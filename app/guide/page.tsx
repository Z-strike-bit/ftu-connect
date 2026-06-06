"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Image from 'next/image';

interface UserProfile {
  name: string;
  totalCredits?: number;
  creditsA?: number;
  creditsB?: number;
  creditsC?: number;
  creditsD?: number;
  creditsF?: number;
  photoURL?: string;
}

const COURSES = [
  { 
    id: 'm1', 
    name: 'Kinh tế vi mô', 
    difficulty: 'Khó nhằn', 
    rating: 3.8, 
    reviews: 124, 
    description: 'Môn đại cương bắt buộc, cần tập trung cao độ vào đồ thị và các đường chi phí. Cực kỳ dễ trượt nếu không làm bài tập thường xuyên.',
    link: 'https://drive.google.com/drive/folders/1abc'
  },
  { 
    id: 'm2', 
    name: 'Triết học Mác - Lênin', 
    difficulty: 'Dễ thở', 
    rating: 4.5, 
    reviews: 89, 
    description: 'Chỉ cần chăm chỉ học thuộc và hiểu bản chất vấn đề, thầy cô chấm khá thoáng. Nên xin slide của các anh chị khóa trên.',
    link: 'https://drive.google.com/drive/folders/2def'
  },
  { 
    id: 'm3', 
    name: 'Toán cao cấp', 
    difficulty: 'Khó nhằn', 
    rating: 3.2, 
    reviews: 156, 
    description: 'Thi tự luận 100%, rất dễ tịt ngòi nếu không luyện đề các năm trước. Khuyên chân thành nên học nhóm.',
    link: 'https://drive.google.com/drive/folders/3ghi'
  },
  { 
    id: 'm4', 
    name: 'Kỹ năng giao tiếp', 
    difficulty: 'Dễ thở', 
    rating: 4.8, 
    reviews: 210, 
    description: 'Môn siêu vui, chủ yếu là làm bài tập nhóm và thuyết trình. Cầm chắc điểm A nếu team work tốt.',
    link: 'https://drive.google.com/drive/folders/4jkl'
  }
];

export default function GuidePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUser(currentUser);
          const data = userDoc.data() as UserProfile;
          setProfile(data);
          setTotalCredits(data.totalCredits ?? 130);
          setCreditsA(data.creditsA ?? 0);
          setCreditsB(data.creditsB ?? 0);
          setCreditsC(data.creditsC ?? 0);
          setCreditsD(data.creditsD ?? 0);
          setCreditsF(data.creditsF ?? 0);
          setLoading(false);
        } else {
          router.push('/onboarding');
        }
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  const [totalCredits, setTotalCredits] = useState<number | ''>(130);
  const [creditsA, setCreditsA] = useState<number | ''>(0);
  const [creditsB, setCreditsB] = useState<number | ''>(0);
  const [creditsC, setCreditsC] = useState<number | ''>(0);
  const [creditsD, setCreditsD] = useState<number | ''>(0);
  const [creditsF, setCreditsF] = useState<number | ''>(0);
  const [targetGPA, setTargetGPA] = useState<number>(3.2);

  const [totalError, setTotalError] = useState('');

  // Auto Save to Firebase
  useEffect(() => {
    if (!user || loading) return;
    const timeout = setTimeout(async () => {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          totalCredits: totalCredits === '' ? null : totalCredits,
          creditsA: creditsA === '' ? null : creditsA,
          creditsB: creditsB === '' ? null : creditsB,
          creditsC: creditsC === '' ? null : creditsC,
          creditsD: creditsD === '' ? null : creditsD,
          creditsF: creditsF === '' ? null : creditsF,
        });
      } catch (err) {
        console.error("Lỗi lưu dữ liệu GPA:", err);
      }
    }, 1000);
    return () => clearTimeout(timeout);
  }, [totalCredits, creditsA, creditsB, creditsC, creditsD, creditsF, user, loading]);

  const handleTotalChange = (val: string) => {
    if (val === '') {
      setTotalCredits('');
      setTotalError('');
      return;
    }
    const num = Number(val);
    if (num <= 0) {
      setTotalError('Tổng tín chỉ phải lớn hơn 0');
      setTotalCredits(num);
    } else {
      setTotalError('');
      setTotalCredits(num);
    }
  };

  const a = Number(creditsA) || 0;
  const b = Number(creditsB) || 0;
  const c = Number(creditsC) || 0;
  const d = Number(creditsD) || 0;
  const f = Number(creditsF) || 0;
  const total = Number(totalCredits) || 130;

  const sumCredits = a + b + c + d + f;
  const curPoints = (a * 4) + (b * 3) + (c * 2) + (d * 1) + (f * 0);
  const currentGPA = sumCredits > 0 ? (curPoints / sumCredits) : 0;
  
  // Ticker Animation for GPA
  const gpaRef = useRef<HTMLSpanElement>(null);
  const animatedGpaVal = useRef(0);
  useEffect(() => {
    let start = animatedGpaVal.current;
    let end = currentGPA;
    let duration = 1000;
    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentVal = start + (end - start) * easeOut;
      animatedGpaVal.current = currentVal;
      
      if (gpaRef.current) {
        gpaRef.current.textContent = currentVal.toFixed(2);
      }
      
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };
    
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [currentGPA]);
  
  let rank = 'Chưa có';
  if (sumCredits > 0) {
    if (currentGPA >= 3.6) rank = 'Xuất sắc';
    else if (currentGPA >= 3.2) rank = 'Giỏi';
    else if (currentGPA >= 2.5) rank = 'Khá';
    else if (currentGPA >= 2.0) rank = 'Trung bình';
    else rank = 'Yếu';
  }

  const remCredits = total - sumCredits;
  let neededA = 0;
  
  if (remCredits > 0) {
    const reqPoints = (targetGPA * total) - curPoints;
    neededA = Math.ceil(reqPoints - (3 * remCredits));
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    if (card.dataset.ticking === 'true') return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    card.dataset.ticking = 'true';
    requestAnimationFrame(() => {
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      card.dataset.ticking = 'false';
    });
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    requestAnimationFrame(() => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    });
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 dark:bg-[#141414] flex items-center justify-center"><p className="text-gray-500 dark:text-[#999999] font-bold animate-pulse">Đang tải Cẩm nang...</p></div>;
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#05050a] text-gray-900 dark:text-white font-sans pb-16 selection:bg-[#ff385c]/30 selection:text-gray-900 dark:selection:text-white relative overflow-hidden">
      {/* Creative Background: Tech Grid + Soft Ambient Orbs (Zero lag) */}
      <div className="absolute inset-0 z-0 opacity-[0.08] dark:opacity-[0.06] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,rgba(255,56,92,0.12)_0%,transparent_60%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(255,56,92,0.06)_0%,transparent_60%)] pointer-events-none rounded-full z-0"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,rgba(212,77,240,0.12)_0%,transparent_60%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(212,77,240,0.06)_0%,transparent_60%)] pointer-events-none rounded-full z-0"></div>
      <div className="absolute top-[40%] right-[20%] w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.08)_0%,transparent_60%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.03)_0%,transparent_60%)] pointer-events-none rounded-full z-0"></div>

      <div className="relative z-10">
        <Navbar profileName={profile?.name} profileId={user?.uid} profilePhoto={profile?.photoURL} onSignOut={handleSignOut} />

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10 border-b border-gray-200 dark:border-white/10 pb-8"
          >
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-[#c8a0e0] tracking-tight uppercase drop-shadow-sm dark:drop-shadow-none">Cẩm nang <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ff385c] to-[#d44df0] drop-shadow-sm dark:drop-shadow-[0_0_10px_rgba(255,56,92,0.4)]">Tân sinh viên</span></h1>
            <p className="text-gray-600 dark:text-[#a0a0b0] mt-2 text-lg font-medium">Bí kíp sinh tồn và chinh phục 4 năm rực rỡ tại Ngoại Thương.</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Cột Trái: GPA Tracker */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-4"
            >
              <div className="bg-white/95 dark:bg-[#111118]/95 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white dark:border-white/10 overflow-hidden sticky top-28 ring-1 ring-black/5 dark:ring-0">
                
                <div className="p-6 border-b border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                  <h2 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                    <div className="bg-gradient-to-br from-[#ff385c] to-[#d44df0] p-2 rounded-xl text-white shadow-lg">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    </div>
                    GPA Tracker
                  </h2>
                  <p className="text-[13px] text-gray-600 dark:text-[#a0a0b0] font-medium mt-2 leading-relaxed">
                    Công cụ phân tích điểm rơi chiến thuật dành riêng cho FTU-er.
                  </p>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1.5">Tổng tín chỉ tối thiểu để ra trường</label>
                    <input 
                      type="number" 
                      placeholder="VD: 130"
                      value={totalCredits}
                      onChange={(e) => handleTotalChange(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border ${totalError ? 'border-[#ff385c] bg-[#ff385c]/10 focus:ring-[#ff385c]/40' : 'border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/40 focus:border-[#b04090] focus:ring-[#b04090]/30 shadow-inner'} outline-none focus:ring-2 transition-all text-[15px] font-bold text-gray-900 dark:text-white`}
                    />
                    {totalError && <p className="text-[#ff385c] text-xs font-bold mt-1.5">{totalError}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">Nhập điểm thành phần (Tín chỉ)</label>
                    <div className="grid grid-cols-5 gap-2">
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-extrabold text-gray-600 dark:text-[#c8a0e0] mb-1 uppercase">Điểm A</span>
                        <input type="number" value={creditsA} onChange={(e) => setCreditsA(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))} className="w-full text-center py-2 rounded-lg bg-white/50 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-inner focus:border-[#b04090] focus:ring-2 focus:ring-[#b04090]/30 outline-none font-bold text-sm text-gray-900 dark:text-white transition-all" />
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-extrabold text-gray-600 dark:text-[#c8a0e0] mb-1 uppercase">Điểm B</span>
                        <input type="number" value={creditsB} onChange={(e) => setCreditsB(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))} className="w-full text-center py-2 rounded-lg bg-white/50 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-inner focus:border-[#b04090] focus:ring-2 focus:ring-[#b04090]/30 outline-none font-bold text-sm text-gray-900 dark:text-white transition-all" />
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-extrabold text-gray-600 dark:text-[#c8a0e0] mb-1 uppercase">Điểm C</span>
                        <input type="number" value={creditsC} onChange={(e) => setCreditsC(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))} className="w-full text-center py-2 rounded-lg bg-white/50 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-inner focus:border-[#b04090] focus:ring-2 focus:ring-[#b04090]/30 outline-none font-bold text-sm text-gray-900 dark:text-white transition-all" />
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-extrabold text-gray-600 dark:text-[#c8a0e0] mb-1 uppercase">Điểm D</span>
                        <input type="number" value={creditsD} onChange={(e) => setCreditsD(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))} className="w-full text-center py-2 rounded-lg bg-white/50 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-inner focus:border-[#b04090] focus:ring-2 focus:ring-[#b04090]/30 outline-none font-bold text-sm text-gray-900 dark:text-white transition-all" />
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-extrabold text-gray-600 dark:text-[#c8a0e0] mb-1 uppercase">Điểm F</span>
                        <input type="number" value={creditsF} onChange={(e) => setCreditsF(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))} className="w-full text-center py-2 rounded-lg bg-white/50 dark:bg-black/40 border border-gray-200 dark:border-white/10 shadow-inner focus:border-[#b04090] focus:ring-2 focus:ring-[#b04090]/30 outline-none font-bold text-sm text-gray-900 dark:text-white transition-all" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-100 dark:bg-black/30 p-4 rounded-xl border border-gray-200 dark:border-white/5 shadow-inner">
                    <h3 className="text-xs font-bold text-gray-600 dark:text-[#a0a0b0] uppercase tracking-widest mb-3">Thống kê hiện tại</h3>
                    <div className="space-y-2 text-[14px]">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-600 dark:text-white/80">Tổng tín đã tích lũy:</span>
                        <span className="font-extrabold text-gray-900 dark:text-white">{sumCredits}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-600 dark:text-white/80">GPA Hiện tại:</span>
                        <span ref={gpaRef} className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#ff385c] to-[#d44df0] text-base">0.00</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-600 dark:text-white/80">Xếp loại:</span>
                        <span className="font-extrabold text-gray-900 dark:text-white bg-gray-200 dark:bg-white/10 px-2 py-0.5 rounded shadow-sm">{rank}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-white mb-1.5">Mục tiêu mong muốn</label>
                    <select 
                      value={targetGPA}
                      onChange={(e) => setTargetGPA(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-white/10 outline-none focus:border-[#b04090] focus:ring-2 focus:ring-[#b04090]/30 transition-all text-[15px] font-bold bg-gray-50 dark:bg-black/40 appearance-none cursor-pointer text-gray-900 dark:text-white"
                    >
                      <option value={2.5}>Bằng Khá (2.5)</option>
                      <option value={3.2}>Bằng Giỏi (3.2)</option>
                      <option value={3.6}>Bằng Xuất sắc (3.6)</option>
                    </select>
                  </div>
                </div>

                <div className="p-6 bg-gray-50/50 dark:bg-white/[0.02] border-t border-gray-200 dark:border-white/5 min-h-[160px] overflow-hidden relative">
                  <AnimatePresence mode="wait">
                    {sumCredits > total ? (
                      <motion.div key="error" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="text-center p-5 bg-[#ff385c]/10 rounded-xl border border-[#ff385c]/30 shadow-[0_0_20px_rgba(255,56,92,0.1)] w-full">
                        <p className="text-[#ff385c] font-extrabold text-lg mb-2">⚠️ Lỗi dữ liệu!</p>
                        <p className="text-[#ff385c] text-sm font-medium leading-relaxed">
                          Tổng số tín chỉ bạn đã nhập ({sumCredits}) lớn hơn cả tổng tín chỉ toàn khóa ({total}). Vui lòng kiểm tra lại!
                        </p>
                      </motion.div>
                    ) : remCredits <= 0 ? (
                      <motion.div key="done" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="text-center p-5 bg-green-500/10 rounded-xl border border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.1)] w-full">
                        <p className="text-green-400 font-extrabold text-lg mb-2">🎓 Đã hoàn thành!</p>
                        <p className="text-green-400 text-sm font-medium leading-relaxed">
                          Bạn đã hoàn thành đủ số tín chỉ ra trường. GPA chung cuộc của bạn là <span className="font-extrabold">{currentGPA.toFixed(2)}</span> ({rank}).
                        </p>
                      </motion.div>
                    ) : neededA > remCredits ? (
                      <motion.div key="impossible" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="text-center p-5 bg-[#ff385c]/10 rounded-xl border border-[#ff385c]/30 shadow-[0_0_20px_rgba(255,56,92,0.1)] flex flex-col items-center w-full">
                        <Image src="/assets/badges/badge-newbie.png" alt="Newbie Badge" width={80} height={80} className="mb-3 hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(255,56,92,0.5)]" />
                        <p className="text-[#ff385c] font-extrabold text-lg mb-2">❌ Bất khả thi!</p>
                        <p className="text-[#ff385c] text-sm font-medium leading-relaxed">
                          Đời còn dài, FTU-er còn nhiều việc phải làm! Quỹ tín chỉ của bạn đã hết room để kéo điểm lên mức này, dù có full A. Hãy cân nhắc hạ mục tiêu xuống một chút.
                        </p>
                      </motion.div>
                    ) : neededA > 0 ? (
                      <motion.div key="safe" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="text-center p-5 bg-[#d44df0]/10 rounded-xl border border-[#d44df0]/30 shadow-[0_0_20px_rgba(212,77,240,0.1)] flex flex-col items-center w-full">
                        <Image src="/assets/badges/badge-veteran.png" alt="Veteran Badge" width={80} height={80} className="mb-3 hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(212,77,240,0.4)]" />
                        <p className="text-[#d44df0] font-extrabold text-lg mb-2">🔥 Kịch bản an toàn</p>
                        <p className="text-[#e290f5] text-sm font-medium leading-relaxed">
                          Kịch bản an toàn: Bạn cần gánh ít nhất <span className="font-extrabold text-lg bg-black/50 px-2 py-0.5 rounded-md shadow-sm border border-[#d44df0]/50 text-white">{neededA}</span> tín chỉ điểm A, phần còn lại (<span className="font-extrabold text-white">{remCredits - neededA}</span> tín chỉ) chỉ cần giữ mức điểm B là sẽ chạm mốc {targetGPA.toFixed(2)}!
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div key="easy" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="text-center p-5 bg-[#00e5ff]/10 rounded-xl border border-[#00e5ff]/30 shadow-[0_0_20px_rgba(0,229,255,0.1)] flex flex-col items-center w-full">
                        <Image src="/assets/badges/badge-gold.png" alt="Gold Badge" width={80} height={80} className="mb-3 animate-bounce drop-shadow-[0_0_15px_rgba(0,229,255,0.5)]" />
                        <p className="text-[#00e5ff] font-extrabold text-lg mb-2">🎉 Quá dễ thở!</p>
                        <p className="text-[#8cf5ff] text-sm font-medium leading-relaxed">
                          Quỹ điểm của bạn đang rất dư dả. Chặng đường còn lại thậm chí không cần điểm A, chỉ cần đều đều điểm B (hoặc C) là vẫn thừa sức đạt mục tiêu!
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* Cột Phải: Wiki Môn học */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="lg:col-span-8"
            >
              <div className="bg-white/90 dark:bg-[#111118]/90 rounded-[2.5rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white dark:border-white/10 p-8 ring-1 ring-black/5 dark:ring-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                  <div>
                    <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Thư viện Wiki</h2>
                    <p className="text-sm font-medium text-gray-600 dark:text-[#a0a0b0] mt-1">Review chân thực và kho tài liệu khổng lồ.</p>
                  </div>
                  <div className="relative">
                    <input type="text" placeholder="Tìm kiếm môn học..." className="w-full sm:w-72 pl-12 pr-4 py-3 bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-white/10 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#b04090]/40 focus:border-[#b04090] text-gray-900 dark:text-white font-bold transition-all placeholder-gray-400 dark:placeholder-[#6a6a6a]"/>
                    <svg className="w-5 h-5 text-gray-400 dark:text-[#a0a0b0] absolute left-4 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {COURSES.map(course => (
                    <div 
                      key={course.id}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                      className={`holo-card group border ${course.difficulty === 'Khó nhằn' ? 'border-[#ff385c]/30 shadow-[0_8px_20px_rgba(255,56,92,0.08)] dark:border-[#ff385c]/50 dark:shadow-[0_0_15px_rgba(255,56,92,0.15)]' : 'border-white dark:border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] ring-1 ring-black/5 dark:ring-0'} rounded-[1.5rem] p-6 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(212,77,240,0.1)] dark:hover:shadow-[0_0_30px_rgba(212,77,240,0.2)] bg-white/95 dark:bg-[#1a1a24] flex flex-col h-full relative overflow-hidden transition-all duration-300`}
                    >
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ff385c] to-[#d44df0] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="flex justify-between items-start mb-4 relative z-20 pointer-events-none">
                        <h3 className="font-extrabold text-lg text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#ff385c] group-hover:to-[#d44df0] transition-all">{course.name}</h3>
                        <span className={`px-3 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-widest shrink-0 shadow-sm ${course.difficulty === 'Dễ thở' ? 'bg-white/10 text-gray-600 dark:text-white' : 'bg-[#ff385c]/20 text-[#ff385c] border border-[#ff385c]/30'}`}>
                          {course.difficulty}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 mb-5 relative z-20 pointer-events-none">
                        <div className="flex items-center gap-1.5">
                          <span className="text-yellow-400 text-lg drop-shadow-sm">⭐</span>
                          <span className="font-extrabold text-gray-900 dark:text-white">{course.rating}</span>
                        </div>
                        <span className="text-xs font-bold text-gray-600 dark:text-[#c8a0e0] border-l border-gray-300 dark:border-white/10 pl-4 uppercase tracking-wider">{course.reviews} đánh giá</span>
                      </div>
                      
                      <p className="text-sm text-gray-700 dark:text-[#e0e0e0] font-medium leading-relaxed mb-8 flex-1 relative z-20 pointer-events-none">
                        {course.description}
                      </p>

                      <div className="mt-auto flex gap-3 relative z-20">
                        <a 
                          href={course.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-ftu-red-600 to-purple-600 hover:opacity-90 dark:from-white dark:to-gray-200 dark:hover:from-gray-100 dark:hover:to-gray-300 text-white dark:text-black rounded-xl text-sm font-bold transition-all shadow-[0_4px_10px_rgba(255,255,255,0.2)] hover:shadow-[0_6px_15px_rgba(255,255,255,0.3)] hover:-translate-y-0.5"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                          Tài liệu
                        </a>
                        <button className="flex items-center justify-center px-6 border-2 border-gray-300 dark:border-white/20 hover:border-gray-400 dark:hover:border-white/50 bg-gray-100 dark:bg-black/20 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5">
                          Review
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
                
                <div className="mt-10 text-center p-8 bg-gray-50 dark:bg-black/40 rounded-[1.5rem] relative overflow-hidden cursor-pointer transition-all border border-dashed border-gray-300 dark:border-white/20 hover:bg-[#ff385c]/5 hover:border-[#ff385c]/50">
                  <p className="text-gray-600 dark:text-[#a0a0b0] font-bold text-sm relative z-10 transition-colors group-hover:text-gray-900 dark:group-hover:text-white">Chưa tìm thấy môn học bạn cần?</p>
                  <button className="mt-3 text-[#d44df0] font-extrabold text-sm uppercase tracking-widest relative z-10 transition-colors group-hover:text-[#ff385c]">Đóng góp môn học mới</button>
                </div>

              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}
