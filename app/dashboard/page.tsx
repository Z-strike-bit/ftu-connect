"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import ConnectModal from '@/components/ConnectModal';
import Navbar from '@/components/Navbar';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, getDocs, doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] dark:bg-[#05050a] font-sans flex items-center justify-center">
        <p className="text-gray-400 dark:text-[#999999] font-bold animate-pulse text-lg">Đang tải Trang chủ...</p>
      </div>
    );
  }

  return (
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
                  {posts.map((post) => (
                    <PostCard 
                      key={post.id} 
                      post={post} 
                      user={user} 
                      profile={profile} 
                      onLike={handleLike} 
                      onComment={handleComment} 
                    />
                  ))}
                </AnimatePresence>
                
                {posts.length === 0 && (
                  <div className="text-center py-20 bg-white dark:bg-[#0c0c14] sm:rounded-[24px] border border-gray-100 dark:border-white/10 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                    <div className="text-6xl mb-6 drop-shadow-none dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] animate-pulse">📝</div>
                    <p className="text-gray-400 dark:text-[#a0a0b0] font-extrabold text-[20px] max-w-sm mx-auto">Chưa có bài đăng nào. Hãy là người đầu tiên lên tiếng!</p>
                  </div>
                )}
              </div>
            </div>

            <SuggestionsSidebar suggestions={suggestions} />
            
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
  );
}
