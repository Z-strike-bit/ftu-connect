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
  completedChecklist?: string[];
}

const CHECKLIST_ITEMS = [
  { id: 'c1', title: 'Làm thẻ sinh viên và thẻ thư viện' },
  { id: 'c2', title: 'Kích hoạt email trường (@ftu.edu.vn)' },
  { id: 'c3', title: 'Đăng ký tín chỉ trên trang Tín chỉ FTU' },
  { id: 'c4', title: 'Nộp giấy khám sức khỏe đầu năm' },
  { id: 'c5', title: 'Tìm hiểu và apply Câu lạc bộ' },
  { id: 'c6', title: 'Tìm phòng trọ / Đăng ký Ký túc xá' }
];

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
          setCompletedItems(data.completedChecklist || []);
          setLoading(false);
        } else {
          router.push('/onboarding');
        }
      } else {
        router.push('/');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  const toggleChecklist = async (id: string) => {
    if (!user) return;
    const isCompleted = completedItems.includes(id);
    
    setCompletedItems(prev => 
      isCompleted ? prev.filter(i => i !== id) : [...prev, id]
    );

    try {
      const userRef = doc(db, 'users', user.uid);
      if (isCompleted) {
        await updateDoc(userRef, { completedChecklist: arrayRemove(id) });
      } else {
        await updateDoc(userRef, { completedChecklist: arrayUnion(id) });
      }
    } catch (err) {
      console.error("Lỗi cập nhật checklist:", err);
      setCompletedItems(prev => 
        isCompleted ? [...prev, id] : prev.filter(i => i !== id)
      );
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center"><p className="text-slate-500 font-bold animate-pulse">Đang tải Cẩm nang...</p></div>;
  }

  const progressPercentage = Math.round((completedItems.length / CHECKLIST_ITEMS.length) * 100);

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
          
          {/* Cột Trái: Checklist (30%) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-4"
          >
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden sticky top-28">
              <div className="p-8 border-b border-slate-100 bg-black text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600 rounded-full blur-[40px] opacity-40 -mr-10 -mt-10"></div>
                <h2 className="text-xl font-bold flex items-center gap-2 relative z-10">
                  <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                  Checklist Nhập học
                </h2>
                
                {/* Progress Bar */}
                <div className="mt-6 relative z-10">
                  <div className="flex justify-between text-xs font-bold text-slate-300 mb-2 uppercase tracking-widest">
                    <span>Tiến độ</span>
                    <span className="text-red-400">{progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-1.5">
                    <motion.div 
                      className="bg-red-500 h-1.5 rounded-full" 
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-3">
                {CHECKLIST_ITEMS.map(item => {
                  const isDone = completedItems.includes(item.id);
                  return (
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      key={item.id}
                      onClick={() => toggleChecklist(item.id)}
                      className={`flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-all border ${isDone ? 'bg-slate-50 border-transparent opacity-60' : 'bg-white border-slate-200 hover:border-black hover:shadow-sm'}`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isDone ? (
                          <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-slate-300"></div>
                        )}
                      </div>
                      <span className={`text-[15px] font-bold transition-all ${isDone ? 'line-through text-slate-400' : 'text-black'}`}>
                        {item.title}
                      </span>
                    </motion.div>
                  );
                })}
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
