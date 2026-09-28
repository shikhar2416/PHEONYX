import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Send, Bot } from 'lucide-react';
import type { ChatMessage } from '@/lib/chatbotTypes';
import ChatMessageView from './ChatMessage';
import QuickActions from './QuickActions';
import TypingIndicator from './TypingIndicator';

interface ChatbotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  isTyping: boolean;
  onSend: (text: string) => void;
  onClear: () => void;
  quickActions: string[];
  suggestions: string[];
  profileName: string | null;
}

export default function ChatbotDrawer({
  isOpen, onClose, messages, isTyping, onSend, onClear,
  quickActions, suggestions, profileName,
}: ChatbotDrawerProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[160] bg-base-900/60 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none"
          />

          {/* Drawer / Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed z-[170] inset-y-0 right-0 w-full sm:w-[420px] flex flex-col bg-base-900/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl"
            role="dialog"
            aria-label="Attendify Assistant chat"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 border border-emerald-400/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-bold text-white text-sm">Attendify Assistant</h3>
                <p className="text-xs text-slate-400">Ask about attendance, leaves, timetable</p>
              </div>
              <button
                onClick={onClear}
                aria-label="Clear chat"
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                aria-label="Close chat"
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
              {isEmpty && (
                <div className="space-y-4">
                  <div className="glass-card bg-white/5 border border-emerald-400/15 rounded-2xl p-4">
                    <p className="text-sm text-slate-200">
                      Hi {profileName ?? 'there'}, I can help you understand your attendance.
                    </p>
                    <p className="text-xs text-slate-400 mt-1.5">
                      Ask me about classes left, bunks, your riskiest subject, or what happens if you skip a day.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider px-1">Try asking</p>
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => onSend(s)}
                        className="w-full text-left px-3 py-2.5 rounded-xl text-sm bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:border-emerald-400/20 transition-all"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <ChatMessageView key={msg.id} message={msg} onFollowUp={onSend} />
              ))}

              {isTyping && (
                <div className="flex gap-2.5">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 border border-emerald-400/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm">
                    <TypingIndicator />
                  </div>
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="px-4 py-2 border-t border-white/5 flex-shrink-0">
              <QuickActions actions={quickActions} onAction={onSend} />
            </div>

            {/* Input bar */}
            <div className="px-4 py-3 border-t border-white/10 flex-shrink-0">
              <div className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about your attendance..."
                  rows={1}
                  aria-label="Chat input"
                  className="flex-1 resize-none px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-emerald-400/40 focus:bg-white/10 transition-colors max-h-24"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  aria-label="Send message"
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 text-base-900 flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none hover:brightness-110 transition-all flex-shrink-0"
                >
                  <Send className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
