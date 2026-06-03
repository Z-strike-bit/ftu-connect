"use client";

import React, { useState } from 'react';
import { auth, googleProvider, db } from '@/lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Login() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user exists in firestore
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    } catch (err: any) {
      console.error(err);
      setError(`Lỗi: ${err.message || 'Đăng nhập thất bại.'}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#090909] p-4 font-sans relative overflow-hidden selection:bg-[#fff0f2] selection:text-[#0099ff]">
      
      {/* Background Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-br from-[#6a4cf5] to-[#d44df0] rounded-[100%] blur-[120px] opacity-20 pointer-events-none"></div>

      <div className="max-w-md w-full bg-[#141414]/80 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-10 text-center border border-[#262626] relative z-10">
        <Image src="/logo_ftu_don_gian.png" alt="FTU Connect" width={200} height={50} className="mx-auto mb-8 h-14 w-auto object-contain drop-shadow-md" style={{ filter: 'brightness(0) invert(1)' }} priority />
        <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Đăng nhập</h1>
        <p className="text-[#999999] font-medium mb-10 text-[15px]">Sử dụng tài khoản Google sinh viên để tiếp tục</p>
        
        {error && (
          <div className="bg-[#ff385c]/10 text-[#ff385c] p-4 rounded-xl text-sm font-bold border border-[#ff385c]/20 mb-6">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-transparent text-black font-bold py-[14px] px-6 rounded-[100px] hover:bg-gray-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-300 disabled:opacity-50"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6 shrink-0" />
          <span className="text-[16px]">{loading ? 'Đang kết nối...' : 'Đăng nhập bằng Google'}</span>
        </button>
        
        <p className="mt-8 text-[13px] text-[#6a6a6a] font-medium px-4 leading-relaxed">
          Bằng việc đăng nhập, bạn đồng ý với <a href="#" className="text-white hover:underline">Điều khoản</a> và <a href="#" className="text-white hover:underline">Chính sách</a> của chúng tôi.
        </p>
      </div>
    </div>
  );
}
