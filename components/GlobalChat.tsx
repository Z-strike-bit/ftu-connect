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
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className={`fixed z-[999] bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col 
          transition-all duration-300
          ${isMinimized ? 'w-[320px] h-[48px] rounded-t-xl bottom-0 right-4 sm:right-24' : 
            'bottom-0 right-0 w-full h-full sm:w-[340px] sm:h-[450px] sm:right-24 sm:rounded-t-xl sm:bottom-0'}
        `}
      >
        {/* Header */}
        <div 
          className="bg-red-600 px-3 py-2 flex justify-between items-center cursor-pointer shrink-0"
          onClick={() => setIsMinimized(!isMinimized)}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="relative">
              <img src={targetUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetUser.name}`} className="w-8 h-8 rounded-full bg-white object-cover" />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-red-600"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-[15px] leading-tight line-clamp-1">{targetUser.name}</span>
              <span className="text-red-100 text-[11px] leading-tight">Đang hoạt động</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button 
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-black/10 transition"
              onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
            >
              {isMinimized ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              )}
            </button>
            <button 
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-black/10 transition"
              onClick={(e) => { e.stopPropagation(); setActiveChatTarget(null); }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* Body */}
        {!isMinimized && (
          <>
            <div className="flex-1 overflow-y-auto p-3 bg-slate-50 flex flex-col gap-2 custom-scrollbar">
              
              {/* Profile Intro */}
              <div className="text-center py-4 flex flex-col items-center border-b border-slate-200 mb-2">
                <img src={targetUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetUser.name}`} className="w-16 h-16 rounded-full bg-slate-200 mb-2" />
                <h4 className="font-bold text-black">{targetUser.name}</h4>
                <p className="text-[13px] text-slate-500">{targetUser.major}</p>
                <Link href={`/profile/${targetUser.id}`} className="mt-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-full font-semibold transition">
                  Xem trang cá nhân
                </Link>
              </div>

              {messages.map((msg, idx) => {
                const isMe = msg.senderId === currentUser.uid;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-3 py-2 text-[15px] ${isMe ? 'bg-red-600 text-white rounded-2xl rounded-br-sm' : 'bg-slate-200 text-black rounded-2xl rounded-bl-sm'}`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-2 bg-white border-t border-slate-200 flex items-end gap-2 shrink-0 pb-[env(safe-area-inset-bottom,8px)]">
              <div className="flex-1 bg-slate-100 rounded-2xl flex items-end px-3 py-2 min-h-[40px]">
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
                  className="w-full bg-transparent outline-none resize-none text-[15px] max-h-24 custom-scrollbar text-black placeholder:text-slate-500"
                  rows={1}
                />
              </div>
              <button 
                type="submit"
                disabled={!newMessage.trim()}
                className="w-10 h-10 rounded-full flex items-center justify-center text-red-600 hover:bg-red-50 transition disabled:opacity-50 disabled:hover:bg-transparent shrink-0"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </button>
            </form>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
