"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';

const SurvivalMap = dynamic(() => import('@/components/SurvivalMap'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-white/90 dark:bg-black/90">
      <div className="flex flex-col items-center gap-3 text-gray-700 dark:text-gray-300">
        <svg className="w-8 h-8 animate-spin text-ftu-red-600 dark:text-[#0099ff]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <p className="font-semibold text-[15px]">Đang tải Bản Đồ...</p>
      </div>
    </div>
  )
});

export default function MapPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'food' | 'pass' | 'event'>('all');
  const [isRadarOpen, setIsRadarOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setCurrentUserProfile(userDoc.data());
        }
        setLoading(false);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 dark:bg-black" />;
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-black font-sans flex flex-col overflow-hidden selection:bg-ftu-red-700/20 dark:selection:bg-[#fff0f2] selection:text-gray-900 dark:selection:text-[#0099ff]">
      <Navbar 
        profileName={currentUserProfile?.name} 
        onSignOut={() => signOut(auth).then(() => router.push('/'))} 
        profileId={currentUser?.uid} 
        profilePhoto={currentUserProfile?.photoURL} 
      />
      
      {/* Full-screen Map Container (Trừ đi Navbar h-[72px]) */}
      <div className="relative h-[calc(100vh-72px)] w-full">
        
        {/* Floating Card */}
        <motion.div drag dragMomentum={false} className="absolute top-4 left-4 sm:left-6 z-[1000] bg-white/95 p-5 sm:p-6 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.05)] w-[calc(100%-32px)] sm:w-full sm:max-w-[360px] cursor-move">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-[20px] font-bold text-gray-900 flex items-center gap-2 leading-tight tracking-tight">
                <span className="text-2xl">🗺️</span> Bản Đồ Sinh Tồn
              </h1>
            </div>
          </div>
          <p className="text-[15px] text-gray-600 mb-5 leading-relaxed pointer-events-none">
            Khám phá góc ăn ngon, chỗ học tập và bí kíp sống sót quanh Ngoại Thương.
          </p>
          <button className="w-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 text-gray-900 px-5 py-3 rounded-lg font-semibold text-[15px] flex justify-center items-center gap-2 transition-colors shadow-sm cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
            Ghim địa điểm mới
          </button>
        </motion.div>

        {/* Map */}
        <div className="absolute inset-0 z-0 bg-gray-50 dark:bg-black">
          <SurvivalMap activeFilter={activeFilter} />
        </div>

        {/* Radar Filter (Bottom Right) */}
        <motion.div drag dragMomentum={false} className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 z-[1000] flex flex-col items-end gap-3 cursor-move">
          <AnimatePresence>
            {isRadarOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                transition={{ type: "spring", bounce: 0.4, duration: 0.5 }}
                className="flex flex-col gap-2 mb-2 origin-bottom-right"
              >
                <button 
                  onClick={() => { setActiveFilter('all'); setIsRadarOpen(false); }}
                  className={`px-5 py-3 rounded-full text-[15px] font-semibold transition-all border shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-end gap-2 ${activeFilter === 'all' ? 'border-gray-300 bg-white text-gray-900 scale-105 shadow-md backdrop-blur-md' : 'border-transparent bg-white/90 text-gray-600 hover:bg-white hover:text-gray-900 hover:scale-105'}`}
                >
                  Tất cả 🌍
                </button>
                <button 
                  onClick={() => { setActiveFilter('food'); setIsRadarOpen(false); }}
                  className={`px-5 py-3 rounded-full text-[15px] font-semibold transition-all border shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-end gap-2 ${activeFilter === 'food' ? 'border-gray-300 bg-white text-gray-900 scale-105 shadow-md backdrop-blur-md' : 'border-transparent bg-white/90 text-gray-600 hover:bg-white hover:text-gray-900 hover:scale-105'}`}
                >
                  Ăn uống 🍜
                </button>
                <button 
                  onClick={() => { setActiveFilter('pass'); setIsRadarOpen(false); }}
                  className={`px-5 py-3 rounded-full text-[15px] font-semibold transition-all border shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-end gap-2 ${activeFilter === 'pass' ? 'border-gray-300 bg-white text-gray-900 scale-105 shadow-md backdrop-blur-md' : 'border-transparent bg-white/90 text-gray-600 hover:bg-white hover:text-gray-900 hover:scale-105'}`}
                >
                  Pass đồ 📚
                </button>
                <button 
                  onClick={() => { setActiveFilter('event'); setIsRadarOpen(false); }}
                  className={`px-5 py-3 rounded-full text-[15px] font-semibold transition-all border shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-end gap-2 ${activeFilter === 'event' ? 'border-gray-300 bg-white text-gray-900 scale-105 shadow-md backdrop-blur-md' : 'border-transparent bg-white/90 text-gray-600 hover:bg-white hover:text-gray-900 hover:scale-105'}`}
                >
                  Sự kiện 🌟
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nút Radar Chính */}
          <button 
            onClick={() => setIsRadarOpen(!isRadarOpen)}
            className={`relative w-16 h-16 rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:scale-105 transition-all duration-300 z-50 bg-white border border-gray-200`}
          >
            {/* Vòng lặp ping mượt mà */}
            {!isRadarOpen && (
              <>
                <div className="absolute inset-0 rounded-full border border-[#0099ff] animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-70"></div>
                <div className="absolute inset-0 rounded-full border-2 border-[#0099ff] animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite] opacity-40 delay-300"></div>
              </>
            )}
            
            {/* Icon Radar */}
            {isRadarOpen ? (
              <svg className="w-7 h-7 text-gray-900 rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <div className="relative w-8 h-8">
                {/* Tia quét radar quay vòng */}
                <svg className="absolute inset-0 w-8 h-8 text-gray-900 animate-[spin_3s_linear_infinite]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 12L12 2" />
                </svg>
                {/* Vòng tròn trung tâm */}
                <svg className="absolute inset-0 w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3" strokeWidth="2" />
                  <circle cx="12" cy="12" r="9" strokeWidth="2" strokeDasharray="4 4" />
                </svg>
              </div>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
