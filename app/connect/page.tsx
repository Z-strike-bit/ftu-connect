"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, getDocs, doc, getDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import Link from 'next/link';

export default function ConnectPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'suggestions' | 'requests' | 'friends' | 'sent'>('suggestions');
  const [isScanning, setIsScanning] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);
  
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [sentRequestsUsers, setSentRequestsUsers] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [allUsersCache, setAllUsersCache] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Handle Radar Scanning State
  useEffect(() => {
    if (activeTab === 'suggestions') {
      setIsScanning(true);
      const timer = setTimeout(() => {
        setIsScanning(false);
      }, 2500);
      return () => clearTimeout(timer);
    } else {
      setIsScanning(false);
    }
  }, [activeTab]);

  useEffect(() => {
    // One-time fetch for all users to avoid massive read operations and memory leaks
    getDocs(collection(db, 'users')).then(snapshot => {
      const users = snapshot.docs.map(d => ({ id: d.id, ...d.data() as any }));
      setAllUsersCache(users);
    });
  }, []);

  useEffect(() => {
    if (!user || allUsersCache.length === 0) return;

    // Listen to current user's profile to get their connections
    const unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const currentUserData = { id: docSnap.id, ...docSnap.data() as any };
        setProfile(currentUserData);
        
        const myFriends = currentUserData.friends || [];
        const myPendingRequests = currentUserData.pendingRequests || [];
        const mySentRequests = currentUserData.sentRequests || [];

        // 1. Friends Tab
        setFriends(allUsersCache.filter(u => myFriends.includes(u.id)));
        
        // 2. Requests Tab (people who sent ME a request)
        setRequests(allUsersCache.filter(u => myPendingRequests.includes(u.id)));

        // 3. Sent Requests Tab (people I sent a request to)
        setSentRequestsUsers(allUsersCache.filter(u => mySentRequests.includes(u.id)));

        // 4. Suggestions Tab
        // Rules: Not me, not friend, not pending request (sent or received)
        let candidates = allUsersCache.filter(u => 
          u.id !== user.uid && 
          !myFriends.includes(u.id) && 
          !myPendingRequests.includes(u.id) &&
          !mySentRequests.includes(u.id)
        );

        // Score suggestions
        candidates = candidates.map(c => {
          let score = 0;
          let matchReason = '';
          
          // Opposite role gets a boost
          if (c.role && currentUserData.role && c.role !== currentUserData.role) {
            score += 10;
            matchReason = c.role === 'mentor' ? 'Mentor phù hợp' : 'Mentee tiềm năng';
          }

          // Same major gets a boost
          if (c.major && currentUserData.major && c.major === currentUserData.major) {
            score += 5;
            if (!matchReason) matchReason = 'Cùng chuyên ngành';
          }
          
          // Common goals
          if (c.goals && currentUserData.goals) {
            const commonGoals = c.goals.filter((g: string) => currentUserData.goals?.includes(g));
            if (commonGoals.length > 0) {
              score += commonGoals.length * 2;
              if (!matchReason) matchReason = `Chung mục tiêu`;
            }
          }
          
          if (!matchReason) matchReason = 'Gợi ý kết nối';
          return { ...c, score, matchReason };
        });

        // Sort by score
        candidates.sort((a, b) => b.score - a.score);
        setSuggestions(candidates);
        setLoading(false);
      } else {
        router.push('/onboarding');
      }
    });
    
    return () => {
      unsubscribeProfile();
    };
  }, [user, allUsersCache, router]); 

  // ACTIONS
  const handleSendRequest = async (targetId: string) => {
    if (!user) return;
    setSendingId(targetId);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        sentRequests: arrayUnion(targetId)
      });
      await updateDoc(doc(db, 'users', targetId), {
        pendingRequests: arrayUnion(user.uid)
      });
      // Force change to Sent tab after a brief delay so they see what happened
      // setActiveTab('sent');
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi gửi lời mời: ' + (err as Error).message);
    } finally {
      setSendingId(null);
    }
  };

  const handleAcceptRequest = async (targetId: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        pendingRequests: arrayRemove(targetId),
        friends: arrayUnion(targetId)
      });
      await updateDoc(doc(db, 'users', targetId), {
        sentRequests: arrayRemove(user.uid),
        friends: arrayUnion(user.uid)
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeclineRequest = async (targetId: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        pendingRequests: arrayRemove(targetId)
      });
      await updateDoc(doc(db, 'users', targetId), {
        sentRequests: arrayRemove(user.uid)
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnfriend = async (targetId: string) => {
    if (!user || !confirm('Bạn có chắc chắn muốn hủy kết bạn?')) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        friends: arrayRemove(targetId)
      });
      await updateDoc(doc(db, 'users', targetId), {
        friends: arrayRemove(user.uid)
      });
    } catch (err) {
      console.error(err);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#050508]">
        <Navbar profileName="" onSignOut={() => {}} />
        <div className="text-center py-20 text-ftu-red-600 dark:text-[#0099ff] font-mono animate-pulse font-semibold">INITIALIZING LOBBY...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050508] flex flex-col h-screen overflow-hidden selection:bg-ftu-red-700/20 dark:selection:bg-[#0099ff]/30 selection:text-gray-900 dark:selection:text-[#00ff88]">
      <Navbar profileName={profile?.name} profileId={user?.uid} profilePhoto={profile?.photoURL} onSignOut={() => signOut(auth).then(() => router.push('/'))} />

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden w-full max-w-[1600px] mx-auto relative">
        {/* Background Gradients for eSports Vibe */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-ftu-red-500/10 dark:from-[#0099ff]/10 to-transparent pointer-events-none z-0"></div>
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-ftu-gold/10 dark:from-[#d44df0]/10 to-transparent pointer-events-none z-0"></div>
        
        {/* Cột trái: Sidebar Quản lý */}
        <div className="w-[360px] bg-white dark:bg-[#0a0a14]/80 backdrop-blur-md dark:backdrop-blur-xl border-r border-gray-200 dark:border-[#1f1f33] flex-shrink-0 flex flex-col h-full hidden lg:flex mt-4 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.05)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
          <div className="p-6 flex justify-between items-center border-b border-gray-200 dark:border-[#1f1f33]">
            <h2 className="text-[22px] font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <svg className="w-6 h-6 text-ftu-red-600 dark:text-[#0099ff]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
              Lobby
            </h2>
          </div>
          <div className="px-5 py-6 space-y-3">
            <button 
              onClick={() => setActiveTab('requests')}
              className={`relative w-full rounded-2xl p-3.5 flex items-center gap-4 transition-all duration-300 group overflow-hidden border ${activeTab === 'requests' ? 'bg-[#ff385c]/10 border-[#ff385c]/30 text-[#ff385c] translate-x-1 shadow-[0_0_20px_rgba(255,56,92,0.15)]' : 'bg-transparent border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-[#8888a0] dark:hover:bg-white/5 dark:hover:text-white hover:translate-x-1'}`}
            >
              {activeTab === 'requests' && <div className="absolute inset-0 bg-gradient-to-r from-[#ff385c]/20 to-transparent opacity-50"></div>}
              {activeTab === 'requests' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-[#ff385c] rounded-r-full shadow-[0_0_10px_#ff385c]"></div>}
              
              <div className={`p-2.5 rounded-xl transition-all duration-300 relative z-10 ${activeTab === 'requests' ? 'bg-[#ff385c] text-white shadow-[0_0_15px_rgba(255,56,92,0.4)]' : 'bg-gray-100 dark:bg-black/40 text-gray-500 dark:text-[#8888a0] group-hover:bg-gray-200 dark:group-hover:bg-white/10 group-hover:text-gray-900 dark:group-hover:text-white border-gray-200 dark:border-white/5'}`}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                {requests.length > 0 && (
                  <span className={`absolute -top-2 -right-2 text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md ${activeTab === 'requests' ? 'bg-white text-[#ff385c]' : 'bg-[#ff385c] text-white shadow-[0_0_10px_#ff385c]'}`}>
                    {requests.length}
                  </span>
                )}
              </div>
              <span className={`text-[15px] tracking-wide relative z-10 transition-colors ${activeTab === 'requests' ? 'text-gray-900 dark:text-white font-extrabold uppercase' : 'font-semibold uppercase'}`}>Lời mời kết bạn</span>
            </button>

            <button 
              onClick={() => setActiveTab('suggestions')}
              className={`relative w-full rounded-2xl p-3.5 flex items-center gap-4 transition-all duration-300 group overflow-hidden border ${activeTab === 'suggestions' ? 'bg-ftu-red-50 border-ftu-red-200 text-ftu-red-700 dark:bg-[#00e5ff]/10 dark:border-[#00e5ff]/30 dark:text-[#00e5ff] translate-x-1 shadow-[0_0_20px_rgba(185,28,28,0.15)] dark:shadow-[0_0_20px_rgba(0,229,255,0.15)]' : 'bg-transparent border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-[#8888a0] dark:hover:bg-white/5 dark:hover:text-white hover:translate-x-1'}`}
            >
              {activeTab === 'suggestions' && <div className="absolute inset-0 bg-gradient-to-r from-ftu-red-600/10 dark:from-[#00e5ff]/20 to-transparent opacity-50"></div>}
              {activeTab === 'suggestions' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-ftu-red-600 dark:bg-[#00e5ff] rounded-r-full shadow-[0_0_10px_rgba(185,28,28,0.5)] dark:shadow-[0_0_10px_#00e5ff]"></div>}
              
              <div className={`p-2.5 rounded-xl transition-all duration-300 relative z-10 ${activeTab === 'suggestions' ? 'bg-ftu-red-600 text-white shadow-[0_0_15px_rgba(185,28,28,0.4)] dark:bg-[#00e5ff] dark:text-black dark:shadow-[0_0_15px_rgba(0,229,255,0.4)]' : 'bg-gray-100 dark:bg-black/40 text-gray-500 dark:text-[#8888a0] group-hover:bg-gray-200 dark:group-hover:bg-white/10 group-hover:text-gray-900 dark:group-hover:text-white border-gray-200 dark:border-white/5'}`}>
                {isScanning && activeTab === 'suggestions' && (
                  <span className="absolute inset-0 border border-black rounded-xl animate-ping"></span>
                )}
                <svg className="w-5 h-5 relative z-10" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
              </div>
              <span className={`text-[15px] tracking-wide relative z-10 transition-colors ${activeTab === 'suggestions' ? 'text-ftu-red-700 dark:text-white font-extrabold uppercase' : 'font-semibold uppercase'}`}>Radar Gợi ý</span>
            </button>

            <button 
              onClick={() => setActiveTab('sent')}
              className={`relative w-full rounded-2xl p-3.5 flex items-center gap-4 transition-all duration-300 group overflow-hidden border ${activeTab === 'sent' ? 'bg-[#d44df0]/10 border-[#d44df0]/30 text-[#d44df0] translate-x-1 shadow-[0_0_20px_rgba(212,77,240,0.15)]' : 'bg-transparent border-transparent text-[#8888a0] hover:bg-white/5 hover:text-white hover:translate-x-1'}`}
            >
              {activeTab === 'sent' && <div className="absolute inset-0 bg-gradient-to-r from-[#d44df0]/20 to-transparent opacity-50"></div>}
              {activeTab === 'sent' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-[#d44df0] rounded-r-full shadow-[0_0_10px_#d44df0]"></div>}
              
              <div className={`p-2.5 rounded-xl transition-all duration-300 relative z-10 ${activeTab === 'sent' ? 'bg-[#d44df0] text-white shadow-[0_0_15px_rgba(212,77,240,0.4)]' : 'bg-black/40 text-[#8888a0] group-hover:bg-white/10 group-hover:text-white border border-white/5'}`}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </div>
              <span className={`text-[15px] tracking-wide relative z-10 transition-colors ${activeTab === 'sent' ? 'text-white font-extrabold uppercase' : 'font-semibold uppercase'}`}>Đã gửi</span>
            </button>

            <button 
              onClick={() => setActiveTab('friends')}
              className={`relative w-full rounded-2xl p-3.5 flex items-center gap-4 transition-all duration-300 group overflow-hidden border ${activeTab === 'friends' ? 'bg-[#00ff88]/10 border-[#00ff88]/30 text-[#00ff88] translate-x-1 shadow-[0_0_20px_rgba(0,255,136,0.15)]' : 'bg-transparent border-transparent text-[#8888a0] hover:bg-white/5 hover:text-white hover:translate-x-1'}`}
            >
              {activeTab === 'friends' && <div className="absolute inset-0 bg-gradient-to-r from-[#00ff88]/20 to-transparent opacity-50"></div>}
              {activeTab === 'friends' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-[#00ff88] rounded-r-full shadow-[0_0_10px_#00ff88]"></div>}
              
              <div className={`p-2.5 rounded-xl transition-all duration-300 relative z-10 ${activeTab === 'friends' ? 'bg-[#00ff88] text-black shadow-[0_0_15px_rgba(0,255,136,0.4)]' : 'bg-black/40 text-[#8888a0] group-hover:bg-white/10 group-hover:text-white border border-white/5'}`}>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              </div>
              <span className={`text-[15px] tracking-wide relative z-10 transition-colors ${activeTab === 'friends' ? 'text-white font-extrabold uppercase' : 'font-semibold uppercase'}`}>Tất cả bạn bè</span>
            </button>
          </div>
        </div>

        {/* Horizontal Tab Switcher (Mobile Only) */}
        <div className="lg:hidden flex overflow-x-auto hide-scrollbar gap-2 px-4 pt-4 pb-2 shrink-0 border-b border-gray-200 dark:border-[#1f1f33] sticky top-0 z-20 bg-white/90 dark:bg-[#050508]/90 backdrop-blur-md">
          <button 
            onClick={() => setActiveTab('suggestions')}
            className={`flex-shrink-0 font-bold rounded-full px-4 py-2 flex items-center gap-2 transition-all ${activeTab === 'suggestions' ? 'bg-ftu-red-600 dark:bg-[#0099ff] text-white shadow-[0_0_15px_rgba(185,28,28,0.4)] dark:shadow-[0_0_15px_rgba(0,153,255,0.4)]' : 'bg-gray-100 dark:bg-[#1f1f33] text-gray-500 dark:text-[#8888a0]'}`}
          >
            Radar Gợi ý
          </button>
          <button 
            onClick={() => setActiveTab('requests')}
            className={`flex-shrink-0 font-bold rounded-full px-4 py-2 flex items-center gap-2 transition-all ${activeTab === 'requests' ? 'bg-[#ff0055] text-white shadow-[0_0_15px_rgba(255,0,85,0.4)]' : 'bg-gray-100 dark:bg-[#1f1f33] text-gray-500 dark:text-[#8888a0]'}`}
          >
            Lời mời {requests.length > 0 && `(${requests.length})`}
          </button>
          <button 
            onClick={() => setActiveTab('sent')}
            className={`flex-shrink-0 font-bold rounded-full px-4 py-2 flex items-center gap-2 transition-all ${activeTab === 'sent' ? 'bg-[#d44df0] text-white shadow-[0_0_15px_rgba(212,77,240,0.4)]' : 'bg-gray-100 dark:bg-[#1f1f33] text-gray-500 dark:text-[#8888a0]'}`}
          >
            Đã gửi
          </button>
          <button 
            onClick={() => setActiveTab('friends')}
            className={`flex-shrink-0 font-bold rounded-full px-4 py-2 flex items-center gap-2 transition-all ${activeTab === 'friends' ? 'bg-[#00ff88] text-black shadow-[0_0_15px_rgba(0,255,136,0.4)]' : 'bg-gray-100 dark:bg-[#1f1f33] text-gray-500 dark:text-[#8888a0]'}`}
          >
            Bạn bè
          </button>
        </div>

        {/* Cột Phải: Radar / Grid Card */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 custom-scrollbar lg:mt-4 z-10 pb-28">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex justify-between items-center mb-6 lg:mb-10 border-b border-[#1f1f33] pb-4">
              <h3 className="text-[28px] font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-[#8888a0] uppercase tracking-wider">
                {activeTab === 'suggestions' && 'Matchmaking Radar'}
                {activeTab === 'requests' && `Incoming Requests [${requests.length}]`}
                {activeTab === 'sent' && `Sent Requests [${sentRequestsUsers.length}]`}
                {activeTab === 'friends' && `My Squad [${friends.length}]`}
              </h3>
            </div>

            {isScanning && activeTab === 'suggestions' ? (
              <div className="flex flex-col items-center justify-center py-32 h-[60vh]">
                <div className="relative w-56 h-56 flex items-center justify-center">
                  <div className="absolute w-full h-full border border-[#0099ff]/30 rounded-full animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                  <div className="absolute w-3/4 h-3/4 border border-[#0099ff]/50 rounded-full animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite_0.8s]"></div>
                  <div className="absolute w-1/2 h-1/2 border-2 border-[#0099ff]/80 rounded-full animate-pulse shadow-[0_0_30px_rgba(0,153,255,0.4)]"></div>
                  <div className="absolute w-16 h-16 bg-[#0099ff] rounded-full shadow-[0_0_40px_#0099ff] animate-pulse flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                  </div>
                  <div className="absolute w-1/2 h-[2px] bg-gradient-to-r from-transparent via-[#00ff88] to-[#0099ff] top-1/2 left-1/2 origin-left animate-[spin_2s_linear_infinite] drop-shadow-[0_0_8px_#00ff88]"></div>
                </div>
                <p className="mt-12 text-[#0099ff] font-mono font-bold text-xl tracking-[0.2em] uppercase flex items-center shadow-black drop-shadow-md">
                  Đang quét hệ thống
                  <span className="flex ml-2 w-8">
                    <span className="animate-[bounce_1.5s_infinite_0ms]">.</span>
                    <span className="animate-[bounce_1.5s_infinite_200ms]">.</span>
                    <span className="animate-[bounce_1.5s_infinite_400ms]">.</span>
                  </span>
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {/* SUGGESTIONS */}
                {activeTab === 'suggestions' && suggestions.map((suggestion) => (
                  <div key={suggestion.id} className="relative bg-white dark:bg-[#0a0a14]/60 backdrop-blur-sm dark:backdrop-blur-md rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.05)] dark:shadow-xl overflow-hidden flex flex-col border border-gray-200 dark:border-[#1f1f33] hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(0,153,255,0.3)] hover:border-[#0099ff]/60 transition-all duration-300 group">
                    <div className="absolute top-3 right-3 z-20">
                      <div className="bg-green-50 dark:bg-[#050508]/90 border border-green-200 dark:border-[#00ff88]/40 text-green-700 dark:text-[#00ff88] text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-full shadow-[0_0_12px_rgba(21,128,61,0.15)] dark:shadow-[0_0_12px_rgba(0,255,136,0.25)]">
                        Match: {Math.min(95 + (suggestion.score || 0), 99)}%
                      </div>
                    </div>

                    <div className="aspect-square w-full bg-gray-100 dark:bg-[#11111a] overflow-hidden shrink-0 relative">
                      <img 
                        src={suggestion.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + suggestion.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100" 
                        alt="Avatar"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#0a0a14] via-transparent to-transparent opacity-90"></div>
                    </div>
                    
                    <div className="p-5 flex flex-col flex-1 relative z-10 -mt-8">
                      <h4 className="font-bold text-[19px] text-gray-900 dark:text-white line-clamp-1 font-sans mb-1 drop-shadow-md">{suggestion.name}</h4>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded shadow-[0_0_8px_currentColor] ${suggestion.role === 'mentor' ? 'bg-ftu-red-100 text-ftu-red-700 border-ftu-red-200 dark:bg-[#ff0055]/20 dark:text-[#ff0055] dark:border-[#ff0055]/50' : 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-[#0099ff]/20 dark:text-[#0099ff] dark:border-[#0099ff]/50'}`}>
                          {suggestion.role === 'mentor' ? 'Mentor' : 'Mentee'}
                        </span>
                        <p className="text-[13px] text-gray-500 dark:text-[#8888a0] line-clamp-1 font-medium">{suggestion.major}</p>
                      </div>

                      <div className="text-[12px] text-[#0099ff] mb-5 flex items-center gap-1.5 bg-[#0099ff]/10 px-3 py-1.5 rounded-lg border border-[#0099ff]/20 w-fit font-bold">
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                        <span className="truncate">{suggestion.matchReason || 'Gợi ý kết nối'}</span>
                      </div>
                      
                      <div className="mt-auto flex flex-col gap-2.5">
                        <button 
                          onClick={() => handleSendRequest(suggestion.id)}
                          disabled={sendingId === suggestion.id}
                          className="relative w-full py-3 bg-ftu-red-600 dark:bg-[#0a0a14] text-white font-bold rounded-xl text-[13px] uppercase tracking-wider overflow-hidden group/btn border border-ftu-red-700 dark:border-[#0099ff]/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-ftu-red-700 to-ftu-red-500 dark:from-[#0099ff] dark:to-[#d44df0] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                          <span className="relative z-10 drop-shadow-md text-white transition-colors">
                            {sendingId === suggestion.id ? 'Đang gửi...' : 'Kết nối ngay'}
                          </span>
                        </button>
                        <Link href={`/profile/${suggestion.id}`} className="w-full py-2 bg-transparent text-gray-500 dark:text-[#8888a0] font-bold rounded-xl text-[12px] hover:text-gray-900 dark:text-white uppercase tracking-wider transition-colors text-center">
                          Xem Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
                
                {activeTab === 'suggestions' && suggestions.length === 0 && (
                  <div className="col-span-full py-20 flex flex-col items-center">
                    <div className="w-20 h-20 bg-[#1f1f33] rounded-full flex items-center justify-center border-2 border-[#2a2a40] mb-4">
                      <svg className="w-8 h-8 text-gray-500 dark:text-[#8888a0]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                    <p className="text-gray-500 dark:text-[#8888a0] font-mono uppercase tracking-widest text-sm">Lobby trống. Hãy tìm kiếm thủ công!</p>
                  </div>
                )}

                {/* REQUESTS */}
                {activeTab === 'requests' && requests.map((reqUser) => (
                  <div key={reqUser.id} className="relative bg-white dark:bg-[#0a0a14]/60 backdrop-blur-sm dark:backdrop-blur-md rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.05)] dark:shadow-xl overflow-hidden flex flex-col border border-gray-200 dark:border-[#1f1f33] hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(255,0,85,0.2)] hover:border-[#ff0055]/50 transition-all duration-300 group">
                    <div className="aspect-square w-full bg-gray-100 dark:bg-[#11111a] overflow-hidden shrink-0 relative">
                      <img 
                        src={reqUser.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + reqUser.name} 
                        className="w-full h-full object-cover opacity-90" 
                        alt="Avatar"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#0a0a14] via-transparent to-transparent opacity-90"></div>
                    </div>
                    
                    <div className="p-5 flex flex-col flex-1 relative z-10 -mt-8">
                      <h4 className="font-bold text-[19px] text-gray-900 dark:text-white line-clamp-1 font-sans mb-1 drop-shadow-md">{reqUser.name}</h4>
                      <p className="text-[13px] text-gray-500 dark:text-[#8888a0] line-clamp-1 font-medium mb-5">{reqUser.major}</p>
                      
                      <div className="mt-auto flex gap-2">
                        <button 
                          onClick={() => handleAcceptRequest(reqUser.id)}
                          className="flex-1 py-2.5 bg-green-600 dark:bg-[#ff0055] text-white font-bold rounded-xl text-[12px] uppercase tracking-wider hover:bg-green-700 dark:hover:bg-[#ff3377] transition-colors shadow-[0_0_15px_rgba(22,163,74,0.3)] dark:shadow-[0_0_15px_rgba(255,0,85,0.3)]"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => handleDeclineRequest(reqUser.id)}
                          className="flex-1 py-2.5 bg-[#1f1f33] text-gray-500 dark:text-[#8888a0] font-bold rounded-xl text-[12px] uppercase tracking-wider hover:bg-[#2a2a40] hover:text-gray-900 dark:text-white transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* SENT REQUESTS */}
                {activeTab === 'sent' && sentRequestsUsers.map((reqUser) => (
                  <div key={reqUser.id} className="relative bg-white dark:bg-[#0a0a14]/60 backdrop-blur-sm dark:backdrop-blur-md rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.05)] dark:shadow-xl overflow-hidden flex flex-col border border-gray-200 dark:border-[#1f1f33] hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(212,77,240,0.2)] hover:border-[#d44df0]/50 transition-all duration-300 group">
                    <div className="aspect-square w-full bg-gray-100 dark:bg-[#11111a] overflow-hidden shrink-0 relative">
                      <img 
                        src={reqUser.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + reqUser.name} 
                        className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-500" 
                        alt="Avatar"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 dark:from-[#0a0a14] dark:via-[#0a0a14]/50 to-transparent"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#d44df0] bg-white/90 dark:bg-[#000000]/80 px-4 py-2 rounded-full border border-[#d44df0]/50 font-black text-[11px] tracking-widest uppercase backdrop-blur-md shadow-[0_0_20px_rgba(212,77,240,0.4)]">
                        Đang chờ duyệt
                      </div>
                    </div>
                    
                    <div className="p-5 flex flex-col flex-1 relative z-10 -mt-8">
                      <h4 className="font-bold text-[19px] text-gray-900 dark:text-white line-clamp-1 font-sans mb-1 drop-shadow-md">{reqUser.name}</h4>
                      <p className="text-[13px] text-gray-500 dark:text-[#8888a0] line-clamp-1 font-medium mb-5">{reqUser.major}</p>
                    </div>
                  </div>
                ))}

                {/* FRIENDS */}
                {activeTab === 'friends' && friends.map((friend) => (
                  <div key={friend.id} className="relative bg-white dark:bg-[#0a0a14]/60 backdrop-blur-sm dark:backdrop-blur-md rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.05)] dark:shadow-xl overflow-hidden flex flex-col border border-gray-200 dark:border-[#1f1f33] hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(0,255,136,0.2)] hover:border-[#00ff88]/50 transition-all duration-300 group">
                    <div className="aspect-video w-full bg-gray-100 dark:bg-[#11111a] overflow-hidden shrink-0 relative">
                      <img 
                        src={friend.coverPhotoUrl || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'} 
                        className="w-full h-full object-cover opacity-50" 
                        alt="Cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#0a0a14] to-transparent"></div>
                      <div className="absolute -bottom-6 left-5">
                        <div className="w-16 h-16 rounded-xl border-2 border-[#00ff88] overflow-hidden bg-gray-100 dark:bg-[#1c1c1c] shadow-[0_0_15px_rgba(0,255,136,0.3)]">
                          <img 
                            src={friend.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + friend.name} 
                            className="w-full h-full object-cover" 
                            alt="Avatar"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-5 pt-8 flex flex-col flex-1 relative z-10">
                      <h4 className="font-bold text-[18px] text-gray-900 dark:text-white line-clamp-1 font-sans">{friend.name}</h4>
                      <p className="text-[12px] text-gray-500 dark:text-[#8888a0] line-clamp-1 uppercase tracking-wider font-bold mb-4">{friend.role === 'mentor' ? 'Mentor' : 'Mentee'}</p>
                      
                      <div className="mt-auto flex flex-col gap-2">
                        <Link href={`/profile/${friend.id}`} className="w-full py-2.5 bg-gray-100 dark:bg-[#1f1f33] text-gray-900 dark:text-white font-bold rounded-xl text-[12px] uppercase tracking-wider hover:bg-gray-200 dark:hover:bg-[#2a2a40] transition-colors text-center border border-gray-200 dark:border-[#2a2a40]">
                          View Stats
                        </Link>
                        <button 
                          onClick={() => handleUnfriend(friend.id)}
                          className="w-full py-2 bg-transparent text-[#ff0055] font-bold rounded-xl text-[11px] uppercase tracking-wider hover:bg-[#ff0055]/10 transition-colors"
                        >
                          Unfriend
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
