"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Playfair_Display } from 'next/font/google';

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
    <div style={{ background: 'var(--bg, #0a0a0f)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px', fontFamily: '"Inter", sans-serif' }}>
      <svg width="0" height="0" className="absolute">
        <filter id="wave-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.01 0.05" numOctaves="2" result="noise">
            <animate attributeName="baseFrequency" values="0.01 0.05; 0.015 0.07; 0.01 0.05" dur="5s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="15" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      {/* NAVBAR */}
      <nav className="xero-nav relative z-[1002]">
        <span className="nav-logo">FTU Connect</span>
        
        {/* Mobile Toggle */}
        <button className={`menu-toggle ${menuOpen ? 'active' : ''} md:hidden`} onClick={() => setMenuOpen(!menuOpen)}>
          <span />
          <span />
        </button>

        <div className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          <div className="nav-actions">
            <Link href="/login" className="btn-login" onClick={() => setMenuOpen(false)}>Đăng nhập</Link>
            <Link href="/register" className="btn-signup" onClick={() => setMenuOpen(false)}>Đăng ký</Link>
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
        <div className="hero-content">
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
      <div className="brands relative z-10" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', letterSpacing: '0.05em' }}>
        2514410250.k64.FTU.Đặng Quang Trung
      </div>
    </div>
  );
}
