"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useRouter, useParams } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc, collection, onSnapshot, query, where, updateDoc } from 'firebase/firestore';
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

  const [connectionStatus, setConnectionStatus] = useState<'none' | 'pending_sent' | 'pending_received' | 'accepted'>('none');
  const [connectionLoading, setConnectionLoading] = useState(false);

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

  // Handle Connections
  useEffect(() => {
    if (!currentUser || !profileId || currentUser.uid === profileId) return;

    const connId = [currentUser.uid, profileId].sort().join('_');
    const connRef = doc(db, 'connections', connId);
    
    const unsubConn = onSnapshot(connRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.status === 'accepted') {
          setConnectionStatus('accepted');
        } else if (data.status === 'pending') {
          if (data.requesterId === currentUser.uid) {
            setConnectionStatus('pending_sent');
          } else {
            setConnectionStatus('pending_received');
          }
        }
      } else {
        setConnectionStatus('none');
      }
    });

    return () => unsubConn();
  }, [currentUser, profileId]);

  const handleConnectAction = async () => {
    if (!currentUser || !profileId || connectionLoading) return;
    setConnectionLoading(true);
    try {
      const connId = [currentUser.uid, profileId].sort().join('_');
      const connRef = doc(db, 'connections', connId);

      if (connectionStatus === 'none') {
        await setDoc(connRef, {
          requesterId: currentUser.uid,
          receiverId: profileId,
          status: 'pending',
          createdAt: new Date().toISOString()
        });
      } else if (connectionStatus === 'pending_sent') {
        // Hủy yêu cầu
        await deleteDoc(connRef);
      } else if (connectionStatus === 'pending_received') {
        // Chấp nhận
        await updateDoc(connRef, {
          status: 'accepted',
          updatedAt: new Date().toISOString()
        });
      } else if (connectionStatus === 'accepted') {
        // Hủy kết bạn
        if (confirm('Bạn có chắc muốn hủy kết bạn?')) {
          await deleteDoc(connRef);
        }
      }
    } catch (error) {
      console.error("Lỗi khi kết nối:", error);
      alert("Đã xảy ra lỗi, vui lòng thử lại.");
    } finally {
      setConnectionLoading(false);
    }
  };

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
      <div className="min-h-screen bg-[#090909] font-sans">
        <Navbar profileName="" onSignOut={() => {}} />
        <div className="text-center py-20 text-[#999999] font-semibold">Đang tải trang cá nhân...</div>
      </div>
    );
  }

  if (!targetProfile) {
    return (
      <div className="min-h-screen bg-[#090909] font-sans">
        <Navbar profileName={currentUserProfile?.name} onSignOut={() => signOut(auth).then(() => router.push('/'))} profileId={currentUser?.uid} profilePhoto={currentUserProfile?.photoURL} />
        <div className="text-center py-20 text-[#999999] font-semibold">Người dùng không tồn tại.</div>
      </div>
    );
  }

  const coverPhoto = targetProfile.coverPhotoUrl || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80';
  const avatarPhoto = targetProfile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetProfile.name}`;

  return (
    <div className="min-h-screen bg-[#090909] font-sans pb-10 selection:bg-[#fff0f2] selection:text-[#0099ff]">
      <Navbar profileName={currentUserProfile?.name} onSignOut={() => signOut(auth).then(() => router.push('/'))} profileId={currentUser?.uid} profilePhoto={currentUserProfile?.photoURL} />

      {/* HEADER: Cover + Avatar + Info */}
      <div className="bg-[#141414] shadow-[0_1px_2px_rgba(0,0,0,0.04)] border-b border-[#1a1a1a] mb-6">
        <div className="max-w-[1095px] mx-auto">
          {/* Cover Photo */}
          <div className="relative w-full h-[350px] sm:h-[400px] bg-[#1c1c1c] rounded-b-[14px] overflow-hidden group">
            <img src={coverPhoto} alt="Cover" className="w-full h-full object-cover" />
            {isOwnProfile && (
              <button onClick={() => setIsEditing(true)} className="absolute bottom-4 right-4 bg-[#141414]/90 hover:bg-[#141414] text-white font-semibold py-2 px-3 rounded-lg flex items-center gap-2 transition-colors text-sm shadow-sm opacity-90 group-hover:opacity-100">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h3l2-2h6l2 2h3c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm8 3c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z"/></svg>
                Chỉnh sửa ảnh bìa
              </button>
            )}
          </div>

          {/* User Info Bar */}
          <div className="px-4 sm:px-8 pb-4 relative">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-end mb-4 relative z-10">
              {/* Avatar */}
              <div className="relative group shrink-0 -mt-16 sm:-mt-20">
                <div className="w-[168px] h-[168px] rounded-full ring-4 ring-white bg-[#141414] overflow-hidden shadow-sm">
                  <img src={avatarPhoto} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                {isOwnProfile && (
                  <button onClick={() => setIsEditing(true)} className="absolute bottom-2 right-2 bg-[#090909] hover:bg-[#1c1c1c] w-9 h-9 rounded-full flex items-center justify-center transition-colors border-2 border-white text-white opacity-90 group-hover:opacity-100">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4h3l2-2h6l2 2h3c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm8 3c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z"/></svg>
                  </button>
                )}
              </div>

              {/* Name and Basic Stats */}
              <div className="flex-1 text-center sm:text-left mb-2 sm:mb-4 pb-2 sm:pb-0">
                <h1 className="text-[32px] font-bold text-white leading-tight flex items-center justify-center sm:justify-start gap-2">
                  {targetProfile.name}
                  {targetProfile.points >= 200 && <span className="text-xl" title="Top Mentor">👑</span>}
                </h1>
                <p className="text-[15px] font-semibold text-[#999999] mt-1">
                  {targetProfile.points || 0} điểm tín nhiệm · {targetProfile.role === 'mentor' ? 'Mentor' : 'Mentee'}
                </p>
                {/* Facepile mock */}
                <div className="flex items-center justify-center sm:justify-start mt-2">
                  <div className="flex -space-x-1.5">
                    {[1,2,3,4].map(i => (
                      <img key={i} className="w-8 h-8 rounded-full border-2 border-white bg-[#1c1c1c]" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=friend${i}`} alt="Friend"/>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 sm:mb-4 w-full sm:w-auto px-4 sm:px-0">
                {isOwnProfile ? (
                  <>
                    <button onClick={() => setIsEditing(true)} className="flex-1 sm:flex-none bg-[#090909] hover:bg-[#1c1c1c] text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-[15px] border border-[#262626]">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                      Chỉnh sửa hồ sơ
                    </button>
                  </>
                ) : (
                  <>
                    {connectionStatus === 'none' && (
                      <button onClick={handleConnectAction} disabled={connectionLoading} className="flex-1 sm:flex-none bg-white hover:bg-gray-200 text-black font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-[15px] disabled:opacity-50">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                        Kết nối
                      </button>
                    )}
                    {connectionStatus === 'pending_sent' && (
                      <button onClick={handleConnectAction} disabled={connectionLoading} className="flex-1 sm:flex-none bg-[#090909] hover:bg-[#1c1c1c] text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-[15px] border border-[#262626] disabled:opacity-50">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4 11H8v-2h8v2z"/></svg>
                        Hủy lời mời
                      </button>
                    )}
                    {connectionStatus === 'pending_received' && (
                      <button onClick={handleConnectAction} disabled={connectionLoading} className="flex-1 sm:flex-none bg-[#222222] hover:bg-black text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-[15px] disabled:opacity-50">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                        Chấp nhận
                      </button>
                    )}
                    {connectionStatus === 'accepted' && (
                      <button onClick={handleConnectAction} disabled={connectionLoading} className="flex-1 sm:flex-none bg-[#090909] hover:bg-[#1c1c1c] text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-[15px] border border-[#262626] disabled:opacity-50">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                        Bạn bè
                      </button>
                    )}

                    <button onClick={() => window.dispatchEvent(new CustomEvent('openChat', { detail: profileId }))} className="flex-1 sm:flex-none bg-[#090909] hover:bg-[#1c1c1c] text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-[15px] border border-[#262626]">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
                      Nhắn tin
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="border-t border-[#1a1a1a] mt-2"></div>

            {/* Nav Tabs */}
            <div className="flex mt-1">
              <button className="px-4 py-4 text-[15px] font-semibold text-white border-b-[3px] border-[#222222]">Bài viết</button>
              <button className="px-4 py-4 text-[15px] font-semibold text-[#999999] hover:bg-[#090909] rounded-md my-1 transition-colors">Giới thiệu</button>
              <button className="px-4 py-4 text-[15px] font-semibold text-[#999999] hover:bg-[#090909] rounded-md my-1 transition-colors">Bạn bè</button>
              <button className="px-4 py-4 text-[15px] font-semibold text-[#999999] hover:bg-[#090909] rounded-md my-1 transition-colors">Ảnh</button>
            </div>
          </div>
        </div>
      </div>

      {/* BODY: Intro (Left) & Posts (Right) */}
      <div className="max-w-[1095px] mx-auto px-4 sm:px-8">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Cột Trái: Giới thiệu */}
          <div className="w-full lg:w-[400px] shrink-0 space-y-6">
            <div className="bg-[#141414] rounded-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] border border-[#1a1a1a] p-5">
              <h2 className="text-[20px] font-bold text-white mb-4">Giới thiệu</h2>
              
              <div className="text-center mb-5 border-b border-[#1a1a1a] pb-5">
                <p className="text-[15px] text-white">{targetProfile.bio || 'Chưa có tiểu sử.'}</p>
                {isOwnProfile && (
                  <button onClick={() => setIsEditing(true)} className="w-full mt-3 bg-[#090909] hover:bg-[#1c1c1c] text-white font-semibold py-2 rounded-lg text-[15px] transition-colors border border-transparent hover:border-[#262626]">
                    Chỉnh sửa tiểu sử
                  </button>
                )}
              </div>
              
              <div className="space-y-4 text-[15px] text-white">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#999999] shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/></svg>
                  <span>Chuyên ngành <span className="font-semibold">{targetProfile.major || 'Chưa cập nhật'}{targetProfile.specialization ? ` - ${targetProfile.specialization}` : ''}</span></span>
                </div>

                {targetProfile.contactLink && (
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-[#999999] shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>
                    <span>Liên hệ: <a href={targetProfile.contactLink} target="_blank" rel="noreferrer" className="text-[#0099ff] font-semibold hover:underline">Xem Link</a></span>
                  </div>
                )}

                {targetProfile.role === 'mentor' && (
                  <>
                    {targetProfile.gpa && (
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-[#999999] shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
                        <span>GPA / Thành tích: <span className="font-semibold">{targetProfile.gpa}</span></span>
                      </div>
                    )}
                    {targetProfile.clubs && (
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-[#999999] shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                        <span>Câu lạc bộ: <span className="font-semibold">{targetProfile.clubs}</span></span>
                      </div>
                    )}
                    {targetProfile.skills && (
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-[#999999] shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                        <span>Kỹ năng: <span className="font-semibold">{targetProfile.skills}</span></span>
                      </div>
                    )}
                  </>
                )}

                {targetProfile.role === 'mentee' && (
                  <>
                    {targetProfile.goals && targetProfile.goals.length > 0 && (
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-[#999999] shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                        <div className="flex flex-col">
                          <span>Mục tiêu:</span>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {targetProfile.goals.map((goal: string) => (
                              <span key={goal} className="bg-[#fff0f2] text-[#0099ff] px-2.5 py-1 rounded-md text-[13px] font-semibold border border-[#ff385c]/20">{goal}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    {targetProfile.interests && (
                      <div className="flex items-start gap-3">
                        <svg className="w-6 h-6 text-[#999999] shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                        <span>Sở thích: <span className="font-semibold">{targetProfile.interests}</span></span>
                      </div>
                    )}
                  </>
                )}

                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-[#999999] shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L12 15.45 7.77 18l1.12-4.81-3.73-3.23 4.92-.42L12 5l1.92 4.53 4.92.42-3.73 3.23L16.23 18z"/></svg>
                  <span>Điểm tín nhiệm: <span className="font-semibold text-[#0099ff]">{targetProfile.points || 0}</span></span>
                </div>
              </div>

              {isOwnProfile && (
                <button onClick={() => setIsEditing(true)} className="w-full mt-6 bg-[#090909] hover:bg-[#1c1c1c] text-white font-semibold py-2 rounded-lg text-[15px] transition-colors border border-transparent hover:border-[#262626]">
                  Chỉnh sửa chi tiết
                </button>
              )}
            </div>

            <div className="bg-[#141414] rounded-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] border border-[#1a1a1a] p-5">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-[20px] font-bold text-white hover:underline cursor-pointer">Ảnh</h2>
                </div>
                <span className="text-[15px] text-[#0099ff] hover:bg-[#fff0f2] p-1.5 rounded cursor-pointer transition font-semibold">Xem tất cả ảnh</span>
              </div>
              <div className="grid grid-cols-3 gap-2 rounded-xl overflow-hidden">
                <img src={avatarPhoto} className="aspect-square object-cover hover:opacity-90 cursor-pointer rounded-lg" />
                <img src={coverPhoto} className="aspect-square object-cover hover:opacity-90 cursor-pointer rounded-lg" />
                <div className="aspect-square bg-[#090909] rounded-lg"></div>
              </div>
            </div>
          </div>

          {/* Cột Phải: Dòng thời gian (Posts) */}
          <div className="flex-1 space-y-6">
            
            {/* Hộp đăng bài */}
            {isOwnProfile && (
              <div className="bg-[#141414] rounded-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] border border-[#1a1a1a] p-5">
                <div className="flex gap-4 border-b border-[#1a1a1a] pb-4">
                  <img src={avatarPhoto} alt="Avatar" className="w-12 h-12 rounded-full bg-[#1c1c1c] shrink-0 cursor-pointer"/>
                  <div className="flex-1 bg-[#090909] hover:bg-[#1c1c1c] transition-colors rounded-full px-5 flex items-center cursor-text border border-transparent hover:border-[#262626]">
                    <Link href="/dashboard" className="w-full text-[16px] text-[#999999] font-medium py-3 text-left block">
                      Bạn đang nghĩ gì thế?
                    </Link>
                  </div>
                </div>
                <div className="flex pt-4">
                  <button className="flex-1 flex items-center justify-center gap-2 hover:bg-[#090909] py-2.5 rounded-lg transition text-[15px] font-semibold text-[#999999]">
                    <span className="text-xl">📸</span> Ảnh/Video
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 hover:bg-[#090909] py-2.5 rounded-lg transition text-[15px] font-semibold text-[#999999]">
                    <span className="text-xl">😃</span> Cảm xúc
                  </button>
                </div>
              </div>
            )}

            <div className="bg-[#141414] rounded-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] border border-[#1a1a1a] p-5 flex justify-between items-center">
              <h2 className="text-[20px] font-bold text-white">Bài viết</h2>
              <button className="bg-[#090909] hover:bg-[#1c1c1c] text-white font-semibold py-2 px-4 rounded-lg text-[15px] flex items-center gap-2 transition border border-transparent hover:border-[#262626]">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z"/></svg>
                Bộ lọc
              </button>
            </div>

            {/* List Posts */}
            <div className="space-y-6">
              <AnimatePresence>
                {targetPosts.map(post => (
                  <motion.div key={post.id} layout className="bg-[#141414] rounded-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] border border-[#1a1a1a] overflow-hidden">
                    <div className="p-5 flex items-start justify-between">
                      <div className="flex space-x-3 items-center">
                        <img src={post.isAnonymous ? "https://api.dicebear.com/7.x/avataaars/svg?seed=anonymous" : avatarPhoto} alt="Avatar" className="h-11 w-11 rounded-full bg-[#1c1c1c] border border-[#262626]"/>
                        <div>
                          <p className="text-[16px] font-bold text-white cursor-pointer hover:underline">
                            {post.isAnonymous ? 'Sinh viên ẩn danh' : post.authorName}
                          </p>
                          <div className="flex items-center text-[13px] text-[#999999] gap-1.5 mt-0.5">
                            <span className="hover:underline cursor-pointer">{new Date(post.createdAt).toLocaleString('vi-VN')}</span>
                            <span>·</span>
                            <span>{post.tag}</span>
                            <svg className="w-3.5 h-3.5 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="px-5 pb-3 text-[16px] text-white whitespace-pre-wrap leading-relaxed">
                      {post.content}
                    </div>
                    
                    <div className="px-5 py-3 flex items-center justify-between text-[14px] text-[#999999] border-b border-[#1a1a1a]">
                      <div className="flex items-center gap-1.5 cursor-pointer hover:underline">
                        <div className="w-5 h-5 rounded-full bg-[#ff385c] flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                        </div>
                        <span>{post.likes || 0}</span>
                      </div>
                      <div className="flex gap-3">
                        <span className="cursor-pointer hover:underline">{post.comments?.length || 0} bình luận</span>
                      </div>
                    </div>

                    <div className="px-5 py-1.5 flex items-center justify-between gap-2">
                      <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-[#090909] transition-colors font-semibold text-[15px] text-[#999999]">
                        <svg className="w-5 h-5 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                        Thích
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-[#090909] transition-colors font-semibold text-[15px] text-[#999999]">
                        <svg className="w-5 h-5 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        Bình luận
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {targetPosts.length === 0 && (
                <div className="text-center py-20 bg-[#141414] rounded-[14px] border border-[#1a1a1a] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <p className="text-[#999999] font-semibold text-[17px]">Không có bài viết nào để hiển thị.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* MODAL CHỈNH SỬA THÔNG TIN */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 bg-[#222222]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#141414] border border-[#1a1a1a] shadow-2xl rounded-[14px] w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-5 border-b border-[#1a1a1a] flex justify-between items-center shrink-0">
                <h2 className="text-[20px] font-bold text-white">Chỉnh sửa trang cá nhân</h2>
                <button onClick={() => setIsEditing(false)} className="w-9 h-9 rounded-full bg-[#141414] flex items-center justify-center hover:bg-[#090909] transition border border-transparent hover:border-[#262626]">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
                <div>
                  <label className="block text-[16px] font-bold text-white mb-2">Tên hiển thị</label>
                  <input type="text" value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} className="w-full bg-[#141414] border border-[#262626] rounded-lg px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#0099ff]/20 focus:border-[#ff385c] transition" placeholder="Nhập tên của bạn..." />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[16px] font-bold text-white">Ảnh đại diện (Avatar URL)</label>
                  </div>
                  <input type="text" value={editFormData.photoURL} onChange={(e) => setEditFormData({...editFormData, photoURL: e.target.value})} className="w-full bg-[#141414] border border-[#262626] rounded-lg px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#0099ff]/20 focus:border-[#ff385c] transition" placeholder="Nhập Link Ảnh URL..." />
                  
                  {/* Gợi ý Avatar */}
                  <div className="mt-4">
                    <p className="text-[14px] font-semibold text-[#999999] mb-2">Gợi ý Avatar độc quyền:</p>
                    <div className="flex gap-3">
                      {DEFAULT_AVATARS.map((avatar, idx) => (
                        <img 
                          key={idx} 
                          src={avatar} 
                          alt="Dino Avatar" 
                          onClick={() => setEditFormData({...editFormData, photoURL: avatar})}
                          className={`w-14 h-14 rounded-full border-2 object-cover cursor-pointer hover:scale-105 transition-transform ${editFormData.photoURL === avatar ? 'border-[#ff385c] shadow-sm scale-105' : 'border-[#1a1a1a] hover:border-[#262626]'}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex justify-center">
                    <img src={editFormData.photoURL || avatarPhoto} className="w-28 h-28 rounded-full border border-[#1a1a1a] object-cover" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[16px] font-bold text-white">Ảnh bìa (Cover URL)</label>
                  </div>
                  <input type="text" value={editFormData.coverPhotoUrl} onChange={(e) => setEditFormData({...editFormData, coverPhotoUrl: e.target.value})} className="w-full bg-[#141414] border border-[#262626] rounded-lg px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#0099ff]/20 focus:border-[#ff385c] transition" placeholder="Nhập Link Ảnh URL..." />
                  <div className="mt-3">
                    <img src={editFormData.coverPhotoUrl || coverPhoto} className="w-full h-36 rounded-lg border border-[#1a1a1a] object-cover" />
                  </div>
                </div>

                <div>
                  <label className="block text-[16px] font-bold text-white mb-2">Tiểu sử</label>
                  <textarea rows={3} value={editFormData.bio} onChange={(e) => setEditFormData({...editFormData, bio: e.target.value})} className="w-full bg-[#141414] border border-[#262626] rounded-lg px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#0099ff]/20 focus:border-[#ff385c] transition resize-none" placeholder="Mô tả bản thân..." />
                </div>

                <div>
                  <label className="block text-[16px] font-bold text-white mb-2">Link liên hệ (Mess/Zalo)</label>
                  <input type="text" value={editFormData.contactLink} onChange={(e) => setEditFormData({...editFormData, contactLink: e.target.value})} className="w-full bg-[#141414] border border-[#262626] rounded-lg px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#0099ff]/20 focus:border-[#ff385c] transition" placeholder="Ví dụ: https://m.me/your.username" />
                </div>

                <div>
                  <label className="block text-[16px] font-bold text-white mb-2">Chuyên ngành học</label>
                  <div className="flex flex-col gap-3">
                    <select 
                      value={editFormData.major} 
                      onChange={(e) => setEditFormData({...editFormData, major: e.target.value, specialization: ''})} 
                      className="w-full bg-[#141414] border border-[#262626] rounded-lg px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#0099ff]/20 focus:border-[#ff385c] transition"
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
                      className="w-full bg-[#141414] border border-[#262626] rounded-lg px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#0099ff]/20 focus:border-[#ff385c] transition disabled:opacity-50 disabled:bg-[#090909]"
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
                        <label className="block text-[16px] font-bold text-white mb-2">GPA / Thành tích</label>
                        <input type="text" value={editFormData.gpa} onChange={(e) => setEditFormData({...editFormData, gpa: e.target.value})} className="w-full bg-[#141414] border border-[#262626] rounded-lg px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#0099ff]/20 focus:border-[#ff385c] transition" placeholder="Ví dụ: 3.8/4.0" />
                      </div>
                      <div>
                        <label className="block text-[16px] font-bold text-white mb-2">Câu lạc bộ</label>
                        <input type="text" value={editFormData.clubs} onChange={(e) => setEditFormData({...editFormData, clubs: e.target.value})} className="w-full bg-[#141414] border border-[#262626] rounded-lg px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#0099ff]/20 focus:border-[#ff385c] transition" placeholder="Ví dụ: TEC, YRC" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[16px] font-bold text-white mb-2">Kỹ năng mạnh nhất</label>
                      <input type="text" value={editFormData.skills} onChange={(e) => setEditFormData({...editFormData, skills: e.target.value})} className="w-full bg-[#141414] border border-[#262626] rounded-lg px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#0099ff]/20 focus:border-[#ff385c] transition" placeholder="Ví dụ: IELTS 8.0, Thuyết trình" />
                    </div>
                    <div>
                      <label className="block text-[16px] font-bold text-white mb-2">Trải nghiệm nổi bật</label>
                      <textarea rows={2} value={editFormData.achievements} onChange={(e) => setEditFormData({...editFormData, achievements: e.target.value})} className="w-full bg-[#141414] border border-[#262626] rounded-lg px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#0099ff]/20 focus:border-[#ff385c] transition resize-none" placeholder="Điểm tự hào nhất..." />
                    </div>
                  </>
                )}

                {targetProfile.role === 'mentee' && (
                  <>
                    <div>
                      <label className="block text-[16px] font-bold text-white mb-2">Mục tiêu học tập</label>
                      <div className="grid grid-cols-2 gap-3">
                        {GOALS.map(goal => (
                          <label key={goal} className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all ${editFormData.goals.includes(goal) ? 'border-[#ff385c] bg-[#fff0f2] text-[#0099ff]' : 'border-[#262626] bg-[#141414] hover:bg-[#090909]'}`}>
                            <input
                              type="checkbox"
                              checked={editFormData.goals.includes(goal)}
                              onChange={() => {
                                const newGoals = editFormData.goals.includes(goal)
                                  ? editFormData.goals.filter(g => g !== goal)
                                  : [...editFormData.goals, goal];
                                setEditFormData({...editFormData, goals: newGoals});
                              }}
                              className="w-4 h-4 text-[#0099ff] rounded border-[#262626] focus:ring-[#0099ff]"
                            />
                            <span className="text-[14px] font-semibold">{goal}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[16px] font-bold text-white mb-2">Sở thích cá nhân</label>
                      <input type="text" value={editFormData.interests} onChange={(e) => setEditFormData({...editFormData, interests: e.target.value})} className="w-full bg-[#141414] border border-[#262626] rounded-lg px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#0099ff]/20 focus:border-[#ff385c] transition" placeholder="VD: Đọc sách, Nghe Podcast..." />
                    </div>
                  </>
                )}
              </div>

              <div className="p-5 border-t border-[#1a1a1a] flex justify-end gap-3 shrink-0 bg-[#141414]">
                <button onClick={() => setIsEditing(false)} className="px-6 py-2.5 rounded-lg font-bold text-white hover:bg-[#090909] transition border border-transparent hover:border-[#262626]">Hủy</button>
                <button onClick={handleSaveProfile} disabled={saving} className="px-8 py-2.5 bg-white hover:bg-gray-200 text-black rounded-lg font-bold transition disabled:opacity-50">
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
