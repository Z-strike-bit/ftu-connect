"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { auth, googleProvider, db } from '@/lib/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      const docRef = doc(db, 'users', result.user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    } catch (err: any) {
      console.error(err);
      setError('Lỗi đăng nhập với Google.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#090909] p-4 font-sans relative overflow-hidden selection:bg-ftu-red-100 dark:selection:bg-[#fff0f2] selection:text-ftu-red-700 dark:selection:text-[#0099ff]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-br from-ftu-red-400 dark:from-[#6a4cf5] to-ftu-red-500 dark:to-[#d44df0] rounded-[100%] blur-[120px] opacity-20 pointer-events-none"></div>

      <div className="max-w-md w-full bg-white dark:bg-[#141414] backdrop-blur-2xl rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-10 text-center border border-gray-200 dark:border-[#1a1a1a] relative z-10">
        <Image src="/logo_ftu_don_gian.png" alt="FTU Connect" width={200} height={50} className="mx-auto mb-8 h-14 w-auto object-contain drop-shadow-md dark:brightness-0 dark:invert" priority />
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">Đăng nhập</h1>
        <p className="text-gray-500 dark:text-[#999999] font-medium mb-10 text-[15px]">Chào mừng trở lại FTU Connect</p>
        
        {error && (
          <div className="bg-[#ff385c]/10 text-[#ff385c] p-4 rounded-xl text-sm font-bold border border-[#ff385c]/20 mb-6 text-left">
            {error}
          </div>
        )}

        {/* Phương thức: Google SSO */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 dark:border-transparent text-gray-900 dark:text-black font-bold py-[14px] px-6 rounded-[100px] hover:bg-gray-50 dark:hover:bg-gray-200 transition-all duration-300 disabled:opacity-50 mt-8 shadow-sm dark:shadow-[0_4px_15px_rgba(255,255,255,0.15)]"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6 shrink-0" />
          <span className="text-[16px]">Đăng nhập bằng Email Sinh viên (@ftu.edu.vn)</span>
        </button>
      </div>
    </div>
  );
}
