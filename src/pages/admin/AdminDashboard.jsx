import { useState, useEffect, useCallback, useRef } from 'react';
import './admin.css';

const ADMIN_API = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace(/\/api$/, '')
  : (import.meta.env.DEV ? 'http://localhost:8002' : '');

function fmt(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
function fmtDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('uz-UZ');
}
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function intentClass(intent) {
  const i = (intent || 'unknown').toLowerCase();
  return `intent-badge intent-${i}`;
}

export default function AdminDashboard({ onLogout }) {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [azureStatus, setAzureStatus] = useState(null);
  const [online, setOnline] = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  const [modalLogId, setModalLogId] = useState(null);
  const [logDetail, setLogDetail] = useState(null);
  const [logDetailLoading, setLogDetailLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const intervalRef = useRef(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${ADMIN_API}/api/admin/stats/summary`);
      const data = await res.json();
      setStats(data);
      setOnline(true);
    } catch {
      setOnline(false);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch(`${ADMIN_API}/api/admin/logs?limit=100`);
      const data = await res.json();
      if (!data.error) setLogs(data.logs || []);
    } catch {}
  }, []);

  const fetchBalance = useCallback(async () => {
    try {
      const res = await fetch(`${ADMIN_API}/api/admin/balance`);
      const data = await res.json();
      setAzureStatus(data.azure_speech);
    } catch {}
  }, []);

  const refreshAll = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([fetchStats(), fetchLogs(), fetchBalance()]);
    setIsRefreshing(false);
  }, [fetchStats, fetchLogs, fetchBalance]);

  useEffect(() => {
    refreshAll();
    intervalRef.current = setInterval(refreshAll, 30000);
    return () => clearInterval(intervalRef.current);
  }, [refreshAll]);

  const openLogModal = useCallback(async (logId) => {
    setModalLogId(logId);
    setLogDetail(null);
    setLogDetailLoading(true);
    try {
      const res = await fetch(`${ADMIN_API}/api/admin/logs/${logId}`);
      const data = await res.json();
      setLogDetail(data.error ? null : data);
    } catch {}
    setLogDetailLoading(false);
  }, []);

  const closeModal = () => setModalLogId(null);

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const getSortedLogs = () => {
    if (!activeCard || activeCard === 'all') return logs;
    if (activeCard === 'tokens') return [...logs].sort((a, b) => (b.tokens || 0) - (a.tokens || 0));
    if (activeCard === 'cost') return [...logs].sort((a, b) => (b.cost_usd || 0) - (a.cost_usd || 0));
    return logs;
  };

  const detailTitle = activeCard === 'tokens'
    ? "Token bo'yicha saralangan"
    : activeCard === 'cost'
    ? "Narx bo'yicha saralangan"
    : "Barcha so'rovlar";

  const sortedLogs = getSortedLogs();
  const recentLogs = logs.slice(0, 15);
  const intents = stats?.intents || {};

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#f7f7f8', color: '#111', minHeight: '100vh' }}>
      <div className="dashboard">

        <header>
          <div className="logo">
            <div className="logo-icon" />
            <div>
              <h1>ECO EXPERT AI</h1>
              <span>Admin Dashboard</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="status-badge">
              <span className="status-dot" style={{ background: online ? '#10b981' : '#ef4444' }} />
              <span>{online ? 'Online' : 'Offline'}</span>
            </div>
            <button
              onClick={onLogout}
              style={{
                padding: '6px 14px', background: '#f3f4f6', border: '1px solid #e5e7eb',
                borderRadius: '20px', fontSize: '0.8rem', color: '#555', cursor: 'pointer',
              }}
            >
              Chiqish
            </button>
          </div>
        </header>

        <div className="metrics-grid">
          {[
            { id: 'requests', cardKey: 'all', label: 'Requests Today', value: (stats?.today?.requests ?? '—').toLocaleString?.() ?? '—' },
            { id: 'tokens', cardKey: 'tokens', label: 'Tokens Today', value: (stats?.today?.tokens ?? '—').toLocaleString?.() ?? '—' },
            { id: 'cost', cardKey: 'cost', label: 'Cost Today', value: `$${(stats?.today?.cost_usd ?? 0).toFixed(4)}` },
            { id: 'tpm', cardKey: 'all', label: 'TPM', value: (stats?.realtime?.tpm ?? '—').toLocaleString?.() ?? '—', sub: `${(((stats?.realtime?.tpm ?? 0) / 2_000_000) * 100).toFixed(3)}% of 2M` },
            { id: 'rpm', cardKey: 'all', label: 'RPM', value: stats?.realtime?.rpm ?? '—' },
          ].map((card) => (
            <div
              key={card.id}
              className={`metric-card${activeCard === card.cardKey ? ' active' : ''}`}
              onClick={() => setActiveCard(card.cardKey)}
            >
              <div className="metric-label">{card.label}</div>
              <div className="metric-value">{card.value}</div>
              {card.sub && <div className="metric-sub">{card.sub}</div>}
            </div>
          ))}
        </div>

        {activeCard && (
          <div className="main-section">
            <div className="section-header">
              <span className="section-title">{detailTitle}</span>
              <span className="section-count">{sortedLogs.length ? `${sortedLogs.length} ta` : ''}</span>
            </div>
            <div className="scroll-wrap">
              <table className="logs-table">
                <thead>
                  <tr>
                    <th>Vaqt</th><th>So'rov</th><th>Intent</th><th>Til</th>
                    <th>Model</th><th>Kirish tok.</th><th>Chiqish tok.</th>
                    <th>Jami tok.</th><th>Narx</th><th>Vaqt (ms)</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedLogs.length === 0 ? (
                    <tr><td colSpan="11" className="empty-state">Ma'lumot yo'q</td></tr>
                  ) : sortedLogs.map((log) => (
                    <tr key={log.id} onClick={() => openLogModal(log.id)}>
                      <td className="log-time">{fmt(log.timestamp)}</td>
                      <td className="log-query">{log.query_text || '—'}</td>
                      <td><span className={intentClass(log.intent)}>{log.intent || '?'}</span></td>
                      <td style={{ color: '#666' }}>{log.language || '—'}</td>
                      <td style={{ color: '#666', fontSize: '.75rem' }}>{log.endpoint || '—'}</td>
                      <td className="log-tokens">—</td>
                      <td className="log-tokens">—</td>
                      <td className="log-tokens">{(log.tokens || 0).toLocaleString()}</td>
                      <td className="log-cost">${(log.cost_usd || 0).toFixed(5)}</td>
                      <td className="log-rt">{log.response_time_ms ? `${log.response_time_ms} ms` : '—'}</td>
                      <td><span className={log.success ? 'dot-ok' : 'dot-fail'} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="two-col">
          <div className="main-section">
            <div className="section-header">
              <span className="section-title">So'nggi so'rovlar</span>
              <span className="section-count">{logs.length ? `${logs.length} ta` : ''}</span>
            </div>
            <div className="scroll-wrap">
              <table className="logs-table">
                <thead>
                  <tr><th>Vaqt</th><th>Intent</th><th>So'rov</th><th>Tokenlar</th><th>Narx</th></tr>
                </thead>
                <tbody>
                  {recentLogs.length === 0 ? (
                    <tr><td colSpan="5" className="empty-state">Hali so'rovlar yo'q</td></tr>
                  ) : recentLogs.map((log) => (
                    <tr key={log.id} onClick={() => openLogModal(log.id)}>
                      <td className="log-time">{fmt(log.timestamp)}</td>
                      <td><span className={intentClass(log.intent)}>{log.intent || '?'}</span></td>
                      <td className="log-query">{log.query_text || '—'}</td>
                      <td className="log-tokens">{(log.tokens || 0).toLocaleString()}</td>
                      <td className="log-cost">${(log.cost_usd || 0).toFixed(5)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="main-section">
            <div className="section-header"><span className="section-title">API Holati</span></div>
            <div className="section-pad">
              <div className="balance-row">
                <div className="balance-service">
                  <div className="balance-icon gemini-icon">G</div>
                  <div>
                    <div className="balance-name">Google Gemini</div>
                    <div className="balance-sub">Free Tier</div>
                  </div>
                </div>
                <div className="balance-value">♾️ Unlimited</div>
              </div>
              <div className="balance-row">
                <div className="balance-service">
                  <div className="balance-icon azure-icon">A</div>
                  <div>
                    <div className="balance-name">Azure Speech</div>
                    <div className="balance-sub">STT + TTS</div>
                  </div>
                </div>
                <div
                  className="balance-value"
                  style={{ color: azureStatus?.status === 'configured' ? '#059669' : '#d97706' }}
                >
                  {azureStatus?.status === 'configured' ? (azureStatus.region || 'Configured') : 'Sozlanmagan'}
                </div>
              </div>
            </div>
            <div className="section-header" style={{ marginTop: 0 }}>
              <span className="section-title">Intent taqsimoti</span>
            </div>
            <div className="section-pad">
              <div className="intent-grid">
                {Object.entries(intents).length === 0 ? (
                  <span style={{ color: '#bbb', fontSize: '.8rem' }}>Ma'lumot yo'q</span>
                ) : Object.entries(intents).map(([intent, count]) => (
                  <span key={intent} className={intentClass(intent)}>{intent}: {count}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        className="refresh-btn"
        onClick={refreshAll}
        title="Yangilash"
        style={{ position: 'fixed', bottom: '24px', right: '24px' }}
      >
        <svg
          viewBox="0 0 24 24"
          style={{ width: 18, height: 18, fill: '#fff', animation: isRefreshing ? 'spin .8s linear infinite' : 'none' }}
        >
          <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
        </svg>
      </button>

      {modalLogId && (
        <div
          className="modal-overlay open"
          onClick={(e) => { if (e.target.classList.contains('modal-overlay')) closeModal(); }}
        >
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">So'rov tafsiloti</span>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              {logDetailLoading && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>Yuklanmoqda...</div>
              )}
              {!logDetailLoading && !logDetail && (
                <div className="error-state">Ma'lumot topilmadi</div>
              )}
              {!logDetailLoading && logDetail && (
                <>
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <span className={intentClass(logDetail.intent)}>{logDetail.intent || '?'}</span>
                      <span style={{ color: '#aaa', fontSize: '.78rem' }}>{fmtDate(logDetail.timestamp)}</span>
                      <span className={logDetail.success ? 'dot-ok' : 'dot-fail'} />
                    </div>
                  </div>
                  {[
                    ['Endpoint', logDetail.endpoint, true],
                    ['Til', logDetail.detected_language, false],
                    ['Model', logDetail.model_used, true],
                    ['IP', logDetail.client_ip, true],
                    ['Javob vaqti', logDetail.response_time_ms ? `${logDetail.response_time_ms} ms` : '—', false],
                  ].map(([label, value, mono]) => (
                    <div key={label} className="detail-row">
                      <span className="detail-label">{label}</span>
                      <span className={`detail-value${mono ? ' mono' : ''}`}>{value || '—'}</span>
                    </div>
                  ))}
                  <div className="divider" />
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '.72rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '8px', fontWeight: '600' }}>Tokenlar</div>
                    <div className="token-grid">
                      {[
                        ['Kirish', logDetail.tokens_input],
                        ['Chiqish', logDetail.tokens_output],
                        ['Jami', logDetail.tokens_total],
                      ].map(([label, val]) => (
                        <div key={label} className="token-box">
                          <div className="token-num">{(val || 0).toLocaleString()}</div>
                          <div className="token-label">{label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="detail-row" style={{ marginTop: '10px' }}>
                    <span className="detail-label">Narx</span>
                    <span className="detail-value" style={{ fontWeight: '600' }}>${(logDetail.cost_usd || 0).toFixed(6)}</span>
                  </div>
                  <div className="divider" />
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '.72rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '8px', fontWeight: '600' }}>So'rov</div>
                    <div className="text-box">{logDetail.query_text || '—'}</div>
                  </div>
                  {logDetail.response_text && (
                    <div>
                      <div style={{ fontSize: '.72rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '8px', fontWeight: '600' }}>Javob</div>
                      <div className="text-box">{logDetail.response_text}</div>
                    </div>
                  )}
                  {logDetail.error_message && (
                    <>
                      <div className="divider" />
                      <div className="detail-row">
                        <span className="detail-label">Xato</span>
                        <span className="detail-value" style={{ color: '#ef4444' }}>{logDetail.error_message}</span>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
