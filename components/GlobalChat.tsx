"use client";

import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function GlobalChat() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeChatTarget, setActiveChatTarget] = useState<string | null>(null);
  const [targetUser, setTargetUser] = useState<any>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const handleOpenChat = async (e: any) => {
      const targetUserId = e.detail;
      if (!currentUser || targetUserId === currentUser.uid) return;
      
      setActiveChatTarget(targetUserId);
      setIsMinimized(false);
      
      // Fetch target user info
      const uDoc = await getDoc(doc(db, 'users', targetUserId));
      if (uDoc.exists()) {
        setTargetUser({ id: uDoc.id, ...uDoc.data() });
      }
    };

    window.addEventListener('openChat', handleOpenChat);
    return () => window.removeEventListener('openChat', handleOpenChat);
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !activeChatTarget) return;

    const chatId = [currentUser.uid, activeChatTarget].sort().join('_');
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    return () => unsub();
  }, [currentUser, activeChatTarget]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !activeChatTarget) return;

    const text = newMessage.trim();
    setNewMessage('');

    const chatId = [currentUser.uid, activeChatTarget].sort().join('_');
    const chatRef = doc(db, 'chats', chatId);
    const messagesRef = collection(db, 'chats', chatId, 'messages');

    try {
      // Ensure chat doc exists
      await setDoc(chatRef, {
        participants: [currentUser.uid, activeChatTarget],
        updatedAt: serverTimestamp(),
        lastMessage: text
      }, { merge: true });

      // Add message
      await addDoc(messagesRef, {
        senderId: currentUser.uid,
        text: text,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Lỗi gửi tin nhắn:", error);
    }
  };

  if (!currentUser || !activeChatTarget || !targetUser) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 50, opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={`fixed z-[999] bg-[#141414]/90 backdrop-blur-3xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col 
          transition-all duration-300
          ${isMinimized ? 'w-[320px] h-[52px] rounded-t-2xl bottom-0 right-4 sm:right-24' : 
            'bottom-0 right-0 w-full h-full sm:w-[350px] sm:h-[480px] sm:right-24 sm:rounded-t-2xl sm:bottom-0'}
        `}
      >
        {/* Header */}
        <div 
          className="bg-gradient-to-r from-[#ff385c]/80 to-[#d44df0]/80 backdrop-blur-md px-4 py-3 flex justify-between items-center cursor-pointer shrink-0 border-b border-white/10"
          onClick={() => setIsMinimized(!isMinimized)}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative shrink-0">
              <img src={targetUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetUser.name}`} className="w-9 h-9 rounded-full bg-white/10 object-cover border border-white/30" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#00e676] rounded-full border-2 border-[#ff385c] animate-pulse"></div>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-white font-extrabold text-[15px] leading-tight truncate drop-shadow-sm">{targetUser.name}</span>
              <span className="text-white/90 text-[11px] font-bold leading-tight uppercase tracking-wider mt-0.5">Đang hoạt động</span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button 
              className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/20 transition-colors"
              onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
            >
              {isMinimized ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              )}
            </button>
            <button 
              className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/20 transition-colors"
              onClick={(e) => { e.stopPropagation(); setActiveChatTarget(null); }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* Body */}
        {!isMinimized && (
          <>
            <div className="flex-1 overflow-y-auto p-4 bg-transparent flex flex-col gap-3 custom-scrollbar relative">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#ff385c]/5 to-transparent pointer-events-none"></div>
              
              {/* Profile Intro */}
              <div className="text-center py-6 flex flex-col items-center border-b border-white/5 mb-2 relative z-10">
                <img src={targetUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetUser.name}`} className="w-20 h-20 rounded-full bg-white/5 mb-3 border-2 border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.1)]" />
                <h4 className="font-extrabold text-[17px] text-white drop-shadow-sm">{targetUser.name}</h4>
                <p className="text-[13px] text-[#a0a0b0] font-medium mt-1">{targetUser.major}</p>
                <Link href={`/profile/${targetUser.id}`} className="mt-4 text-[13px] text-white bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-1.5 rounded-full font-bold transition-all shadow-sm hover:shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                  Xem trang cá nhân
                </Link>
              </div>

              {messages.map((msg, idx) => {
                const isMe = msg.senderId === currentUser.uid;
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg.id} 
                    className={`flex relative z-10 ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] px-4 py-2.5 text-[14px] font-medium leading-relaxed shadow-sm ${isMe ? 'bg-gradient-to-r from-[#ff385c] to-[#d44df0] text-white rounded-2xl rounded-br-sm shadow-[0_2px_15px_rgba(255,56,92,0.3)]' : 'bg-[#262626]/80 backdrop-blur-md text-white border border-white/5 rounded-2xl rounded-bl-sm'}`}>
                      {msg.text}
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-3 bg-[#1a1a1a]/90 backdrop-blur-lg border-t border-white/10 flex items-end gap-2 shrink-0 pb-[calc(12px+env(safe-area-inset-bottom))]">
              <div className="flex-1 bg-[#090909] border border-white/10 rounded-2xl flex items-end px-4 py-2 min-h-[44px] focus-within:border-[#ff385c] focus-within:shadow-[0_0_10px_rgba(255,56,92,0.2)] transition-all">
                <textarea 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e as any);
                    }
                  }}
                  placeholder="Aa"
                  className="w-full bg-transparent outline-none resize-none text-[15px] max-h-24 custom-scrollbar text-white placeholder-[#6a6a6a] font-medium py-0.5"
                  rows={1}
                />
              </div>
              <button 
                type="submit"
                disabled={!newMessage.trim()}
                className="w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-r from-[#ff385c] to-[#d44df0] text-white hover:shadow-[0_0_15px_rgba(255,56,92,0.6)] hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none shrink-0"
              >
                <svg className="w-5 h-5 translate-x-[-1px] translate-y-[1px]" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </button>
            </form>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
