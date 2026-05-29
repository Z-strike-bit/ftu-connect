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
      setError('Đăng nhập thất bại. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-slate-100">
        <Image src="/logo.png" alt="FTU Connect" width={200} height={50} className="mx-auto mb-8 h-12 w-auto object-contain" priority />
        <h1 className="text-3xl font-extrabold text-black mb-2">Đăng nhập</h1>
        <p className="text-slate-500 font-medium mb-8">Sử dụng tài khoản Google để tiếp tục</p>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-200 mb-6">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 text-black font-bold py-4 px-4 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
          {loading ? 'Đang kết nối...' : 'Đăng nhập bằng Google'}
        </button>
        
        <p className="mt-8 text-sm text-slate-400 font-medium">
          Bằng việc đăng nhập, bạn đồng ý với Điều khoản và Chính sách của chúng tôi.
        </p>
      </div>
    </div>
  );
}
