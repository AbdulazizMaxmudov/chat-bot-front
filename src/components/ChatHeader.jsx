import { Bot, MessageSquare, Volume2, VolumeX, Menu, X, Sun, Moon, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { STATUS_TEXT } from '../constants';

export default function ChatHeader({
  isImg,
  avatarState,
  isWelcomeView,
  isMenuOpen,
  showRobot,
  soundEnabled,
  isDark,
  selectedStyle,
  menuRef,
  setIsMenuOpen,
  setIsDark,
  toggleRobot,
  toggleSound,
  setSelectedStyle,
}) {
  return (
    <header
      className={`absolute top-0 left-0 right-0 z-20 backdrop-blur-sm border-b px-4 sm:px-6 py-3.5 flex items-center gap-3 ${
        isImg
          ? 'bg-black/30 border-white/10'
          : 'bg-[#f7f7f8]/95 dark:bg-[#111113]/95 border-gray-200/80 dark:border-gray-700/80'
      }`}
    >
      <div
        className={`flex-shrink-0 w-12 h-12 rounded-xl border shadow-sm flex items-center justify-center ${
          isImg
            ? 'bg-white/15 border-white/20'
            : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
        }`}
      >
        <img src="/logo.png" alt="Logo" className="w-9 h-9 object-contain" />
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-[19px] font-bold leading-none tracking-tight ${isImg ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
          ECO EXPERT AI
        </p>
        <p className={`text-[13px] mt-1 truncate ${isImg ? 'text-white/60' : 'text-gray-400 dark:text-gray-500'}`}>
          Davlat ekologik ekspertizasi markazi
        </p>
      </div>

      {!isWelcomeView && (
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
            avatarState !== 'idle'
              ? isImg
                ? 'bg-white/20 text-white'
                : 'bg-purple-50 dark:bg-purple-900/30 text-purple-500'
              : isImg
              ? 'bg-white/10 text-white/50'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
          }`}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              avatarState !== 'idle'
                ? isImg
                  ? 'bg-white animate-pulse'
                  : 'bg-purple-400 animate-pulse'
                : isImg
                ? 'bg-white/30'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
          />
          <span className="text-[10px] font-medium tracking-wide">{STATUS_TEXT[avatarState]}</span>
        </div>
      )}

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`p-2 rounded-full border transition-colors touch-manipulation ${
            isMenuOpen
              ? isImg
                ? 'bg-white text-gray-900 border-white'
                : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white'
              : isImg
              ? 'bg-white/15 text-white border-white/20 hover:bg-white/25'
              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          {isMenuOpen ? <X size={15} /> : <Menu size={15} />}
        </button>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className={`absolute top-full mt-2 right-0 w-56 rounded-2xl shadow-lg border p-3 z-[65] ${
                isImg
                  ? 'bg-black/60 backdrop-blur-xl border-white/15'
                  : 'bg-white dark:bg-[#1c1c1e] border-gray-100 dark:border-gray-700'
              }`}
            >
              {!isImg && (
                <button
                  onClick={() => setIsDark((d) => !d)}
                  className="w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    {isDark ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-gray-500" />}
                    <span>{isDark ? "Yorug' rejim" : "Qorong'u rejim"}</span>
                  </div>
                  <div className={`w-8 h-4 rounded-full flex-shrink-0 transition-colors ${isDark ? 'bg-gray-900 dark:bg-white' : 'bg-gray-200'}`}>
                    <div className={`w-3 h-3 rounded-full bg-white dark:bg-gray-900 mt-0.5 transition-transform ${isDark ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </div>
                </button>
              )}

              <button
                onClick={toggleRobot}
                className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-sm transition-colors ${
                  isImg ? 'text-white/90 hover:bg-white/10' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {showRobot ? (
                    <Bot size={15} className={isImg ? 'text-white/60' : 'text-gray-500 dark:text-gray-400'} />
                  ) : (
                    <MessageSquare size={15} className={isImg ? 'text-white/60' : 'text-gray-500 dark:text-gray-400'} />
                  )}
                  <span>{showRobot ? 'Avatar yoqilgan' : "Avatar o'chirilgan"}</span>
                </div>
                <div
                  className={`w-8 h-4 rounded-full flex-shrink-0 transition-colors ${
                    showRobot
                      ? isImg ? 'bg-white/80' : 'bg-gray-900 dark:bg-white'
                      : isImg ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full mt-0.5 transition-transform ${showRobot ? 'translate-x-4' : 'translate-x-0.5'} ${
                      isImg ? 'bg-gray-900' : 'bg-white dark:bg-gray-900'
                    }`}
                  />
                </div>
              </button>

              <button
                onClick={toggleSound}
                className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-sm transition-colors ${
                  isImg ? 'text-white/90 hover:bg-white/10' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {soundEnabled ? (
                    <Volume2 size={15} className={isImg ? 'text-white/60' : 'text-gray-500 dark:text-gray-400'} />
                  ) : (
                    <VolumeX size={15} className={isImg ? 'text-white/60' : 'text-gray-500 dark:text-gray-400'} />
                  )}
                  <span>{soundEnabled ? 'Ovoz yoqilgan' : "Ovoz o'chirilgan"}</span>
                </div>
                <div
                  className={`w-8 h-4 rounded-full flex-shrink-0 transition-colors ${
                    soundEnabled
                      ? isImg ? 'bg-white/80' : 'bg-gray-900 dark:bg-white'
                      : isImg ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full mt-0.5 transition-transform ${soundEnabled ? 'translate-x-4' : 'translate-x-0.5'} ${
                      isImg ? 'bg-gray-900' : 'bg-white dark:bg-gray-900'
                    }`}
                  />
                </div>
              </button>

              <div className={`h-px my-2 ${isImg ? 'bg-white/10' : 'bg-gray-100 dark:bg-gray-700'}`} />

              <div className="px-3 py-1">
                <div className={`flex items-center gap-2 mb-1.5 ${isImg ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}`}>
                  <Palette size={13} />
                  <span className="text-xs font-medium">Dizayn stili</span>
                </div>
                <select
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  style={isImg ? { colorScheme: 'dark' } : undefined}
                  className={`w-full text-xs rounded-xl px-3 py-2 border outline-none cursor-pointer ${
                    isImg
                      ? 'bg-black/40 border-white/20 text-white'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <option value="style1">Minimalizm</option>
                  <option value="style2">Hi tech</option>
                  <option value="style3">Ecology</option>
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
