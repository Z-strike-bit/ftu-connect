"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useTheme } from 'next-themes';

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const docSnap = await getDoc(doc(db, 'users', currentUser.uid));
        if (docSnap.exists()) {
          setProfile({ id: docSnap.id, ...docSnap.data() });
        }
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const themeOptions = [
    { 
      value: 'light', 
      label: 'Sáng', 
      description: 'Giao diện sáng với phong cách FTU truyền thống',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
      ),
      preview: 'bg-white border-gray-200'
    },
    { 
      value: 'dark', 
      label: 'Tối', 
      description: 'Giao diện tối hiện đại với hiệu ứng Cyberpunk',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
      ),
      preview: 'bg-[#141414] border-[#262626]'
    },
    { 
      value: 'system', 
      label: 'Hệ thống', 
      description: 'Tự động theo cài đặt thiết bị của bạn',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
        </svg>
      ),
      preview: 'bg-gradient-to-r from-white to-[#141414] border-gray-300'
    }
  ];

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#FAFBFC] dark:bg-[#090909] transition-colors duration-300">
      <Navbar 
        profileName={profile?.name} 
        profileId={user?.uid} 
        profilePhoto={profile?.photoURL} 
        onSignOut={() => signOut(auth).then(() => router.push('/'))} 
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-32">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-[28px] font-extrabold text-gray-900 dark:text-white tracking-tight">Cài đặt</h1>
          <p className="text-gray-500 dark:text-[#8888a0] text-[15px] mt-1">Tùy chỉnh trải nghiệm FTU Connect của bạn</p>
        </div>

        {/* Appearance Section */}
        <div className="bg-white dark:bg-[#141414] rounded-2xl border border-gray-200 dark:border-[#1a1a1a] shadow-sm dark:shadow-none overflow-hidden transition-colors duration-300">
          {/* Section Header */}
          <div className="px-6 py-5 border-b border-gray-100 dark:border-[#1a1a1a]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-ftu-red-50 dark:bg-ftu-red-900/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-ftu-red-700 dark:text-ftu-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
                </svg>
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-gray-900 dark:text-white">Giao diện</h2>
                <p className="text-[13px] text-gray-500 dark:text-[#8888a0]">Chọn chế độ hiển thị phù hợp với bạn</p>
              </div>
            </div>
          </div>

          {/* Theme Options */}
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {themeOptions.map((option) => {
                const isSelected = theme === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={`relative group rounded-2xl p-5 border-2 transition-all duration-300 text-left
                      ${isSelected 
                        ? 'border-ftu-red-700 dark:border-[#0099ff] bg-ftu-red-50/50 dark:bg-[#0099ff]/10 shadow-[0_0_20px_rgba(185,28,28,0.15)] dark:shadow-[0_0_20px_rgba(0,153,255,0.15)]' 
                        : 'border-gray-200 dark:border-[#262626] hover:border-ftu-red-300 dark:hover:border-[#0099ff]/50 bg-white dark:bg-[#0a0a14]'
                      }`}
                  >
                    {/* Selected indicator */}
                    {isSelected && (
                      <div className="absolute top-3 right-3 z-10">
                        <div className="w-6 h-6 rounded-full bg-ftu-red-700 dark:bg-[#0099ff] flex items-center justify-center shadow-md">
                          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                        </div>
                      </div>
                    )}

                    {/* Preview bar */}
                    <div className={`w-full h-16 rounded-xl mb-4 border ${option.preview} overflow-hidden relative`}>
                      {option.value === 'light' && (
                        <>
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-ftu-red-600 via-ftu-red-700 to-ftu-red-600"></div>
                          <div className="absolute top-3 left-3 w-8 h-1.5 bg-gray-200 rounded-full"></div>
                          <div className="absolute top-3 right-3 w-3 h-3 bg-ftu-red-200 rounded-full"></div>
                          <div className="absolute bottom-3 left-3 right-3 h-2 bg-gray-100 rounded-full"></div>
                        </>
                      )}
                      {option.value === 'dark' && (
                        <>
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00e5ff] via-[#d44df0] to-[#ff385c]"></div>
                          <div className="absolute top-3 left-3 w-8 h-1.5 bg-[#262626] rounded-full"></div>
                          <div className="absolute top-3 right-3 w-3 h-3 bg-[#0099ff]/30 rounded-full"></div>
                          <div className="absolute bottom-3 left-3 right-3 h-2 bg-[#1a1a1a] rounded-full"></div>
                        </>
                      )}
                      {option.value === 'system' && (
                        <>
                          <div className="absolute top-0 left-0 w-1/2 h-full bg-white"></div>
                          <div className="absolute top-0 right-0 w-1/2 h-full bg-[#141414]"></div>
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-ftu-red-600 to-[#0099ff]"></div>
                        </>
                      )}
                    </div>

                    {/* Icon + Text */}
                    <div className={`mb-2 ${isSelected ? 'text-ftu-red-700 dark:text-[#0099ff]' : 'text-gray-400 dark:text-[#666]'} transition-colors`}>
                      {option.icon}
                    </div>
                    <h3 className={`text-[16px] font-bold mb-1 ${isSelected ? 'text-ftu-red-700 dark:text-white' : 'text-gray-700 dark:text-[#cccccc]'} transition-colors`}>
                      {option.label}
                    </h3>
                    <p className="text-[12px] text-gray-500 dark:text-[#8888a0] leading-relaxed">
                      {option.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Account Section (Coming Soon) */}
        <div className="mt-6 bg-white dark:bg-[#141414] rounded-2xl border border-gray-200 dark:border-[#1a1a1a] shadow-sm dark:shadow-none overflow-hidden transition-colors duration-300">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-[#1a1a1a]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-[#1f1f33] flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-500 dark:text-[#8888a0]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-gray-900 dark:text-white">Tài khoản</h2>
                <p className="text-[13px] text-gray-500 dark:text-[#8888a0]">Quản lý thông tin cá nhân và bảo mật</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-[#1f1f33] flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400 dark:text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.3-3.07a1.5 1.5 0 010-2.59l5.3-3.07a1.5 1.5 0 011.58 0l5.3 3.07a1.5 1.5 0 010 2.59l-5.3 3.07a1.5 1.5 0 01-1.58 0z" />
                  </svg>
                </div>
                <p className="text-[14px] font-semibold text-gray-500 dark:text-[#8888a0]">Sắp ra mắt</p>
                <p className="text-[12px] text-gray-400 dark:text-[#666] mt-1">Tính năng đang được phát triển</p>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Section (Coming Soon) */}
        <div className="mt-6 bg-white dark:bg-[#141414] rounded-2xl border border-gray-200 dark:border-[#1a1a1a] shadow-sm dark:shadow-none overflow-hidden transition-colors duration-300">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-[#1a1a1a]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-[#1f1f33] flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-500 dark:text-[#8888a0]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-gray-900 dark:text-white">Thông báo</h2>
                <p className="text-[13px] text-gray-500 dark:text-[#8888a0]">Quản lý cách nhận thông báo</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-[#1f1f33] flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400 dark:text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.3-3.07a1.5 1.5 0 010-2.59l5.3-3.07a1.5 1.5 0 011.58 0l5.3 3.07a1.5 1.5 0 010 2.59l-5.3 3.07a1.5 1.5 0 01-1.58 0z" />
                  </svg>
                </div>
                <p className="text-[14px] font-semibold text-gray-500 dark:text-[#8888a0]">Sắp ra mắt</p>
                <p className="text-[12px] text-gray-400 dark:text-[#666] mt-1">Tính năng đang được phát triển</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
