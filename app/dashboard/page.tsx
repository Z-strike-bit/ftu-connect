"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ConnectModal from '@/components/ConnectModal';
import Navbar from '@/components/Navbar';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, getDocs, doc, getDoc, updateDoc, onSnapshot, deleteDoc } from 'firebase/firestore';

import SidebarShortcuts from '@/components/dashboard/SidebarShortcuts';
import SuggestionsSidebar from '@/components/dashboard/SuggestionsSidebar';
import PostComposer from '@/components/dashboard/PostComposer';
import PostCard from '@/components/dashboard/PostCard';

interface User {
  uid: string;
  photoURL?: string;
}

interface UserProfile {
  name: string;
  email: string;
  major: string;
  role: string;
  bio: string;
  points?: number;
  photoURL?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [posts, setPosts] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  
  const [selectedUserToConnect, setSelectedUserToConnect] = useState<any | null>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser({ uid: currentUser.uid, photoURL: currentUser.photoURL || '' });
        
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile({
            name: data.name || data.username,
            email: data.email,
            major: data.major || '',
            role: data.role || 'mentee',
            bio: data.bio || '',
            points: data.points || 0,
            photoURL: data.photoURL || currentUser.photoURL
          } as UserProfile);
        }
        setLoading(false);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users'));
    getDocs(q).then(snap => {
      const usersList = snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((u: any) => u.id !== user.uid)
        .slice(0, 5);
      setSuggestions(usersList);
    });
  }, [user]);

  useEffect(() => {
    const q = query(collection(db, 'posts'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      fetchedPosts.sort((a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime());
      setPosts(fetchedPosts);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  const handleLike = useCallback(async (postId: string, likedBy: string[], currentLikes: number) => {
    if (!user) return;
    const hasLiked = likedBy.includes(user.uid);
    const postRef = doc(db, 'posts', postId);
    
    await updateDoc(postRef, {
      likedBy: hasLiked ? likedBy.filter(id => id !== user.uid) : [...likedBy, user.uid],
      likes: hasLiked ? currentLikes - 1 : currentLikes + 1
    });
  }, [user]);

  const handleComment = useCallback(async (postId: string, commentContent: string) => {
    if (!user || !profile || !commentContent.trim()) return;
    const postRef = doc(db, 'posts', postId);
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const newComment = {
      uid: user.uid,
      authorName: profile.name,
      authorPhotoUrl: profile.photoURL || user.photoURL || '',
      content: commentContent.trim(),
      createdAt: new Date().toISOString()
    };

    await updateDoc(postRef, {
      comments: [...(post.comments || []), newComment]
    });
  }, [user, profile, posts]);

  const handleConnectClick = useCallback((targetUser: any) => {
    setSelectedUserToConnect(targetUser);
    setIsConnectModalOpen(true);
  }, []);

  const handlePostCreated = useCallback(() => {
    setIsPostModalOpen(false);
  }, []);

  const handleDeletePost = useCallback(async (postId: string) => {
    if (!user) return;
    const postRef = doc(db, 'posts', postId);
    await deleteDoc(postRef);
  }, [user]);
  const renderedPosts = React.useMemo(() => {
    return posts.map(post => (
      <PostCard 
        key={post.id} 
        post={post} 
        user={user} 
        profile={profile} 
        onLike={handleLike} 
        onComment={handleComment} 
        onDelete={handleDeletePost}
      />
    ));
  }, [posts, user, profile, handleLike, handleComment, handleDeletePost]);
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] dark:bg-[#05050a] font-sans flex items-center justify-center">
        <p className="text-gray-400 dark:text-[#999999] font-bold animate-pulse text-lg">Đang tải Trang chủ...</p>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen w-full bg-[#F4F6F8] dark:bg-[#0B0C10] text-gray-900 dark:text-white font-sans selection:bg-ftu-red-700/20 dark:selection:bg-[#ff385c]/30 selection:text-gray-900 dark:selection:text-white relative overflow-clip pb-28 lg:pb-16">
      {/* Background Elements (Creative, lag-free) */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/30 via-[#0B0C10]/0 to-transparent blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#ff385c]/20 via-[#0B0C10]/0 to-transparent blur-[100px]"></div>
      </div>
      <div className="fixed inset-0 z-0 pointer-events-none dark:opacity-0 transition-opacity duration-700">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-ftu-red-500/10 to-transparent"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-ftu-gold/10 to-transparent"></div>
        <div className="absolute top-[40%] left-[40%] w-[30vw] h-[30vw] rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-ftu-red-300/10 to-transparent"></div>
      </div>
      <div className="relative z-10">
        <Navbar profileName={profile?.name} profileId={user?.uid} profilePhoto={profile?.photoURL} onSignOut={handleSignOut} />

        <div className="w-full mx-auto px-4 sm:px-0 lg:max-w-[1600px] mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8">
            
            <SidebarShortcuts user={user} profile={profile} />

            <div className="col-span-1 lg:col-span-6 xl:col-span-6 space-y-6 max-w-[680px] mx-auto w-full px-0 sm:px-4 lg:px-8">
              <PostComposer user={user} profile={profile} suggestions={suggestions} />
  
              <div className="space-y-8">
                <AnimatePresence mode="popLayout">
                  {renderedPosts}
                </AnimatePresence>
                
                {posts.length === 0 && (
                  <div className="text-center py-20 bg-white dark:bg-[#0c0c14] sm:rounded-[24px] border border-gray-100 dark:border-white/10 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                    <div className="text-6xl mb-6 drop-shadow-none dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] animate-pulse">📝</div>
                    <p className="text-gray-400 dark:text-[#a0a0b0] font-extrabold text-[20px] max-w-sm mx-auto">Chưa có bài đăng nào. Hãy là người đầu tiên lên tiếng!</p>
                  </div>
                )}
              </div>
            </div>

            <SuggestionsSidebar 
              suggestions={suggestions} 
              onConnectClick={(user) => {
                setSelectedUserToConnect(user);
                setIsConnectModalOpen(true);
              }}
            />
            
          </div>
        </div>
      </div>
      
      {isConnectModalOpen && selectedUserToConnect && (
        <ConnectModal
          isOpen={isConnectModalOpen}
          onClose={() => { setIsConnectModalOpen(false); setSelectedUserToConnect(null); }}
          targetUser={selectedUserToConnect}
        />
      )}
    </div>

      {/* Floating Action Button (FAB) for Creating Post */}
      <div className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 z-[90]">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-ftu-red-500 to-ftu-red-600 dark:from-[#00e5ff] dark:to-[#d44df0] rounded-full blur-md opacity-60 group-hover:opacity-100 group-hover:blur-lg animate-pulse transition-all duration-500"></div>
          <button 
            onClick={() => setIsPostModalOpen(true)}
            className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-ftu-red-500 to-ftu-red-600 dark:from-[#00e5ff] dark:to-[#d44df0] text-white dark:text-black shadow-[0_8px_20px_rgba(255,56,92,0.3)] dark:shadow-[0_8px_20px_rgba(0,229,255,0.3)] flex items-center justify-center hover:scale-110 transition-transform duration-300 z-10 border border-white/20"
          >
            <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Post Composer Modal (Always Mounted for 0 Lag) */}
      <div className={`fixed inset-0 z-[9999] overflow-y-auto custom-scrollbar transition-opacity duration-200 ${isPostModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div 
          className="fixed inset-0 bg-black/80"
          onClick={() => setIsPostModalOpen(false)}
        />
        <div className="min-h-full flex items-center justify-center p-4 sm:p-6 relative z-10">
          <div 
            className={`relative w-full max-w-[680px] transition-all duration-200 ${isPostModalOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-10'}`}
          >
            <div className="absolute -top-12 right-0">
              <button onClick={() => setIsPostModalOpen(false)} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors border border-white/10">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-transparent rounded-[24px]">
              <PostComposer user={user} profile={profile} suggestions={suggestions} onPostCreated={handlePostCreated} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
