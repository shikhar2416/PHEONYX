import { useState, useCallback, useEffect, useRef } from 'react';
import { useStudent } from '@/context/StudentContext';
import { answerQuery, generateProactiveSuggestions, QUICK_ACTIONS } from '@/lib/chatbot';
import type { ChatMessage, ChatbotContext } from '@/lib/chatbotTypes';
import { SECTIONS } from '@/data/timetables';
import { todayISO } from '@/lib/dates';

const MAX_MESSAGES = 50;
const STORAGE_PREFIX = 'attendify:chat:';

function getStorageKey(rollNumber: string | null): string {
  return `${STORAGE_PREFIX}${rollNumber ?? 'guest'}`;
}

function loadMessages(rollNumber: string | null): ChatMessage[] {
  try {
    const raw = localStorage.getItem(getStorageKey(rollNumber));
    if (!raw) return [];
    const msgs = JSON.parse(raw) as ChatMessage[];
    return msgs.slice(-MAX_MESSAGES);
  } catch {
    return [];
  }
}

function saveMessages(rollNumber: string | null, messages: ChatMessage[]) {
  try {
    localStorage.setItem(getStorageKey(rollNumber), JSON.stringify(messages.slice(-MAX_MESSAGES)));
  } catch { /* ignore */ }
}

export function useChatbot() {
  const { profile, sectionKey, planDate, mode, inputs, plannedLeaves } = useStudent();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load messages on mount or when roll number changes
  useEffect(() => {
    setMessages(loadMessages(profile?.rollNumber ?? null));
  }, [profile?.rollNumber]);

  // Persist messages whenever they change
  useEffect(() => {
    saveMessages(profile?.rollNumber ?? null, messages);
  }, [messages, profile?.rollNumber]);

  // Reset unread when opened
  useEffect(() => {
    if (isOpen) setUnreadCount(0);
  }, [isOpen]);

  const buildContext = useCallback((): ChatbotContext => {
    const section = SECTIONS[sectionKey];
    return {
      profileName: profile?.name ?? null,
      rollNumber: profile?.rollNumber ?? null,
      sectionKey,
      sectionLabel: section?.label ?? sectionKey,
      planDate,
      mode,
      inputs,
      plannedLeaves,
      today: todayISO(),
      hasData: inputs.length > 0 && inputs.some((i) => i.conducted > 0 || i.attended > 0),
    };
  }, [profile, sectionKey, planDate, mode, inputs, plannedLeaves]);

  const sendMessage = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}-${Math.random()}`,
      role: 'user',
      text: trimmed,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    if (typingTimer.current) clearTimeout(typingTimer.current);

    // Simulate typing delay for natural feel
    typingTimer.current = setTimeout(() => {
      const ctx = buildContext();
      const response = answerQuery(trimmed, ctx);
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}-${Math.random()}`,
        role: 'assistant',
        text: response.text,
        timestamp: Date.now(),
        followUps: response.followUps,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
      if (!isOpen) setUnreadCount((c) => c + 1);
    }, 400 + Math.random() * 300);
  }, [buildContext, isOpen]);

  const clearChat = useCallback(() => {
    setMessages([]);
    saveMessages(profile?.rollNumber ?? null, []);
  }, [profile?.rollNumber]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const suggestions = generateProactiveSuggestions(buildContext());

  return {
    isOpen,
    open,
    close,
    messages,
    isTyping,
    sendMessage,
    clearChat,
    unreadCount,
    suggestions,
    quickActions: QUICK_ACTIONS,
    profileName: profile?.name ?? null,
  };
}
