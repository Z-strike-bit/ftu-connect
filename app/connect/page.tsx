"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, collection, onSnapshot, query, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import Link from 'next/link';

export default function ConnectPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'suggestions' | 'requests' | 'friends'>('suggestions');
  
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);

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

  useEffect(() => {
    if (!user) return;

    // Listen to current user's profile to get their connections
    const unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setProfile({ id: docSnap.id, ...docSnap.data() });
      } else {
        router.push('/onboarding');
      }
    });

    // Listen to all users to filter into tabs
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      if (!profile) return; // Wait for profile to load
      
      const allUsers = snapshot.docs.map(d => ({ id: d.id, ...d.data() as any }));
      
      const myFriends = profile.friends || [];
      const myPendingRequests = profile.pendingRequests || [];
      const mySentRequests = profile.sentRequests || [];

      // 1. Friends Tab
      setFriends(allUsers.filter(u => myFriends.includes(u.id)));
      
      // 2. Requests Tab (people who sent ME a request)
      setRequests(allUsers.filter(u => myPendingRequests.includes(u.id)));

      // 3. Suggestions Tab
      // Rules: Not me, not friend, not pending request (sent or received)
      let candidates = allUsers.filter(u => 
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
        if (c.role && profile.role && c.role !== profile.role) {
          score += 10;
          matchReason = c.role === 'mentor' ? 'Mentor phù hợp' : 'Mentee tiềm năng';
        }

        // Same major gets a boost
        if (c.major && profile.major && c.major === profile.major) {
          score += 5;
          if (!matchReason) matchReason = 'Cùng chuyên ngành';
        }
        
        // Common goals
        if (c.goals && profile.goals) {
          const commonGoals = c.goals.filter((g: string) => profile.goals?.includes(g));
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
    });
    
    return () => {
      unsubscribeProfile();
      unsubscribeUsers();
    };
  }, [user, profile?.id]); // Re-run users listener when profile id is set

  // ACTIONS
  const handleSendRequest = async (targetId: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        sentRequests: arrayUnion(targetId)
      });
      await updateDoc(doc(db, 'users', targetId), {
        pendingRequests: arrayUnion(user.uid)
      });
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi gửi lời mời.');
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
      <div className="min-h-screen bg-[#141414]">
        <Navbar profileName="" onSignOut={() => {}} />
        <div className="text-center py-20 text-[#999999] font-semibold">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141414] flex flex-col h-screen overflow-hidden selection:bg-[#fff0f2] selection:text-[#0099ff]">
      <Navbar profileName={profile?.name} profileId={user?.uid} profilePhoto={profile?.photoURL} onSignOut={() => signOut(auth).then(() => router.push('/'))} />

      <div className="flex flex-1 overflow-hidden w-full max-w-[1600px] mx-auto">
        
        {/* Cột trái: Sidebar Quản lý */}
        <div className="w-[360px] bg-[#141414] border-r border-[#1a1a1a] flex-shrink-0 flex flex-col h-full hidden lg:flex mt-4">
          <div className="p-5 flex justify-between items-center">
            <h2 className="text-[24px] font-bold text-white">Bạn bè</h2>
            <button className="w-10 h-10 rounded-full bg-[#090909] flex items-center justify-center hover:bg-[#1c1c1c] transition-colors border border-[#262626]">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
            </button>
          </div>
          <div className="px-5 pb-4 space-y-1">
            <button 
              onClick={() => setActiveTab('requests')}
              className={`w-full font-semibold rounded-[14px] p-3 flex items-center gap-4 transition-colors ${activeTab === 'requests' ? 'bg-[#1c1c1c] text-white' : 'hover:bg-[#090909] text-[#999999] hover:text-white'}`}
            >
              <div className="bg-[#222222] text-white p-2 rounded-full shadow-sm relative">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                {requests.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#ff385c] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {requests.length}
                  </span>
                )}
              </div>
              <span className="text-[16px]">Lời mời kết bạn</span>
            </button>
            <button 
              onClick={() => setActiveTab('suggestions')}
              className={`w-full font-semibold rounded-[14px] p-3 flex items-center gap-4 transition-colors ${activeTab === 'suggestions' ? 'bg-[#1c1c1c] text-white' : 'hover:bg-[#090909] text-[#999999] hover:text-white'}`}
            >
              <div className="bg-[#1c1c1c] text-white p-2 rounded-full shadow-sm">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
              </div>
              <span className="text-[16px]">Gợi ý (Mới)</span>
            </button>
            <button 
              onClick={() => setActiveTab('friends')}
              className={`w-full font-semibold rounded-[14px] p-3 flex items-center gap-4 transition-colors ${activeTab === 'friends' ? 'bg-[#1c1c1c] text-white' : 'hover:bg-[#090909] text-[#999999] hover:text-white'}`}
            >
              <div className="bg-[#1c1c1c] text-white p-2 rounded-full shadow-sm">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              </div>
              <span className="text-[16px]">Tất cả bạn bè</span>
            </button>
          </div>
        </div>

        {/* Cột Phải: Grid Card Gợi ý / Bạn bè */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar bg-[#090909] mt-4">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-[22px] font-bold text-white">
                {activeTab === 'suggestions' && 'Những người bạn có thể biết'}
                {activeTab === 'requests' && `Lời mời kết bạn (${requests.length})`}
                {activeTab === 'friends' && `Tất cả bạn bè (${friends.length})`}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* SUGGESTIONS */}
              {activeTab === 'suggestions' && suggestions.map((suggestion) => (
                <div key={suggestion.id} className="bg-[#141414] rounded-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col border border-[#1a1a1a] hover:border-[#0099ff]/50 hover:shadow-[0_0_20px_rgba(0,153,255,0.1)] transition-all duration-300 group">
                  <div className="aspect-square w-full bg-[#1c1c1c] overflow-hidden shrink-0 relative">
                    <img 
                      src={suggestion.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + suggestion.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      alt="Avatar"
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h4 className="font-semibold text-[18px] text-white line-clamp-1 mb-0.5">{suggestion.name}</h4>
                    <p className="text-[15px] text-[#999999] line-clamp-1 mb-2">{suggestion.role === 'mentor' ? 'Mentor' : 'Mentee'} • {suggestion.major}</p>
                    <div className="text-[14px] text-[#999999] mb-4 flex items-center gap-1.5 bg-[#090909] px-2.5 py-1.5 rounded-lg border border-[#1a1a1a] w-fit">
                      <span className="truncate">{suggestion.matchReason}</span>
                    </div>
                    
                    <div className="mt-auto flex flex-col gap-2.5">
                      <button 
                        onClick={() => handleSendRequest(suggestion.id)}
                        className="w-full py-2 bg-[#0099ff] text-white font-bold rounded-lg text-[15px] hover:bg-[#0077cc] transition-colors text-center shadow-sm"
                      >
                        Kết nối
                      </button>
                      <Link href={`/profile/${suggestion.id}`} className="w-full py-2 bg-[#090909] text-white font-semibold rounded-lg text-[15px] hover:bg-[#1c1c1c] transition-colors border border-transparent hover:border-[#262626] text-center">
                        Xem hồ sơ
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              
              {activeTab === 'suggestions' && suggestions.length === 0 && (
                <div className="col-span-full py-20 text-center text-[#999999] font-semibold text-[16px]">
                  Chưa tìm thấy người phù hợp lúc này. Hãy thử tìm kiếm qua thanh công cụ ở trên!
                </div>
              )}

              {/* REQUESTS */}
              {activeTab === 'requests' && requests.map((reqUser) => (
                <div key={reqUser.id} className="bg-[#141414] rounded-[14px] overflow-hidden flex flex-col border border-[#1a1a1a] hover:border-[#ff385c]/50 transition-all duration-300 group">
                  <div className="aspect-square w-full bg-[#1c1c1c] overflow-hidden shrink-0 relative">
                    <img 
                      src={reqUser.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + reqUser.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      alt="Avatar"
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h4 className="font-semibold text-[18px] text-white line-clamp-1 mb-0.5">{reqUser.name}</h4>
                    <p className="text-[15px] text-[#999999] line-clamp-1 mb-4">{reqUser.major}</p>
                    
                    <div className="mt-auto flex flex-col gap-2.5">
                      <button 
                        onClick={() => handleAcceptRequest(reqUser.id)}
                        className="w-full py-2 bg-[#ff385c] text-white font-bold rounded-lg text-[15px] hover:bg-[#e02d4f] transition-colors text-center shadow-sm"
                      >
                        Chấp nhận
                      </button>
                      <button 
                        onClick={() => handleDeclineRequest(reqUser.id)}
                        className="w-full py-2 bg-[#090909] text-white font-semibold rounded-lg text-[15px] hover:bg-[#1c1c1c] transition-colors border border-transparent hover:border-[#262626] text-center"
                      >
                        Xóa lời mời
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {activeTab === 'requests' && requests.length === 0 && (
                <div className="col-span-full py-20 text-center text-[#999999] font-semibold text-[16px]">
                  Bạn không có lời mời kết bạn nào.
                </div>
              )}

              {/* FRIENDS */}
              {activeTab === 'friends' && friends.map((friend) => (
                <div key={friend.id} className="bg-[#141414] rounded-[14px] overflow-hidden flex flex-col border border-[#1a1a1a] transition-all duration-300 group">
                  <div className="p-4 flex gap-4 items-center border-b border-[#1a1a1a]">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-[#1c1c1c] shrink-0 border border-[#262626]">
                      <img 
                        src={friend.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + friend.name} 
                        className="w-full h-full object-cover" 
                        alt="Avatar"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[18px] text-white line-clamp-1">{friend.name}</h4>
                      <p className="text-[14px] text-[#999999] line-clamp-1">{friend.role === 'mentor' ? 'Mentor' : 'Mentee'}</p>
                    </div>
                  </div>
                  <div className="p-4 mt-auto flex flex-col gap-2.5">
                    <Link href={`/profile/${friend.id}`} className="w-full py-2 bg-white text-black font-bold rounded-lg text-[15px] hover:bg-gray-200 transition-colors text-center shadow-sm">
                      Xem hồ sơ
                    </Link>
                    <button 
                      onClick={() => handleUnfriend(friend.id)}
                      className="w-full py-2 bg-[#090909] text-[#ff385c] font-semibold rounded-lg text-[15px] hover:bg-[#1a0f12] transition-colors border border-transparent hover:border-[#ff385c]/30 text-center"
                    >
                      Hủy kết bạn
                    </button>
                  </div>
                </div>
              ))}

              {activeTab === 'friends' && friends.length === 0 && (
                <div className="col-span-full py-20 text-center text-[#999999] font-semibold text-[16px]">
                  Bạn chưa có người bạn nào. Hãy kết nối thêm nhé!
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
