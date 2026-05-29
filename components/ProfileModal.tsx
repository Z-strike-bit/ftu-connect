"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  currentProfile: any;
  onSuccess: (newProfile: any) => void;
}

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

export default function ProfileModal({ isOpen, onClose, user, currentProfile, onSuccess }: ProfileModalProps) {
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

  // Pre-fill data when modal opens
  useEffect(() => {
    if (isOpen && currentProfile) {
      setFormData({
        role: currentProfile.role || '',
        major: currentProfile.major || '',
        contactLink: currentProfile.contactLink || '',
        bio: currentProfile.bio || '',
        gpa: currentProfile.gpa || '',
        clubs: currentProfile.clubs || '',
        achievements: currentProfile.achievements || '',
        skills: currentProfile.skills || '',
        goals: currentProfile.goals || [],
        interests: currentProfile.interests || ''
      });
      setError(null);
    }
  }, [isOpen, currentProfile]);

  if (!isOpen) return null;

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
    if (!formData.role || !formData.major || !formData.contactLink) {
      setError('Vui lòng điền các trường bắt buộc (*)');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const updatedData = {
        name: currentProfile?.name || user.displayName,
        email: currentProfile?.email || user.email,
        ...formData,
        updatedAt: new Date().toISOString()
      };
      
      // Use setDoc with merge: true to avoid overwriting unrelated fields like createdAt
      await setDoc(doc(db, 'users', user.uid), updatedData, { merge: true });
      
      onSuccess(updatedData);
      onClose();
    } catch (err) {
      console.error(err);
      setError('Đã xảy ra lỗi khi lưu thông tin. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl my-8 overflow-hidden animate-[fadeUp_0.3s_ease-out]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 py-6 px-8 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-extrabold text-white">Cập nhật Hồ sơ</h2>
            <p className="mt-1 text-blue-100 text-sm font-medium">Bổ sung thông tin để tối ưu hóa kết nối</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <div className="max-h-[75vh] overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-8">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-start gap-2">
                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                {error}
              </div>
            )}

            {/* Core Info */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Bạn tham gia với vai trò gì? <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: 'mentor'})}
                    className={`py-4 px-4 rounded-xl border-2 transition-all duration-200 font-semibold text-left flex flex-col gap-1 ${formData.role === 'mentor' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
                  >
                    <span className="text-lg">Mentor (Người hướng dẫn)</span>
                    <span className="text-xs font-medium opacity-80">Năm 2, 3, 4 muốn chia sẻ kinh nghiệm</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: 'mentee'})}
                    className={`py-4 px-4 rounded-xl border-2 transition-all duration-200 font-semibold text-left flex flex-col gap-1 ${formData.role === 'mentee' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
                  >
                    <span className="text-lg">Mentee (Người được hướng dẫn)</span>
                    <span className="text-xs font-medium opacity-80">Tân sinh viên cần định hướng</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Chuyên ngành <span className="text-red-500">*</span></label>
                  <select
                    required
                    value={formData.major}
                    onChange={(e) => setFormData({...formData, major: e.target.value})}
                    className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 border outline-none font-medium"
                  >
                    <option value="">-- Chọn chuyên ngành --</option>
                    {MAJORS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Link liên hệ (Messenger / Zalo) <span className="text-red-500">*</span></label>
                  <input
                    type="url"
                    required
                    placeholder="https://m.me/your.username"
                    value={formData.contactLink}
                    onChange={(e) => setFormData({...formData, contactLink: e.target.value})}
                    className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 border outline-none font-medium placeholder-slate-400"
                  />
                  <p className="text-xs text-slate-500 mt-1">Sẽ chỉ hiển thị khi ai đó 'Kết nối' thành công với bạn.</p>
                </div>
              </div>
            </div>

            {/* Conditional Sections based on Role */}
            {formData.role === 'mentor' && (
              <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 space-y-6 animate-[fadeUp_0.3s_ease-out]">
                <h3 className="text-lg font-bold text-blue-800 border-b border-blue-100 pb-2">Hồ sơ Cố vấn (Mentor Profile)</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">GPA / Thành tích học tập</label>
                    <input
                      type="text"
                      placeholder="VD: 3.8/4.0 hoặc Học bổng xuất sắc"
                      value={formData.gpa}
                      onChange={(e) => setFormData({...formData, gpa: e.target.value})}
                      className="w-full rounded-xl border-slate-200 bg-white p-3 text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 border outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Câu lạc bộ tham gia</label>
                    <input
                      type="text"
                      placeholder="VD: TEC, YRC, MFC..."
                      value={formData.clubs}
                      onChange={(e) => setFormData({...formData, clubs: e.target.value})}
                      className="w-full rounded-xl border-slate-200 bg-white p-3 text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 border outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Kỹ năng mạnh nhất</label>
                  <input
                    type="text"
                    placeholder="VD: Tiếng Anh IELTS 8.0, Excel, Chạy sự kiện..."
                    value={formData.skills}
                    onChange={(e) => setFormData({...formData, skills: e.target.value})}
                    className="w-full rounded-xl border-slate-200 bg-white p-3 text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 border outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Kinh nghiệm / Trải nghiệm nổi bật</label>
                  <textarea
                    rows={3}
                    placeholder="Chia sẻ những điều bạn tự hào nhất trong quãng đời sinh viên..."
                    value={formData.achievements}
                    onChange={(e) => setFormData({...formData, achievements: e.target.value})}
                    className="w-full rounded-xl border-slate-200 bg-white p-3 text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 border outline-none resize-none"
                  />
                </div>
              </div>
            )}

            {formData.role === 'mentee' && (
              <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100 space-y-6 animate-[fadeUp_0.3s_ease-out]">
                <h3 className="text-lg font-bold text-emerald-800 border-b border-emerald-100 pb-2">Hồ sơ Mentee</h3>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">Mục tiêu chính của bạn ở FTU là gì?</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {GOALS.map(goal => (
                      <label key={goal} className="flex items-center space-x-3 p-3 border border-slate-200 rounded-xl bg-white cursor-pointer hover:border-emerald-300 transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.goals.includes(goal)}
                          onChange={() => handleGoalToggle(goal)}
                          className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                        />
                        <span className="text-sm font-medium text-slate-700">{goal}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Sở thích / Mối quan tâm</label>
                  <input
                    type="text"
                    placeholder="VD: Đá bóng, Chụp ảnh, Thích làm truyền thông..."
                    value={formData.interests}
                    onChange={(e) => setFormData({...formData, interests: e.target.value})}
                    className="w-full rounded-xl border-slate-200 bg-white p-3 text-slate-800 focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 border outline-none"
                  />
                </div>
              </div>
            )}

            {/* Common Bio */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Vài lời giới thiệu ngắn về bản thân</label>
              <textarea
                rows={3}
                placeholder="Hi, mình là..."
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="w-full rounded-xl border-slate-200 bg-slate-50 p-3 text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 border outline-none resize-none"
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-4 px-4 border border-slate-300 rounded-xl text-lg font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={saving || !formData.role || !formData.major || !formData.contactLink}
                className="flex-1 flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Đang lưu...' : 'Cập nhật'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
