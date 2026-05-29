"use client";

import React from 'react';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: any | null;
}

export default function ConnectModal({ isOpen, onClose, targetUser }: ConnectModalProps) {
  if (!isOpen || !targetUser) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-[fadeUp_0.3s_ease-out]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-5 px-6 border-b border-blue-100 flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <h3 className="text-xl font-extrabold text-blue-900 relative z-10">Kết nối ngay!</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors relative z-10">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-center space-y-5">
          <div className="relative mx-auto w-20 h-20">
            <img 
              src={"https://api.dicebear.com/7.x/avataaars/svg?seed=" + targetUser.name} 
              alt="Avatar" 
              className="w-20 h-20 rounded-full border-4 border-white shadow-md bg-slate-100 relative z-10"
            />
            <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-ping"></div>
          </div>
          
          <div>
            <p className="text-slate-600 font-medium text-sm">Bạn đang yêu cầu kết nối với</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{targetUser.name}</p>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mt-1">{targetUser.role === 'mentor' ? 'Mentor' : 'Mentee'}</p>
          </div>

          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 text-sm text-slate-700 font-medium">
            Hãy chủ động gửi tin nhắn làm quen qua mạng xã hội của họ nhé! Đừng ngại ngần! 🚀
          </div>

          <a 
            href={targetUser.contactLink} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition-all transform active:scale-95"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.145 2 11.259c0 2.915 1.53 5.513 3.905 7.234.204.148.336.38.354.63l.115 1.584c.045.626.732.96 1.25.607l1.986-1.35c.22-.15.485-.205.744-.158 1.05.19 2.146.29 3.28.29 5.523 0 10-4.145 10-9.259S17.523 2 12 2zm1.09 9.943l-2.493 2.65c-.328.348-.888.368-1.242.044l-2.585-2.368c-.378-.346-.96-.346-1.338 0l-2.585 2.368c-.46.42-.143 1.18.498 1.18h.023l2.493-2.65c.328-.348.888-.368 1.242-.044l2.585 2.368c.378.346.96.346 1.338 0l2.585-2.368c.46-.42.143-1.18-.498-1.18h-.023z"/></svg>
            Nhắn tin ngay
          </a>
        </div>
      </div>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
