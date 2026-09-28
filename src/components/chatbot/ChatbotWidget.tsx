import { useChatbot } from '@/hooks/useChatbot';
import ChatbotButton from './ChatbotButton';
import ChatbotDrawer from './ChatbotDrawer';

export default function ChatbotWidget() {
  const chatbot = useChatbot();

  return (
    <>
      <ChatbotButton onClick={chatbot.open} unreadCount={chatbot.unreadCount} />
      <ChatbotDrawer
        isOpen={chatbot.isOpen}
        onClose={chatbot.close}
        messages={chatbot.messages}
        isTyping={chatbot.isTyping}
        onSend={chatbot.sendMessage}
        onClear={chatbot.clearChat}
        quickActions={chatbot.quickActions}
        suggestions={chatbot.suggestions}
        profileName={chatbot.profileName}
      />
    </>
  );
}
