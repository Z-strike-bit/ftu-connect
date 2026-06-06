"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Playfair_Display } from 'next/font/google';
import ThemeToggle from '@/components/ThemeToggle';

const playfair = Playfair_Display({ subsets: ['vietnamese'], weight: ['700', '900'] });

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#05050a] text-gray-900 dark:text-white font-sans selection:bg-ftu-red-700/20 dark:selection:bg-[#ff385c]/30 selection:text-gray-900 dark:selection:text-white overflow-x-hidden">
      
      {/* Background Orbs (Optimized) */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-ftu-red-500/10 to-transparent dark:from-purple-600/10 pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-ftu-gold/10 to-transparent dark:from-[#ff385c]/10 pointer-events-none z-0"></div>

      {/* Grid Pattern */}
      <div className="fixed inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="fixed inset-0 z-0 hidden dark:block opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      {/* Navbar */}
      <nav className="relative z-50 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-ftu-red-700 dark:bg-white rounded-lg flex items-center justify-center">
            <span className="text-white dark:text-ftu-red-700 font-extrabold text-sm tracking-tighter">FTU</span>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-gray-900 dark:text-white">Connect</span>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden flex flex-col gap-1.5 p-2" onClick={() => setMenuOpen(!menuOpen)}>
          <span className={`block w-6 h-0.5 bg-gray-900 dark:bg-white transition-transform ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-gray-900 dark:bg-white transition-opacity ${menuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-gray-900 dark:bg-white transition-transform ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
        </button>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          <Link href="/login" className="px-6 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-ftu-red-700 dark:hover:text-white transition-colors">
            Đăng nhập
          </Link>
          <Link href="/register" className="px-6 py-2.5 text-sm font-bold text-white bg-ftu-red-700 hover:bg-ftu-red-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 rounded-full shadow-lg shadow-ftu-red-700/20 dark:shadow-white/10 transition-all hover:-translate-y-0.5">
            Đăng ký
          </Link>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white/95 dark:bg-[#05050a]/95 backdrop-blur-md pt-24 px-6 flex flex-col items-center gap-6 animate-fade-in">
          <div className="absolute top-6 right-20">
            <ThemeToggle />
          </div>
          <Link href="/login" className="w-full py-4 text-center text-lg font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-white/5 rounded-2xl" onClick={() => setMenuOpen(false)}>
            Đăng nhập
          </Link>
          <Link href="/register" className="w-full py-4 text-center text-lg font-bold text-white bg-ftu-red-700 dark:bg-white dark:text-gray-900 rounded-2xl shadow-lg shadow-ftu-red-700/20" onClick={() => setMenuOpen(false)}>
            Đăng ký
          </Link>
        </div>
      )}

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-6 pt-10 pb-24 text-center">
        
        {/* Decorative Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ftu-red-50 dark:bg-white/5 border border-ftu-red-100 dark:border-white/10 mb-8 animate-fade-rise" style={{ animationDelay: '0.1s' }}>
          <span className="w-2 h-2 rounded-full bg-ftu-red-600 dark:bg-[#00e5ff] animate-pulse"></span>
          <span className="text-[13px] font-bold text-ftu-red-700 dark:text-gray-300 uppercase tracking-widest">Nền tảng sinh viên thế hệ mới</span>
        </div>

        <h1 className={`text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight text-gray-900 dark:text-white max-w-4xl leading-[1.1] mb-8 animate-fade-rise ${playfair.className}`} style={{ animationDelay: '0.2s' }}>
          Trọn vẹn nhịp sống <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-ftu-red-600 to-ftu-red-500 dark:from-white dark:to-gray-400">
            Ngoại Thương
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12 animate-fade-rise font-medium leading-relaxed" style={{ animationDelay: '0.3s' }}>
          Từ giảng đường đến những góc phố quen. Mọi tiện ích, sự kiện và kết nối thu bé lại trong một điểm chạm.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-rise" style={{ animationDelay: '0.4s' }}>
          <Link href="/login" className="w-full sm:w-auto px-8 py-4 text-[15px] font-bold text-white bg-ftu-red-700 hover:bg-ftu-red-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 rounded-full shadow-[0_8px_30px_rgba(185,28,28,0.3)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.2)] transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
            Khác biệt để dẫn đầu
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </Link>
          <Link href="/events" className="w-full sm:w-auto px-8 py-4 text-[15px] font-bold text-ftu-red-700 dark:text-white bg-ftu-red-50 dark:bg-white/5 hover:bg-ftu-red-100 dark:hover:bg-white/10 border border-transparent hover:border-ftu-red-200 dark:hover:border-white/20 rounded-full transition-all text-center">
            Khám phá tính năng
          </Link>
        </div>

        {/* Feature Cards Showcase */}
        <div className="w-full max-w-6xl mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-rise" style={{ animationDelay: '0.6s' }}>
          {[
            { icon: '🌍', title: 'Mạng lưới Mở', desc: 'Kết nối sinh viên các khóa, cựu sinh viên và doanh nghiệp dễ dàng hơn bao giờ hết.' },
            { icon: '🚀', title: 'Hoạt động Sôi nổi', desc: 'Cập nhật nhanh nhất các sự kiện CLB, hội thảo, cuộc thi trong toàn trường.' },
            { icon: '💎', title: 'Thương mại Trực tuyến', desc: 'Mua bán, trao đổi giáo trình và vật dụng hữu ích trong nội bộ sinh viên FTU.' }
          ].map((feature, i) => (
            <div key={i} className="bg-white/80 dark:bg-white/5 backdrop-blur-md border border-gray-100 dark:border-white/10 p-8 rounded-3xl text-left shadow-[0_4px_20px_rgb(0,0,0,0.02)] dark:shadow-none hover:-translate-y-2 transition-transform duration-300">
              <div className="text-4xl mb-6 bg-gray-50 dark:bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full py-8 text-center text-sm font-medium text-gray-400 dark:text-gray-500">
        © 2026 FTU Connect. Designed with passion by 2514410250.k64.FTU.Đặng Quang Trung
      </footer>
    </div>
  );
}

