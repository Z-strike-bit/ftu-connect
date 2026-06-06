"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Playfair_Display } from 'next/font/google';
import ThemeToggle from '@/components/ThemeToggle';

const playfair = Playfair_Display({ subsets: ['vietnamese'], weight: ['700', '900'] });

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isCenterHovered, setIsCenterHovered] = useState(false);
  const requestRef = useRef<number | null>(null);
  
  useEffect(() => {
    // Handle body overflow on menu toggle
    document.body.style.overflow = menuOpen ? 'hidden' : 'auto';
  }, [menuOpen]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      requestRef.current = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = (e.clientY / window.innerHeight) * 2 - 1;
        setMousePos({ x, y });
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const handleMagneticMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    element.style.setProperty('--mag-x', `${x * 0.3}px`);
    element.style.setProperty('--mag-y', `${y * 0.3}px`);
    element.classList.add('glow');
  };

  const handleMagneticLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    element.style.setProperty('--mag-x', '0px');
    element.style.setProperty('--mag-y', '0px');
    element.classList.remove('glow');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-white font-sans selection:bg-ftu-red-700/20 dark:selection:bg-[#ff385c]/30 selection:text-gray-900 dark:selection:text-white overflow-x-hidden flex flex-col">
      
      {/* =========================================
          LIGHT MODE UI (NEW CLEAN DESIGN)
          ========================================= */}
      <div className="block dark:hidden w-full flex-1 flex flex-col relative">
        {/* Background Orbs (Optimized) */}
        <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-ftu-red-500/10 to-transparent pointer-events-none z-0"></div>
        <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-ftu-gold/10 to-transparent pointer-events-none z-0"></div>

        {/* Grid Pattern */}
        <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

        {/* Navbar */}
        <nav className="relative z-50 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-ftu-red-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-extrabold text-sm tracking-tighter">FTU</span>
            </div>
            <span className="font-extrabold text-xl tracking-tight text-gray-900">Connect</span>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden flex flex-col gap-1.5 p-2" onClick={() => setMenuOpen(!menuOpen)}>
            <span className={`block w-6 h-0.5 bg-gray-900 transition-transform ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-gray-900 transition-opacity ${menuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-gray-900 transition-transform ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login" className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-ftu-red-700 transition-colors">
              Đăng nhập
            </Link>
            <Link href="/register" className="px-6 py-2.5 text-sm font-bold text-white bg-ftu-red-700 hover:bg-ftu-red-800 rounded-full shadow-lg shadow-ftu-red-700/20 transition-all hover:-translate-y-0.5">
              Đăng ký
            </Link>
          </div>
        </nav>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-white/95 backdrop-blur-md pt-24 px-6 flex flex-col items-center gap-6 animate-fade-in">
            <div className="absolute top-6 right-20">
              <ThemeToggle />
            </div>
            <Link href="/login" className="w-full py-4 text-center text-lg font-bold text-gray-900 bg-gray-50 rounded-2xl" onClick={() => setMenuOpen(false)}>
              Đăng nhập
            </Link>
            <Link href="/register" className="w-full py-4 text-center text-lg font-bold text-white bg-ftu-red-700 rounded-2xl shadow-lg shadow-ftu-red-700/20" onClick={() => setMenuOpen(false)}>
              Đăng ký
            </Link>
          </div>
        )}

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-6 pt-10 pb-24 text-center">
          {/* Decorative Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ftu-red-50 border border-ftu-red-100 mb-8 animate-fade-rise" style={{ animationDelay: '0.1s' }}>
            <span className="w-2 h-2 rounded-full bg-ftu-red-600 animate-pulse"></span>
            <span className="text-[13px] font-bold text-ftu-red-700 uppercase tracking-widest">Nền tảng sinh viên thế hệ mới</span>
          </div>

          <h1 className={`text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight text-gray-900 max-w-4xl leading-[1.1] mb-8 animate-fade-rise ${playfair.className}`} style={{ animationDelay: '0.2s' }}>
            Trọn vẹn nhịp sống <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-ftu-red-600 to-ftu-red-500">
              Ngoại Thương
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-12 animate-fade-rise font-medium leading-relaxed" style={{ animationDelay: '0.3s' }}>
            Từ giảng đường đến những góc phố quen. Mọi tiện ích, sự kiện và kết nối thu bé lại trong một điểm chạm.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-rise" style={{ animationDelay: '0.4s' }}>
            <Link href="/login" className="w-full sm:w-auto px-8 py-4 text-[15px] font-bold text-white bg-ftu-red-700 hover:bg-ftu-red-800 rounded-full shadow-[0_8px_30px_rgba(185,28,28,0.3)] transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
              Khác biệt để dẫn đầu
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </Link>
            <Link href="/events" className="w-full sm:w-auto px-8 py-4 text-[15px] font-bold text-ftu-red-700 bg-ftu-red-50 hover:bg-ftu-red-100 border border-transparent hover:border-ftu-red-200 rounded-full transition-all text-center">
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
              <div key={i} className="bg-white/80 backdrop-blur-md border border-gray-100 p-8 rounded-3xl text-left shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:-translate-y-2 transition-transform duration-300">
                <div className="text-4xl mb-6 bg-gray-50 w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </main>
        
        {/* Footer */}
        <footer className="relative z-10 w-full py-8 text-center text-sm font-medium text-gray-400">
          © 2026 FTU Connect. Designed with passion by 2514410250.k64.FTU.Đặng Quang Trung
        </footer>
      </div>

      {/* =========================================
          DARK MODE UI (OLD DESIGN)
          ========================================= */}
      <div className="hidden dark:flex w-full flex-1 flex-col items-center p-[14px]">
        {/* NAVBAR */}
        <nav className="xero-nav relative z-[1002] w-full flex justify-between items-center">
          <span className="nav-logo text-white">FTU Connect</span>
          
          <div className="flex items-center gap-6">
            {/* Theme Toggle for Dark Mode */}
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
            
            {/* Mobile Toggle */}
            <button className={`menu-toggle ${menuOpen ? 'active' : ''} md:hidden`} onClick={() => setMenuOpen(!menuOpen)}>
              <span />
              <span />
            </button>

            <div className={`nav-menu ${menuOpen ? 'active' : ''}`}>
              <div className="nav-actions flex items-center gap-4">
                <div className="md:hidden flex justify-center mb-4">
                  <ThemeToggle />
                </div>
                <Link href="/login" className="btn-login" onClick={() => setMenuOpen(false)}>Đăng nhập</Link>
                <Link href="/register" className="btn-signup" onClick={() => setMenuOpen(false)}>Đăng ký</Link>
              </div>
            </div>
          </div>
        </nav>

        {/* HERO CARD */}
        <section className="hero-card" style={{ '--mouse-x': mousePos.x, '--mouse-y': mousePos.y } as React.CSSProperties}>
          <div className="hero-grid"></div>

          {/* ICON PIPELINE */}
          <div className="icon-pipeline">
            {/* Node Left: User */}
            <div 
              className={`icon-node magnetic-node ${isCenterHovered ? 'scale-up' : ''}`}
              onMouseMove={handleMagneticMove}
              onMouseLeave={handleMagneticLeave}
            >
              <svg viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>

            <div className="pipeline-line data-flow-container">
              <div className={`data-flow-beam ${isCenterHovered ? 'fast' : ''}`}></div>
            </div>

            {/* Node Center: FTU */}
            <div style={{ position: 'relative' }} 
              onMouseEnter={() => setIsCenterHovered(true)} 
              onMouseLeave={() => setIsCenterHovered(false)}
            >
              <div className="icon-node-center magnetic-node"
                onMouseMove={handleMagneticMove}
                onMouseLeave={handleMagneticLeave}
              >
                <span style={{ color: 'white', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-1px' }}>FTU</span>
              </div>
            </div>

            <div className="pipeline-line right data-flow-container">
              <div className={`data-flow-beam ${isCenterHovered ? 'fast' : ''}`}></div>
            </div>

            {/* Node Right: Book */}
            <div 
              className={`icon-node magnetic-node ${isCenterHovered ? 'scale-up' : ''}`}
              onMouseMove={handleMagneticMove}
              onMouseLeave={handleMagneticLeave}
            >
              <svg viewBox="0 0 24 24">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
            </div>
          </div>

          {/* HERO TEXT */}
          <div className="hero-content text-center">
            <h1 className={`hero-heading animate-blur-reveal ${playfair.className}`} style={{ lineHeight: '1.3', fontSize: 'clamp(3rem, 6.5vw, 4.8rem)' }}>
              <span className="text-apple-shimmer">Trọn vẹn nhịp sống</span> <br/>
              <strong className="text-breathe">Ngoại Thương</strong>
            </h1>
            <p className="hero-sub" style={{ marginTop: '24px', marginBottom: '40px', lineHeight: '1.6' }}>
              Từ giảng đường đến những góc phố quen. Mọi tiện ích thu bé lại trong một điểm chạm.
            </p>
            <Link href="/map" className="btn-cta">
              Khác biệt để dẫn đầu &rarr;
            </Link>
          </div>
        </section>

        {/* FOOTER TEXT */}
        <div className="brands relative z-10 mt-8 pb-4" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', letterSpacing: '0.05em' }}>
          2514410250.k64.FTU.Đặng Quang Trung
        </div>
      </div>
    </div>
  );
}
