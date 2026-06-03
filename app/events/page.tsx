"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';

interface UserProfile {
  name: string;
}

const EVENTS = [
  {
    id: 'e1',
    title: 'Hội thảo: Hành trang vươn ra Biển lớn cùng Big4',
    date: '15/09/2026 - 08:30 AM',
    location: 'Hội trường VJCC, FTU',
    organizer: 'CLB Kế toán - Kiểm toán CFA',
    gradient: 'from-[#222222] to-[#6a6a6a]',
    tagText: 'Nổi bật',
    tagColor: 'bg-white text-black',
    link: 'https://forms.gle/test1'
  },
  {
    id: 'e2',
    title: 'Tuyển thành viên Gen 15 - Ban truyền thông',
    date: 'Hạn chót: 20/09/2026',
    location: 'Online (Phỏng vấn trực tiếp tại D201)',
    organizer: 'Đoàn Thanh Niên FTU',
    gradient: 'from-[#ebebeb] to-[#dddddd]',
    tagText: 'Tuyển dụng',
    tagColor: 'bg-[#222222] text-white',
    link: 'https://forms.gle/test2'
  },
  {
    id: 'e3',
    title: 'Workshop: Kỹ năng chinh phục học bổng Erasmus+',
    date: '25/09/2026 - 14:00 PM',
    location: 'Phòng D201, Tòa nhà D',
    organizer: 'Phòng Hợp tác Quốc tế',
    gradient: 'from-[#ff385c] to-[#e00b41]',
    tagText: 'Workshop',
    tagColor: 'bg-[#141414] text-[#0099ff]',
    link: 'https://forms.gle/test3'
  },
  {
    id: 'e4',
    title: 'Giao lưu Sinh viên Ngoại thương và Doanh nghiệp',
    date: '02/10/2026 - 18:00 PM',
    location: 'Sân nhà G',
    organizer: 'Hội Sinh viên FTU',
    gradient: 'from-[#222222] to-black',
    tagText: 'Networking',
    tagColor: 'bg-[#1c1c1c] text-white',
    link: 'https://forms.gle/test4'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function EventsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUser(currentUser);
          setProfile(userDoc.data() as UserProfile);
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

  if (loading) {
    return <div className="min-h-screen bg-[#141414] flex items-center justify-center"><p className="text-[#999999] font-semibold animate-pulse">Đang tải Sự kiện...</p></div>;
  }

  return (
    <div className="min-h-screen w-full bg-[#141414] text-white font-sans pb-16 selection:bg-[#fff0f2] selection:text-[#0099ff]">
      <Navbar profileName={profile?.name} profileId={user?.uid} profilePhoto={profile?.photoURL} onSignOut={handleSignOut} />

      {/* Main Container */}
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center sm:text-left border-b border-[#1a1a1a] pb-6"
        >
          <h1 className="text-[32px] font-bold text-white tracking-tight">Sự kiện <span className="text-[#0099ff]">Độc quyền</span></h1>
          <p className="text-[#999999] mt-2 text-[16px] max-w-2xl font-medium">Khám phá các bộ sưu tập sự kiện và cơ hội tuyển dụng mới nhất từ các tổ chức sinh viên hàng đầu.</p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {EVENTS.map(event => (
            <motion.div 
              key={event.id} 
              variants={itemVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="bg-[#141414] rounded-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] border border-[#1a1a1a] overflow-hidden flex flex-col group cursor-pointer"
            >
              {/* Cover Gradient */}
              <div className={`h-[160px] w-full bg-gradient-to-br ${event.gradient} relative overflow-hidden flex items-center justify-center`}>
                <div className={`absolute top-4 left-4 ${event.tagColor} px-3 py-1 rounded-md text-[12px] font-bold uppercase shadow-sm`}>
                  {event.tagText}
                </div>
                {/* Decorative circle */}
                <div className="w-48 h-48 border border-white/10 rounded-full absolute -right-12 -bottom-12 scale-150 group-hover:scale-100 transition-transform duration-700 ease-in-out"></div>
              </div>
              
              {/* Content */}
              <div className="p-6 flex-1 flex flex-col">
                <p className="text-[12px] font-bold text-[#999999] uppercase tracking-wider mb-2">{event.organizer}</p>
                <h3 className="text-[18px] font-semibold text-white mb-4 leading-snug group-hover:text-[#0099ff] transition-colors line-clamp-2">{event.title}</h3>
                
                <div className="space-y-2.5 mb-6 flex-1">
                  <div className="flex items-center text-[14px] text-[#999999] font-medium">
                    <span className="w-1.5 h-1.5 bg-[#222222] rounded-full mr-3 shrink-0"></span>
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center text-[14px] text-[#999999] font-medium">
                    <span className="w-1.5 h-1.5 bg-[#ff385c] rounded-full mr-3 shrink-0"></span>
                    <span>{event.location}</span>
                  </div>
                </div>

                {/* Register Button */}
                <a 
                  href={event.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full block text-center bg-[#141414] border border-[#222222] hover:bg-[#090909] text-white font-semibold py-3 rounded-lg transition-all"
                >
                  Đăng ký tham gia
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
