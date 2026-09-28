import { User, Bot } from 'lucide-react';
import type { ChatMessage } from '@/lib/chatbotTypes';

interface ChatMessageProps {
  message: ChatMessage;
  onFollowUp?: (text: string) => void;
}

export default function ChatMessageView({ message, onFollowUp }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
        isUser ? 'bg-white/10' : 'bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 border border-emerald-400/20'
      }`}>
        {isUser ? <User className="w-4 h-4 text-slate-400" /> : <Bot className="w-4 h-4 text-emerald-400" />}
      </div>
      <div className={`flex flex-col gap-1.5 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
          isUser
            ? 'bg-emerald-400/15 border border-emerald-400/20 text-white rounded-tr-sm'
            : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-sm'
        }`}>
          {message.text}
        </div>
        {message.followUps && message.followUps.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-0.5">
            {message.followUps.map((fu, i) => (
              <button
                key={i}
                onClick={() => onFollowUp?.(fu)}
                className="px-2.5 py-1 rounded-lg text-xs bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20 transition-colors"
              >
                {fu}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
