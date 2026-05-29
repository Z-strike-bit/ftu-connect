"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavbarProps {
  profileName?: string;
  onSignOut: () => void;
}

export default function Navbar({ profileName, onSignOut }: NavbarProps) {
  const pathname = usePathname();

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          <div className="flex items-center gap-10">
            <Link href="/dashboard" className="cursor-pointer flex items-center">
              <Image 
                src="/logo.png" 
                alt="FTU Connect Logo" 
                width={200} 
                height={50} 
                className="h-12 sm:h-14 w-auto object-contain scale-110 origin-left"
                priority
              />
            </Link>
            
            <div className="hidden md:flex gap-8 mt-1">
              <Link 
                href="/dashboard" 
                className={`text-[15px] font-bold py-5 transition-colors ${pathname === '/dashboard' ? 'text-red-600 border-b-2 border-red-600' : 'text-slate-500 hover:text-black border-b-2 border-transparent'}`}
              >
                Bảng tin
              </Link>
              
              <Link 
                href="/guide" 
                className={`text-[15px] font-bold py-5 transition-colors ${pathname === '/guide' ? 'text-red-600 border-b-2 border-red-600' : 'text-slate-500 hover:text-black border-b-2 border-transparent'}`}
              >
                Cẩm nang
              </Link>
              
              <Link 
                href="/events" 
                className={`text-[15px] font-bold py-5 transition-colors ${pathname === '/events' ? 'text-red-600 border-b-2 border-red-600' : 'text-slate-500 hover:text-black border-b-2 border-transparent'}`}
              >
                Sự kiện
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-[15px] font-medium text-slate-500 hidden sm:block">
              Xin chào, <span className="text-black font-extrabold">{profileName}</span>
            </span>
            <button 
              onClick={onSignOut} 
              className="text-sm font-bold text-slate-600 hover:text-white transition-all hover:bg-black border border-slate-200 hover:border-black px-6 py-2.5 rounded-full shadow-sm"
            >
              Đăng xuất
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}
