"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await response.json();
      
      if (response.ok && data.reply) {
        setMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'bot', text: 'Xin lỗi em, Dino Ngoại Thương đang bận chút xíu, em thử lại sau nha 🥲' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Lỗi mạng rồi em ơi, check lại wifi nha 😥' }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading]);

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, x: -20 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, y: 20, scale: 0.9, x: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute bottom-20 left-0 w-[360px] bg-[#141414]/80 backdrop-blur-3xl rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden flex flex-col mb-4"
            style={{ height: '500px' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#ff385c]/80 to-[#d44df0]/80 backdrop-blur-md text-white p-4 flex justify-between items-center shrink-0 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img src="/avata_dino_ftu.jpeg" alt="Dino Ngoại Thương" className="w-10 h-10 rounded-full object-cover border-2 border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00e676] border-2 border-[#ff385c] rounded-full animate-pulse"></span>
                </div>
                <div>
                  <h3 className="font-extrabold text-[15px] drop-shadow-sm">Dino Ngoại Thương</h3>
                  <p className="text-[11px] font-bold opacity-90 flex items-center gap-1.5 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00e676] shadow-[0_0_5px_#00e676]"></span>
                    Đang online
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-5 overflow-y-auto bg-transparent flex flex-col gap-4 custom-scrollbar relative">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#ff385c]/5 to-transparent pointer-events-none"></div>
              
              {messages.length === 0 && (
                <div className="text-center text-[#999999] text-sm mt-10 relative z-10 flex flex-col items-center">
                  <motion.div 
                    animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                    className="text-5xl mb-4 drop-shadow-lg"
                  >
                    👋
                  </motion.div>
                  <p className="font-medium px-4 leading-relaxed">Chào ẻm, chị là Dino Ngoại Thương đây. Cần hỏi gì cứ nhắn chị nhé!</p>
                </div>
              )}
              {messages.map((msg, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={idx} 
                  className={`flex relative z-10 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[14px] font-medium leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-gradient-to-r from-[#ff385c] to-[#d44df0] text-white rounded-br-sm shadow-[0_2px_15px_rgba(255,56,92,0.3)]' : 'bg-[#262626]/80 backdrop-blur-md border border-white/5 text-white rounded-bl-sm'}`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start relative z-10">
                  <div className="max-w-[80%] rounded-2xl px-5 py-3 bg-[#262626]/80 backdrop-blur-md border border-white/5 text-white rounded-bl-sm shadow-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-[#ff385c] rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-[#d44df0] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-2 h-2 bg-[#0099ff] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-[#1a1a1a]/90 backdrop-blur-lg border-t border-white/10 shrink-0">
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Hỏi gì Dino trả lời..."
                  className="flex-1 bg-[#090909] border border-white/10 rounded-full px-5 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#ff385c]/50 focus:border-[#ff385c] transition-all text-white placeholder-[#6a6a6a]"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-11 h-11 rounded-full bg-gradient-to-r from-[#ff385c] to-[#d44df0] text-white flex items-center justify-center hover:shadow-[0_0_15px_rgba(255,56,92,0.6)] disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0 hover:scale-105"
                >
                  <svg className="w-5 h-5 translate-x-[-1px] translate-y-[1px]" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative group">
        {/* Pulsing glow ring behind the button */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#ff385c] to-[#d44df0] rounded-full blur-md opacity-60 group-hover:opacity-100 group-hover:blur-lg animate-pulse transition-all duration-500"></div>
        
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#ff385c] to-[#d44df0] text-white shadow-[0_8px_20px_rgba(255,56,92,0.4)] flex items-center justify-center hover:scale-110 transition-transform duration-300 z-10 border border-white/20"
        >
          {isOpen ? (
            <motion.svg 
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              className="w-7 h-7" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </motion.svg>
          ) : (
            <motion.svg 
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              className="w-7 h-7 drop-shadow-md" 
              fill="none" 
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </motion.svg>
          )}
        </button>
      </div>
    </div>
  );
}
