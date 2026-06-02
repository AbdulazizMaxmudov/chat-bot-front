import { Mic, ArrowUp, StopCircle, Loader2, Globe, Square, Instagram, Youtube, MapPin } from 'lucide-react';
import NierVisualizer from './NierVisualizer';
import { QUICK_ACTION_ICONS, SOCIAL_LINKS } from '../constants';
import { i18n } from '../i18n';

const TelegramIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

export default function ChatInputBar({
  selectedStyle,
  isImg,
  isRecording,
  audioStream,
  isDark,
  input,
  setInput,
  avatarState,
  isResponseActive,
  selectedLang,
  setSelectedLang,
  inputRef,
  sendMessage,
  startRecording,
  stopRecording,
  stopGeneration,
  onFocus,
  onBlur,
}) {
  const tr = i18n[selectedLang] || i18n.uz;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 px-3 sm:px-6 pb-4 sm:pb-6 pt-2 ${
        selectedStyle === 'style3'
          ? 'bg-transparent'
          : isImg
          ? 'bg-black/20 backdrop-blur-md'
          : 'bg-[#f7f7f8]/95 dark:bg-[#111113]/95 backdrop-blur-sm'
      }`}
    >
      <div
        className={`max-w-2xl mx-auto rounded-2xl border overflow-hidden ${
          isImg
            ? 'bg-white/10 backdrop-blur-md border-white/15 shadow-none'
            : 'bg-white dark:bg-[#1c1c1e] border-gray-200 dark:border-gray-700 shadow-sm'
        }`}
      >
        <div className="px-4 pt-3 pb-1 flex items-center gap-1.5">
          <span className={`text-[11px] leading-none ${isImg ? 'text-white/50' : 'text-gray-400 dark:text-gray-500'}`}>
            {tr.subtitle}
          </span>
          <span className={`text-[11px] ${isImg ? 'text-white/25' : 'text-gray-300 dark:text-gray-600'}`}>•</span>
          <span
            className={`text-[11px] font-medium leading-none transition-colors ${
              avatarState !== 'idle' ? 'text-purple-400' : isImg ? 'text-white/35' : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            {tr.status[avatarState]}
          </span>
        </div>

        {isRecording ? (
          <div className="px-4 pb-3 pt-2 space-y-2">
            <NierVisualizer isRecording={isRecording} stream={audioStream} isDark={isDark || isImg} />
            <button
              onClick={stopRecording}
              className={`w-full py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors touch-manipulation border ${
                isImg
                  ? 'bg-red-500/20 text-red-300 border-red-400/30 hover:bg-red-500/30'
                  : 'bg-red-50 dark:bg-red-900/20 text-red-500 border-red-100 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30'
              }`}
            >
              <StopCircle size={15} className="animate-pulse" />
              {tr.stopRecording}
            </button>
          </div>
        ) : (
          <>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              onFocus={onFocus}
              onBlur={onBlur}
              placeholder={tr.inputPlaceholder}
              className={`w-full px-4 py-3 bg-transparent focus:outline-none text-sm sm:text-base ${
                isImg ? 'text-white placeholder-white/40' : 'text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600'
              }`}
            />
            <div className="flex items-center justify-between px-3 pb-3">
              <button
                onClick={() => setSelectedLang((l) => (l === 'uz' ? 'ru' : l === 'ru' ? 'en' : 'uz'))}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-colors touch-manipulation ${
                  isImg
                    ? 'border-white/20 text-white/70 hover:bg-white/10'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Globe size={12} />
                <span className="font-medium">{selectedLang === 'uz' ? "O'zbekcha" : selectedLang === 'ru' ? 'Русский' : 'English'}</span>
              </button>

              <div className="flex items-center gap-1.5">
                {isResponseActive && (
                  <button
                    onClick={stopGeneration}
                    title={tr.stopLabel}
                    className={`p-2 rounded-full border transition-colors touch-manipulation ${
                      isImg
                        ? 'border-white/20 text-white/70 hover:bg-white/10'
                        : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Square size={13} fill="currentColor" />
                  </button>
                )}
                <button
                  onClick={startRecording}
                  aria-label={tr.micLabel}
                  className={`p-2 rounded-full border transition-colors touch-manipulation ${
                    isImg
                      ? 'border-white/20 text-white/70 hover:bg-white/10'
                      : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <Mic size={16} />
                </button>
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  aria-label={tr.sendLabel}
                  className={`p-2 rounded-full disabled:opacity-30 transition-colors touch-manipulation ${
                    isImg
                      ? 'bg-white text-gray-900 hover:bg-white/90'
                      : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-700 dark:hover:bg-gray-200'
                  }`}
                >
                  {avatarState === 'thinking' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUp size={16} />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="max-w-2xl mx-auto mt-2.5 flex items-center gap-2 flex-wrap justify-center">
        {tr.quickActions.map((action, idx) => {
          const Icon = QUICK_ACTION_ICONS[idx];
          return (
            <button
              key={action.label}
              onClick={() => {
                setInput(action.query);
                setTimeout(() => inputRef.current?.focus(), 0);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs transition-colors touch-manipulation ${
                isImg
                  ? 'border-white/20 bg-white/10 text-white hover:bg-white/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1c1e] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Icon size={12} />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>

      <div className="max-w-2xl mx-auto mt-2 flex items-center justify-between px-1">
        <div className="flex items-center gap-0.5">
          {[
            { href: SOCIAL_LINKS.instagram, icon: <Instagram size={14} /> },
            { href: SOCIAL_LINKS.youtube, icon: <Youtube size={14} /> },
            { href: SOCIAL_LINKS.telegram, icon: <TelegramIcon size={14} /> },
            { href: SOCIAL_LINKS.location, icon: <MapPin size={14} /> },
          ].map(({ href, icon }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-1.5 rounded-lg transition-colors touch-manipulation ${
                isImg
                  ? 'text-white/40 hover:text-white hover:bg-white/10'
                  : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {icon}
            </a>
          ))}
        </div>
        <p className={`text-[10px] ${isImg ? 'text-white/30' : 'text-gray-400 dark:text-gray-600'}`}>{tr.aiDisclaimer}</p>
      </div>
    </div>
  );
}
