"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';

interface UserProfile {
  name: string;
  currentCredits?: number;
  currentGPA?: number;
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
          setCurrentCredits(data.currentCredits ?? '');
          setCurrentGPA(data.currentGPA ?? '');
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

  const [currentCredits, setCurrentCredits] = useState<number | ''>('');
  const [currentGPA, setCurrentGPA] = useState<number | ''>('');
  const [targetGPA, setTargetGPA] = useState<number>(3.2);

  const [creditsError, setCreditsError] = useState('');
  const [gpaError, setGpaError] = useState('');

  // Handle Input Changes & Validation
  const handleCreditsChange = (val: string) => {
    if (val === '') {
      setCurrentCredits('');
      setCreditsError('');
      saveToFirebase('', currentGPA);
      return;
    }
    const num = Number(val);
    if (num < 0) {
      setCreditsError('Số tín chỉ không được âm');
      setCurrentCredits(num);
    } else {
      setCreditsError('');
      setCurrentCredits(num);
      saveToFirebase(num, currentGPA);
    }
  };

  const handleGpaChange = (val: string) => {
    if (val === '') {
      setCurrentGPA('');
      setGpaError('');
      saveToFirebase(currentCredits, '');
      return;
    }
    const num = Number(val);
    if (num < 0 || num > 4.0) {
      setGpaError('GPA phải nằm trong khoảng 0 - 4.0');
      setCurrentGPA(num);
    } else {
      setGpaError('');
      setCurrentGPA(num);
      saveToFirebase(currentCredits, num);
    }
  };

  // Debounced/Direct Save
  const saveToFirebase = async (credits: number | '', gpa: number | '') => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        currentCredits: credits === '' ? null : credits,
        currentGPA: gpa === '' ? null : gpa
      });
    } catch (err) {
      console.error("Lỗi lưu dữ liệu GPA:", err);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center"><p className="text-slate-500 font-bold animate-pulse">Đang tải Cẩm nang...</p></div>;
  }

  // Calculate Required Credits
  let neededCredits: number | null = null;
  let difficulty = ''; // 'easy' | 'challenging' | 'impossible'
  
  if (currentCredits !== '' && currentGPA !== '' && !creditsError && !gpaError) {
    if (currentGPA >= targetGPA) {
      neededCredits = 0;
    } else {
      const needed = (currentCredits * (targetGPA - currentGPA)) / (4.0 - targetGPA);
      neededCredits = Math.ceil(needed);
      
      if (neededCredits <= 15) difficulty = 'easy'; // Xanh
      else if (neededCredits <= 35) difficulty = 'challenging'; // Cam
      else difficulty = 'impossible'; // Đỏ
    }
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 text-black font-sans pb-16 selection:bg-red-200">
      <Navbar profileName={profile?.name} onSignOut={handleSignOut} />

      {/* Main Container */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 border-b border-slate-200 pb-8"
        >
          <h1 className="text-4xl font-extrabold text-black tracking-tight uppercase">Cẩm nang <span className="text-red-600">Tân sinh viên</span></h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">Bí kíp sinh tồn và chinh phục 4 năm rực rỡ tại Ngoại Thương.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Cột Trái: GPA Calculator (30%) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-4"
          >
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden sticky top-28">
              
              {/* Header Widget */}
              <div className="p-6 border-b border-slate-100 bg-white">
                <h2 className="text-xl font-extrabold text-black flex items-center gap-2">
                  <div className="bg-red-50 p-2 rounded-xl text-red-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  </div>
                  Mục tiêu GPA
                </h2>
                <p className="text-[13px] text-slate-500 font-medium mt-2 leading-relaxed">
                  Tính toán lộ trình tín chỉ để chinh phục danh hiệu mong muốn.
                </p>
              </div>

              {/* Form Input */}
              <div className="p-6 space-y-5 bg-slate-50/50">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Tín chỉ đã tích lũy</label>
                  <input 
                    type="number" 
                    placeholder="VD: 50"
                    value={currentCredits}
                    onChange={(e) => handleCreditsChange(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${creditsError ? 'border-red-400 bg-red-50 focus:ring-red-200' : 'border-slate-200 focus:border-red-500 focus:ring-red-100'} outline-none focus:ring-4 transition-all text-[15px] font-medium text-black`}
                  />
                  {creditsError && <p className="text-red-500 text-xs font-bold mt-1.5">{creditsError}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">GPA hiện tại (Hệ 4.0)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="VD: 3.15"
                    value={currentGPA}
                    onChange={(e) => handleGpaChange(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${gpaError ? 'border-red-400 bg-red-50 focus:ring-red-200' : 'border-slate-200 focus:border-red-500 focus:ring-red-100'} outline-none focus:ring-4 transition-all text-[15px] font-medium text-black`}
                  />
                  {gpaError && <p className="text-red-500 text-xs font-bold mt-1.5">{gpaError}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Mục tiêu mong muốn</label>
                  <select 
                    value={targetGPA}
                    onChange={(e) => setTargetGPA(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all text-[15px] font-medium bg-white appearance-none cursor-pointer text-black"
                  >
                    <option value={2.5}>Bằng Khá (2.5)</option>
                    <option value={3.2}>Bằng Giỏi (3.2)</option>
                    <option value={3.6}>Bằng Xuất sắc (3.6)</option>
                  </select>
                </div>
              </div>

              {/* Result Area */}
              <div className="p-6 bg-white border-t border-slate-100">
                {neededCredits === null ? (
                  <div className="text-center py-6 text-slate-400 font-medium text-sm">
                    Nhập dữ liệu để xem kết quả
                  </div>
                ) : neededCredits === 0 ? (
                  <div className="text-center py-4 bg-green-50 rounded-xl border border-green-100">
                    <p className="text-green-700 font-extrabold text-lg">🎉 Chúc mừng!</p>
                    <p className="text-green-600 text-sm font-medium mt-1">Bạn đã đạt mục tiêu này rồi!</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <p className="text-slate-500 text-sm font-medium mb-2">Bạn cần thêm tối thiểu</p>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-4xl font-black text-black tracking-tight">{neededCredits}</span>
                      <span className="text-lg font-bold text-slate-400">tín chỉ A</span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium mb-4">
                      (Đạt điểm 4.0 tuyệt đối) để vươn tới mức {targetGPA}
                    </p>

                    {/* Progress Bar & Tags */}
                    <div className="w-full">
                      <div className="flex justify-between text-[11px] font-extrabold uppercase tracking-widest mb-1.5">
                        <span className="text-slate-400">Độ khó</span>
                        {difficulty === 'easy' && <span className="text-green-600">Dễ thở</span>}
                        {difficulty === 'challenging' && <span className="text-amber-500">Thử thách</span>}
                        {difficulty === 'impossible' && <span className="text-red-600">Bất khả thi</span>}
                      </div>
                      
                      <div className="flex w-full h-2 rounded-full overflow-hidden bg-slate-100 gap-0.5">
                        <div className={`h-full flex-1 ${['easy', 'challenging', 'impossible'].includes(difficulty) ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                        <div className={`h-full flex-1 ${['challenging', 'impossible'].includes(difficulty) ? 'bg-amber-400' : 'bg-slate-200'}`}></div>
                        <div className={`h-full flex-1 ${difficulty === 'impossible' ? 'bg-red-500' : 'bg-slate-200'}`}></div>
                      </div>
                    </div>
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
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-black">Thư viện Wiki</h2>
                  <p className="text-sm font-medium text-slate-500 mt-1">Review chân thực và kho tài liệu khổng lồ.</p>
                </div>
                <div className="relative">
                  <input type="text" placeholder="Tìm kiếm môn học..." className="w-full sm:w-72 pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-600 font-bold transition-all"/>
                  <svg className="w-5 h-5 text-slate-400 absolute left-4 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {COURSES.map(course => (
                  <motion.div 
                    whileHover={{ y: -5 }}
                    key={course.id} 
                    className="group border border-slate-200 rounded-[1.5rem] p-6 hover:border-black hover:shadow-lg transition-all bg-white flex flex-col h-full"
                  >
                    
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-extrabold text-lg text-black group-hover:text-red-600 transition-colors">{course.name}</h3>
                      <span className={`px-3 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-widest shrink-0 ${course.difficulty === 'Dễ thở' ? 'bg-slate-100 text-slate-600' : 'bg-red-50 text-red-600'}`}>
                        {course.difficulty}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-yellow-400 text-lg drop-shadow-sm">⭐</span>
                        <span className="font-extrabold text-black">{course.rating}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-400 border-l border-slate-200 pl-4 uppercase tracking-wider">{course.reviews} đánh giá</span>
                    </div>
                    
                    <p className="text-sm text-slate-600 font-medium leading-relaxed mb-8 flex-1">
                      {course.description}
                    </p>

                    <div className="mt-auto flex gap-3">
                      <a 
                        href={course.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-black hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-colors shadow-sm"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Tài liệu
                      </a>
                      <button className="flex items-center justify-center px-6 border-2 border-slate-200 hover:border-black text-black rounded-xl text-sm font-bold transition-colors">
                        Review
                      </button>
                    </div>

                  </motion.div>
                ))}
              </div>
              
              <div className="mt-10 text-center p-8 bg-slate-50 border-2 border-slate-200 border-dashed rounded-3xl">
                <p className="text-slate-500 font-bold text-sm">Chưa tìm thấy môn học bạn cần?</p>
                <button className="mt-3 text-red-600 font-extrabold hover:underline text-sm uppercase tracking-widest">Đóng góp môn học mới</button>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
