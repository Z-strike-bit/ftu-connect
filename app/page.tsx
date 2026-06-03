"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const pipelineRef = useRef<HTMLDivElement>(null);
  const nodeLeftRef = useRef<HTMLDivElement>(null);
  const nodeCenterRef = useRef<HTMLDivElement>(null);
  const nodeRightRef = useRef<HTMLDivElement>(null);
  const beamPathGlowRef = useRef<SVGPathElement>(null);
  const beamPathCoreRef = useRef<SVGPathElement>(null);
  const beamGradientRef = useRef<SVGLinearGradientElement>(null);
  const splashRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Handle body overflow on menu toggle
    document.body.style.overflow = menuOpen ? 'hidden' : 'auto';
  }, [menuOpen]);

  useEffect(() => {
    // Pipeline Beam Animation Logic
    let animationFrameId: number;
    let lastStateChange = performance.now();
    let currentState: 'p1' | 'splash' | 'p2' | 'idle' = 'p1';
    
    const updatePath = () => {
      if (!pipelineRef.current || !nodeLeftRef.current || !nodeCenterRef.current || !nodeRightRef.current || !beamPathGlowRef.current || !beamPathCoreRef.current) return;
      
      const pRect = pipelineRef.current.getBoundingClientRect();
      const leftRect = nodeLeftRef.current.getBoundingClientRect();
      const centerRect = nodeCenterRef.current.getBoundingClientRect();
      const rightRect = nodeRightRef.current.getBoundingClientRect();
      
      const startX = leftRect.left + leftRect.width / 2 - pRect.left;
      const startY = leftRect.top + leftRect.height / 2 - pRect.top;
      
      const midX = centerRect.left + centerRect.width / 2 - pRect.left;
      const midY = centerRect.top + centerRect.height / 2 - pRect.top;
      
      const endX = rightRect.left + rightRect.width / 2 - pRect.left;
      const endY = rightRect.top + rightRect.height / 2 - pRect.top;
      
      const d = `M ${startX},${startY} L ${midX},${midY} L ${endX},${endY}`;
      beamPathGlowRef.current.setAttribute('d', d);
      beamPathCoreRef.current.setAttribute('d', d);
    };

    updatePath();
    window.addEventListener('resize', updatePath);

    const loop = (timestamp: number) => {
      const elapsed = timestamp - lastStateChange;
      
      const updateGradient = (percentage: number) => {
        if (!beamGradientRef.current) return;
        const center = percentage * 100;
        beamGradientRef.current.setAttribute('x1', `${center - 5}%`);
        beamGradientRef.current.setAttribute('x2', `${center + 5}%`);
      };

      if (currentState === 'p1') {
        const duration = 800;
        const p = Math.min(elapsed / duration, 1);
        // p1 interpolates 0 -> 0.5
        updateGradient(p * 0.5);
        
        if (p < 0.4) {
          nodeLeftRef.current?.classList.add('active');
        } else {
          nodeLeftRef.current?.classList.remove('active');
        }

        if (p >= 1) {
          currentState = 'splash';
          lastStateChange = timestamp;
          if (beamPathGlowRef.current) beamPathGlowRef.current.style.opacity = '0';
          if (beamPathCoreRef.current) beamPathCoreRef.current.style.opacity = '0';
          splashRef.current?.classList.add('animate');
        }
      } else if (currentState === 'splash') {
        if (elapsed > 800) {
          currentState = 'p2';
          lastStateChange = timestamp;
          splashRef.current?.classList.remove('animate');
          if (beamPathGlowRef.current) beamPathGlowRef.current.style.opacity = '0.6';
          if (beamPathCoreRef.current) beamPathCoreRef.current.style.opacity = '1';
        }
      } else if (currentState === 'p2') {
        const duration = 800;
        const p = Math.min(elapsed / duration, 1);
        // p2 interpolates 0.5 -> 1.0
        updateGradient(0.5 + p * 0.5);
        
        if (p > 0.6 && p < 1) {
          nodeRightRef.current?.classList.add('active');
        } else {
          nodeRightRef.current?.classList.remove('active');
        }

        if (p >= 1) {
          currentState = 'idle';
          lastStateChange = timestamp;
          nodeRightRef.current?.classList.remove('active');
          if (beamPathGlowRef.current) beamPathGlowRef.current.style.opacity = '0';
          if (beamPathCoreRef.current) beamPathCoreRef.current.style.opacity = '0';
        }
      } else if (currentState === 'idle') {
        if (elapsed > 1000) {
          currentState = 'p1';
          lastStateChange = timestamp;
          if (beamPathGlowRef.current) beamPathGlowRef.current.style.opacity = '0.6';
          if (beamPathCoreRef.current) beamPathCoreRef.current.style.opacity = '1';
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', updatePath);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div style={{ background: 'var(--bg, #0a0a0f)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px', fontFamily: '"Inter", sans-serif' }}>
      {/* NAVBAR */}
      <nav className="xero-nav relative z-[1002]">
        <span className="nav-logo">FTU Connect</span>
        
        {/* Mobile Toggle */}
        <button className={`menu-toggle ${menuOpen ? 'active' : ''} md:hidden`} onClick={() => setMenuOpen(!menuOpen)}>
          <span />
          <span />
        </button>

        <div className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          <ul className="nav-links">
            <li><Link href="/map" onClick={() => setMenuOpen(false)}>Bản Đồ</Link></li>
            <li><Link href="/market" onClick={() => setMenuOpen(false)}>Góc Pass Đồ</Link></li>
            <li><Link href="/events" onClick={() => setMenuOpen(false)}>Sự Kiện CLB</Link></li>
          </ul>
          <div className="nav-actions">
            <Link href="/login" className="btn-login" onClick={() => setMenuOpen(false)}>Đăng nhập</Link>
            <Link href="/register" className="btn-signup" onClick={() => setMenuOpen(false)}>Đăng ký</Link>
          </div>
        </div>
      </nav>

      {/* HERO CARD */}
      <section className="hero-card">
        <div className="hero-grid"></div>

        {/* ICON PIPELINE */}
        <div className="icon-pipeline" ref={pipelineRef}>
          <svg className="beam-svg">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <linearGradient id="beam-gradient" gradientUnits="userSpaceOnUse" y1="0%" y2="0%" x1="0%" x2="10%">
                <stop offset="0%" stopColor="#b04090" stopOpacity="0" />
                <stop offset="20%" stopColor="#b04090" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#fff" stopOpacity="1" />
                <stop offset="80%" stopColor="#c8a0e0" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#c8a0e0" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path ref={beamPathGlowRef} stroke="url(#beam-gradient)" strokeWidth="2" filter="url(#glow)" opacity="0.6" fill="none" strokeLinecap="round" />
            <path ref={beamPathCoreRef} stroke="url(#beam-gradient)" strokeWidth="0.8" opacity="1" fill="none" strokeLinecap="round" />
          </svg>

          {/* Node Left: User */}
          <div className="icon-node node-light-right" ref={nodeLeftRef} id="node-stack">
            <svg viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>

          <div className="pipeline-line"></div>

          {/* Node Center: FTU */}
          <div style={{ position: 'relative' }}>
            <div className="splash" ref={splashRef}></div>
            <div className="icon-node-center" ref={nodeCenterRef} id="node-x">
              <span style={{ color: 'white', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-1px' }}>FTU</span>
            </div>
          </div>

          <div className="pipeline-line right"></div>

          {/* Node Right: Map/Compass */}
          <div className="icon-node node-light-left" ref={nodeRightRef} id="node-shield">
            <svg viewBox="0 0 24 24">
              <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon>
              <line x1="9" y1="3" x2="9" y2="18"></line>
              <line x1="15" y1="6" x2="15" y2="21"></line>
            </svg>
          </div>
        </div>

        {/* HERO TEXT */}
        <div className="hero-content">
          <h1 className="hero-heading animate-blur-reveal" style={{ lineHeight: '1.3' }}>
            <span className="text-apple-shimmer">Trọn vẹn nhịp sống</span> <br/>
            <strong className="text-breathe">Ngoại Thương</strong>
          </h1>
          <p className="hero-sub" style={{ marginTop: '24px', marginBottom: '40px', lineHeight: '1.6' }}>
            Từ giảng đường đến những góc phố quen. Mọi tiện ích thu bé lại trong một điểm chạm.
          </p>
          <Link href="/map" className="btn-cta">
            Khám phá Bản Đồ ngay
          </Link>
        </div>
      </section>

      {/* BRANDS ROW */}
      <div className="brands relative z-10">
        <div className="brand-item">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>
          MaC FTU
        </div>
        <div className="brand-item">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>
          Dynamic FTU
        </div>
        <div className="brand-item">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>
          FBLC
        </div>
        <div className="brand-item">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>
          FSC FTU
        </div>
        <div className="brand-item">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>
          EZ Community
        </div>
      </div>
    </div>
  );
}
