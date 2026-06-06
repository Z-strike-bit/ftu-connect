"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface PostCardProps {
  post: any;
  user: any;
  profile: any;
  onLike: (postId: string, likedBy: string[], likes: number) => void;
  onComment: (postId: string, commentContent: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, user, profile, onLike, onComment }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  
  const hasLiked = post.likedBy && post.likedBy.includes(user?.uid || '');

  const handleCommentSubmit = () => {
    if (!commentInput.trim()) return;
    onComment(post.id, commentInput);
    setCommentInput('');
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/95 dark:bg-[#151720] sm:rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.8)] border-x-0 sm:border border-white/60 dark:border-[#2A2D3A] overflow-hidden group transition-colors"
    >
      {/* Post Header */}
      <div className="p-6 flex items-start justify-between">
        <div className="flex space-x-4 items-center">
          <Link href={post.isAnonymous ? "#" : `/profile/${post.uid}`} className="flex-shrink-0 cursor-pointer relative">
            {post.isAnonymous ? (
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 dark:from-gray-700 dark:to-gray-900 border-2 border-gray-200 dark:border-white/20 flex items-center justify-center text-xl shadow-inner">
                🕵️
              </div>
            ) : (
              <img src={post.authorPhotoUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + post.authorName} alt="Avatar" className="h-12 w-12 rounded-full border-2 border-gray-200 dark:border-white/20 object-cover shadow-sm"/>
            )}
          </Link>
          <div>
            <div className="flex items-center flex-wrap gap-2 mb-1">
              <Link href={post.isAnonymous ? "#" : `/profile/${post.uid}`} className="text-[17px] font-extrabold text-gray-900 dark:text-white cursor-pointer hover:text-ftu-red-700 dark:hover:text-transparent dark:hover:bg-clip-text dark:hover:bg-gradient-to-r dark:hover:from-white dark:hover:to-[#c8a0e0] transition-all">
                {post.isAnonymous ? 'Sinh viên ẩn danh' : post.authorName}
              </Link>
              {!post.isAnonymous && post.authorBadge && (
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${post.authorBadge.color}`}>
                  {post.authorBadge.icon} {post.authorBadge.label}
                </span>
              )}
            </div>
            <div className="flex items-center text-[13px] text-gray-400 dark:text-[#a0a0b0] font-medium gap-2">
              <span className="hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">{new Date(post.createdAt).toLocaleString('vi-VN')}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-white/20"></span>
              <span className="font-extrabold text-ftu-red-700 dark:text-[#c8a0e0] uppercase tracking-wider">{post.tag}</span>
            </div>
          </div>
        </div>
        <button className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center transition-colors">
          <svg className="w-5 h-5 text-gray-400 dark:text-white/70" fill="currentColor" viewBox="0 0 24 24"><path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
        </button>
      </div>
      
      {/* Feeling */}
      {post.feeling && (
        <div className="px-6 pb-2">
          <span className="text-[14px] text-gray-400 dark:text-[#a0a0b0] font-medium">— Đang cảm thấy {post.feeling}</span>
        </div>
      )}

      {/* Post Content */}
      <div className="px-6 pb-4 text-[16px] text-gray-700 dark:text-[#e0e0e0] whitespace-pre-wrap leading-relaxed font-medium">
        {String(post.content || '').split(/(@\S+|#\S+)/).map((part, i) => {
          if (part.startsWith('@') || part.startsWith('#')) {
            return <span key={i} className="text-ftu-red-700 dark:text-[#00e5ff] hover:underline cursor-pointer font-bold">{part}</span>;
          }
          return part;
        })}
      </div>

      {/* Post Image */}
      {post.imageUrl && (
        <div className="px-6 pb-4">
          <img src={post.imageUrl} className="rounded-2xl max-h-[500px] w-auto border border-gray-200 dark:border-white/10" alt="Post attachment" />
        </div>
      )}

      {/* Post File Attachment */}
      {post.fileUrl && post.fileName && (
        <div className="px-6 pb-4">
          <a href={post.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 rounded-2xl px-5 py-4 transition-all group">
            <span className="text-3xl">{(() => { const ext = (post.fileName || '').split('.').pop()?.toLowerCase(); if (ext === 'pdf') return '📄'; if (['doc','docx'].includes(ext||'')) return '📝'; if (['ppt','pptx'].includes(ext||'')) return '📊'; return '📎'; })()}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-gray-900 dark:text-white truncate group-hover:text-ftu-red-700 dark:group-hover:text-[#00e5ff] transition-colors">{post.fileName}</p>
              <p className="text-[12px] text-gray-400 dark:text-[#a0a0b0]">Nhấn để tải xuống</p>
            </div>
            <svg className="w-5 h-5 text-gray-400 dark:text-[#a0a0b0] group-hover:text-ftu-red-700 dark:group-hover:text-[#00e5ff] transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          </a>
        </div>
      )}
      
      {/* Engagement Stats */}
      <div className="px-6 py-3 flex items-center justify-between text-[14px] text-gray-400 dark:text-[#a0a0b0] border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-2 cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors font-semibold">
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-ftu-red-600 to-ftu-red-700 dark:from-[#ff385c] dark:to-[#d44df0] flex items-center justify-center shadow-sm dark:shadow-[0_0_10px_rgba(255,56,92,0.4)]">
            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </div>
          <span className="text-gray-900 dark:text-white">{post.likes || 0}</span>
        </div>
        <div className="flex gap-4 font-medium">
          <span className="cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors" onClick={() => setIsExpanded(!isExpanded)}>
            {post.comments?.length || 0} bình luận
          </span>
          <span className="cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors">0 chia sẻ</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 py-2 flex items-center justify-between gap-2 bg-gray-50/50 dark:bg-white/[0.01]">
        <button 
          onClick={() => onLike(post.id, post.likedBy || [], post.likes || 0)}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors font-bold text-[15px] ${hasLiked ? 'text-ftu-red-700 dark:text-[#ff385c]' : 'text-gray-400 dark:text-[#a0a0b0] hover:text-gray-900 dark:hover:text-white'}`}
        >
          <svg className={`w-5 h-5 ${hasLiked ? 'fill-current drop-shadow-[0_0_8px_rgba(255,56,92,0.6)]' : 'fill-none stroke-current'}`} strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
          Thích
        </button>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors font-bold text-[15px] text-gray-400 dark:text-[#a0a0b0] hover:text-gray-900 dark:hover:text-white"
        >
          <svg className="w-5 h-5 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          Bình luận
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors font-bold text-[15px] text-gray-400 dark:text-[#a0a0b0] hover:text-gray-900 dark:hover:text-white">
          <svg className="w-5 h-5 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
          Chia sẻ
        </button>
      </div>

      {/* Comments Section */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20"
          >
            <div className="p-6 space-y-6">
              {(post.comments || []).map((cmt: any, idx: number) => (
                <div key={idx} className="flex gap-4">
                  <Link href={`/profile/${cmt.uid}`}>
                    <img src={cmt.authorPhotoUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + cmt.authorName} alt="Avatar" className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/20 shrink-0 object-cover cursor-pointer hover:border-gray-400 dark:hover:border-white/50 transition-colors"/>
                  </Link>
                  <div className="flex-1">
                    <div className="bg-gray-100 dark:bg-white/5 rounded-2xl px-5 py-3 text-[15px] border border-gray-200 dark:border-white/10 shadow-sm inline-block">
                      <Link href={`/profile/${cmt.uid}`} className="font-extrabold text-gray-900 dark:text-white cursor-pointer hover:text-ftu-red-700 dark:hover:text-transparent dark:hover:bg-clip-text dark:hover:bg-gradient-to-r dark:hover:from-white dark:hover:to-[#c8a0e0] block mb-1 transition-all">{cmt.authorName}</Link>
                      <p className="text-gray-700 dark:text-[#e0e0e0] leading-relaxed font-medium">{cmt.content}</p>
                    </div>
                    <div className="flex gap-4 px-3 mt-2 text-[13px] font-bold text-gray-400 dark:text-[#a0a0b0]">
                      <span className="hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors">Thích</span>
                      <span className="hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors">Phản hồi</span>
                      <span className="font-medium">{new Date(cmt.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="flex gap-4 items-start mt-6 pt-2">
                <img src={profile?.photoURL || user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + profile?.name} alt="Avatar" className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/20 shrink-0 object-cover mt-0.5 cursor-pointer"/>
                <div className="flex-1 bg-gray-100 dark:bg-[#08080C] rounded-full flex items-center px-5 py-2.5 border border-gray-200 dark:border-white/5 focus-within:border-ftu-red-700 dark:focus-within:border-[#00e5ff] focus-within:shadow-sm dark:focus-within:shadow-[0_0_10px_rgba(0,229,255,0.2)] transition-all">
                  <input
                    type="text"
                    placeholder="Viết bình luận công khai..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit()}
                    className="flex-1 bg-transparent border-none outline-none text-[15px] placeholder-gray-400 dark:placeholder-[#6a6a6a] text-gray-900 dark:text-white py-1 font-medium"
                  />
                  <button
                    onClick={handleCommentSubmit}
                    disabled={!commentInput.trim()}
                    className="p-1.5 disabled:opacity-50 text-ftu-red-700 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors flex items-center justify-center shrink-0 ml-2"
                  >
                    <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default React.memo(PostCard);
