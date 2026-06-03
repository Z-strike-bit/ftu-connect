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
    <div className="min-h-screen bg-[#f0f2f5] font-sans flex flex-col">
      <Navbar 
        profileName={currentUserProfile?.name} 
        onSignOut={() => signOut(auth).then(() => router.push('/'))} 
        profileId={currentUser?.uid} 
        profilePhoto={currentUserProfile?.photoURL} 
      />
      
      <div className="flex-1 max-w-[1095px] w-full mx-auto px-4 sm:px-8 py-6 flex flex-col">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-4 flex justify-between items-center shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-black flex items-center gap-2">
              🗺️ Bản Đồ Sinh Tồn Chùa Láng
            </h1>
            <p className="text-[15px] text-slate-500 mt-1">
              Khám phá các góc ăn ngon, chỗ pass đồ và bí kíp sống sót quanh Ngoại Thương.
            </p>
          </div>
          <button className="hidden sm:flex bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold text-sm items-center gap-2 transition-colors shadow-md">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
            Ghim địa điểm mới
          </button>
        </div>

        {/* Map Container - Flex 1 để đẩy full chiều cao còn lại */}
        <div className="flex-1 min-h-[500px] w-full relative z-0">
          <SurvivalMap />
        </div>
      </div>
    </div>
  );
}
