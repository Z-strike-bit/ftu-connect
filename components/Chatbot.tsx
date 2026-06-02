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
        setMessages(prev => [...prev, { role: 'bot', text: 'Xin lỗi em, Thổ địa đang bận chút xíu, em thử lại sau nha 🥲' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Lỗi mạng rồi em ơi, check lại wifi nha 😥' }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-16 right-0 w-[350px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col mb-4"
            style={{ height: '450px' }}
          >
            {/* Header */}
            <div className="bg-red-600 text-white p-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🦖</span>
                <div>
                  <h3 className="font-bold text-sm">Thổ địa FTU</h3>
                  <p className="text-[11px] opacity-80 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                    Đang online
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-red-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50 flex flex-col gap-3 custom-scrollbar">
              {messages.length === 0 && (
                <div className="text-center text-slate-500 text-xs mt-10">
                  <span className="text-4xl block mb-2">👋</span>
                  Chào ẻm, chị là Thổ địa FTU đây. Cần hỏi gì cứ nhắn chị nhé!
                </div>
              )}
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.role === 'user' ? 'bg-red-600 text-white rounded-br-sm' : 'bg-white border border-slate-200 text-black rounded-bl-sm shadow-sm'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-white border border-slate-200 text-black rounded-bl-sm shadow-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-slate-100 shrink-0">
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Hỏi gì Thổ địa trả lời..."
                  className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-500 transition-all text-black"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                >
                  <svg className="w-4 h-4 translate-x-[-1px] translate-y-[1px]" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
        )}
      </button>
    </div>
  );
}
