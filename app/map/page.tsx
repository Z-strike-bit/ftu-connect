"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import dynamic from 'next/dynamic';

const SurvivalMap = dynamic(() => import('@/components/SurvivalMap'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-2xl border border-slate-200">
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
        <p className="font-semibold">Đang tải Bản Đồ Sinh Tồn...</p>
      </div>
    </div>
  )
});

export default function MapPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    return <div className="min-h-screen bg-[#f0f2f5]" />;
  }

  return (
    <div className="h-screen bg-[#f0f2f5] font-sans flex flex-col overflow-hidden">
      <Navbar 
        profileName={currentUserProfile?.name} 
        onSignOut={() => signOut(auth).then(() => router.push('/'))} 
        profileId={currentUser?.uid} 
        profilePhoto={currentUserProfile?.photoURL} 
      />
      
      {/* Full-screen Map Container (Trừ đi Navbar h-16 = 64px) */}
      <div className="relative h-[calc(100vh-64px)] w-full">
        
        {/* Floating Card */}
        <div className="absolute top-4 left-4 sm:left-8 z-[1000] bg-white/95 backdrop-blur-sm p-4 sm:p-5 rounded-2xl shadow-xl w-[calc(100%-32px)] sm:w-full sm:max-w-[380px] border border-white/50">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-xl font-bold text-black flex items-center gap-2 leading-tight">
                <span className="text-2xl">🗺️</span> Bản Đồ Sinh Tồn
              </h1>
            </div>
          </div>
          <p className="text-[14px] text-slate-600 mb-4 leading-snug">
            Khám phá góc ăn ngon, chỗ học tập và bí kíp sống sót quanh Ngoại Thương.
          </p>
          <button className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-bold text-[15px] flex justify-center items-center gap-2 transition-all shadow-md shadow-red-600/20 active:scale-[0.98]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
            Ghim địa điểm mới
          </button>
        </div>

        {/* Map */}
        <div className="absolute inset-0 z-0">
          <SurvivalMap />
        </div>
      </div>
    </div>
  );
}
