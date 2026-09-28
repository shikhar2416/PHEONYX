import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatbotButtonProps {
  onClick: () => void;
  unreadCount?: number;
}

export default function ChatbotButton({ onClick, unreadCount = 0 }: ChatbotButtonProps) {
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      aria-label="Ask Attendify Assistant"
      className="fixed bottom-6 right-6 z-[150] w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 no-print group"
    >
      <span className="absolute inset-0 rounded-full bg-emerald-400/40 animate-ping opacity-60" />
      <MessageCircle className="w-6 h-6 text-base-900 relative z-10" strokeWidth={2.5} />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center z-20">
          {unreadCount}
        </span>
      )}
    </motion.button>
  );
}
