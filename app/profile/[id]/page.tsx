"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useRouter, useParams } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, collection, onSnapshot, query, where, orderBy, updateDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FTU_MAJORS } from '@/lib/constants/ftuMajors';

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const profileId = params.id as string;
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  
  const [targetProfile, setTargetProfile] = useState<any>(null);
  const [targetPosts, setTargetPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    bio: '',
    major: '',
    specialization: '',
    coverPhotoUrl: '',
    photoURL: '',
    contactLink: '',
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

  const isOwnProfile = currentUser && currentUser.uid === profileId;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setCurrentUserProfile(userDoc.data());
        }
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!profileId) return;

    // Fetch Target Profile
    const fetchProfile = async () => {
      const pDoc = await getDoc(doc(db, 'users', profileId));
      if (pDoc.exists()) {
        const data = pDoc.data();
        setTargetProfile(data);
        setEditFormData({
          name: data.name || '',
          bio: data.bio || '',
          major: data.major || '',
          specialization: data.specialization || '',
          coverPhotoUrl: data.coverPhotoUrl || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
          photoURL: data.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`,
          contactLink: data.contactLink || '',
          gpa: data.gpa || '',
          clubs: data.clubs || '',
          achievements: data.achievements || '',
          skills: data.skills || '',
          goals: data.goals || [],
          interests: data.interests || ''
        });
      } else {
        // User not found
      }
      setLoading(false);
    };

    fetchProfile();

    // Fetch Target Posts
    const q = query(collection(db, 'posts'), where('uid', '==', profileId));
    const unsubPosts = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sắp xếp posts ở client vì Firebase cần composite index nếu sort và where cùng lúc trên nhiều trường
      postsData.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setTargetPosts(postsData);
    });

    return () => unsubPosts();
  }, [profileId]);

  const handleSaveProfile = async () => {
    if (!isOwnProfile) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        ...editFormData
      });
      setTargetProfile(prev => ({
        ...prev,
        ...editFormData
      }));
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert('Không thể cập nhật hồ sơ');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] font-sans">
        <Navbar profileName="" onSignOut={() => {}} />
        <div className="text-center py-20 text-slate-500 font-bold">Đang tải trang cá nhân...</div>
      </div>
    );
  }

  if (!targetProfile) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] font-sans">
        <Navbar profileName={currentUserProfile?.name} onSignOut={() => signOut(auth).then(() => router.push('/'))} profileId={currentUser?.uid} />
        <div className="text-center py-20 text-slate-500 font-bold">Người dùng không tồn tại.</div>
      </div>
    );
  }

  const coverPhoto = targetProfile.coverPhotoUrl || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80';
  const avatarPhoto = targetProfile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetProfile.name}`;

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans pb-10">
      <Navbar profileName={currentUserProfile?.name} onSignOut={() => signOut(auth).then(() => router.push('/'))} profileId={currentUser?.uid} />

      {/* HEADER: Cover + Avatar + Info */}
      <div className="bg-white shadow-sm mb-4">
        <div className="max-w-[1095px] mx-auto">
          {/* Cover Photo */}
          <div className="relative w-full h-[350px] sm:h-[400px] bg-slate-200 rounded-b-xl overflow-hidden group">
            <img src={coverPhoto} alt="Cover" className="w-full h-full object-cover" />
            {isOwnProfile && (
              <button onClick={() => setIsEditing(true)} className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-black font-semibold py-2 px-3 rounded-lg flex items-center gap-2 transition-colors text-sm shadow-sm opacity-90 group-hover:opacity-100">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h3l2-2h6l2 2h3c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm8 3c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z"/></svg>
                Chỉnh sửa ảnh bìa
              </button>
            )}
          </div>

          {/* User Info Bar */}
          <div className="px-4 sm:px-8 pb-4 relative">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-end -mt-10 sm:-mt-16 mb-4 relative z-10">
              {/* Avatar */}
              <div className="relative group shrink-0">
                <div className="w-[168px] h-[168px] rounded-full ring-4 ring-white bg-white overflow-hidden shadow-sm">
                  <img src={avatarPhoto} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                {isOwnProfile && (
                  <button onClick={() => setIsEditing(true)} className="absolute bottom-2 right-2 bg-slate-200 hover:bg-slate-300 w-9 h-9 rounded-full flex items-center justify-center transition-colors border-2 border-white text-black opacity-90 group-hover:opacity-100">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h3l2-2h6l2 2h3c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm8 3c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z"/></svg>
                  </button>
                )}
              </div>

              {/* Name and Basic Stats */}
              <div className="flex-1 text-center sm:text-left mb-2 sm:mb-4 mt-6 sm:mt-10">
                <h1 className="text-[32px] font-bold text-black leading-tight flex items-center justify-center sm:justify-start gap-2">
                  {targetProfile.name}
                  {targetProfile.points >= 200 && <span className="text-xl" title="Top Mentor">👑</span>}
                </h1>
                <p className="text-[15px] font-semibold text-slate-500 mt-1">
                  {targetProfile.points || 0} điểm tín nhiệm · {targetProfile.role === 'mentor' ? 'Mentor' : 'Mentee'}
                </p>
                {/* Facepile mock */}
                <div className="flex items-center justify-center sm:justify-start mt-2">
                  <div className="flex -space-x-1.5">
                    {[1,2,3,4].map(i => (
                      <img key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=friend${i}`} alt="Friend"/>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 sm:mb-4 w-full sm:w-auto px-4 sm:px-0 mt-4 sm:mt-10">
                {isOwnProfile ? (
                  <>
                    <button onClick={() => setIsEditing(true)} className="flex-1 sm:flex-none bg-slate-200 hover:bg-slate-300 text-black font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors text-[15px]">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                      Chỉnh sửa trang cá nhân
                    </button>
                  </>
                ) : (
                  <>
                    <button className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-[15px]">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                      Kết nối
                    </button>
                    <button className="flex-1 sm:flex-none bg-slate-200 hover:bg-slate-300 text-black font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-[15px]">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
                      Nhắn tin
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="border-t border-slate-300 mt-2"></div>

            {/* Nav Tabs */}
            <div className="flex mt-1">
              <button className="px-4 py-4 text-[15px] font-semibold text-red-600 border-b-[3px] border-red-600">Bài viết</button>
              <button className="px-4 py-4 text-[15px] font-semibold text-slate-500 hover:bg-slate-100 rounded-md my-1 transition-colors">Giới thiệu</button>
              <button className="px-4 py-4 text-[15px] font-semibold text-slate-500 hover:bg-slate-100 rounded-md my-1 transition-colors">Bạn bè</button>
              <button className="px-4 py-4 text-[15px] font-semibold text-slate-500 hover:bg-slate-100 rounded-md my-1 transition-colors">Ảnh</button>
            </div>
          </div>
        </div>
      </div>

      {/* BODY: Intro (Left) & Posts (Right) */}
      <div className="max-w-[1095px] mx-auto px-4 sm:px-8">
        <div className="flex flex-col lg:flex-row gap-4">
          
          {/* Cột Trái: Giới thiệu */}
          <div className="w-full lg:w-[400px] shrink-0 space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <h2 className="text-[20px] font-bold text-black mb-4">Giới thiệu</h2>
              
              <div className="text-center mb-4">
                <p className="text-[15px] text-slate-900">{targetProfile.bio || 'Chưa có tiểu sử.'}</p>
                {isOwnProfile && (
                  <button onClick={() => setIsEditing(true)} className="w-full mt-3 bg-slate-100 hover:bg-slate-200 text-black font-semibold py-1.5 rounded-lg text-[15px] transition-colors">
                    Chỉnh sửa tiểu sử
                  </button>
                )}
              </div>
              
              <div className="space-y-4 text-[15px] text-slate-900">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/></svg>
                  <span>Chuyên ngành <span className="font-semibold">{targetProfile.major || 'Chưa cập nhật'}{targetProfile.specialization ? ` - ${targetProfile.specialization}` : ''}</span></span>
                </div>

                {targetProfile.contactLink && (
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>
                    <span>Liên hệ: <a href={targetProfile.contactLink} target="_blank" rel="noreferrer" className="text-red-600 font-semibold hover:underline">Xem Link</a></span>
                  </div>
                )}

                {targetProfile.role === 'mentor' && (
                  <>
                    {targetProfile.gpa && (
                      <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
                        <span>GPA/Thành tích: <span className="font-semibold">{targetProfile.gpa}</span></span>
                      </div>
                    )}
                    {targetProfile.clubs && (
                      <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                        <span>Câu lạc bộ: <span className="font-semibold">{targetProfile.clubs}</span></span>
                      </div>
                    )}
                    {targetProfile.skills && (
                      <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                        <span>Kỹ năng: <span className="font-semibold">{targetProfile.skills}</span></span>
                      </div>
                    )}
                  </>
                )}

                {targetProfile.role === 'mentee' && (
                  <>
                    {targetProfile.goals && targetProfile.goals.length > 0 && (
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-slate-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                        <div className="flex flex-col">
                          <span>Mục tiêu:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {targetProfile.goals.map((goal: string) => (
                              <span key={goal} className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-sm font-semibold">{goal}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {targetProfile.interests && (
                      <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                        <span>Sở thích: <span className="font-semibold">{targetProfile.interests}</span></span>
                      </div>
                    )}
                  </>
                )}

                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L12 15.45 7.77 18l1.12-4.81-3.73-3.23 4.92-.42L12 5l1.92 4.53 4.92.42-3.73 3.23L16.23 18z"/></svg>
                  <span>Điểm tín nhiệm: <span className="font-semibold">{targetProfile.points || 0}</span></span>
                </div>
              </div>

              {isOwnProfile && (
                <button onClick={() => setIsEditing(true)} className="w-full mt-4 bg-slate-100 hover:bg-slate-200 text-black font-semibold py-1.5 rounded-lg text-[15px] transition-colors">
                  Chỉnh sửa chi tiết
                </button>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-[20px] font-bold text-black hover:underline cursor-pointer">Ảnh</h2>
                </div>
                <span className="text-[15px] text-red-600 hover:bg-red-50 p-1.5 rounded cursor-pointer transition">Xem tất cả ảnh</span>
              </div>
              <div className="grid grid-cols-3 gap-1 rounded-lg overflow-hidden">
                <img src={avatarPhoto} className="aspect-square object-cover hover:opacity-90 cursor-pointer" />
                <img src={coverPhoto} className="aspect-square object-cover hover:opacity-90 cursor-pointer" />
                <div className="aspect-square bg-slate-100"></div>
              </div>
            </div>
          </div>

          {/* Cột Phải: Dòng thời gian (Posts) */}
          <div className="flex-1 space-y-4">
            
            {/* Hộp đăng bài (chỉ hiện nếu là tường nhà mình) */}
            {isOwnProfile && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="flex gap-3 border-b border-slate-100 pb-3">
                  <img src={avatarPhoto} alt="Avatar" className="w-10 h-10 rounded-full bg-slate-200 shrink-0 cursor-pointer"/>
                  <div className="flex-1 bg-[#f0f2f5] hover:bg-[#e4e6eb] transition-colors rounded-full px-4 flex items-center cursor-text">
                    <Link href="/dashboard" className="w-full text-[17px] text-slate-500 font-normal py-2 text-left block">
                      Bạn đang nghĩ gì thế?
                    </Link>
                  </div>
                </div>
                <div className="flex pt-3">
                  <button className="flex-1 flex items-center justify-center gap-2 hover:bg-slate-100 py-2 rounded-lg transition text-[15px] font-semibold text-slate-500">
                    <span className="text-xl">📸</span> Ảnh/Video
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 hover:bg-slate-100 py-2 rounded-lg transition text-[15px] font-semibold text-slate-500">
                    <span className="text-xl">😃</span> Cảm xúc/Hoạt động
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex justify-between items-center">
              <h2 className="text-[20px] font-bold text-black">Bài viết</h2>
              <button className="bg-slate-100 hover:bg-slate-200 text-black font-semibold py-1.5 px-3 rounded-lg text-[15px] flex items-center gap-1 transition">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z"/></svg>
                Bộ lọc
              </button>
            </div>

            {/* List Posts */}
            <div className="space-y-4">
              <AnimatePresence>
                {targetPosts.map(post => (
                  <motion.div key={post.id} layout className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 flex items-start justify-between">
                      <div className="flex space-x-3 items-center">
                        <img src={post.isAnonymous ? "https://api.dicebear.com/7.x/avataaars/svg?seed=anonymous" : avatarPhoto} alt="Avatar" className="h-10 w-10 rounded-full bg-slate-200 border border-slate-300"/>
                        <div>
                          <p className="text-[15px] font-semibold text-slate-900 cursor-pointer hover:underline">
                            {post.isAnonymous ? 'Sinh viên ẩn danh' : post.authorName}
                          </p>
                          <div className="flex items-center text-[13px] text-slate-500 gap-1">
                            <span className="hover:underline cursor-pointer">{new Date(post.createdAt).toLocaleString('vi-VN')}</span>
                            <span>·</span>
                            <span>{post.tag}</span>
                            <svg className="w-3.5 h-3.5 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="px-4 pb-2 text-[15px] text-slate-900 whitespace-pre-wrap leading-[1.3333]">
                      {post.content}
                    </div>
                    
                    <div className="px-4 py-2 flex items-center justify-between text-[13px] text-slate-500 border-b border-slate-200">
                      <div className="flex items-center gap-1.5 cursor-pointer hover:underline">
                        <div className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                        </div>
                        <span>{post.likes || 0}</span>
                      </div>
                      <div className="flex gap-3">
                        <span className="cursor-pointer hover:underline">{post.comments?.length || 0} bình luận</span>
                      </div>
                    </div>

                    <div className="px-4 py-1 flex items-center justify-between gap-1">
                      <button className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md hover:bg-slate-100 transition-colors font-semibold text-[15px] text-slate-600">
                        <svg className="w-5 h-5 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                        Thích
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md hover:bg-slate-100 transition-colors font-semibold text-[15px] text-slate-600">
                        <svg className="w-5 h-5 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        Bình luận
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {targetPosts.length === 0 && (
                <div className="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <p className="text-slate-500 font-semibold text-[17px]">Không có bài viết nào để hiển thị.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* MODAL CHỈNH SỬA THÔNG TIN */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
                <h2 className="text-xl font-bold text-black">Chỉnh sửa trang cá nhân</h2>
                <button onClick={() => setIsEditing(false)} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
                <div>
                  <label className="block text-[17px] font-bold text-black mb-2">Tên hiển thị</label>
                  <input type="text" value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-600 transition" placeholder="Nhập tên của bạn..." />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[17px] font-bold text-black">Ảnh đại diện (Avatar URL)</label>
                  </div>
                  <input type="text" value={editFormData.photoURL} onChange={(e) => setEditFormData({...editFormData, photoURL: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-600 transition" placeholder="Nhập Link Ảnh URL..." />
                  <div className="mt-3 flex justify-center">
                    <img src={editFormData.photoURL || avatarPhoto} className="w-24 h-24 rounded-full border border-slate-200 object-cover" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[17px] font-bold text-black">Ảnh bìa (Cover URL)</label>
                  </div>
                  <input type="text" value={editFormData.coverPhotoUrl} onChange={(e) => setEditFormData({...editFormData, coverPhotoUrl: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-600 transition" placeholder="Nhập Link Ảnh URL..." />
                  <div className="mt-3">
                    <img src={editFormData.coverPhotoUrl || coverPhoto} className="w-full h-32 rounded-lg border border-slate-200 object-cover" />
                  </div>
                </div>

                <div>
                  <label className="block text-[17px] font-bold text-black mb-2">Tiểu sử</label>
                  <textarea rows={3} value={editFormData.bio} onChange={(e) => setEditFormData({...editFormData, bio: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-600 transition resize-none" placeholder="Mô tả bản thân..." />
                </div>

                <div>
                  <label className="block text-[17px] font-bold text-black mb-2">Link liên hệ (Mess/Zalo)</label>
                  <input type="text" value={editFormData.contactLink} onChange={(e) => setEditFormData({...editFormData, contactLink: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-600 transition" placeholder="Ví dụ: https://m.me/your.username" />
                </div>

                <div>
                  <label className="block text-[17px] font-bold text-black mb-2">Chuyên ngành học</label>
                  <div className="flex flex-col gap-3">
                    <select 
                      value={editFormData.major} 
                      onChange={(e) => setEditFormData({...editFormData, major: e.target.value, specialization: ''})} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-600 transition"
                    >
                      <option value="">-- Chọn ngành --</option>
                      {FTU_MAJORS.map(m => (
                        <option key={m.id} value={m.majorName}>{m.majorName}</option>
                      ))}
                    </select>

                    <select 
                      value={editFormData.specialization} 
                      onChange={(e) => setEditFormData({...editFormData, specialization: e.target.value})} 
                      disabled={!editFormData.major}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">-- Chọn chuyên ngành --</option>
                      {editFormData.major && FTU_MAJORS.find(m => m.majorName === editFormData.major)?.specializations.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {targetProfile.role === 'mentor' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[17px] font-bold text-black mb-2">GPA / Thành tích</label>
                        <input type="text" value={editFormData.gpa} onChange={(e) => setEditFormData({...editFormData, gpa: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-600 transition" placeholder="Ví dụ: 3.8/4.0" />
                      </div>
                      <div>
                        <label className="block text-[17px] font-bold text-black mb-2">Câu lạc bộ</label>
                        <input type="text" value={editFormData.clubs} onChange={(e) => setEditFormData({...editFormData, clubs: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-600 transition" placeholder="Ví dụ: TEC, YRC" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[17px] font-bold text-black mb-2">Kỹ năng mạnh nhất</label>
                      <input type="text" value={editFormData.skills} onChange={(e) => setEditFormData({...editFormData, skills: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-600 transition" placeholder="Ví dụ: IELTS 8.0, Thuyết trình" />
                    </div>
                    <div>
                      <label className="block text-[17px] font-bold text-black mb-2">Trải nghiệm nổi bật</label>
                      <textarea rows={2} value={editFormData.achievements} onChange={(e) => setEditFormData({...editFormData, achievements: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-600 transition resize-none" placeholder="Điểm tự hào nhất..." />
                    </div>
                  </>
                )}

                {targetProfile.role === 'mentee' && (
                  <>
                    <div>
                      <label className="block text-[17px] font-bold text-black mb-2">Mục tiêu học tập</label>
                      <div className="grid grid-cols-2 gap-2">
                        {GOALS.map(goal => (
                          <label key={goal} className={`flex items-center space-x-2 p-2 border rounded-lg cursor-pointer transition-all ${editFormData.goals.includes(goal) ? 'border-red-500 bg-red-50 text-red-600' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}>
                            <input
                              type="checkbox"
                              checked={editFormData.goals.includes(goal)}
                              onChange={() => {
                                const newGoals = editFormData.goals.includes(goal)
                                  ? editFormData.goals.filter(g => g !== goal)
                                  : [...editFormData.goals, goal];
                                setEditFormData({...editFormData, goals: newGoals});
                              }}
                              className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                            />
                            <span className="text-[13px] font-semibold">{goal}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[17px] font-bold text-black mb-2">Sở thích cá nhân</label>
                      <input type="text" value={editFormData.interests} onChange={(e) => setEditFormData({...editFormData, interests: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-600 transition" placeholder="VD: Đọc sách, Nghe Podcast..." />
                    </div>
                  </>
                )}
              </div>

              <div className="p-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                <button onClick={() => setIsEditing(false)} className="px-5 py-2.5 rounded-lg font-bold text-red-600 hover:bg-red-50 transition">Hủy</button>
                <button onClick={handleSaveProfile} disabled={saving} className="px-8 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition disabled:opacity-50">
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
