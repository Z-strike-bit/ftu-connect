"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { auth, googleProvider, db } from '@/lib/firebase';
import { signInWithPopup, signOut, getAdditionalUserInfo } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { FTU_MAJORS } from '@/lib/constants/ftuMajors';

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

export default function Register() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [googleUser, setGoogleUser] = useState<any>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email;
      
      if (email && email.endsWith('@ftu.edu.vn')) {
        const additionalInfo = getAdditionalUserInfo(result);
        
        const docRef = doc(db, 'users', result.user.uid);
        const docSnap = await getDoc(docRef);

        if (additionalInfo?.isNewUser || !docSnap.exists()) {
          setGoogleUser(result.user);
          setStep(2);
        } else {
          router.push('/dashboard');
        }
      } else {
        await signOut(auth);
        setError('Truy cập bị từ chối. Chỉ email trường (@ftu.edu.vn) mới được phép đăng ký.');
      }
    } catch (err: any) {
      console.error(err);
      setError('Lỗi kết nối với Google.');
    }
  };

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => {
      if (prev.goals.includes(goal)) {
        return { ...prev, goals: prev.goals.filter(g => g !== goal) };
      } else {
        return { ...prev, goals: [...prev.goals, goal] };
      }
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!googleUser) return;
    
    if (!formData.role || !formData.major || !formData.specialization || !formData.contactLink) {
      setError('Vui lòng điền các trường bắt buộc (*)');
      return;
    }

    setSaving(true);
    try {
      const randomAvatar = DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];
      await setDoc(doc(db, 'users', googleUser.uid), {
        name: googleUser.displayName,
        email: googleUser.email,
        photoURL: googleUser.photoURL || randomAvatar,
        username: googleUser.email.split('@')[0],
        ...formData,
        points: 0,
        createdAt: new Date().toISOString()
      });

      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError('Có lỗi xảy ra khi lưu thông tin: ' + err.message);
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#090909] p-4 font-sans relative overflow-hidden selection:bg-[#fff0f2] selection:text-[#0099ff]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-br from-[#6a4cf5] to-[#d44df0] rounded-[100%] blur-[120px] opacity-20 pointer-events-none"></div>

      <div className={`w-full bg-[#141414] backdrop-blur-2xl rounded-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-10 text-center border border-[#1a1a1a] relative z-10 transition-all duration-500 ${step === 2 ? 'max-w-2xl' : 'max-w-md'}`}>
        <Image src="/logo_ftu_don_gian.png" alt="FTU Connect" width={200} height={50} className="mx-auto mb-8 h-14 w-auto object-contain drop-shadow-md" style={{ filter: 'brightness(0) invert(1)' }} priority />
        
        <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Đăng ký</h1>
        <p className="text-[#999999] font-medium mb-8 text-[15px]">
          {step === 1 ? 'Xác thực email sinh viên Ngoại Thương' : 'Hoàn thiện hồ sơ để hệ thống ghép cặp phù hợp nhất'}
        </p>
        
        {error && (
          <div className="bg-[#ff385c]/10 text-[#ff385c] p-4 rounded-xl text-sm font-bold border border-[#ff385c]/20 mb-6 text-left">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white border border-transparent text-black font-bold py-[14px] px-6 rounded-[100px] hover:bg-gray-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-300"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6 shrink-0" />
              <span className="text-[16px]">Tiếp tục với Google</span>
            </button>
            <p className="text-[13px] text-[#6a6a6a] mt-2">Bắt buộc sử dụng email trường (@ftu.edu.vn)</p>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleRegister} className="flex flex-col gap-6 text-left max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {/* Vai trò */}
            <div>
              <label className="block text-white text-[15px] font-semibold mb-3">Bạn tham gia với vai trò gì? <span className="text-[#ff385c]">*</span></label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'mentor'})}
                  className={`py-4 px-5 rounded-xl border transition-all duration-300 font-semibold text-left flex flex-col gap-1 ${formData.role === 'mentor' ? 'border-[#ff385c] bg-[#ff385c]/10 text-[#ff385c] shadow-[0_0_15px_rgba(255,56,92,0.2)]' : 'border-[#262626] bg-[#090909] text-white hover:border-[#404040]'}`}
                >
                  <span className="text-lg">Mentor</span>
                  <span className="text-xs font-medium opacity-70 mt-1">Người hướng dẫn (Năm 2,3,4)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'mentee'})}
                  className={`py-4 px-5 rounded-xl border transition-all duration-300 font-semibold text-left flex flex-col gap-1 ${formData.role === 'mentee' ? 'border-[#ff385c] bg-[#ff385c]/10 text-[#ff385c] shadow-[0_0_15px_rgba(255,56,92,0.2)]' : 'border-[#262626] bg-[#090909] text-white hover:border-[#404040]'}`}
                >
                  <span className="text-lg">Mentee</span>
                  <span className="text-xs font-medium opacity-70 mt-1">Người được hướng dẫn (Năm 1)</span>
                </button>
              </div>
            </div>

            {/* Chuyên ngành & Liên hệ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-white text-[15px] font-semibold mb-3">Ngành học <span className="text-[#ff385c]">*</span></label>
                <div className="flex flex-col gap-3">
                  <select
                    required
                    value={formData.major}
                    onChange={(e) => setFormData({...formData, major: e.target.value, specialization: ''})}
                    className="w-full bg-[#090909] border border-[#262626] rounded-xl px-4 py-3 text-white outline-none focus:border-[#6a4cf5] transition-colors"
                  >
                    <option value="">-- Chọn ngành --</option>
                    {FTU_MAJORS.map(m => <option key={m.id} value={m.majorName}>{m.majorName}</option>)}
                  </select>

                  <select
                    required
                    value={formData.specialization}
                    onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                    disabled={!formData.major}
                    className="w-full bg-[#090909] border border-[#262626] rounded-xl px-4 py-3 text-white outline-none focus:border-[#6a4cf5] transition-colors disabled:opacity-50 disabled:bg-[#111]"
                  >
                    <option value="">-- Chọn chuyên ngành --</option>
                    {formData.major && FTU_MAJORS.find(m => m.majorName === formData.major)?.specializations.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-white text-[15px] font-semibold mb-3">Link liên hệ (Mess/Zalo) <span className="text-[#ff385c]">*</span></label>
                <input
                  type="url"
                  required
                  placeholder="https://m.me/your.username"
                  value={formData.contactLink}
                  onChange={(e) => setFormData({...formData, contactLink: e.target.value})}
                  className="w-full bg-[#090909] border border-[#262626] rounded-xl px-4 py-3 text-white outline-none focus:border-[#6a4cf5] transition-colors placeholder-[#666]"
                />
                <p className="text-[12px] text-[#6a6a6a] mt-2 font-medium">Bảo mật: Chỉ hiển thị khi kết nối thành công.</p>
              </div>
            </div>

            {/* Mentor Fields */}
            {formData.role === 'mentor' && (
              <div className="bg-[#0f0f0f] border border-[#262626] rounded-2xl p-6 shadow-inner transition-all duration-300">
                <h3 className="text-[16px] font-bold text-white mb-5 border-b border-[#262626] pb-3">Chi tiết Mentor</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label className="block text-[#ccc] text-sm font-semibold mb-2">GPA / Thành tích</label>
                    <input
                      type="text"
                      placeholder="VD: 3.8/4.0"
                      value={formData.gpa}
                      onChange={(e) => setFormData({...formData, gpa: e.target.value})}
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white outline-none focus:border-[#ff385c] transition-colors placeholder-[#555]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#ccc] text-sm font-semibold mb-2">Câu lạc bộ</label>
                    <input
                      type="text"
                      placeholder="VD: TEC, YRC..."
                      value={formData.clubs}
                      onChange={(e) => setFormData({...formData, clubs: e.target.value})}
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white outline-none focus:border-[#ff385c] transition-colors placeholder-[#555]"
                    />
                  </div>
                </div>
                <div className="mb-5">
                  <label className="block text-[#ccc] text-sm font-semibold mb-2">Kỹ năng mạnh nhất</label>
                  <input
                    type="text"
                    placeholder="VD: IELTS 8.0, Thuyết trình..."
                    value={formData.skills}
                    onChange={(e) => setFormData({...formData, skills: e.target.value})}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white outline-none focus:border-[#ff385c] transition-colors placeholder-[#555]"
                  />
                </div>
                <div>
                  <label className="block text-[#ccc] text-sm font-semibold mb-2">Trải nghiệm nổi bật</label>
                  <textarea
                    rows={2}
                    placeholder="Điều tự hào nhất..."
                    value={formData.achievements}
                    onChange={(e) => setFormData({...formData, achievements: e.target.value})}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white outline-none focus:border-[#ff385c] transition-colors resize-none placeholder-[#555]"
                  />
                </div>
              </div>
            )}

            {/* Mentee Fields */}
            {formData.role === 'mentee' && (
              <div className="bg-[#0f0f0f] border border-[#262626] rounded-2xl p-6 shadow-inner transition-all duration-300">
                <h3 className="text-[16px] font-bold text-white mb-5 border-b border-[#262626] pb-3">Mục tiêu Mentee</h3>
                <div className="mb-5">
                  <label className="block text-[#ccc] text-sm font-semibold mb-3">Bạn muốn đạt được điều gì?</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {GOALS.map(goal => (
                      <label key={goal} className={`flex items-center space-x-3 p-3 border rounded-xl cursor-pointer transition-all ${formData.goals.includes(goal) ? 'border-[#ff385c] bg-[#ff385c]/10 text-[#ff385c]' : 'border-[#333] bg-[#1a1a1a] hover:bg-[#222]'}`}>
                        <input
                          type="checkbox"
                          checked={formData.goals.includes(goal)}
                          onChange={() => handleGoalToggle(goal)}
                          className="w-4 h-4 text-[#ff385c] rounded border-[#555] bg-transparent focus:ring-[#ff385c] focus:ring-offset-[#1a1a1a]"
                        />
                        <span className="text-[13px] font-semibold text-white">{goal}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[#ccc] text-sm font-semibold mb-2">Sở thích cá nhân</label>
                  <input
                    type="text"
                    placeholder="VD: Đọc sách, Nghe Podcast..."
                    value={formData.interests}
                    onChange={(e) => setFormData({...formData, interests: e.target.value})}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white outline-none focus:border-[#ff385c] transition-colors placeholder-[#555]"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={saving || !formData.role || !formData.major || !formData.specialization || !formData.contactLink}
              className="mt-4 w-full flex items-center justify-center gap-3 bg-white border border-transparent text-black font-bold py-[14px] px-6 rounded-[100px] hover:bg-gray-200 transition-all duration-300 disabled:opacity-50"
            >
              {saving ? 'Đang lưu thông tin...' : 'Hoàn tất Đăng ký'}
            </button>
          </form>
        )}
        
        <p className="mt-8 text-[14px] text-[#999999] font-medium px-4">
          Đã có tài khoản? <Link href="/login" className="text-white hover:underline">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
