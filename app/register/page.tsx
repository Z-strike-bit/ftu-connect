"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { auth, googleProvider, db } from '@/lib/firebase';
import { signInWithPopup, signOut, updatePassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDocs, query, collection, where } from 'firebase/firestore';

export default function Register() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [googleEmail, setGoogleEmail] = useState('');
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email;
      
      if (email && email.endsWith('@ftu.edu.vn')) {
        setGoogleEmail(email);
        setStep(2);
      } else {
        await signOut(auth);
        setError('Truy cập bị từ chối. Chỉ email trường (@ftu.edu.vn) mới được phép đăng ký.');
      }
    } catch (err: any) {
      console.error(err);
      setError('Lỗi kết nối với Google.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (username.trim() === '' || password.trim() === '') {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Chưa xác thực Google SSO.");

      const q = query(collection(db, 'users'), where('username', '==', username));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setError('Tên tài khoản đã tồn tại.');
        return;
      }

      await updatePassword(user, password);
      await updateProfile(user, { displayName: username });

      await setDoc(doc(db, 'users', user.uid), {
        username,
        email: user.email,
        name: username,
        role: 'mentee',
        points: 0,
        createdAt: new Date().toISOString(),
        photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        bio: '',
        major: '',
        specialization: '',
        coverPhotoUrl: '',
        contactLink: '',
        gpa: '',
        clubs: '',
        achievements: '',
        skills: '',
        goals: [],
        interests: ''
      });

      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError('Có lỗi xảy ra: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#090909] p-4 font-sans relative overflow-hidden selection:bg-[#fff0f2] selection:text-[#0099ff]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-br from-[#6a4cf5] to-[#d44df0] rounded-[100%] blur-[120px] opacity-20 pointer-events-none"></div>

      <div className="max-w-md w-full bg-[#141414] backdrop-blur-2xl rounded-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-10 text-center border border-[#1a1a1a] relative z-10">
        <Image src="/logo_ftu_don_gian.png" alt="FTU Connect" width={200} height={50} className="mx-auto mb-8 h-14 w-auto object-contain drop-shadow-md" style={{ filter: 'brightness(0) invert(1)' }} priority />
        
        <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Đăng ký</h1>
        <p className="text-[#999999] font-medium mb-10 text-[15px]">
          {step === 1 ? 'Xác thực email sinh viên Ngoại Thương' : 'Tạo tài khoản để tham gia cộng đồng'}
        </p>
        
        {error && (
          <div className="bg-[#ff385c]/10 text-[#ff385c] p-4 rounded-xl text-sm font-bold border border-[#ff385c]/20 mb-6 text-left">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white border border-transparent text-black font-bold py-[14px] px-6 rounded-[100px] hover:bg-gray-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-300"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6 shrink-0" />
              <span className="text-[16px]">Tiếp tục với Google</span>
            </button>
            <p className="text-[13px] text-[#6a6a6a] mt-2">Bắt buộc sử dụng email trường (@ftu.edu.vn)</p>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleRegister} className="flex flex-col gap-4 text-left">
            <div>
              <label className="block text-white text-sm font-semibold mb-2">Tên tài khoản (Username)</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-[#090909] border border-[#262626] rounded-xl px-4 py-3 text-white outline-none focus:border-[#6a4cf5] transition-colors"
                placeholder="Chọn tên tài khoản"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-semibold mb-2">Mật khẩu (Password)</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#090909] border border-[#262626] rounded-xl px-4 py-3 text-white outline-none focus:border-[#6a4cf5] transition-colors"
                placeholder="Tạo mật khẩu"
              />
            </div>
            <button
              type="submit"
              className="mt-4 w-full flex items-center justify-center gap-3 bg-white border border-transparent text-black font-bold py-[14px] px-6 rounded-[100px] hover:bg-gray-200 transition-all duration-300"
            >
              Hoàn tất Đăng ký
            </button>
          </form>
        )}
        
        <p className="mt-8 text-[14px] text-[#999999] font-medium px-4">
          Đã có tài khoản? <Link href="/login" className="text-white hover:underline">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
