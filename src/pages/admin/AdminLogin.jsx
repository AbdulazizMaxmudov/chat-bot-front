import { useState } from 'react';

export default function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      sessionStorage.setItem('admin_auth', 'true');
      onLogin();
    } else {
      setError("Noto'g'ri login yoki parol");
      setPassword('');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f7f7f8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '18px',
        padding: '40px',
        width: '100%',
        maxWidth: '380px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #fed7aa, #f9a8d4, #c084fc)',
            flexShrink: 0,
          }} />
          <div>
            <div style={{ fontSize: '1rem', fontWeight: '600', color: '#111' }}>ECO EXPERT AI</div>
            <div style={{ fontSize: '0.75rem', color: '#999' }}>Admin Panel</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '500', color: '#555', marginBottom: '6px' }}>
              Login
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              style={{
                width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb',
                borderRadius: '10px', fontSize: '0.875rem', outline: 'none',
                boxSizing: 'border-box', color: '#111', background: '#fafafa',
              }}
              onFocus={(e) => e.target.style.borderColor = '#c084fc'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '500', color: '#555', marginBottom: '6px' }}>
              Parol
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              style={{
                width: '100%', padding: '10px 14px', border: '1px solid #e5e7eb',
                borderRadius: '10px', fontSize: '0.875rem', outline: 'none',
                boxSizing: 'border-box', color: '#111', background: '#fafafa',
              }}
              onFocus={(e) => e.target.style.borderColor = '#c084fc'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {error && (
            <div style={{
              background: '#fff5f5', border: '1px solid #fecaca', borderRadius: '8px',
              padding: '10px 14px', fontSize: '0.8rem', color: '#dc2626', marginBottom: '16px',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%', padding: '11px', background: '#111', color: '#fff',
              border: 'none', borderRadius: '10px', fontSize: '0.875rem', fontWeight: '600',
              cursor: 'pointer', transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.background = '#333'}
            onMouseLeave={(e) => e.target.style.background = '#111'}
          >
            Kirish
          </button>
        </form>
      </div>
    </div>
  );
}
