"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

interface NavbarProps {
  profileName?: string;
  profileId?: string;
  profilePhoto?: string;
  onSignOut: () => void;
}

export default function Navbar({ profileName, profileId, profilePhoto, onSignOut }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      <nav className="bg-white/80 dark:bg-[#141414]/80 backdrop-blur-2xl border-b border-white/60 dark:border-[#1a1a1a] sticky top-0 z-50 h-16 sm:h-20 flex items-center justify-between px-4 sm:px-10 shadow-[0_4px_30px_rgb(0,0,0,0.03)] dark:shadow-none transition-colors duration-300">
        {/* Left: Logo */}
        <div className="flex items-center w-auto sm:w-1/4">
          <Link href="/dashboard" className="shrink-0 flex items-center">
            <Image src="/logo_ftu_don_gian.png" alt="FTU Connect" width={200} height={200} className="h-10 sm:h-14 w-auto object-contain cursor-pointer transition-transform hover:scale-105 dark:invert" style={{ filter: undefined }} />
          </Link>
        </div>

        {/* Center: Navigation icons (Desktop Only) */}
        <div className="hidden lg:flex flex-1 justify-center items-center h-full max-w-[850px] gap-1 px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                title={item.name}
                className={`relative flex items-center justify-center h-full px-4 transition-all duration-300
                  ${isActive 
                    ? 'text-ftu-red-700 dark:text-white' 
                    : 'text-gray-400 dark:text-[#999999] hover:text-ftu-red-600 dark:hover:text-white hover:bg-ftu-red-50 dark:hover:bg-[#1c1c1c] rounded-lg my-3'
                  }
                `}
              >
                {item.icon}
                {isActive && (
                  <div className="absolute bottom-0 left-0 w-full h-[3px] bg-ftu-red-700 dark:bg-white rounded-t-md shadow-[0_0_8px_rgba(185,28,28,0.4)] dark:shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-colors duration-300" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right: Search + ThemeToggle + User Dropdown */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 w-auto lg:w-[35%]">
          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center bg-gray-100 dark:bg-[#090909] border border-gray-200 dark:border-[#262626] rounded-full px-2 py-1.5 focus-within:border-ftu-red-400 dark:focus-within:border-[#0099ff] hover:border-ftu-red-300 dark:hover:border-[#0099ff] transition-colors cursor-text h-10 sm:h-12 w-full max-w-[280px]">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên, mã SV..." 
              className="bg-transparent border-none outline-none text-[13px] sm:text-[14px] font-medium w-full placeholder-gray-400 dark:placeholder-[#999999] text-gray-900 dark:text-white px-2 sm:px-3" 
            />
            <button type="submit" className="bg-ftu-red-700 dark:bg-[#1c1c1c] rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shrink-0 border border-ftu-red-800 dark:border-[#262626] hover:bg-ftu-red-800 dark:hover:bg-[#262626] transition-colors">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white dark:text-[#999999]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </button>
          </form>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Avatar Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1.5 border border-gray-200 dark:border-[#262626] rounded-full p-1 sm:p-1.5 transition-all bg-white dark:bg-[#090909] hover:border-ftu-red-300 dark:hover:border-[#0099ff] hover:shadow-sm"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 dark:bg-[#1c1c1c] border border-gray-200 dark:border-[#262626] flex items-center justify-center overflow-hidden">
                {profilePhoto ? (
                  <img src={profilePhoto} alt={profileName || "Avatar"} className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-[#999999] mt-1" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                )}
              </div>
              <svg className={`w-3 h-3 text-gray-400 dark:text-[#999999] mr-1 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/></svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#262626] rounded-2xl shadow-xl dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden z-[200] animate-in fade-in slide-in-from-top-2 duration-200">
                {/* User Info */}
                <Link 
                  href={profileId ? `/profile/${profileId}` : "#"}
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-[#1c1c1c] transition-colors border-b border-gray-100 dark:border-[#1a1a1a]"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#1c1c1c] border-2 border-ftu-red-200 dark:border-[#262626] flex items-center justify-center overflow-hidden">
                    {profilePhoto ? (
                      <img src={profilePhoto} alt={profileName || "Avatar"} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-5 h-5 text-gray-400 dark:text-[#999999]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-bold text-gray-900 dark:text-white truncate">{profileName || 'Người dùng'}</p>
                    <p className="text-[12px] text-gray-500 dark:text-[#8888a0]">Xem trang cá nhân</p>
                  </div>
                </Link>

                {/* Menu Items */}
                <div className="py-1.5">
                  <Link 
                    href="/settings"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#1c1c1c] transition-colors text-gray-700 dark:text-[#cccccc] hover:text-gray-900 dark:hover:text-white"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#1f1f33] flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.573-1.066z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    </div>
                    <span className="text-[14px] font-semibold">Cài đặt</span>
                  </Link>

                  <button 
                    onClick={() => { setIsDropdownOpen(false); onSignOut(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-[#1c1c1c] transition-colors text-red-600 dark:text-[#ff385c]"
                  >
                    <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-[#1f1f33] flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                    </div>
                    <span className="text-[14px] font-semibold">Đăng xuất</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Bottom Navigation (Mobile Only) */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white/90 dark:bg-[#0a0a14]/90 backdrop-blur-2xl border-t border-gray-200 dark:border-white/10 z-[100] pb-[calc(10px+env(safe-area-inset-bottom))] pt-2 px-2 transition-colors duration-300">
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
                  <div className="absolute inset-0 bg-gradient-to-t from-ftu-red-500/20 dark:from-[#0099ff]/20 to-transparent rounded-xl blur-md -z-10 animate-pulse"></div>
                )}
                <div className={`transition-all duration-300 transform flex flex-col items-center
                  ${isActive ? '-translate-y-2 scale-110 text-ftu-red-700 dark:text-[#0099ff]' : 'text-gray-400 dark:text-[#8888a0] group-hover:text-ftu-red-600 dark:group-hover:text-white group-hover:-translate-y-1'}`}>
                  <div className={`p-2 rounded-xl ${isActive ? 'bg-ftu-red-50 dark:bg-[#1f1f33] shadow-[0_4px_15px_rgba(185,28,28,0.3)] dark:shadow-[0_4px_15px_rgba(0,153,255,0.4)]' : ''}`}>
                    {item.icon}
                  </div>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-ftu-red-700 dark:bg-[#0099ff] shadow-[0_0_8px_rgba(185,28,28,0.5)] dark:shadow-[0_0_8px_#0099ff] mt-1"></div>}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
