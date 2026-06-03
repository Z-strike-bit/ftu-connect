"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, collection, onSnapshot, query, where } from 'firebase/firestore';
import ConnectModal from '@/components/ConnectModal';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ConnectPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedUserToConnect, setSelectedUserToConnect] = useState<any | null>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUser(currentUser);
          setProfile(userDoc.data());
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
      setSuggestions(candidates);
    });
    
    return () => unsubscribe();
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar profileName="" onSignOut={() => {}} />
        <div className="text-center py-20 text-[#6a6a6a] font-semibold">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col h-screen overflow-hidden selection:bg-[#fff0f2] selection:text-[#ff385c]">
      <Navbar profileName={profile?.name} profileId={user?.uid} profilePhoto={profile?.photoURL} onSignOut={() => signOut(auth).then(() => router.push('/'))} />

      <div className="flex flex-1 overflow-hidden w-full max-w-[1600px] mx-auto">
        
        {/* Cột trái: Sidebar Quản lý */}
        <div className="w-[360px] bg-white border-r border-[#ebebeb] flex-shrink-0 flex flex-col h-full hidden lg:flex mt-4">
          <div className="p-5 flex justify-between items-center">
            <h2 className="text-[24px] font-bold text-[#222222]">Bạn bè</h2>
            <button className="w-10 h-10 rounded-full bg-[#f7f7f7] flex items-center justify-center hover:bg-[#ebebeb] transition-colors border border-[#dddddd]">
              <svg className="w-5 h-5 text-[#222222]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
            </button>
          </div>
          <div className="px-5 pb-4 space-y-1">
            <button className="w-full bg-[#f7f7f7] hover:bg-[#ebebeb] text-[#222222] font-semibold rounded-[14px] p-3 flex items-center gap-4 transition-colors">
              <div className="bg-[#222222] text-white p-2 rounded-full shadow-sm">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              </div>
              <span className="text-[16px]">Lời mời kết bạn</span>
            </button>
            <button className="w-full hover:bg-[#f7f7f7] text-[#222222] font-semibold rounded-[14px] p-3 flex items-center gap-4 transition-colors">
              <div className="bg-[#ebebeb] text-[#222222] p-2 rounded-full shadow-sm">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
              </div>
              <span className="text-[16px]">Gợi ý (Mới)</span>
            </button>
            <button className="w-full hover:bg-[#f7f7f7] text-[#222222] font-semibold rounded-[14px] p-3 flex items-center gap-4 transition-colors">
              <div className="bg-[#ebebeb] text-[#222222] p-2 rounded-full shadow-sm">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              </div>
              <span className="text-[16px]">Tất cả bạn bè</span>
            </button>
          </div>
        </div>

        {/* Cột Phải: Grid Card Gợi ý */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar bg-[#fdfdfd] mt-4">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-[22px] font-bold text-[#222222]">Những người bạn có thể biết</h3>
              <span className="text-[16px] font-semibold text-[#ff385c] cursor-pointer hover:underline">Xem tất cả</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {suggestions.map((suggestion) => (
                <div key={suggestion.id} className="bg-white rounded-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col border border-[#ebebeb] group">
                  <div className="aspect-square w-full bg-[#ebebeb] overflow-hidden shrink-0 relative">
                    <img 
                      src={"https://api.dicebear.com/7.x/avataaars/svg?seed=" + suggestion.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      alt="Avatar"
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h4 className="font-semibold text-[18px] text-[#222222] line-clamp-1 mb-0.5">{suggestion.name}</h4>
                    <p className="text-[15px] text-[#6a6a6a] line-clamp-1 mb-2">{suggestion.major}</p>
                    <div className="text-[14px] text-[#6a6a6a] mb-4 flex items-center gap-1.5 bg-[#f7f7f7] px-2.5 py-1.5 rounded-lg border border-[#ebebeb] w-fit">
                      <span className="w-5 h-5 rounded-full bg-[#ebebeb] flex items-center justify-center shrink-0 border border-[#dddddd]">
                        <img src={"https://api.dicebear.com/7.x/avataaars/svg?seed=" + profile?.name} className="w-full h-full rounded-full"/>
                      </span>
                      <span className="truncate">{suggestion.matchReason}</span>
                    </div>
                    
                    <div className="mt-auto flex flex-col gap-2.5">
                      <Link 
                        href={`/profile/${suggestion.id}`}
                        className="w-full py-2 bg-[#ff385c] text-white font-semibold rounded-lg text-[15px] hover:bg-[#e00b41] transition-colors text-center shadow-sm"
                      >
                        Xem trang cá nhân
                      </Link>
                      <button className="w-full py-2 bg-[#f7f7f7] text-[#222222] font-semibold rounded-lg text-[15px] hover:bg-[#ebebeb] transition-colors border border-transparent hover:border-[#dddddd]">
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {suggestions.length === 0 && (
                <div className="col-span-full py-20 text-center text-[#6a6a6a] font-semibold text-[16px]">
                  Đang quét hệ thống để tìm người phù hợp nhất...
                </div>
              )}
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
