"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
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

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12
    }
  }
};

const postVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [postContent, setPostContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  
  const [postTag, setPostTag] = useState('Thảo luận');
  const [activeFilter, setActiveFilter] = useState('Tất cả');
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
        router.push('/onboarding');
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
          matchReason = 'Match: Cùng chuyên ngành';
        }
        if (c.goals && profile.goals) {
          const commonGoals = c.goals.filter((g: string) => profile.goals?.includes(g));
          if (commonGoals.length > 0) {
            score += commonGoals.length * 2;
            if (!matchReason) matchReason = `Match: Cùng mục tiêu`;
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
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-red-200">
        <Navbar profileName="" onSignOut={() => {}} />
        <div className="w-full px-4 sm:px-6 lg:px-12 py-10 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-pulse">
            {/* Left Skeleton */}
            <div className="md:col-span-3">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-96">
                <div className="bg-slate-200 h-24 w-full"></div>
                <div className="px-6 flex flex-col items-center -mt-14 space-y-4">
                  <div className="w-28 h-28 bg-slate-300 rounded-full border-4 border-white"></div>
                  <div className="w-3/4 h-6 bg-slate-200 rounded-full mt-4"></div>
                  <div className="flex gap-2 w-full justify-center">
                    <div className="w-16 h-6 bg-slate-200 rounded-full"></div>
                    <div className="w-24 h-6 bg-slate-200 rounded-full"></div>
                  </div>
                  <div className="w-1/2 h-4 bg-slate-200 rounded-full mt-2"></div>
                  <div className="w-full pt-5 border-t border-slate-100">
                    <div className="w-full h-10 bg-slate-200 rounded-xl mt-4"></div>
                  </div>
                </div>
              </div>
            </div>
            {/* Center Skeleton */}
            <div className="md:col-span-6 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 h-40">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-slate-200 rounded-full shrink-0"></div>
                  <div className="flex-1 bg-slate-100 rounded-2xl h-20"></div>
                </div>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-20 h-8 bg-slate-200 rounded-full"></div>)}
              </div>
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 h-60">
                  <div className="flex gap-4 mb-4">
                    <div className="w-12 h-12 bg-slate-200 rounded-full shrink-0"></div>
                    <div className="space-y-2 flex-1">
                      <div className="w-1/3 h-4 bg-slate-200 rounded-full"></div>
                      <div className="w-1/4 h-3 bg-slate-100 rounded-full"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full h-4 bg-slate-200 rounded-full"></div>
                    <div className="w-5/6 h-4 bg-slate-200 rounded-full"></div>
                    <div className="w-4/6 h-4 bg-slate-200 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
            {/* Right Skeleton */}
            <div className="md:col-span-3 hidden md:block">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 h-96 space-y-6">
                <div className="w-1/2 h-4 bg-slate-200 rounded-full mb-6"></div>
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-3">
                    <div className="w-11 h-11 bg-slate-200 rounded-full shrink-0"></div>
                    <div className="space-y-2 flex-1">
                      <div className="w-3/4 h-4 bg-slate-200 rounded-full"></div>
                      <div className="w-1/2 h-3 bg-slate-100 rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredPosts = activeFilter === 'Tất cả' ? posts : posts.filter(p => p.tag === activeFilter);

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-800 font-sans selection:bg-red-200">
      <Navbar profileName={profile?.name} onSignOut={handleSignOut} />

      <div className="w-full px-4 sm:px-6 lg:px-12 py-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Cột Trái: Profile */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="md:col-span-3"
          >
            <motion.div 
              whileHover={{ y: -2, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-28 transition-all"
            >
              <div className="bg-slate-50 border-b border-slate-100 h-24 relative overflow-hidden"></div>
              <div className="px-6 py-4 flex flex-col items-center -mt-14">
                <div className="h-28 w-28 rounded-full bg-white flex items-center justify-center text-3xl overflow-hidden ring-4 ring-white shadow-lg relative z-10 shrink-0">
                  <img src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + profile?.name} alt="Avatar" className="w-full h-full object-cover"/>
                </div>
                <h2 className="mt-5 text-lg font-bold text-black text-center break-words w-full">{profile?.name}</h2>
                
                {/* Badges */}
                <div className="flex gap-2 justify-center mt-3 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider shrink-0">
                    {profile?.role === 'mentor' ? 'Mentor' : 'Mentee'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 uppercase tracking-wider shrink-0 ${getBadge(profile?.points || 0).color}`}>
                    {getBadge(profile?.points || 0).icon} {getBadge(profile?.points || 0).label}
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-600 mt-3 text-center">{profile?.points || 0} Điểm tín nhiệm</p>

                <div className="mt-6 w-full pt-5 border-t border-slate-100">
                  <div className="flex flex-col gap-3 text-sm text-slate-500">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Chuyên ngành</span> 
                      <span className="font-bold text-black break-words">{profile?.major}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 w-full">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsProfileModalOpen(true)}
                    className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                  >
                    Cập nhật hồ sơ
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Cột Giữa: Feed */}
          <div className="md:col-span-6 space-y-8">
            
            {/* Hộp đăng bài */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
            >
              <div className="flex space-x-4 mb-4">
                <div className="flex-shrink-0">
                  <img src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + profile?.name} alt="Avatar" className="h-12 w-12 rounded-full bg-slate-100 border border-slate-200"/>
                </div>
                <div className="min-w-0 flex-1">
                  <textarea
                    rows={3}
                    className="block w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-black placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-600 sm:text-[15px] resize-none transition-all font-medium"
                    placeholder="Chia sẻ kiến thức, kinh nghiệm hoặc đặt câu hỏi..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2 flex-wrap gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <select 
                    value={postTag} 
                    onChange={(e) => setPostTag(e.target.value)}
                    className="rounded-xl border-slate-200 bg-white text-sm font-bold text-slate-700 py-2 px-4 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-600 border shadow-sm cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    {TAGS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>

                  <label className="flex items-center space-x-2 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input type="checkbox" className="sr-only" checked={isAnonymous} onChange={() => setIsAnonymous(!isAnonymous)} />
                      <div className={`block w-10 h-6 rounded-full transition-colors duration-200 ease-in-out ${isAnonymous ? 'bg-black' : 'bg-slate-200'}`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out shadow-sm ${isAnonymous ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                    <span className="text-xs font-bold text-slate-500 group-hover:text-black transition-colors hidden sm:block">Ẩn danh</span>
                  </label>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePost}
                  disabled={!postContent.trim() || isPosting}
                  className="inline-flex shrink-0 items-center bg-red-600 hover:bg-red-700 text-white rounded-xl px-6 py-2.5 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {isPosting ? 'Đang...' : 'Đăng bài'}
                </motion.button>
              </div>
            </motion.div>

            {/* Filter Pills */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar items-center"
            >
              {['Tất cả', ...TAGS].map(tag => (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  key={tag}
                  onClick={() => setActiveFilter(tag)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-colors border ${activeFilter === tag ? 'bg-red-50 text-red-600 border-red-100 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-800 hover:bg-slate-50'}`}
                >
                  {tag}
                </motion.button>
              ))}
            </motion.div>

            {/* Danh sách bài đăng */}
            <motion.div 
              variants={listVariants}
              initial="hidden"
              animate="show"
              className="space-y-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredPosts.map((post) => {
                  const hasLiked = post.likedBy && post.likedBy.includes(user?.uid || '');
                  const isExpanded = !!expandedComments[post.id];
                  
                  return (
                    <motion.div 
                      key={post.id} 
                      variants={postVariants}
                      layout
                      className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 transition-all group"
                    >
                      <div className="flex space-x-4 items-start">
                        <div className="flex-shrink-0">
                          {post.isAnonymous ? (
                            <div className="h-12 w-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xl shadow-sm">
                              <span className="text-slate-500 text-2xl">🕵️</span>
                            </div>
                          ) : (
                            <img src={"https://api.dicebear.com/7.x/avataaars/svg?seed=" + post.authorName} alt="Avatar" className="h-12 w-12 rounded-full bg-slate-100 border border-slate-200"/>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={`text-base font-extrabold ${post.isAnonymous ? 'text-slate-500' : 'text-black'}`}>
                              {post.isAnonymous ? 'Sinh viên ẩn danh' : post.authorName}
                            </p>
                            {!post.isAnonymous && post.authorBadge && (
                              <span className={`px-2 py-1 text-xs font-bold rounded flex items-center gap-1 border shrink-0 ${post.authorBadge.color}`}>
                                {post.authorBadge.icon} {post.authorBadge.label}
                              </span>
                            )}
                            {post.tag && (
                              <span className="px-3 py-1 rounded border border-slate-200 bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-widest shrink-0">
                                {post.tag}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-slate-400 mt-1">
                            {new Date(post.createdAt).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-5 text-black font-medium text-base whitespace-pre-wrap leading-relaxed">
                        {post.content}
                      </div>
                      
                      <div className="mt-5 flex gap-3 border-t border-slate-100 pt-4">
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleLike(post.id, post.likedBy || [], post.likes || 0)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors border ${hasLiked ? 'text-red-600 bg-red-50 border-red-100' : 'text-slate-500 border-transparent hover:bg-slate-50 hover:text-black'}`}
                        >
                          <svg className={`w-5 h-5 transition-transform ${hasLiked ? 'fill-current scale-110' : 'fill-none stroke-current'}`} viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                          </svg>
                          <span>{post.likes || 0}</span>
                        </motion.button>
                        
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !isExpanded }))}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors border ${isExpanded ? 'text-black bg-slate-100 border-slate-200' : 'text-slate-500 border-transparent hover:bg-slate-50 hover:text-black'}`}
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span>{post.comments?.length || 0}</span>
                        </motion.button>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-5 pt-5 border-t border-slate-100 space-y-5">
                              <div className="space-y-4">
                                {(post.comments || []).map((cmt, idx) => (
                                  <div key={idx} className="flex gap-3">
                                    <img src={"https://api.dicebear.com/7.x/avataaars/svg?seed=" + cmt.authorName} alt="Avatar" className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 shrink-0"/>
                                    <div className="bg-slate-50 rounded-2xl rounded-tl-none px-5 py-3 border border-slate-100">
                                      <p className="text-xs font-extrabold text-black">{cmt.authorName}</p>
                                      <p className="text-sm text-slate-700 mt-1 font-medium">{cmt.content}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              <div className="flex gap-3 items-start">
                                <img src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + profile?.name} alt="Avatar" className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 shrink-0 mt-1"/>
                                <div className="flex-1 flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="Viết bình luận..."
                                    value={commentInputs[post.id] || ''}
                                    onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                    onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                                    className="flex-1 bg-white border-2 border-slate-200 rounded-full px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-600 font-medium transition-all"
                                  />
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleComment(post.id)}
                                    disabled={!commentInputs[post.id]?.trim()}
                                    className="text-white p-2 disabled:opacity-50 transition-colors bg-black hover:bg-red-600 rounded-full w-11 h-11 flex items-center justify-center shrink-0 shadow-sm"
                                  >
                                    <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
                                  </motion.button>
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
              
              {filteredPosts.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm"
                >
                  <div className="text-5xl mb-4">✨</div>
                  <p className="text-slate-500 font-bold text-lg">Chưa có bài viết nào trong chủ đề này.</p>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Cột Phải: Suggestions */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="md:col-span-3 hidden md:block"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-28">
              <h3 className="font-extrabold text-black mb-6 text-[13px] tracking-widest uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                Gợi ý kết nối
              </h3>
              <div className="space-y-5">
                {suggestions.map(suggestion => (
                  <motion.div 
                    whileHover={{ y: -2 }}
                    key={suggestion.id} 
                    className="flex flex-col gap-3 group border-b border-slate-100 pb-5 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center space-x-3">
                      <img src={"https://api.dicebear.com/7.x/avataaars/svg?seed=" + suggestion.name} className="h-11 w-11 rounded-full bg-slate-100 border border-slate-200" alt="Avatar"/>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-black truncate">{suggestion.name}</p>
                        <p className="text-xs font-bold text-slate-400 uppercase mt-0.5 truncate">{suggestion.role === 'mentor' ? 'Mentor' : 'Mentee'} - {suggestion.major}</p>
                        <p className="text-xs font-extrabold text-red-600 mt-1">{suggestion.matchReason}</p>
                      </div>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.02, backgroundColor: "#000", color: "#fff" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedUserToConnect(suggestion);
                        setIsConnectModalOpen(true);
                      }}
                      className="w-full text-black border-2 border-black rounded-xl py-2 text-xs font-bold transition-colors"
                    >
                      Kết nối
                    </motion.button>
                  </motion.div>
                ))}
                
                {suggestions.length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-sm font-bold text-slate-400">Đang tìm kiếm ghép cặp...</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

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
