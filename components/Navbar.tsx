"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavbarProps {
  profileName?: string;
  profileId?: string;
  profilePhoto?: string;
  onSignOut: () => void;
}

export default function Navbar({ profileName, profileId, profilePhoto, onSignOut }: NavbarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Bảng tin', path: '/dashboard', icon: (
      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
    )},
    { name: 'Kết nối', path: '/connect', icon: (
      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
    )},
    { name: 'Cẩm nang', path: '/guide', icon: (
      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>
    )},
    { name: 'Sự kiện', path: '/events', icon: (
      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/></svg>
    )}
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 h-16 flex items-center justify-between px-4 shadow-sm">
      {/* Left: Logo + Search */}
      <div className="flex items-center gap-4 w-1/3">
        <Link href="/dashboard" className="shrink-0 flex items-center">
          <Image src="/logo.png" alt="FTU Connect" width={240} height={80} className="w-[160px] sm:w-[200px] h-auto object-contain" />
        </Link>
        <div className="hidden lg:flex items-center bg-[#f0f2f5] rounded-full px-3 py-2 w-64 h-10 shrink-0">
          <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input type="text" placeholder="Tìm kiếm trên FTU Connect" className="bg-transparent border-none outline-none text-[15px] w-full placeholder-gray-500" />
        </div>
      </div>

      {/* Center: Icon Navigation */}
      <div className="flex-1 flex justify-center h-full max-w-2xl gap-1 sm:gap-2 px-2 sm:px-10">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.path} 
              href={item.path}
              title={item.name}
              className={`flex-1 flex items-center justify-center h-full relative rounded-lg transition-colors mt-1 mb-1
                ${isActive ? 'text-red-600' : 'text-gray-500 hover:bg-[#f0f2f5]'}
              `}
            >
              {item.icon}
              {isActive && (
                <div className="absolute bottom-[-4px] left-0 w-full h-[3px] bg-red-600 rounded-t-md" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Right: User + Utils */}
      <div className="flex items-center justify-end gap-2 w-1/4">
        <Link href={profileId ? `/profile/${profileId}` : "#"} className="hidden sm:flex items-center mr-2 hover:bg-slate-100 px-2 py-1 rounded-full transition-colors cursor-pointer">
          <span className="text-[15px] font-bold text-black">{profileName}</span>
        </Link>
        
        <Link href={profileId ? `/profile/${profileId}` : "#"} className="w-10 h-10 rounded-full bg-[#e4e6eb] flex items-center justify-center hover:bg-[#d8dadf] transition-colors cursor-pointer overflow-hidden">
          {profilePhoto ? (
            <img src={profilePhoto} alt={profileName || "Avatar"} className="w-full h-full object-cover" />
          ) : (
            <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/></svg>
          )}
        </Link>
        
        <button 
          onClick={onSignOut}
          title="Đăng xuất"
          className="w-10 h-10 rounded-full bg-[#e4e6eb] flex items-center justify-center hover:bg-[#d8dadf] transition-colors"
        >
          <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
        </button>
      </div>
    </nav>
  );
}
