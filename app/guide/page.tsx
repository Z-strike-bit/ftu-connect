"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
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
}

// Xóa CHECKLIST_ITEMS

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
  
  const [completedItems, setCompletedItems] = useState<string[]>([]);

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

  if (loading) {
    return <div className="min-h-screen bg-[#141414] flex items-center justify-center"><p className="text-[#999999] font-bold animate-pulse">Đang tải Cẩm nang...</p></div>;
  }

  // Cấu trúc thuật toán Core
  const a = Number(creditsA) || 0;
  const b = Number(creditsB) || 0;
  const c = Number(creditsC) || 0;
  const d = Number(creditsD) || 0;
  const f = Number(creditsF) || 0;
  const total = Number(totalCredits) || 130;

  const sumCredits = a + b + c + d + f;
  const curPoints = (a * 4) + (b * 3) + (c * 2) + (d * 1) + (f * 0);
  const currentGPA = sumCredits > 0 ? (curPoints / sumCredits) : 0;
  
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

  return (
    <div className="min-h-screen w-full bg-[#090909] text-white font-sans pb-16 selection:bg-red-200">
      <Navbar profileName={profile?.name} profileId={user?.uid} profilePhoto={profile?.photoURL} onSignOut={handleSignOut} />

      {/* Main Container */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 border-b border-[#262626] pb-8"
        >
          <h1 className="text-4xl font-extrabold text-white tracking-tight uppercase">Cẩm nang <span className="text-[#ff385c]">Tân sinh viên</span></h1>
          <p className="text-[#999999] mt-2 text-lg font-medium">Bí kíp sinh tồn và chinh phục 4 năm rực rỡ tại Ngoại Thương.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Cột Trái: GPA Tracker (30%) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-4"
          >
            <div className="bg-[#141414] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#1a1a1a] overflow-hidden sticky top-28">
              
              {/* Header Widget */}
              <div className="p-6 border-b border-[#1a1a1a] bg-[#141414]">
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <div className="bg-[#ff385c]/10 p-2 rounded-xl text-[#ff385c]">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  </div>
                  GPA Tracker
                </h2>
                <p className="text-[13px] text-[#999999] font-medium mt-2 leading-relaxed">
                  Công cụ phân tích điểm rơi chiến thuật dành riêng cho FTU-er.
                </p>
              </div>

              {/* Form Input */}
              <div className="p-6 space-y-6 bg-[#090909]">
                <div>
                  <label className="block text-sm font-bold text-white mb-1.5">Tổng tín chỉ tối thiểu để ra trường</label>
                  <input 
                    type="number" 
                    placeholder="VD: 130"
                    value={totalCredits}
                    onChange={(e) => handleTotalChange(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${totalError ? 'border-[#ff385c] bg-[#ff385c]/10 focus:ring-[#0099ff]/40' : 'border-[#262626] focus:border-[#0099ff] focus:ring-[#0099ff]/20'} outline-none focus:ring-4 transition-all text-[15px] font-bold text-white`}
                  />
                  {totalError && <p className="text-red-500 text-xs font-bold mt-1.5">{totalError}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-2">Nhập điểm thành phần (Tín chỉ)</label>
                  <div className="grid grid-cols-5 gap-2">
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-extrabold text-[#6a6a6a] mb-1 uppercase">Điểm A</span>
                      <input type="number" value={creditsA} onChange={(e) => setCreditsA(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))} className="w-full text-center py-2 rounded-lg border border-[#262626] focus:border-[#0099ff] focus:ring-2 focus:ring-[#0099ff]/20 outline-none font-bold text-sm text-white" />
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-extrabold text-[#6a6a6a] mb-1 uppercase">Điểm B</span>
                      <input type="number" value={creditsB} onChange={(e) => setCreditsB(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))} className="w-full text-center py-2 rounded-lg border border-[#262626] focus:border-[#0099ff] focus:ring-2 focus:ring-[#0099ff]/20 outline-none font-bold text-sm text-white" />
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-extrabold text-[#6a6a6a] mb-1 uppercase">Điểm C</span>
                      <input type="number" value={creditsC} onChange={(e) => setCreditsC(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))} className="w-full text-center py-2 rounded-lg border border-[#262626] focus:border-[#0099ff] focus:ring-2 focus:ring-[#0099ff]/20 outline-none font-bold text-sm text-white" />
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-extrabold text-[#6a6a6a] mb-1 uppercase">Điểm D</span>
                      <input type="number" value={creditsD} onChange={(e) => setCreditsD(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))} className="w-full text-center py-2 rounded-lg border border-[#262626] focus:border-[#0099ff] focus:ring-2 focus:ring-[#0099ff]/20 outline-none font-bold text-sm text-white" />
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-extrabold text-[#6a6a6a] mb-1 uppercase">Điểm F</span>
                      <input type="number" value={creditsF} onChange={(e) => setCreditsF(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))} className="w-full text-center py-2 rounded-lg border border-[#262626] focus:border-[#0099ff] focus:ring-2 focus:ring-[#0099ff]/20 outline-none font-bold text-sm text-white" />
                    </div>
                  </div>
                </div>

                {/* Read Only Current Stats */}
                <div className="bg-[#141414] p-4 rounded-xl border border-[#262626] shadow-sm">
                  <h3 className="text-xs font-bold text-[#6a6a6a] uppercase tracking-widest mb-3">Thống kê hiện tại</h3>
                  <div className="space-y-2 text-[14px]">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-white/80">Tổng tín đã tích lũy:</span>
                      <span className="font-extrabold text-white">{sumCredits}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-white/80">GPA Hiện tại:</span>
                      <span className="font-extrabold text-[#ff385c] text-base">{currentGPA.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-white/80">Xếp loại:</span>
                      <span className="font-extrabold text-white bg-[#1c1c1c] px-2 py-0.5 rounded">{rank}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-1.5">Mục tiêu mong muốn</label>
                  <select 
                    value={targetGPA}
                    onChange={(e) => setTargetGPA(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-[#262626] outline-none focus:border-[#0099ff] focus:ring-4 focus:ring-[#0099ff]/20 transition-all text-[15px] font-bold bg-[#141414] appearance-none cursor-pointer text-white"
                  >
                    <option value={2.5}>Bằng Khá (2.5)</option>
                    <option value={3.2}>Bằng Giỏi (3.2)</option>
                    <option value={3.6}>Bằng Xuất sắc (3.6)</option>
                  </select>
                </div>
              </div>

              {/* Result Area */}
              <div className="p-6 bg-[#141414] border-t border-[#1a1a1a]">
                {sumCredits > total ? (
                  <div className="text-center p-5 bg-[#ff385c]/10 rounded-xl border border-[#ff385c]/20 shadow-sm">
                    <p className="text-[#ff385c] font-extrabold text-lg mb-2">⚠️ Lỗi dữ liệu!</p>
                    <p className="text-[#ff385c] text-sm font-medium leading-relaxed">
                      Tổng số tín chỉ bạn đã nhập ({sumCredits}) lớn hơn cả tổng tín chỉ toàn khóa ({total}). Vui lòng kiểm tra lại!
                    </p>
                  </div>
                ) : remCredits <= 0 ? (
                  <div className="text-center p-5 bg-green-500/10 rounded-xl border border-green-500/20 shadow-sm">
                    <p className="text-green-400 font-extrabold text-lg mb-2">🎓 Đã hoàn thành!</p>
                    <p className="text-green-400 text-sm font-medium leading-relaxed">
                      Bạn đã hoàn thành đủ số tín chỉ ra trường. GPA chung cuộc của bạn là <span className="font-extrabold">{currentGPA.toFixed(2)}</span> ({rank}).
                    </p>
                  </div>
                ) : neededA > remCredits ? (
                  <div className="text-center p-5 bg-[#ff385c]/10 rounded-xl border border-[#ff385c]/20 shadow-sm flex flex-col items-center">
                    <Image src="/assets/badges/badge-newbie.png" alt="Newbie Badge" width={80} height={80} className="mb-3 hover:scale-110 transition-transform duration-300 drop-shadow-md" />
                    <p className="text-[#ff385c] font-extrabold text-lg mb-2">❌ Bất khả thi!</p>
                    <p className="text-[#ff385c] text-sm font-medium leading-relaxed">
                      Đời còn dài, FTU-er còn nhiều việc phải làm! Quỹ tín chỉ của bạn đã hết room để kéo điểm lên mức này, dù có full A. Hãy cân nhắc hạ mục tiêu xuống một chút và tận hưởng thời sinh viên nhé!
                    </p>
                  </div>
                ) : neededA > 0 ? (
                  <div className="text-center p-5 bg-[#0099ff]/10 rounded-xl border border-[#0099ff]/20 shadow-sm flex flex-col items-center">
                    <Image src="/assets/badges/badge-veteran.png" alt="Veteran Badge" width={80} height={80} className="mb-3 hover:scale-110 transition-transform duration-300 drop-shadow-md" />
                    <p className="text-[#0099ff] font-extrabold text-lg mb-2">🔥 Kịch bản an toàn</p>
                    <p className="text-[#0099ff] text-sm font-medium leading-relaxed">
                      Kịch bản an toàn: Bạn cần gánh ít nhất <span className="font-extrabold text-lg bg-[#141414] px-2 py-0.5 rounded-md shadow-sm border border-current">{neededA}</span> tín chỉ điểm A, phần còn lại (<span className="font-extrabold">{remCredits - neededA}</span> tín chỉ) chỉ cần giữ mức điểm B là sẽ chạm mốc {targetGPA.toFixed(2)}!
                    </p>
                  </div>
                ) : (
                  <div className="text-center p-5 bg-green-500/10 rounded-xl border border-green-500/20 shadow-sm flex flex-col items-center">
                    <Image src="/assets/badges/badge-gold.png" alt="Gold Badge" width={80} height={80} className="mb-3 animate-bounce drop-shadow-lg" />
                    <p className="text-green-400 font-extrabold text-lg mb-2">🎉 Quá dễ thở!</p>
                    <p className="text-green-400 text-sm font-medium leading-relaxed">
                      Quỹ điểm của bạn đang rất dư dả. Chặng đường còn lại thậm chí không cần điểm A, chỉ cần đều đều điểm B (hoặc C) là vẫn thừa sức đạt mục tiêu!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Cột Phải: Wiki Môn học (70%) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-8"
          >
            <div className="bg-[#141414] rounded-[2rem] shadow-sm border border-[#262626] p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-white">Thư viện Wiki</h2>
                  <p className="text-sm font-medium text-[#999999] mt-1">Review chân thực và kho tài liệu khổng lồ.</p>
                </div>
                <div className="relative">
                  <input type="text" placeholder="Tìm kiếm môn học..." className="w-full sm:w-72 pl-12 pr-4 py-3 bg-[#090909] border border-[#262626] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#0099ff]/20 focus:border-red-600 font-bold transition-all"/>
                  <svg className="w-5 h-5 text-[#6a6a6a] absolute left-4 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {COURSES.map(course => (
                  <motion.div 
                    whileHover={{ y: -5 }}
                    key={course.id} 
                    className="group border border-[#262626] rounded-[1.5rem] p-6 hover:border-[#0099ff] hover:shadow-lg transition-all bg-[#141414] flex flex-col h-full"
                  >
                    
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-extrabold text-lg text-white group-hover:text-[#ff385c] transition-colors">{course.name}</h3>
                      <span className={`px-3 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-widest shrink-0 ${course.difficulty === 'Dễ thở' ? 'bg-[#1c1c1c] text-white/80' : 'bg-[#ff385c]/10 text-[#ff385c]'}`}>
                        {course.difficulty}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-yellow-400 text-lg drop-shadow-sm">⭐</span>
                        <span className="font-extrabold text-white">{course.rating}</span>
                      </div>
                      <span className="text-xs font-bold text-[#6a6a6a] border-l border-[#262626] pl-4 uppercase tracking-wider">{course.reviews} đánh giá</span>
                    </div>
                    
                    <p className="text-sm text-white/80 font-medium leading-relaxed mb-8 flex-1">
                      {course.description}
                    </p>

                    <div className="mt-auto flex gap-3">
                      <a 
                        href={course.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-white hover:bg-gray-200 text-black rounded-xl text-sm font-bold transition-colors shadow-sm"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Tài liệu
                      </a>
                      <button className="flex items-center justify-center px-6 border-2 border-[#262626] hover:border-[#0099ff] text-white rounded-xl text-sm font-bold transition-colors">
                        Review
                      </button>
                    </div>

                  </motion.div>
                ))}
              </div>
              
              <div className="mt-10 text-center p-8 bg-[#090909] border-2 border-[#262626] border-dashed rounded-3xl">
                <p className="text-[#999999] font-bold text-sm">Chưa tìm thấy môn học bạn cần?</p>
                <button className="mt-3 text-[#ff385c] font-extrabold hover:underline text-sm uppercase tracking-widest">Đóng góp môn học mới</button>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
