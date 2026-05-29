"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc, collection, addDoc, onSnapshot, query, orderBy, updateDoc, arrayUnion, arrayRemove, where } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileModal from '@/components/ProfileModal';
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
  if (points >= 200) return { icon: '👑', label: 'Top Mentor', color: 'bg-black text-white border-black shadow-sm' };
  if (points >= 50) return { icon: '🥇', label: 'Người Nổi Bật', color: 'bg-red-50 text-red-700 border-red-200' };
  return { icon: '👤', label: 'Tân Binh', color: 'bg-slate-100 text-slate-600 border-slate-200' };
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
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const [posts, setPosts] = useState<Post[]>([]);
  
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedUserToConnect, setSelectedUserToConnect] = useState<any | null>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUser(currentUser);
          setProfile(userDoc.data() as UserProfile);
          setLoading(false);
        } else {
          router.push('/onboarding');
        }
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!profile) return;
    const oppositeRole = profile.role === 'mentor' ? 'mentee' : 'mentor';
    const q = query(collection(db, 'users'), where('role', '==', oppositeRole));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let candidates = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      candidates = candidates.map(c => {
        let score = 0;
        let matchReason = '';
        if (c.major && profile.major && c.major === profile.major) {
          score += 5;
          matchReason = 'Cùng chuyên ngành';
        }
        if (c.goals && profile.goals) {
          const commonGoals = c.goals.filter((g: string) => profile.goals?.includes(g));
          if (commonGoals.length > 0) {
            score += commonGoals.length * 2;
            if (!matchReason) matchReason = `Cùng mục tiêu`;
          }
        }
        if (!matchReason) matchReason = 'Gợi ý phù hợp';
        return { ...c, score, matchReason };
      });
      candidates.sort((a, b) => b.score - a.score);
      setSuggestions(candidates.slice(0, 5));
    });
    
    return () => unsubscribe();
  }, [profile]);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('likes', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      setPosts(postsData);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  const handlePost = async () => {
    if (!postContent.trim() || !user || !profile || isPosting) return;
    setIsPosting(true);
    try {
      const newPoints = (profile.points || 0) + 10;
      await addDoc(collection(db, 'posts'), {
        content: postContent,
        uid: user.uid,
        authorName: profile.name,
        authorBadge: getBadge(newPoints),
        isAnonymous,
        tag: postTag,
        likes: 0,
        likedBy: [],
        comments: [],
        createdAt: new Date().toISOString()
      });
      
      await updateDoc(doc(db, 'users', user.uid), { points: newPoints });
      setProfile({ ...profile, points: newPoints });
      
      setPostContent('');
      setPostTag('Thảo luận');
      setIsAnonymous(false);
    } catch (err) {
      console.error("Lỗi đăng bài:", err);
      alert("Không thể đăng bài. Vui lòng thử lại.");
    } finally {
      setIsPosting(false);
    }
  };

  const handleComment = async (postId: string) => {
    if (!user || !profile || !commentInputs[postId]?.trim()) return;
    try {
      const newComment: Comment = {
        uid: user.uid,
        authorName: profile.name,
        content: commentInputs[postId].trim(),
        createdAt: new Date().toISOString()
      };
      await updateDoc(doc(db, 'posts', postId), {
        comments: arrayUnion(newComment)
      });
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    } catch (err) {
      console.error("Lỗi cập nhật comment:", err);
    }
  };

  const handleLike = async (postId: string, likedBy: string[], currentLikes: number) => {
    if (!user) return;
    const postRef = doc(db, 'posts', postId);
    const hasLiked = likedBy.includes(user.uid);
    try {
      if (hasLiked) {
        await updateDoc(postRef, {
          likedBy: arrayRemove(user.uid),
          likes: currentLikes - 1
        });
      } else {
        await updateDoc(postRef, {
          likedBy: arrayUnion(user.uid),
          likes: currentLikes + 1
        });
      }
    } catch (err) {
      console.error("Lỗi cập nhật like:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] font-sans selection:bg-red-200">
        <Navbar profileName="" onSignOut={() => {}} />
        <div className="text-center py-20 animate-pulse text-slate-500 font-bold">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#f0f2f5] font-sans selection:bg-red-200">
      <Navbar profileName={profile?.name} onSignOut={handleSignOut} />

      <div className="w-full mx-auto px-4 sm:px-0 lg:max-w-[1600px] mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8">
          
          {/* Cột Trái: Lối tắt (Shortcuts) */}
          <div className="hidden lg:block lg:col-span-3 xl:col-span-3 pl-2 xl:pl-4">
            <div className="sticky top-20 flex flex-col gap-1 pr-4">
              <div 
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <img src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + profile?.name} alt="Avatar" className="w-9 h-9 rounded-full bg-slate-300"/>
                <span className="font-semibold text-[15px] text-slate-800">{profile?.name}</span>
              </div>
              <Link href="/connect" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer">
                <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                </div>
                <span className="font-medium text-[15px] text-slate-800">Bạn bè / Kết nối</span>
              </Link>
              <Link href="/events" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer">
                <div className="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/></svg>
                </div>
                <span className="font-medium text-[15px] text-slate-800">Sự kiện</span>
              </Link>
              <Link href="/guide" className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer">
                <div className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>
                </div>
                <span className="font-medium text-[15px] text-slate-800">Cẩm nang</span>
              </Link>
              
              <div className="border-b border-slate-300 my-3 mx-2"></div>
              
              <div className="p-2">
                <h3 className="text-[17px] font-semibold text-slate-500 mb-2">Lối tắt của bạn</h3>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer">
                    <span className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm">KT</span>
                    <span className="font-medium text-[15px] text-slate-800">Kinh tế quốc tế K64</span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer">
                    <span className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">CLB</span>
                    <span className="font-medium text-[15px] text-slate-800">TEC FTU</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cột Giữa: Feed (Bài đăng) */}
          <div className="col-span-1 lg:col-span-6 xl:col-span-6 space-y-4 max-w-[680px] mx-auto w-full px-0 sm:px-4 lg:px-8">
            
            {/* Ô Tạo bài viết */}
            <div className="bg-white sm:rounded-xl shadow-sm border-x-0 sm:border border-slate-200 p-3 sm:p-4 mb-4">
              <div className="flex gap-2 sm:gap-3 border-b border-slate-100 pb-3">
                <img src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + profile?.name} alt="Avatar" className="w-10 h-10 rounded-full bg-slate-200 shrink-0 cursor-pointer"/>
                <div className="flex-1 bg-[#f0f2f5] hover:bg-[#e4e6eb] transition-colors rounded-full px-4 flex items-center cursor-text">
                  <textarea 
                    rows={1}
                    className="w-full bg-transparent border-none outline-none resize-none text-[17px] placeholder-slate-500 font-normal py-2"
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
              
              <div className="flex justify-between items-center pt-3 gap-2 flex-wrap px-2">
                <div className="flex gap-1 flex-1 items-center">
                  <select 
                    value={postTag} 
                    onChange={(e) => setPostTag(e.target.value)}
                    className="bg-transparent text-[15px] font-semibold text-slate-600 hover:bg-slate-100 px-3 py-2 rounded-lg cursor-pointer outline-none transition-colors"
                  >
                    {TAGS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>

                  <label className="flex items-center space-x-2 cursor-pointer hover:bg-slate-100 px-3 py-2 rounded-lg transition-colors">
                    <input type="checkbox" className="w-4 h-4 rounded text-red-600 focus:ring-red-600 cursor-pointer border-slate-300" checked={isAnonymous} onChange={() => setIsAnonymous(!isAnonymous)} />
                    <span className="text-[15px] font-semibold text-slate-600 whitespace-nowrap">Ẩn danh</span>
                  </label>
                </div>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePost}
                  disabled={!postContent.trim() || isPosting}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-lg px-6 py-2 text-[15px] font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPosting ? 'Đang...' : 'Đăng'}
                </motion.button>
              </div>
            </div>

            {/* Danh sách Bài viết */}
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {posts.map((post) => {
                  const hasLiked = post.likedBy && post.likedBy.includes(user?.uid || '');
                  const isExpanded = !!expandedComments[post.id];
                  
                  return (
                    <motion.div 
                      key={post.id} 
                      layout
                      className="bg-white sm:rounded-xl shadow-sm border-x-0 sm:border border-slate-200 overflow-hidden"
                    >
                      {/* Post Header */}
                      <div className="p-4 flex items-start justify-between">
                        <div className="flex space-x-3 items-center">
                          <div className="flex-shrink-0 cursor-pointer">
                            {post.isAnonymous ? (
                              <div className="h-10 w-10 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-xl">
                                🕵️
                              </div>
                            ) : (
                              <img src={"https://api.dicebear.com/7.x/avataaars/svg?seed=" + post.authorName} alt="Avatar" className="h-10 w-10 rounded-full bg-slate-200 border border-slate-300"/>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center flex-wrap">
                              <p className="text-[15px] font-semibold text-slate-900 cursor-pointer hover:underline">
                                {post.isAnonymous ? 'Sinh viên ẩn danh' : post.authorName}
                              </p>
                            </div>
                            <div className="flex items-center text-[13px] text-slate-500 gap-1">
                              <span className="hover:underline cursor-pointer">{new Date(post.createdAt).toLocaleString('vi-VN')}</span>
                              <span>·</span>
                              <span>{post.tag}</span>
                              <svg className="w-3.5 h-3.5 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                            </div>
                          </div>
                        </div>
                        <button className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
                          <svg className="w-5 h-5 text-slate-500" fill="currentColor" viewBox="0 0 24 24"><path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                        </button>
                      </div>
                      
                      {/* Post Content */}
                      <div className="px-4 pb-2 text-[15px] text-slate-900 whitespace-pre-wrap leading-[1.3333]">
                        {post.content}
                      </div>
                      
                      {/* Engagement Stats */}
                      <div className="px-4 py-2 flex items-center justify-between text-[13px] text-slate-500 border-b border-slate-200">
                        <div className="flex items-center gap-1.5 cursor-pointer hover:underline">
                          <div className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                          </div>
                          <span>{post.likes || 0}</span>
                        </div>
                        <div className="flex gap-3">
                          <span className="cursor-pointer hover:underline" onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: true }))}>
                            {post.comments?.length || 0} bình luận
                          </span>
                          <span className="cursor-pointer hover:underline">0 chia sẻ</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="px-4 py-1 flex items-center justify-between gap-1">
                        <button 
                          onClick={() => handleLike(post.id, post.likedBy || [], post.likes || 0)}
                          className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md hover:bg-slate-100 transition-colors font-semibold text-[15px] ${hasLiked ? 'text-red-600' : 'text-slate-600'}`}
                        >
                          <svg className={`w-5 h-5 ${hasLiked ? 'fill-current' : 'fill-none stroke-current'}`} strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                          Thích
                        </button>
                        <button 
                          onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !isExpanded }))}
                          className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md hover:bg-slate-100 transition-colors font-semibold text-[15px] text-slate-600"
                        >
                          <svg className="w-5 h-5 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                          Bình luận
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md hover:bg-slate-100 transition-colors font-semibold text-[15px] text-slate-600">
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
                            className="overflow-hidden border-t border-slate-100"
                          >
                            <div className="p-4 space-y-4">
                              {(post.comments || []).map((cmt, idx) => (
                                <div key={idx} className="flex gap-2">
                                  <img src={"https://api.dicebear.com/7.x/avataaars/svg?seed=" + cmt.authorName} alt="Avatar" className="w-8 h-8 rounded-full bg-slate-200 shrink-0 cursor-pointer"/>
                                  <div>
                                    <div className="bg-[#f0f2f5] rounded-2xl px-3 py-2 text-[15px]">
                                      <p className="font-semibold text-slate-900 cursor-pointer hover:underline">{cmt.authorName}</p>
                                      <p className="text-slate-900 leading-[1.3333]">{cmt.content}</p>
                                    </div>
                                    <div className="flex gap-3 px-3 mt-1 text-[12px] font-bold text-slate-500">
                                      <span className="hover:underline cursor-pointer">Thích</span>
                                      <span className="hover:underline cursor-pointer">Phản hồi</span>
                                      <span className="font-normal">{new Date(cmt.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              
                              <div className="flex gap-2 items-start mt-2">
                                <img src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + profile?.name} alt="Avatar" className="w-8 h-8 rounded-full bg-slate-200 shrink-0 mt-0.5 cursor-pointer"/>
                                <div className="flex-1 bg-[#f0f2f5] rounded-2xl flex items-center px-3 py-1.5 border border-transparent focus-within:border-slate-300 transition-colors">
                                  <input
                                    type="text"
                                    placeholder="Viết bình luận công khai..."
                                    value={commentInputs[post.id] || ''}
                                    onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                    onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                                    className="flex-1 bg-transparent border-none outline-none text-[15px] placeholder-slate-500 py-1"
                                  />
                                  <button
                                    onClick={() => handleComment(post.id)}
                                    disabled={!commentInputs[post.id]?.trim()}
                                    className="p-1.5 disabled:opacity-50 text-red-600 hover:bg-slate-200 rounded-full transition-colors flex items-center justify-center shrink-0"
                                  >
                                    <svg className="w-4 h-4 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
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
                <div className="text-center py-20 bg-white sm:rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-5xl mb-4">📝</div>
                  <p className="text-slate-500 font-semibold text-[17px]">Chưa có bài viết nào.</p>
                </div>
              )}
            </div>
          </div>

          {/* Cột Phải: Suggestions & Events (Right Sidebar) */}
          <div className="hidden lg:block lg:col-span-3 xl:col-span-3 pr-2 xl:pr-4">
            <div className="sticky top-20 flex flex-col gap-6 pl-4">
              
              {/* Sự kiện nổi bật */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-[17px] text-slate-500">Sự kiện nổi bật</h3>
                  <Link href="/events" className="text-red-600 text-[15px] hover:bg-red-50 px-2 py-1 rounded-md transition-colors">Tất cả</Link>
                </div>
                <div className="space-y-1">
                  <div className="flex gap-3 items-start cursor-pointer hover:bg-slate-200 p-2 -mx-2 rounded-xl transition-colors group">
                    <div className="flex flex-col items-center bg-white rounded-xl shadow-sm border border-slate-200 w-12 h-14 overflow-hidden shrink-0 mt-1">
                      <span className="bg-red-600 text-white text-[11px] font-bold w-full text-center py-0.5">Th 10</span>
                      <span className="text-black font-bold text-[19px] leading-none mt-1">24</span>
                    </div>
                    <div>
                      <h4 className="text-[15px] font-semibold text-black leading-tight group-hover:underline">Ngày hội Định hướng Tân sinh viên FTU</h4>
                      <p className="text-[13px] text-slate-500 mt-1">1,2K người quan tâm</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start cursor-pointer hover:bg-slate-200 p-2 -mx-2 rounded-xl transition-colors group">
                    <div className="flex flex-col items-center bg-white rounded-xl shadow-sm border border-slate-200 w-12 h-14 overflow-hidden shrink-0 mt-1">
                      <span className="bg-blue-600 text-white text-[11px] font-bold w-full text-center py-0.5">Th 11</span>
                      <span className="text-black font-bold text-[19px] leading-none mt-1">05</span>
                    </div>
                    <div>
                      <h4 className="text-[15px] font-semibold text-black leading-tight group-hover:underline">Workshop: Lộ trình trở thành Global Citizen</h4>
                      <p className="text-[13px] text-slate-500 mt-1">Trực tuyến</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-b border-slate-300 mx-2"></div>

              {/* Gợi ý kết nối / Người liên hệ */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-[17px] text-slate-500">Người liên hệ / Gợi ý</h3>
                  <div className="flex gap-1">
                    <button className="w-8 h-8 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors">
                      <svg className="w-4 h-4 text-slate-500" fill="currentColor" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                    </button>
                    <button className="w-8 h-8 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors">
                      <svg className="w-4 h-4 text-slate-500" fill="currentColor" viewBox="0 0 24 24"><path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                    </button>
                  </div>
                </div>
                
                <div className="space-y-1">
                  {suggestions.map(suggestion => (
                    <div 
                      key={suggestion.id}
                      onClick={() => {
                        setSelectedUserToConnect(suggestion);
                        setIsConnectModalOpen(true);
                      }}
                      className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer group"
                    >
                      <div className="relative shrink-0">
                        <img src={"https://api.dicebear.com/7.x/avataaars/svg?seed=" + suggestion.name} className="h-9 w-9 rounded-full bg-slate-300" alt="Avatar"/>
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#f0f2f5] rounded-full group-hover:border-slate-200 transition-colors"></span>
                      </div>
                      <span className="text-[15px] font-medium text-slate-800 truncate flex-1">{suggestion.name}</span>
                    </div>
                  ))}
                  {suggestions.length === 0 && (
                    <p className="text-[13px] text-slate-500 text-center py-4">Đang tìm kiếm...</p>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {user && profile && (
        <ProfileModal 
          isOpen={isProfileModalOpen} 
          onClose={() => setIsProfileModalOpen(false)} 
          user={user} 
          currentProfile={profile} 
          onSuccess={(newProfile) => setProfile(newProfile)} 
        />
      )}

      <ConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        targetUser={selectedUserToConnect}
      />
    </div>
  );
}
