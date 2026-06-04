"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { auth, googleProvider, db } from '@/lib/firebase';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    } catch (err: any) {
      console.error(err);
      setError('Tài khoản hoặc mật khẩu không chính xác.');
    } finally {
      setLoading(false);
    }
  };

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
    <div className="min-h-screen flex items-center justify-center bg-[#090909] p-4 font-sans relative overflow-hidden selection:bg-[#fff0f2] selection:text-[#0099ff]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-br from-[#6a4cf5] to-[#d44df0] rounded-[100%] blur-[120px] opacity-20 pointer-events-none"></div>

      <div className="max-w-md w-full bg-[#141414] backdrop-blur-2xl rounded-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-10 text-center border border-[#1a1a1a] relative z-10">
        <Image src="/logo_ftu_don_gian.png" alt="FTU Connect" width={200} height={50} className="mx-auto mb-8 h-14 w-auto object-contain drop-shadow-md" style={{ filter: 'brightness(0) invert(1)' }} priority />
        <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Đăng nhập</h1>
        <p className="text-[#999999] font-medium mb-10 text-[15px]">Chào mừng trở lại FTU Connect</p>
        
        {error && (
          <div className="bg-[#ff385c]/10 text-[#ff385c] p-4 rounded-xl text-sm font-bold border border-[#ff385c]/20 mb-6 text-left">
            {error}
          </div>
        )}

        {/* Phương thức 1: Email/Password */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4 text-left">
          <div>
            <label className="block text-white text-sm font-semibold mb-2">Email (@ftu.edu.vn)</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#090909] border border-[#262626] rounded-xl px-4 py-3 text-white outline-none focus:border-[#6a4cf5] transition-colors"
              placeholder="Nhập email trường của bạn"
            />
          </div>
          <div>
            <label className="block text-white text-sm font-semibold mb-2">Mật khẩu</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#090909] border border-[#262626] rounded-xl px-4 py-3 text-white outline-none focus:border-[#6a4cf5] transition-colors"
              placeholder="Nhập mật khẩu"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full flex items-center justify-center gap-3 bg-white border border-transparent text-black font-bold py-[14px] px-6 rounded-[100px] hover:bg-gray-200 transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Đang kết nối...' : 'Đăng nhập'}
          </button>
        </form>

        {/* Dải phân cách */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-white/10"></div>
          <span className="px-3 text-[#6a6a6a] text-[13px] font-medium">Hoặc</span>
          <div className="flex-1 border-t border-white/10"></div>
        </div>

        {/* Phương thức 2: Google SSO */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-[#1c1c1c] border border-[#262626] text-white font-semibold py-[14px] px-6 rounded-[100px] hover:bg-[#262626] transition-all duration-300 disabled:opacity-50"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6 shrink-0" />
          <span className="text-[16px]">Đăng nhập bằng Google</span>
        </button>
        
        <p className="mt-8 text-[14px] text-[#999999] font-medium px-4">
          Chưa có tài khoản? <Link href="/register" className="text-white hover:underline">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
}
