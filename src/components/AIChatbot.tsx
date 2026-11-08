import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Minus,
  Send,
  Bot,
  Check,
  CheckCheck,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage, Reservation } from '../types';
import { apiUrl } from '../services/api';

interface AIChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  onReservationCreated?: (res: Reservation) => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'assistant',
    text: 'Hello! Welcome to MiniKitchen. How may I assist your dining experience today? I can help you reserve a table, recommend dishes, or answer questions about our menu.',
    timestamp: '10:24 AM',
  },
];

export const AIChatbot: React.FC<AIChatbotProps> = ({
  isOpen,
  onClose,
  onOpen,
  onReservationCreated,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      scrollToBottom();
    }
  }, [isOpen, messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || loading) return;

    const userText = inputText.trim();
    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now().toString(36),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await fetch(apiUrl('/api/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: messages.map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }],
          })),
        }),
      });

      if (!res.ok) throw new Error('Failed to get AI reply');
      const data = await res.json();

      const botReplyMsg: ChatMessage = {
        id: 'bot-' + Date.now().toString(36),
        sender: 'assistant',
        text: data.reply || 'I am happy to assist you with your table at MiniKitchen.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reservationCreated: data.reservation || undefined,
      };

      setMessages((prev) => [...prev, botReplyMsg]);

      if (data.reservation && onReservationCreated) {
        onReservationCreated(data.reservation);
      }
    } catch (err) {
      console.error(err);
      const fallbackMsg: ChatMessage = {
        id: 'bot-err-' + Date.now().toString(36),
        sender: 'assistant',
        text: 'I can help you reserve a table at MiniKitchen. Please share your name, phone number, date, time, and party size.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chatbot Trigger Button fixed to bottom-right corner */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpen}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[#F5B82E] to-[#D4A43C] text-white shadow-2xl flex items-center justify-center transition-shadow shadow-[#D4A43C]/40 group"
          aria-label="Open MiniKitchen AI Assistant"
        >
          {/* White Chat Bubble Icon */}
          <svg className="w-7 h-7 text-white fill-white" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 5.806 2 10.5c0 2.65 1.442 5.018 3.737 6.55-.262 1.545-.987 3.327-1.026 3.424a.5.5 0 0 0 .618.667c2.315-.815 4.37-1.897 5.176-2.357.48.074.981.116 1.495.116 5.523 0 10-3.806 10-8.5S17.523 2 12 2z" />
            <circle cx="8" cy="10.5" r="1.3" fill="#D4A43C" />
            <circle cx="12" cy="10.5" r="1.3" fill="#D4A43C" />
            <circle cx="16" cy="10.5" r="1.3" fill="#D4A43C" />
          </svg>

          {/* Small Notification Indicator */}
          {hasUnread && (
            <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-red-600 border-2 border-[#0D0D0D]" />
          )}
        </motion.button>
      )}

      {/* Chat Window Dialog */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-6 right-4 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[390px] h-[540px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden text-stone-900"
          >
            {/* Header: MiniKitchen AI Assistant */}
            <div className="bg-[#0D0D0D] text-white px-5 py-4 flex items-center justify-between border-b border-[#171717]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#171717] border border-[#D4A43C]/50 flex items-center justify-center text-[#D4A43C]">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">
                      MiniKitchen AI Assistant
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-[#F5B82E]" />
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Online</span>
                  </div>
                </div>
              </div>

              {/* Window Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-[#171717] transition-colors"
                  aria-label="Minimize"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-[#171717] transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50 text-xs sm:text-sm">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm leading-relaxed ${
                        isUser
                          ? 'bg-[#D4A43C] text-[#0D0D0D] font-medium rounded-br-xs'
                          : 'bg-white text-stone-800 border border-stone-200 rounded-bl-xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>

                      {/* Pending Reservation Card if generated */}
                      {msg.reservationCreated && (
                        <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-[#0D0D0D]">
                          <div className="flex items-center gap-1.5 font-bold text-xs text-amber-800 mb-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Pending Reservation Saved</span>
                          </div>
                          <div className="space-y-0.5 text-[11px] text-stone-700">
                            <p><strong>Name:</strong> {msg.reservationCreated.customerName}</p>
                            <p><strong>Date & Time:</strong> {msg.reservationCreated.reservationDate} at {msg.reservationCreated.reservationTime}</p>
                            <p><strong>Guests:</strong> {msg.reservationCreated.guestCount}</p>
                            <p className="text-amber-700 font-semibold mt-1">Status: Pending Admin Confirmation</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 mt-1 text-[10px] text-stone-400 px-1">
                      <span>{msg.timestamp}</span>
                      {isUser && <CheckCheck className="w-3 h-3 text-[#D4A43C]" />}
                    </div>
                  </motion.div>
                );
              })}

              {loading && (
                <div className="flex items-center gap-2 text-stone-400 text-xs py-2" role="status" aria-live="polite">
                  <span className="flex items-center gap-1" aria-hidden="true">
                    {[0, 1, 2].map((dot) => (
                      <motion.span
                        key={dot}
                        className="w-1.5 h-1.5 rounded-full bg-[#D4A43C]"
                        animate={{ opacity: [0.35, 1, 0.35], y: [0, -2, 0] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: dot * 0.15 }}
                      />
                    ))}
                  </span>
                  <span>Assistant is thinking...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-stone-200">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Ask about menu or reserve a table..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  className="w-full pl-4 pr-11 py-2.5 text-xs sm:text-sm rounded-full bg-stone-100 border border-stone-200 text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#D4A43C] focus:bg-white transition-all"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || loading}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#D4A43C] hover:bg-[#c6942c] text-[#0D0D0D] flex items-center justify-center disabled:opacity-40 transition-colors shadow-sm"
                  aria-label="Send message"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
