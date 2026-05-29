"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';

export default function Onboarding() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    role: '', 
    major: '',
    contactLink: '', 
    bio: '',
    gpa: '',
    clubs: '',
    achievements: '',
    skills: '', 
    goals: [] as string[],
    interests: ''
  });

  const MAJORS = [
    'Kinh tế đối ngoại',
    'Thương mại quốc tế',
    'Quản trị kinh doanh',
    'Kinh doanh quốc tế',
    'Tài chính ngân hàng',
    'Kế toán kiểm toán',
    'Ngôn ngữ Anh',
    'Ngôn ngữ Nhật',
    'Ngôn ngữ Trung',
    'Luật thương mại quốc tế'
  ];

  const GOALS = [
    'Cải thiện điểm GPA',
    'Tham gia Câu lạc bộ',
    'Mở rộng Networking',
    'Tìm kiếm Học bổng',
    'Định hướng nghề nghiệp',
    'Tìm việc Part-time / Intern'
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
        router.push('/');
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
    
    if (!formData.role || !formData.major || !formData.contactLink) {
      setError('Vui lòng điền các trường bắt buộc (*)');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        name: user.displayName,
        email: user.email,
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
    return <div className="min-h-screen flex items-center justify-center bg-white"><p className="text-slate-500 font-medium animate-pulse">Đang tải biểu mẫu...</p></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-red-200">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
      >
        
        {/* Header */}
        <div className="bg-black py-10 px-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600 rounded-full blur-[80px] opacity-20 -mr-20 -mt-20"></div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white relative z-10">Xây dựng Hồ sơ</h2>
          <p className="mt-3 text-slate-300 font-medium relative z-10">Hoàn thiện thông tin để hệ thống ghép cặp phù hợp nhất với bạn</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-10 space-y-8">
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-200 flex items-start gap-2">
              <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              {error}
            </motion.div>
          )}

          {/* Core Info */}
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-bold text-black mb-4">Bạn tham gia với vai trò gì? <span className="text-red-600">*</span></label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'mentor'})}
                  className={`py-5 px-5 rounded-2xl border-2 transition-all duration-300 font-semibold text-left flex flex-col gap-1 ${formData.role === 'mentor' ? 'border-red-600 bg-red-50 text-red-700 shadow-md' : 'border-slate-200 text-slate-600 hover:border-black hover:text-black hover:shadow-sm'}`}
                >
                  <span className="text-lg">Mentor</span>
                  <span className="text-xs font-medium opacity-70 mt-1">Người hướng dẫn (Năm 2,3,4)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'mentee'})}
                  className={`py-5 px-5 rounded-2xl border-2 transition-all duration-300 font-semibold text-left flex flex-col gap-1 ${formData.role === 'mentee' ? 'border-red-600 bg-red-50 text-red-700 shadow-md' : 'border-slate-200 text-slate-600 hover:border-black hover:text-black hover:shadow-sm'}`}
                >
                  <span className="text-lg">Mentee</span>
                  <span className="text-xs font-medium opacity-70 mt-1">Người được hướng dẫn (Năm 1)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-black mb-2">Chuyên ngành <span className="text-red-600">*</span></label>
                <select
                  required
                  value={formData.major}
                  onChange={(e) => setFormData({...formData, major: e.target.value})}
                  className="w-full rounded-xl border-slate-200 bg-slate-50 p-3.5 text-black focus:ring-2 focus:ring-red-100 focus:border-red-600 border outline-none font-medium transition-all"
                >
                  <option value="">-- Chọn chuyên ngành --</option>
                  {MAJORS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-black mb-2">Link liên hệ (Mess/Zalo) <span className="text-red-600">*</span></label>
                <input
                  type="url"
                  required
                  placeholder="https://m.me/your.username"
                  value={formData.contactLink}
                  onChange={(e) => setFormData({...formData, contactLink: e.target.value})}
                  className="w-full rounded-xl border-slate-200 bg-slate-50 p-3.5 text-black focus:ring-2 focus:ring-red-100 focus:border-red-600 border outline-none font-medium placeholder-slate-400 transition-all"
                />
                <p className="text-[11px] text-slate-500 mt-1.5 font-medium">Bảo mật: Chỉ hiển thị khi kết nối thành công.</p>
              </div>
            </div>
          </div>

          {/* Conditional Sections */}
          {formData.role === 'mentor' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              className="bg-black text-white rounded-2xl p-8 shadow-md"
            >
              <h3 className="text-xl font-bold border-b border-white/20 pb-4 mb-6">Chi tiết Mentor</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">GPA / Thành tích</label>
                  <input
                    type="text"
                    placeholder="VD: 3.8/4.0"
                    value={formData.gpa}
                    onChange={(e) => setFormData({...formData, gpa: e.target.value})}
                    className="w-full rounded-xl border-white/10 bg-white/10 p-3.5 text-white focus:ring-2 focus:ring-red-500 border outline-none placeholder-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Câu lạc bộ</label>
                  <input
                    type="text"
                    placeholder="VD: TEC, YRC..."
                    value={formData.clubs}
                    onChange={(e) => setFormData({...formData, clubs: e.target.value})}
                    className="w-full rounded-xl border-white/10 bg-white/10 p-3.5 text-white focus:ring-2 focus:ring-red-500 border outline-none placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-300 mb-2">Kỹ năng mạnh nhất</label>
                <input
                  type="text"
                  placeholder="VD: IELTS 8.0, Thuyết trình..."
                  value={formData.skills}
                  onChange={(e) => setFormData({...formData, skills: e.target.value})}
                  className="w-full rounded-xl border-white/10 bg-white/10 p-3.5 text-white focus:ring-2 focus:ring-red-500 border outline-none placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Trải nghiệm nổi bật</label>
                <textarea
                  rows={3}
                  placeholder="Điều tự hào nhất..."
                  value={formData.achievements}
                  onChange={(e) => setFormData({...formData, achievements: e.target.value})}
                  className="w-full rounded-xl border-white/10 bg-white/10 p-3.5 text-white focus:ring-2 focus:ring-red-500 border outline-none resize-none placeholder-slate-400"
                />
              </div>
            </motion.div>
          )}

          {formData.role === 'mentee' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              className="bg-black text-white rounded-2xl p-8 shadow-md"
            >
              <h3 className="text-xl font-bold border-b border-white/20 pb-4 mb-6">Mục tiêu Mentee</h3>
              
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-300 mb-4">Bạn muốn đạt được điều gì?</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {GOALS.map(goal => (
                    <label key={goal} className={`flex items-center space-x-3 p-3.5 border rounded-xl cursor-pointer transition-all ${formData.goals.includes(goal) ? 'border-red-500 bg-red-500/20' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                      <input
                        type="checkbox"
                        checked={formData.goals.includes(goal)}
                        onChange={() => handleGoalToggle(goal)}
                        className="w-5 h-5 text-red-600 rounded border-slate-500 bg-transparent focus:ring-red-500 focus:ring-offset-black"
                      />
                      <span className="text-sm font-bold">{goal}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Sở thích cá nhân</label>
                <input
                  type="text"
                  placeholder="VD: Đọc sách, Nghe Podcast..."
                  value={formData.interests}
                  onChange={(e) => setFormData({...formData, interests: e.target.value})}
                  className="w-full rounded-xl border-white/10 bg-white/10 p-3.5 text-white focus:ring-2 focus:ring-red-500 border outline-none placeholder-slate-400"
                />
              </div>
            </motion.div>
          )}

          {/* Common Bio */}
          <div>
            <label className="block text-sm font-bold text-black mb-2">Lời giới thiệu (Bio)</label>
            <textarea
              rows={3}
              placeholder="Hi, mình là..."
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className="w-full rounded-xl border-slate-200 bg-slate-50 p-3.5 text-black focus:ring-2 focus:ring-red-100 focus:border-red-600 border outline-none resize-none transition-all"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={saving || !formData.role || !formData.major || !formData.contactLink}
            className="w-full flex justify-center py-4 px-4 rounded-xl shadow-lg shadow-red-600/20 text-lg font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Đang lưu...' : 'Tham Gia Ngay'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
