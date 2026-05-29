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
    gradient: 'from-black to-slate-800',
    tagText: 'Nổi bật',
    tagColor: 'bg-red-600 text-white',
    link: 'https://forms.gle/test1'
  },
  {
    id: 'e2',
    title: 'Tuyển thành viên Gen 15 - Ban truyền thông',
    date: 'Hạn chót: 20/09/2026',
    location: 'Online (Phỏng vấn trực tiếp tại D201)',
    organizer: 'Đoàn Thanh Niên FTU',
    gradient: 'from-slate-200 to-slate-100',
    tagText: 'Tuyển dụng',
    tagColor: 'bg-black text-white',
    link: 'https://forms.gle/test2'
  },
  {
    id: 'e3',
    title: 'Workshop: Kỹ năng chinh phục học bổng Erasmus+',
    date: '25/09/2026 - 14:00 PM',
    location: 'Phòng D201, Tòa nhà D',
    organizer: 'Phòng Hợp tác Quốc tế',
    gradient: 'from-red-600 to-red-500',
    tagText: 'Workshop',
    tagColor: 'bg-white text-red-600',
    link: 'https://forms.gle/test3'
  },
  {
    id: 'e4',
    title: 'Giao lưu Sinh viên Ngoại thương và Doanh nghiệp',
    date: '02/10/2026 - 18:00 PM',
    location: 'Sân nhà G',
    organizer: 'Hội Sinh viên FTU',
    gradient: 'from-zinc-900 to-black',
    tagText: 'Networking',
    tagColor: 'bg-slate-800 text-white',
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
        // router.push('/'); // Bypass auth for testing
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center"><p className="text-slate-500 font-bold animate-pulse">Đang tải Sự kiện...</p></div>;
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 text-black font-sans pb-16 selection:bg-red-200">
      <Navbar profileName={profile?.name} onSignOut={handleSignOut} />

      {/* Main Container */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center sm:text-left border-b border-slate-200 pb-8"
        >
          <h1 className="text-4xl font-extrabold text-black tracking-tight uppercase">Sự kiện <span className="text-red-600">Độc quyền</span></h1>
          <p className="text-slate-500 mt-3 text-lg max-w-2xl font-medium">Khám phá các bộ sưu tập sự kiện và cơ hội tuyển dụng mới nhất từ các tổ chức sinh viên hàng đầu.</p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {EVENTS.map(event => (
            <motion.div 
              key={event.id} 
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden flex flex-col group cursor-pointer"
            >
              {/* Cover Gradient */}
              <div className={`h-40 w-full bg-gradient-to-br ${event.gradient} relative overflow-hidden flex items-center justify-center`}>
                <div className={`absolute top-4 left-4 ${event.tagColor} px-4 py-1.5 rounded-full text-[10px] font-extrabold tracking-widest uppercase shadow-sm`}>
                  {event.tagText}
                </div>
                {/* Decorative circle */}
                <div className="w-64 h-64 border border-white/10 rounded-full absolute -right-20 -bottom-20 scale-150 group-hover:scale-100 transition-transform duration-700 ease-in-out"></div>
              </div>
              
              {/* Content */}
              <div className="p-7 flex-1 flex flex-col">
                <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">{event.organizer}</p>
                <h3 className="text-xl font-bold text-black mb-5 leading-snug group-hover:text-red-600 transition-colors">{event.title}</h3>
                
                <div className="space-y-3 mb-8 flex-1">
                  <div className="flex items-center text-sm text-slate-600 font-medium">
                    <span className="w-1.5 h-1.5 bg-black rounded-full mr-3 shrink-0"></span>
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600 font-medium">
                    <span className="w-1.5 h-1.5 bg-red-600 rounded-full mr-3 shrink-0"></span>
                    <span>{event.location}</span>
                  </div>
                </div>

                {/* Register Button */}
                <a 
                  href={event.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full block text-center bg-white border-2 border-black hover:bg-black hover:text-white text-black font-bold py-3.5 rounded-2xl transition-all shadow-sm"
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
