"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
interface User {
  uid: string;
  photoURL?: string;
}
import { motion, AnimatePresence } from 'framer-motion';
import ConnectModal from '@/components/ConnectModal';
import Navbar from '@/components/Navbar';

interface UserProfile {
  name: string;
  email: string;
  major: string;
  role: string;
  bio: string;
  points?: number;
}

interface Comment {
  uid: string;
  authorName: string;
  content: string;
  createdAt: string;
}

interface Post {
  id: string;
  content: string;
  uid: string;
  authorName: string;
  authorBadge?: any;
  isAnonymous: boolean;
  likes: number;
  likedBy: string[];
  tag: string;
  comments: Comment[];
  createdAt: string;
}

const getBadge = (points: number) => {
  if (points >= 200) return { icon: '👑', label: 'Top Mentor', color: 'bg-[#222222] text-white border-[#222222] shadow-[0_1px_2px_rgba(0,0,0,0.04)]' };
  if (points >= 50) return { icon: '🥇', label: 'Người Nổi Bật', color: 'bg-[#fff0f2] text-[#0099ff] border-[#ffcd8]' };
  return { icon: '👤', label: 'Tân Binh', color: 'bg-[#090909] text-[#999999] border-[#1a1a1a]' };
};

const TAGS = ['Thảo luận', 'Hỏi đáp môn học', 'Tìm đồng đội', 'Góc tâm sự', 'Review'];

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [postContent, setPostContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  
  const [postTag, setPostTag] = useState('Thảo luận');
  const [expandedComments, setExpandedComments] = useState<{[key: string]: boolean}>({});
  const [commentInputs, setCommentInputs] = useState<{[key: string]: string}>({});
  
  const [posts, setPosts] = useState<Post[]>([]);
  
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedUserToConnect, setSelectedUserToConnect] = useState<any | null>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser({ uid: userData.username });
      setProfile({
        name: userData.username,
        email: '',
        major: '',
        role: 'mentee',
        bio: '',
        points: 0
      });
      setLoading(false);
    } else {
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    setSuggestions([]);
  }, [profile]);

  useEffect(() => {
    setPosts([]);
  }, []);

  const handleSignOut = async () => {
    localStorage.removeItem('currentUser');
    router.push('/');
  };

  const handlePost = async () => {
    if (!postContent.trim() || !user || !profile || isPosting) return;
    setIsPosting(true);
    try {
      const newPost: Post = {
        id: Date.now().toString(),
        content: postContent,
        uid: user.uid,
        authorName: profile.name,
        authorBadge: getBadge(0),
        isAnonymous,
        tag: postTag,
        likes: 0,
        likedBy: [],
        comments: [],
        createdAt: new Date().toISOString()
      };
      setPosts([newPost, ...posts]);
      setPostContent('');
      setPostTag('Thảo luận');
      setIsAnonymous(false);
    } finally {
      setIsPosting(false);
    }
  };

  const handleComment = async (postId: string) => {
    if (!user || !profile || !commentInputs[postId]?.trim()) return;
    const newComment: Comment = {
      uid: user.uid,
      authorName: profile.name,
      content: commentInputs[postId].trim(),
      createdAt: new Date().toISOString()
    };
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, comments: [...(p.comments || []), newComment] };
      }
      return p;
    }));
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  const handleLike = async (postId: string, likedBy: string[], currentLikes: number) => {
    if (!user) return;
    const hasLiked = likedBy.includes(user.uid);
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          likedBy: hasLiked ? p.likedBy.filter(id => id !== user.uid) : [...p.likedBy, user.uid],
          likes: hasLiked ? p.likes - 1 : p.likes + 1
        };
      }
      return p;
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090909] font-sans selection:bg-[#fff0f2]">
        <Navbar profileName="" onSignOut={() => {}} />
        <div className="text-center py-20 animate-pulse text-[#999999] font-medium">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#090909] font-sans selection:bg-[#fff0f2]">
      <Navbar profileName={profile?.name} profileId={user?.uid} profilePhoto={profile?.photoURL} onSignOut={handleSignOut} />

      <div className="w-full mx-auto px-4 sm:px-0 lg:max-w-[1600px] mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8">
          
          {/* Cột Trái: Lối tắt (Shortcuts) */}
          <div className="hidden lg:block lg:col-span-3 xl:col-span-3 pl-2 xl:pl-4">
            <div className="sticky top-28 flex flex-col gap-2 pr-4">
              <Link 
                href={user ? `/profile/${user.uid}` : "#"}
                className="flex items-center gap-3 p-3 rounded-[14px] hover:bg-[#1c1c1c] transition-colors cursor-pointer"
              >
                <img src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + profile?.name} alt="Avatar" className="w-10 h-10 rounded-full bg-[#1c1c1c]"/>
                <span className="font-semibold text-[16px] text-white">{profile?.name}</span>
              </Link>
              <Link href="/connect" className="flex items-center gap-3 p-3 rounded-[14px] hover:bg-[#1c1c1c] transition-colors cursor-pointer">
                <div className="w-10 h-10 bg-[#141414] rounded-full flex items-center justify-center shrink-0 border border-[#1a1a1a] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                </div>
                <span className="font-medium text-[16px] text-white">Bạn bè / Kết nối</span>
              </Link>
              <Link href="/events" className="flex items-center gap-3 p-3 rounded-[14px] hover:bg-[#1c1c1c] transition-colors cursor-pointer">
                <div className="w-10 h-10 bg-[#141414] rounded-full flex items-center justify-center shrink-0 border border-[#1a1a1a] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/></svg>
                </div>
                <span className="font-medium text-[16px] text-white">Sự kiện</span>
              </Link>
              <Link href="/guide" className="flex items-center gap-3 p-3 rounded-[14px] hover:bg-[#1c1c1c] transition-colors cursor-pointer">
                <div className="w-10 h-10 bg-[#141414] rounded-full flex items-center justify-center shrink-0 border border-[#1a1a1a] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>
                </div>
                <span className="font-medium text-[16px] text-white">Cẩm nang</span>
              </Link>
              
              <div className="border-b border-[#262626] my-4 mx-3"></div>
              
              <div className="p-3">
                <h3 className="text-[18px] font-semibold text-white mb-3">Lối tắt của bạn</h3>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3 p-3 rounded-[14px] hover:bg-[#1c1c1c] transition-colors cursor-pointer">
                    <span className="w-10 h-10 rounded-lg bg-[#141414] border border-[#1a1a1a] shadow-[0_1px_2px_rgba(0,0,0,0.04)] text-white flex items-center justify-center font-bold text-[14px]">KT</span>
                    <span className="font-medium text-[16px] text-white">Kinh tế quốc tế K64</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-[14px] hover:bg-[#1c1c1c] transition-colors cursor-pointer">
                    <span className="w-10 h-10 rounded-lg bg-[#141414] border border-[#1a1a1a] shadow-[0_1px_2px_rgba(0,0,0,0.04)] text-white flex items-center justify-center font-bold text-[14px]">CLB</span>
                    <span className="font-medium text-[16px] text-white">TEC FTU</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cột Giữa: Feed (Bài đăng) */}
          <div className="col-span-1 lg:col-span-6 xl:col-span-6 space-y-6 max-w-[680px] mx-auto w-full px-0 sm:px-4 lg:px-8">
            
            {/* Ô Tạo bài viết */}
            <div className="bg-[#141414] sm:rounded-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] border-x-0 sm:border border-[#1a1a1a] p-5 mb-6">
              <div className="flex gap-3 sm:gap-4 border-b border-[#1a1a1a] pb-4">
                <Link href={user ? `/profile/${user.uid}` : "#"}>
                  <img src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + profile?.name} alt="Avatar" className="w-12 h-12 rounded-full bg-[#1c1c1c] shrink-0 cursor-pointer"/>
                </Link>
                <div className="flex-1 bg-[#090909] hover:bg-[#1c1c1c] transition-colors rounded-full px-5 flex items-center cursor-text">
                  <textarea 
                    rows={1}
                    className="w-full bg-transparent border-none outline-none resize-none text-[16px] placeholder-[#6a6a6a] text-white font-normal py-3"
                    placeholder={`Bạn đang nghĩ gì thế, ${profile?.name?.split(' ').pop()}?`}
                    value={postContent}
                    onChange={(e) => {
                      setPostContent(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = (e.target.scrollHeight) + 'px';
                    }}
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-4 gap-2 flex-wrap px-2">
                <div className="flex gap-2 flex-1 items-center">
                  <select 
                    value={postTag} 
                    onChange={(e) => setPostTag(e.target.value)}
                    className="bg-transparent text-[15px] font-semibold text-[#999999] hover:bg-[#090909] hover:text-white px-3 py-2 rounded-lg cursor-pointer outline-none transition-colors border border-transparent hover:border-[#1a1a1a]"
                  >
                    {TAGS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>

                  <label className="flex items-center space-x-2 cursor-pointer hover:bg-[#090909] px-3 py-2 rounded-lg transition-colors border border-transparent hover:border-[#1a1a1a]">
                    <input type="checkbox" className="w-4 h-4 rounded text-[#0099ff] focus:ring-[#0099ff] cursor-pointer border-[#262626]" checked={isAnonymous} onChange={() => setIsAnonymous(!isAnonymous)} />
                    <span className="text-[15px] font-semibold text-[#999999] whitespace-nowrap">Ẩn danh</span>
                  </label>
                </div>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePost}
                  disabled={!postContent.trim() || isPosting}
                  className="bg-white hover:bg-gray-200 text-black rounded-[100px] px-[15px] py-[10px] text-[15px] font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {isPosting ? 'Đang...' : 'Đăng'}
                </motion.button>
              </div>
            </div>

            {/* Danh sách Bài viết */}
            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {posts.map((post) => {
                  const hasLiked = post.likedBy && post.likedBy.includes(user?.uid || '');
                  const isExpanded = !!expandedComments[post.id];
                  
                  return (
                    <motion.div 
                      key={post.id} 
                      layout
                      className="bg-[#141414] sm:rounded-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] border-x-0 sm:border border-[#1a1a1a] overflow-hidden"
                    >
                      {/* Post Header */}
                      <div className="p-5 flex items-start justify-between">
                        <div className="flex space-x-3 items-center">
                          <Link href={post.isAnonymous ? "#" : `/profile/${post.uid}`} className="flex-shrink-0 cursor-pointer">
                            {post.isAnonymous ? (
                              <div className="h-11 w-11 rounded-full bg-[#090909] border border-[#1a1a1a] flex items-center justify-center text-xl">
                                🕵️
                              </div>
                            ) : (
                              <img src={"https://api.dicebear.com/7.x/avataaars/svg?seed=" + post.authorName} alt="Avatar" className="h-11 w-11 rounded-full bg-[#1c1c1c] border border-[#1a1a1a]"/>
                            )}
                          </Link>
                          <div>
                            <div className="flex items-center flex-wrap">
                              <Link href={post.isAnonymous ? "#" : `/profile/${post.uid}`} className="text-[16px] font-semibold text-white cursor-pointer hover:underline">
                                {post.isAnonymous ? 'Sinh viên ẩn danh' : post.authorName}
                              </Link>
                            </div>
                            <div className="flex items-center text-[14px] text-[#999999] gap-1.5 mt-0.5">
                              <span className="hover:underline cursor-pointer">{new Date(post.createdAt).toLocaleString('vi-VN')}</span>
                              <span>·</span>
                              <span className="font-medium text-white bg-[#090909] px-2 py-0.5 rounded-md border border-[#1a1a1a]">{post.tag}</span>
                            </div>
                          </div>
                        </div>
                        <button className="w-10 h-10 rounded-full hover:bg-[#090909] flex items-center justify-center transition-colors">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                        </button>
                      </div>
                      
                      {/* Post Content */}
                      <div className="px-5 pb-3 text-[16px] text-white whitespace-pre-wrap leading-relaxed">
                        {post.content}
                      </div>
                      
                      {/* Engagement Stats */}
                      <div className="px-5 py-3 flex items-center justify-between text-[14px] text-[#999999] border-b border-[#1a1a1a]">
                        <div className="flex items-center gap-1.5 cursor-pointer hover:underline font-medium">
                          <div className="w-5 h-5 rounded-full bg-[#ff385c] flex items-center justify-center shadow-sm">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                          </div>
                          <span className="text-white">{post.likes || 0}</span>
                        </div>
                        <div className="flex gap-4">
                          <span className="cursor-pointer hover:underline" onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: true }))}>
                            {post.comments?.length || 0} bình luận
                          </span>
                          <span className="cursor-pointer hover:underline">0 chia sẻ</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="px-5 py-2 flex items-center justify-between gap-2">
                        <button 
                          onClick={() => handleLike(post.id, post.likedBy || [], post.likes || 0)}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-[#090909] transition-colors font-semibold text-[15px] ${hasLiked ? 'text-[#0099ff]' : 'text-[#999999] hover:text-white'}`}
                        >
                          <svg className={`w-5 h-5 ${hasLiked ? 'fill-current' : 'fill-none stroke-current'}`} strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                          Thích
                        </button>
                        <button 
                          onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !isExpanded }))}
                          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-[#090909] transition-colors font-semibold text-[15px] text-[#999999] hover:text-white"
                        >
                          <svg className="w-5 h-5 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                          Bình luận
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-[#090909] transition-colors font-semibold text-[15px] text-[#999999] hover:text-white">
                          <svg className="w-5 h-5 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
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
                            className="overflow-hidden border-t border-[#1a1a1a] bg-[#fdfdfd]"
                          >
                            <div className="p-5 space-y-5">
                              {(post.comments || []).map((cmt, idx) => (
                                <div key={idx} className="flex gap-3">
                                  <Link href={`/profile/${cmt.uid}`}>
                                    <img src={"https://api.dicebear.com/7.x/avataaars/svg?seed=" + cmt.authorName} alt="Avatar" className="w-9 h-9 rounded-full bg-[#1c1c1c] shrink-0 cursor-pointer"/>
                                  </Link>
                                  <div>
                                    <div className="bg-[#090909] rounded-[14px] px-4 py-2.5 text-[15px] border border-[#1a1a1a]">
                                      <Link href={`/profile/${cmt.uid}`} className="font-semibold text-white cursor-pointer hover:underline block mb-1">{cmt.authorName}</Link>
                                      <p className="text-white leading-relaxed">{cmt.content}</p>
                                    </div>
                                    <div className="flex gap-4 px-3 mt-1.5 text-[13px] font-semibold text-[#999999]">
                                      <span className="hover:underline hover:text-white cursor-pointer">Thích</span>
                                      <span className="hover:underline hover:text-white cursor-pointer">Phản hồi</span>
                                      <span className="font-normal">{new Date(cmt.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              
                              <div className="flex gap-3 items-start mt-4 pt-2">
                                <img src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + profile?.name} alt="Avatar" className="w-9 h-9 rounded-full bg-[#1c1c1c] shrink-0 mt-0.5 cursor-pointer"/>
                                <div className="flex-1 bg-[#090909] rounded-[14px] flex items-center px-4 py-2 border border-[#1a1a1a] focus-within:border-[#222222] transition-colors">
                                  <input
                                    type="text"
                                    placeholder="Viết bình luận công khai..."
                                    value={commentInputs[post.id] || ''}
                                    onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                    onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                                    className="flex-1 bg-transparent border-none outline-none text-[15px] placeholder-[#6a6a6a] text-white py-1"
                                  />
                                  <button
                                    onClick={() => handleComment(post.id)}
                                    disabled={!commentInputs[post.id]?.trim()}
                                    className="p-1.5 disabled:opacity-50 text-[#0099ff] hover:bg-[#1c1c1c] rounded-full transition-colors flex items-center justify-center shrink-0 ml-1"
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
                })}
              </AnimatePresence>
              
              {posts.length === 0 && (
                <div className="text-center py-20 bg-[#141414] sm:rounded-[14px] border border-[#1a1a1a] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <div className="text-5xl mb-4">📝</div>
                  <p className="text-[#999999] font-semibold text-[18px]">Chưa có bài đăng nào. Hãy là người đầu tiên lên tiếng!</p>
                </div>
              )}
            </div>
          </div>

          {/* Cột Phải: Suggestions & Events (Right Sidebar) */}
          <div className="hidden lg:block lg:col-span-3 xl:col-span-3 pr-2 xl:pr-4">
            <div className="sticky top-28 flex flex-col gap-8 pl-4">
              
              {/* Sự kiện nổi bật */}
              <div className="bg-gradient-to-br from-[#6a4cf5] to-[#d44df0] text-white p-8 rounded-[20px] shadow-[0_4px_30px_rgba(106,76,245,0.3)]">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-[22px] tracking-[-0.8px] font-inter">Sự kiện nổi bật</h3>
                  <Link href="/events" className="text-white text-[14px] font-semibold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-[100px] transition-colors border border-white/20 backdrop-blur-md">Tất cả</Link>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-4 items-start cursor-pointer hover:bg-white/10 p-3 -mx-3 rounded-[15px] transition-colors group border border-transparent hover:border-white/10">
                    <div className="flex flex-col items-center bg-black/20 rounded-[10px] border border-white/10 w-14 h-16 overflow-hidden shrink-0">
                      <span className="bg-white/20 text-white text-[12px] font-bold w-full text-center py-1 backdrop-blur-md">Th 10</span>
                      <span className="text-white font-bold text-[22px] leading-none mt-1.5">24</span>
                    </div>
                    <div className="pt-1">
                      <h4 className="text-[16px] font-semibold text-white leading-tight group-hover:underline">Ngày hội Định hướng Tân sinh viên FTU</h4>
                      <p className="text-[14px] text-white/80 mt-1.5">1,2K người quan tâm</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start cursor-pointer hover:bg-white/10 p-3 -mx-3 rounded-[15px] transition-colors group border border-transparent hover:border-white/10">
                    <div className="flex flex-col items-center bg-black/20 rounded-[10px] border border-white/10 w-14 h-16 overflow-hidden shrink-0">
                      <span className="bg-black/40 text-white text-[12px] font-bold w-full text-center py-1 backdrop-blur-md">Th 11</span>
                      <span className="text-white font-bold text-[22px] leading-none mt-1.5">05</span>
                    </div>
                    <div className="pt-1">
                      <h4 className="text-[16px] font-semibold text-white leading-tight group-hover:underline">Workshop: Lộ trình trở thành Global Citizen</h4>
                      <p className="text-[14px] text-white/80 mt-1.5">Trực tuyến</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-b border-[#262626] mx-2"></div>

              {/* Gợi ý kết nối / Người liên hệ */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-[18px] text-white">Gợi ý cho bạn</h3>
                  <div className="flex gap-1">
                    <button className="w-8 h-8 hover:bg-[#090909] rounded-full flex items-center justify-center transition-colors">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                    </button>
                    <button className="w-8 h-8 hover:bg-[#090909] rounded-full flex items-center justify-center transition-colors">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {suggestions.map(suggestion => (
                    <Link 
                      href={`/profile/${suggestion.id}`}
                      key={suggestion.id}
                      className="flex items-center gap-3 p-3 -mx-3 rounded-[14px] hover:bg-[#1c1c1c] transition-colors cursor-pointer group"
                    >
                      <div className="relative shrink-0">
                        <img src={"https://api.dicebear.com/7.x/avataaars/svg?seed=" + suggestion.name} className="h-10 w-10 rounded-full bg-[#1c1c1c] border border-[#1a1a1a]" alt="Avatar"/>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#f7f7f7] rounded-full group-hover:border-[#1a1a1a] transition-colors"></span>
                      </div>
                      <span className="text-[16px] font-medium text-white truncate flex-1">{suggestion.name}</span>
                    </Link>
                  ))}
                  {suggestions.length === 0 && (
                    <p className="text-[14px] text-[#999999] text-center py-4">Đang tìm kiếm...</p>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      <ConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        targetUser={selectedUserToConnect}
      />
    </div>
  );
}
