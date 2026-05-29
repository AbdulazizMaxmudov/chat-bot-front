import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingScreen({ isLoading, loadingStatus }) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-[#f7f7f8] dark:bg-[#111113]"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
            className="w-9 h-9 rounded-full border-2 border-gray-200 dark:border-gray-700 border-t-gray-800 dark:border-t-gray-300 mb-5"
          />
          <p className="text-gray-900 dark:text-white font-semibold text-base tracking-tight">ECO EXPERT AI</p>
          <p className="text-gray-400 text-[11px] mt-1 tracking-widest uppercase">{loadingStatus}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
