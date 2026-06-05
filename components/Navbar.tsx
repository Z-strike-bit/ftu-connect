"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface NavbarProps {
  profileName?: string;
  profileId?: string;
  profilePhoto?: string;
  onSignOut: () => void;
}

export default function Navbar({ profileName, profileId, profilePhoto, onSignOut }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navItems = [
    { name: 'Bảng tin', path: '/dashboard', icon: (
      <svg className="w-[26px] h-[26px]" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
    )},
    { name: 'Kết nối', path: '/connect', icon: (
      <svg className="w-[26px] h-[26px]" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
    )},
    { name: 'Cẩm nang', path: '/guide', icon: (
      <svg className="w-[26px] h-[26px]" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>
    )},
    { name: 'Sự kiện', path: '/events', icon: (
      <svg className="w-[26px] h-[26px]" fill="currentColor" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/></svg>
    )},
    { name: 'Chợ sinh viên', path: '/market', icon: (
      <svg className="w-[26px] h-[26px]" fill="currentColor" viewBox="0 0 24 24"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg>
    )},
    { name: 'Bản đồ', path: '/map', icon: (
      <svg className="w-[26px] h-[26px]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
    )}
  ];

  return (
    <>
      {/* Top Navbar */}
      <nav className="bg-[#141414] border-b border-[#1a1a1a] sticky top-0 z-50 h-16 sm:h-20 flex items-center justify-between px-4 sm:px-10 shadow-none">
        {/* Left: Logo */}
        <div className="flex items-center w-auto sm:w-1/4">
          <Link href="/dashboard" className="shrink-0 flex items-center">
            <Image src="/logo_ftu_don_gian.png" alt="FTU Connect" width={200} height={200} className="h-10 sm:h-14 w-auto object-contain cursor-pointer transition-transform hover:scale-105" style={{ filter: 'brightness(0) invert(1)' }} />
          </Link>
        </div>

        {/* Center: Navigation icons (Desktop Only) */}
        <div className="hidden lg:flex flex-1 justify-center items-center h-full max-w-[850px] gap-6 px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                title={item.name}
                className={`relative flex items-center justify-center h-full px-2 transition-colors
                  ${isActive ? 'text-white' : 'text-[#999999] hover:text-white hover:bg-[#1c1c1c] rounded-lg my-3'}
                `}
              >
                {item.icon}
                {isActive && (
                  <div className="absolute bottom-0 left-0 w-full h-[3px] bg-white rounded-t-md shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right: Search Pill + User + Utils */}
        <div className="flex items-center justify-end gap-2 sm:gap-4 w-auto lg:w-[35%]">
          <form onSubmit={handleSearch} className="hidden md:flex items-center bg-[#090909] border border-[#262626] rounded-full px-2 py-1.5 focus-within:border-[#0099ff] hover:border-[#0099ff] transition-colors cursor-text h-10 sm:h-12 w-full max-w-[280px]">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên, mã SV..." 
              className="bg-transparent border-none outline-none text-[13px] sm:text-[14px] font-medium w-full placeholder-[#999999] text-white px-2 sm:px-3" 
            />
            <button type="submit" className="bg-[#1c1c1c] rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shrink-0 border border-[#262626] hover:bg-[#262626] transition-colors">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-[#999999]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </button>
          </form>

          <div className="flex items-center gap-1 sm:gap-2 border border-[#262626] rounded-full p-1 sm:p-1.5 transition-shadow bg-[#090909] ml-1 sm:ml-2">
            <button onClick={onSignOut} title="Menu" className="hidden sm:flex p-1 text-[#999999] hover:bg-[#1c1c1c] hover:text-white rounded-full">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <button onClick={onSignOut} title="Đăng xuất" className="sm:hidden p-1.5 text-[#ff385c] hover:bg-[#1c1c1c] rounded-full">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
            <Link href={profileId ? `/profile/${profileId}` : "#"} className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#1c1c1c] border border-[#262626] flex items-center justify-center overflow-hidden">
                {profilePhoto ? (
                  <img src={profilePhoto} alt={profileName || "Avatar"} className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#999999] mt-1" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                )}
              </div>
            </Link>
          </div>
        </div>
      </nav>

      {/* Bottom Navigation (Mobile Only) */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-[#0a0a14]/90 backdrop-blur-2xl border-t border-white/10 z-[100] pb-[calc(10px+env(safe-area-inset-bottom))] pt-2 px-2">
        <div className="flex justify-between items-center max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className="relative flex flex-col items-center justify-center w-14 h-12 group"
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0099ff]/20 to-transparent rounded-xl blur-md -z-10 animate-pulse"></div>
                )}
                <div className={`transition-all duration-300 transform flex flex-col items-center
                  ${isActive ? '-translate-y-2 scale-110 text-[#0099ff]' : 'text-[#8888a0] group-hover:text-white group-hover:-translate-y-1'}`}>
                  <div className={`p-2 rounded-xl ${isActive ? 'bg-[#1f1f33] shadow-[0_4px_15px_rgba(0,153,255,0.4)]' : ''}`}>
                    {item.icon}
                  </div>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#0099ff] shadow-[0_0_8px_#0099ff] mt-1"></div>}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
