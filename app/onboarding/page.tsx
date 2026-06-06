"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { FTU_MAJORS } from '@/lib/constants/ftuMajors';

export default function Onboarding() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    role: '', 
    major: '',
    specialization: '',
    contactLink: '', 
    bio: '',
    gpa: '',
    clubs: '',
    achievements: '',
    skills: '', 
    goals: [] as string[],
    interests: ''
  });

  const GOALS = [
    'Cải thiện điểm GPA',
    'Tham gia Câu lạc bộ',
    'Mở rộng Networking',
    'Tìm kiếm Học bổng',
    'Định hướng nghề nghiệp',
    'Tìm việc Part-time / Intern'
  ];

  const DEFAULT_AVATARS = [
    '/assets/mascots/dino-newbie.jpeg',
    '/assets/mascots/dino-math-crying.jpeg',
    '/assets/mascots/dino-coding.jpeg',
    '/assets/mascots/dino-foodie.jpeg'
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          router.push('/dashboard');
        } else {
          setUser(currentUser);
          setLoading(false);
        }
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => {
      if (prev.goals.includes(goal)) {
        return { ...prev, goals: prev.goals.filter(g => g !== goal) };
      } else {
        return { ...prev, goals: [...prev.goals, goal] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!formData.role || !formData.major || !formData.specialization || !formData.contactLink) {
      setError('Vui lòng điền các trường bắt buộc (*)');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const randomAvatar = DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];
      await setDoc(doc(db, 'users', user.uid), {
        name: user.displayName,
        email: user.email,
        photoURL: randomAvatar,
        ...formData,
        createdAt: new Date().toISOString()
      });
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Đã xảy ra lỗi khi lưu thông tin. Vui lòng thử lại.');
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#05050a]"><p className="text-gray-500 dark:text-[#a0a0b0] font-bold animate-pulse text-lg">Đang tải biểu mẫu...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#05050a] py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-[#ff385c]/30 selection:text-white relative overflow-hidden flex items-center justify-center">
      {/* Ambient Background Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-600/20 to-transparent pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#ff385c]/15 to-transparent pointer-events-none z-0"></div>
      <div className="fixed top-[40%] left-[40%] w-[30vw] h-[30vw] rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 to-transparent pointer-events-none z-0"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-3xl mx-auto bg-white dark:bg-white/[0.03] backdrop-blur-3xl rounded-[32px] shadow-[0_8px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.5)] border border-gray-200 dark:border-white/10 overflow-hidden relative z-10"
      >
        <div className="absolute top-0 left-0 w-full h-[3px] bg-[linear-gradient(90deg,#00e5ff,#d44df0,#ff385c,#d44df0,#00e5ff)] opacity-80 animate-led-run shadow-[0_0_10px_rgba(212,77,240,0.5)]"></div>
        
        {/* Header */}
        <div className="pt-12 pb-8 px-8 text-center relative overflow-hidden border-b border-gray-200 dark:border-white/5">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#ff385c] rounded-full blur-[80px] opacity-20"></div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:to-[#c8a0e0] relative z-10 tracking-tight uppercase">Xây dựng Hồ sơ</h2>
          <p className="mt-4 text-gray-500 dark:text-[#a0a0b0] font-medium relative z-10 max-w-lg mx-auto">Hoàn thiện thông tin để hệ thống ghép cặp phù hợp nhất với bạn trên không gian FTU Connect.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 sm:px-10 py-8 space-y-10">
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 text-[#ff385c] p-4 rounded-2xl text-sm font-bold border border-red-500/30 flex items-start gap-3 backdrop-blur-md shadow-[0_0_15px_rgba(255,56,92,0.1)]">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              {error}
            </motion.div>
          )}

          {/* Core Info */}
          <div className="space-y-8">
            <div>
              <label className="block text-[15px] font-extrabold text-gray-900 dark:text-white mb-4 drop-shadow-sm">Bạn tham gia với vai trò gì? <span className="text-[#ff385c]">*</span></label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'mentor'})}
                  className={`relative overflow-hidden py-6 px-6 rounded-2xl border-2 transition-all duration-300 text-left flex flex-col gap-2 group ${formData.role === 'mentor' ? 'border-[#00e5ff] bg-[#00e5ff]/10 shadow-[0_0_20px_rgba(0,229,255,0.2)]' : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 dark:hover:border-white/20'}`}
                >
                  <span className={`text-xl font-extrabold transition-colors ${formData.role === 'mentor' ? 'text-gray-900 dark:text-[#00e5ff]' : 'text-gray-600 group-hover:text-gray-900 dark:text-white dark:group-hover:text-[#00e5ff]'}`}>Mentor</span>
                  <span className="text-[13px] font-medium text-gray-500 dark:text-[#a0a0b0]">Người hướng dẫn (Sinh viên năm 2, 3, 4)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'mentee'})}
                  className={`relative overflow-hidden py-6 px-6 rounded-2xl border-2 transition-all duration-300 text-left flex flex-col gap-2 group ${formData.role === 'mentee' ? 'border-[#ff385c] bg-[#ff385c]/10 shadow-[0_0_20px_rgba(255,56,92,0.2)]' : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10 dark:hover:border-white/20'}`}
                >
                  <span className={`text-xl font-extrabold transition-colors ${formData.role === 'mentee' ? 'text-gray-900 dark:text-[#ff385c]' : 'text-gray-600 group-hover:text-gray-900 dark:text-white dark:group-hover:text-[#ff385c]'}`}>Mentee</span>
                  <span className="text-[13px] font-medium text-gray-500 dark:text-[#a0a0b0]">Người được hướng dẫn (Tân sinh viên năm 1)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[15px] font-extrabold text-gray-900 dark:text-white mb-3 drop-shadow-sm">Ngành học <span className="text-[#ff385c]">*</span></label>
                <div className="flex flex-col gap-4">
                  <div className="relative">
                    <select
                      required
                      value={formData.major}
                      onChange={(e) => setFormData({...formData, major: e.target.value, specialization: ''})}
                      className="w-full rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-[#090909] p-4 text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-[#d44df0]/50 focus:border-[#d44df0] outline-none transition-all appearance-none shadow-sm dark:shadow-inner"
                    >
                      <option value="" className="text-gray-500">-- Chọn ngành học --</option>
                      {FTU_MAJORS.map(m => <option key={m.id} value={m.majorName}>{m.majorName}</option>)}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 dark:text-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>

                  <div className="relative">
                    <select
                      required
                      value={formData.specialization}
                      onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                      disabled={!formData.major}
                      className="w-full rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-[#090909] p-4 text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-[#d44df0]/50 focus:border-[#d44df0] outline-none transition-all appearance-none disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-[#111] disabled:cursor-not-allowed shadow-sm dark:shadow-inner"
                    >
                      <option value="" className="text-gray-500">-- Chọn chuyên ngành --</option>
                      {formData.major && FTU_MAJORS.find(m => m.majorName === formData.major)?.specializations.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 dark:text-white opacity-50">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[15px] font-extrabold text-gray-900 dark:text-white mb-3 drop-shadow-sm">Link liên hệ (Mess/Zalo) <span className="text-[#ff385c]">*</span></label>
                <input
                  type="url"
                  required
                  placeholder="https://m.me/your.username"
                  value={formData.contactLink}
                  onChange={(e) => setFormData({...formData, contactLink: e.target.value})}
                  className="w-full rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-[#090909] p-4 text-gray-900 dark:text-white font-medium placeholder-gray-400 dark:placeholder-[#6a6a6a] focus:ring-2 focus:ring-[#00e5ff]/50 focus:border-[#00e5ff] outline-none transition-all shadow-sm dark:shadow-inner"
                />
                <p className="text-[13px] text-gray-500 dark:text-[#a0a0b0] mt-3 font-medium flex items-center gap-1.5"><svg className="w-4 h-4 text-[#00e676]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg> Bảo mật: Chỉ hiển thị khi kết nối thành công.</p>
              </div>
            </div>
          </div>

          {/* Conditional Sections */}
          <AnimatePresence mode="wait">
            {formData.role === 'mentor' && (
              <motion.div 
                key="mentor-section"
                initial={{ opacity: 0, height: 0, y: -20 }} 
                animate={{ opacity: 1, height: 'auto', y: 0 }} 
                exit={{ opacity: 0, height: 0, y: -20 }}
                className="bg-white dark:bg-white/5 border border-gray-200 dark:border-[#00e5ff]/30 text-gray-900 dark:text-white rounded-3xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.05)] dark:shadow-[0_0_30px_rgba(0,229,255,0.05)] relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#00e5ff]/10 rounded-full blur-[60px] pointer-events-none"></div>
                <h3 className="text-xl font-extrabold border-b border-gray-200 dark:border-white/10 pb-4 mb-6 flex items-center gap-3">
                  <span className="bg-[#00e5ff] text-black w-8 h-8 rounded-full flex items-center justify-center text-lg">🎓</span>
                  Chi tiết Mentor
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-[14px] font-bold text-gray-600 dark:text-[#a0a0b0] mb-2">GPA / Thành tích</label>
                    <input
                      type="text"
                      placeholder="VD: 3.8/4.0"
                      value={formData.gpa}
                      onChange={(e) => setFormData({...formData, gpa: e.target.value})}
                      className="w-full rounded-xl border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-black/40 p-4 text-gray-900 dark:text-white font-medium placeholder-gray-400 dark:placeholder-[#6a6a6a] focus:ring-2 focus:ring-[#00e5ff]/50 focus:border-[#00e5ff] outline-none transition-all shadow-sm dark:shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block text-[14px] font-bold text-gray-600 dark:text-[#a0a0b0] mb-2">Câu lạc bộ</label>
                    <input
                      type="text"
                      placeholder="VD: TEC, YRC..."
                      value={formData.clubs}
                      onChange={(e) => setFormData({...formData, clubs: e.target.value})}
                      className="w-full rounded-xl border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-black/40 p-4 text-gray-900 dark:text-white font-medium placeholder-gray-400 dark:placeholder-[#6a6a6a] focus:ring-2 focus:ring-[#00e5ff]/50 focus:border-[#00e5ff] outline-none transition-all shadow-sm dark:shadow-inner"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-[14px] font-bold text-gray-600 dark:text-[#a0a0b0] mb-2">Kỹ năng mạnh nhất</label>
                  <input
                    type="text"
                    placeholder="VD: IELTS 8.0, Thuyết trình..."
                    value={formData.skills}
                    onChange={(e) => setFormData({...formData, skills: e.target.value})}
                    className="w-full rounded-xl border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-black/40 p-4 text-gray-900 dark:text-white font-medium placeholder-gray-400 dark:placeholder-[#6a6a6a] focus:ring-2 focus:ring-[#00e5ff]/50 focus:border-[#00e5ff] outline-none transition-all shadow-sm dark:shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-bold text-gray-600 dark:text-[#a0a0b0] mb-2">Trải nghiệm nổi bật</label>
                  <textarea
                    rows={3}
                    placeholder="Điều tự hào nhất..."
                    value={formData.achievements}
                    onChange={(e) => setFormData({...formData, achievements: e.target.value})}
                    className="w-full rounded-xl border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-black/40 p-4 text-gray-900 dark:text-white font-medium placeholder-gray-400 dark:placeholder-[#6a6a6a] focus:ring-2 focus:ring-[#00e5ff]/50 focus:border-[#00e5ff] outline-none resize-none transition-all shadow-sm dark:shadow-inner"
                  />
                </div>
              </motion.div>
            )}

            {formData.role === 'mentee' && (
              <motion.div 
                key="mentee-section"
                initial={{ opacity: 0, height: 0, y: -20 }} 
                animate={{ opacity: 1, height: 'auto', y: 0 }} 
                exit={{ opacity: 0, height: 0, y: -20 }}
                className="bg-white dark:bg-white/5 border border-gray-200 dark:border-[#ff385c]/30 text-gray-900 dark:text-white rounded-3xl p-8 shadow-[0_4px_24px_rgba(0,0,0,0.05)] dark:shadow-[0_0_30px_rgba(255,56,92,0.05)] relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff385c]/10 rounded-full blur-[60px] pointer-events-none"></div>
                <h3 className="text-xl font-extrabold border-b border-gray-200 dark:border-white/10 pb-4 mb-6 flex items-center gap-3">
                  <span className="bg-[#ff385c] text-white w-8 h-8 rounded-full flex items-center justify-center text-lg">🌱</span>
                  Mục tiêu Mentee
                </h3>
                
                <div className="mb-6">
                  <label className="block text-[14px] font-bold text-gray-600 dark:text-[#a0a0b0] mb-4">Bạn muốn đạt được điều gì?</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {GOALS.map(goal => (
                      <label key={goal} className={`flex items-center space-x-3 p-4 border rounded-xl cursor-pointer transition-all group ${formData.goals.includes(goal) ? 'border-[#ff385c] bg-[#ff385c]/10 dark:bg-[#ff385c]/20 shadow-[0_0_15px_rgba(255,56,92,0.2)]' : 'border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 dark:border-white/10 dark:bg-black/40 dark:hover:bg-white/10 dark:hover:border-white/20'}`}>
                        <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
                          <input
                            type="checkbox"
                            checked={formData.goals.includes(goal)}
                            onChange={() => handleGoalToggle(goal)}
                            className="w-5 h-5 appearance-none rounded border-2 border-gray-300 dark:border-white/30 bg-transparent checked:border-[#ff385c] checked:bg-[#ff385c] outline-none transition-colors cursor-pointer"
                          />
                          {formData.goals.includes(goal) && (
                            <svg className="w-3.5 h-3.5 text-white absolute pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          )}
                        </div>
                        <span className={`text-[14px] font-bold transition-colors ${formData.goals.includes(goal) ? 'text-gray-900 dark:text-white' : 'text-gray-600 group-hover:text-gray-900 dark:text-[#a0a0b0] dark:group-hover:text-white'}`}>{goal}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[14px] font-bold text-gray-600 dark:text-[#a0a0b0] mb-2">Sở thích cá nhân</label>
                  <input
                    type="text"
                    placeholder="VD: Đọc sách, Nghe Podcast, Chơi game..."
                    value={formData.interests}
                    onChange={(e) => setFormData({...formData, interests: e.target.value})}
                    className="w-full rounded-xl border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-black/40 p-4 text-gray-900 dark:text-white font-medium placeholder-gray-400 dark:placeholder-[#6a6a6a] focus:ring-2 focus:ring-[#ff385c]/50 focus:border-[#ff385c] outline-none transition-all shadow-sm dark:shadow-inner"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Common Bio */}
          <div>
            <label className="block text-[15px] font-extrabold text-gray-900 dark:text-white mb-3 drop-shadow-sm">Lời giới thiệu (Bio)</label>
            <textarea
              rows={3}
              placeholder="Chia sẻ một chút về bản thân bạn nhé..."
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className="w-full rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-[#090909] p-4 text-gray-900 dark:text-white font-medium placeholder-gray-400 dark:placeholder-[#6a6a6a] focus:ring-2 focus:ring-ftu-red-500/50 focus:border-ftu-red-500 dark:focus:ring-[#c8a0e0]/50 dark:focus:border-[#c8a0e0] outline-none resize-none transition-all shadow-sm dark:shadow-inner"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={saving || !formData.role || !formData.major || !formData.specialization || !formData.contactLink}
            className="w-full flex justify-center py-4 px-4 rounded-xl shadow-[0_4px_15px_rgba(185,28,28,0.3)] hover:shadow-[0_6px_25px_rgba(185,28,28,0.5)] dark:shadow-[0_4px_15px_rgba(255,255,255,0.15)] dark:hover:shadow-[0_6px_25px_rgba(255,255,255,0.3)] text-[17px] font-extrabold text-white dark:text-black bg-gradient-to-r from-ftu-red-600 to-ftu-red-700 dark:from-white dark:to-gray-300 outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-wide mt-4"
          >
            {saving ? 'Đang lưu...' : 'Tham Gia Ngay'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
