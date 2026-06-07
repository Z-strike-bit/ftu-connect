"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, collection, getDocs, addDoc, serverTimestamp, updateDoc, arrayUnion } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

// --- Algorithm Logic ---
const calculateMatchScore = (mentee: any, mentor: any) => {
  let score = 0;

  // 1. Trọng số Học thuật (30đ)
  if (mentee.major && mentor.major) {
    if (mentee.specialization === mentor.specialization && mentee.specialization) {
      score += 30;
    } else if (mentee.major === mentor.major) {
      score += 15;
    }
  }

  // 2. Ánh xạ Mục tiêu - Năng lực (40đ)
  const mGoals = mentee.goals || [];
  const mAchievements = (mentor.achievements || '').toLowerCase();
  const mSkills = (mentor.skills || '').toLowerCase();
  const mClubs = (mentor.clubs || '').toLowerCase();
  const mBio = (mentor.bio || '').toLowerCase();
  const combinedMentorText = `${mAchievements} ${mSkills} ${mClubs} ${mBio}`;

  if (mGoals.includes('Tìm việc Part-time / Intern')) {
    if (combinedMentorText.includes('intern') || combinedMentorText.includes('thực tập') || combinedMentorText.includes('đi làm') || combinedMentorText.includes('big4')) {
      score += 15;
    }
  }
  
  if (mGoals.includes('Cải thiện điểm GPA')) {
    const gpaMatch = mentor.gpa?.match(/(\d\.\d)/);
    if (gpaMatch && parseFloat(gpaMatch[1]) >= 3.6) {
      score += 15;
    } else if (parseFloat(mentor.gpa) >= 3.6) {
      score += 15;
    }
  }

  if (mGoals.includes('Tham gia Câu lạc bộ')) {
    if (mentor.clubs && mentor.clubs.trim().length > 0) {
      score += 10;
    }
  }

  if (mGoals.includes('Tìm kiếm Học bổng')) {
    if (combinedMentorText.includes('học bổng') || combinedMentorText.includes('scholarship')) {
      score += 10;
    }
  }

  // 3. Phân tích Sở thích (30đ)
  const menteeInterests = (mentee.interests || '').toLowerCase().split(',').map((s: string) => s.trim()).filter(Boolean);
  let interestMatchCount = 0;
  menteeInterests.forEach((interest: string) => {
    if (interest.length > 2 && combinedMentorText.includes(interest)) {
      interestMatchCount++;
    }
  });
  score += Math.min(30, interestMatchCount * 10);

  return Math.min(99, score); // Max 99%
};

export default function FindMentorPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mentors, setMentors] = useState<any[]>([]);
  
  const [selectedMentor, setSelectedMentor] = useState<any>(null);
  const [introMessage, setIntroMessage] = useState('');
  const [sendingId, setSendingId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const docSnap = await getDoc(doc(db, 'users', user.uid));
        if (docSnap.exists()) {
          const userData = { id: docSnap.id, ...docSnap.data() };
          setProfile(userData);
          fetchMentors(userData);
        } else {
          router.push('/onboarding');
        }
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchMentors = async (menteeData: any) => {
    const usersSnap = await getDocs(collection(db, 'users'));
    let allMentors = usersSnap.docs
      .map(d => ({ id: d.id, ...d.data() as any }))
      .filter(u => u.role === 'mentor' && u.id !== menteeData.id && !(menteeData.friends || []).includes(u.id) && !(menteeData.sentRequests || []).includes(u.id));

    // Calculate match scores
    allMentors = allMentors.map(mentor => ({
      ...mentor,
      matchScore: calculateMatchScore(menteeData, mentor)
    }));

    // Sort by match score descending
    allMentors.sort((a, b) => b.matchScore - a.matchScore);
    
    setMentors(allMentors);
    setLoading(false);
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentor || !currentUser || !profile) return;
    
    setSendingId(selectedMentor.id);
    try {
      // 1. Create a request doc
      await addDoc(collection(db, 'mentor_requests'), {
        fromUserId: currentUser.uid,
        toUserId: selectedMentor.id,
        message: introMessage,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // 2. Update arrays for old UI compatibility
      await updateDoc(doc(db, 'users', currentUser.uid), {
        sentRequests: arrayUnion(selectedMentor.id)
      });
      await updateDoc(doc(db, 'users', selectedMentor.id), {
        pendingRequests: arrayUnion(currentUser.uid)
      });

      // Remove from view
      setMentors(prev => prev.filter(m => m.id !== selectedMentor.id));
      setSelectedMentor(null);
      setIntroMessage('');
      alert("Đã gửi lời mời thành công!");
    } catch (error) {
      console.error("Error sending request:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setSendingId(null);
    }
  };

  const renderedMentors = React.useMemo(() => mentors.map(mentor => (
    <div key={mentor.id} className="bg-[#0a0a14] rounded-[24px] border border-white/10 overflow-hidden relative group hover:-translate-y-2 transition-all duration-300 hover:shadow-[0_15px_40px_rgba(0,229,255,0.15)] flex flex-col">
      {/* Match Badge */}
      <div className="absolute top-4 right-4 z-20">
        <div className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg flex items-center gap-1.5 backdrop-blur-md border ${mentor.matchScore >= 75 ? 'bg-[#ff385c]/20 text-[#ff385c] border-[#ff385c]/50' : 'bg-[#00e5ff]/20 text-[#00e5ff] border-[#00e5ff]/50'}`}>
          {mentor.matchScore >= 75 ? '🔥 Tuyệt Phối' : '✨ Phù hợp'} 
          <span className="bg-white/20 px-1.5 py-0.5 rounded-md ml-1">{mentor.matchScore}%</span>
        </div>
      </div>

      {/* Avatar Cover */}
      <div className="h-32 bg-gradient-to-br from-[#1a1a2e] to-[#0a0a14] relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
        {mentor.matchScore >= 75 && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#ff385c]/20 to-transparent"></div>
        )}
      </div>

      <div className="px-6 pb-6 pt-0 flex-1 flex flex-col relative">
        {/* Avatar */}
        <img 
          src={mentor.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.name}`} 
          className="w-20 h-20 rounded-full border-4 border-[#0a0a14] object-cover -mt-10 relative z-10 bg-[#1a1a2e]"
          alt={mentor.name}
        />
        
        <div className="mt-4 flex-1">
          <h3 className="text-xl font-extrabold text-white truncate">{mentor.name}</h3>
          <p className="text-[#00e5ff] font-bold text-sm truncate mt-1">{mentor.major} {mentor.specialization ? `- ${mentor.specialization}` : ''}</p>
          
          <div className="mt-4 space-y-3">
            {mentor.gpa && (
              <div className="flex items-start gap-2 text-sm">
                <span className="text-gray-500 shrink-0 mt-0.5">🎓</span>
                <span className="text-gray-300 line-clamp-1"><strong className="text-white">GPA/Thành tích:</strong> {mentor.gpa}</span>
              </div>
            )}
            {mentor.clubs && (
              <div className="flex items-start gap-2 text-sm">
                <span className="text-gray-500 shrink-0 mt-0.5">🎪</span>
                <span className="text-gray-300 line-clamp-1"><strong className="text-white">CLB:</strong> {mentor.clubs}</span>
              </div>
            )}
            {mentor.skills && (
              <div className="flex gap-2 flex-wrap mt-3">
                {mentor.skills.split(',').slice(0, 3).map((skill: string, idx: number) => (
                  <span key={idx} className="bg-white/5 border border-white/10 text-[#a0a0b0] text-xs px-2.5 py-1 rounded-lg truncate max-w-[120px]">
                    {skill.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={() => setSelectedMentor(mentor)}
          className="w-full mt-6 py-3 rounded-xl font-bold bg-white/5 hover:bg-[#00e5ff] text-white hover:text-black border border-white/10 hover:border-[#00e5ff] transition-all"
        >
          Nhận Mentor
        </button>
      </div>
    </div>
  )), [mentors]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <p className="text-[#00e5ff] font-bold animate-pulse text-xl tracking-widest uppercase">Đang quét hệ thống Mentor...</p>
      </div>
    );
  }

  if (profile?.role !== 'mentee') {
    return (
      <div className="min-h-screen bg-[#050508] flex flex-col">
        <Navbar profileName={profile?.name} profileId={currentUser?.uid} profilePhoto={profile?.photoURL} onSignOut={() => signOut(auth).then(() => router.push('/'))} />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center bg-white/5 border border-[#ff385c]/30 p-10 rounded-3xl max-w-lg">
            <div className="text-6xl mb-6">🔒</div>
            <h2 className="text-2xl font-bold text-white mb-4">Tính năng dành riêng cho Mentee</h2>
            <p className="text-[#a0a0b0]">Bạn đang đăng nhập với vai trò Mentor. Tính năng này được thiết kế để các Tân sinh viên tìm kiếm bạn.</p>
            <button onClick={() => router.push('/dashboard')} className="mt-8 px-6 py-3 bg-[#ff385c] hover:bg-[#ff385c]/80 text-white font-bold rounded-full transition-colors">Quay lại Bảng tin</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] flex flex-col font-sans selection:bg-[#00e5ff]/30 selection:text-white pb-24 lg:pb-0">
      <Navbar profileName={profile?.name} profileId={currentUser?.uid} profilePhoto={profile?.photoURL} onSignOut={() => signOut(auth).then(() => router.push('/'))} />

      <div className="flex-1 max-w-[1200px] mx-auto w-full p-4 sm:p-6 lg:p-10 relative">
        {/* Header */}
        <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6 relative z-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00e5ff] to-[#d44df0] uppercase tracking-wider mb-2">Tìm Mentor</h1>
            <p className="text-[#a0a0b0] font-medium">Khám phá và kết nối với các anh chị khóa trên phù hợp nhất với định hướng của bạn.</p>
          </div>
        </div>

        {/* Mentor Grid */}
        {mentors.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
            <span className="text-5xl mb-4 block">🏜️</span>
            <h3 className="text-xl font-bold text-white mb-2">Chưa tìm thấy Mentor phù hợp</h3>
            <p className="text-[#8888a0]">Hệ thống đang tiếp tục cập nhật thêm nhiều anh chị Mentor mới. Vui lòng quay lại sau nhé!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {renderedMentors}
          </div>
        )}

        {/* Modal Send Request */}
        <AnimatePresence>
          {selectedMentor && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                transition={{ duration: 0.15 }}
                className="absolute inset-0 bg-black/80"
                onClick={() => setSelectedMentor(null)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.15 }}
                className="bg-[#0f0f1a] border border-white/10 p-6 sm:p-8 rounded-[32px] w-full max-w-md relative z-10 shadow-2xl"
              >
                <button onClick={() => setSelectedMentor(null)} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                
                <div className="flex flex-col items-center text-center mb-6">
                  <img src={selectedMentor.photoURL} className="w-24 h-24 rounded-full border-4 border-[#1a1a2e] mb-4 object-cover" />
                  <h3 className="text-2xl font-bold text-white mb-1">Kết nối với {selectedMentor.name}</h3>
                  <p className="text-[#00e5ff] text-sm font-semibold">{selectedMentor.major}</p>
                </div>

                <form onSubmit={handleSendRequest}>
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-[#a0a0b0] mb-3">Lời chào (Intro Message) <span className="text-[#ff385c]">*</span></label>
                    <textarea 
                      required
                      rows={4}
                      placeholder="VD: Em chào anh/chị, em là sinh viên K64 mới vào trường, em rất ấn tượng với profile của anh/chị và mong được hướng dẫn ạ..."
                      value={introMessage}
                      onChange={(e) => setIntroMessage(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-white text-sm focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff] outline-none resize-none custom-scrollbar placeholder-[#444]"
                    />
                    <p className="text-xs text-gray-500 mt-2">Lời chào chân thành sẽ giúp bạn dễ dàng được Mentor chấp nhận hơn đấy!</p>
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={sendingId === selectedMentor.id || !introMessage.trim()}
                    className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-[#00e5ff] to-[#d44df0] text-black text-lg hover:opacity-90 disabled:opacity-50 transition-all flex justify-center items-center gap-2"
                  >
                    {sendingId === selectedMentor.id ? (
                      <svg className="w-5 h-5 animate-spin text-black" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (
                      'Gửi Yêu Cầu'
                    )}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
