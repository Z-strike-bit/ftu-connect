"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Image from 'next/image';

interface UserProfile {
  name: string;
  photoURL?: string;
}

const EVENTS = [
  {
    id: 'e1',
    title: 'Hội thảo: Hành trang vươn ra Biển lớn cùng Big4',
    date: '15/09/2026 - 08:30 AM',
    location: 'Hội trường VJCC, FTU',
    organizer: 'CLB Kế toán - Kiểm toán CFA',
    tagText: 'Nổi bật',
    tagColor: 'text-[#00e5ff] border-[#00e5ff]/30 bg-[#00e5ff]/10',
    link: 'https://forms.gle/test1',
    image: '/assets/events/event_big4.png'
  },
  {
    id: 'e2',
    title: 'Tuyển thành viên Gen 15 - Ban truyền thông',
    date: 'Hạn chót: 20/09/2026',
    location: 'Online (Phỏng vấn trực tiếp tại D201)',
    organizer: 'Đoàn Thanh Niên FTU',
    tagText: 'Tuyển dụng',
    tagColor: 'text-white border-white/30 bg-white/10',
    link: 'https://forms.gle/test2',
    image: '/assets/events/event_media.png'
  },
  {
    id: 'e3',
    title: 'Workshop: Kỹ năng chinh phục học bổng Erasmus+',
    date: '25/09/2026 - 14:00 PM',
    location: 'Phòng D201, Tòa nhà D',
    organizer: 'Phòng Hợp tác Quốc tế',
    tagText: 'Workshop',
    tagColor: 'text-[#ff385c] border-[#ff385c]/30 bg-[#ff385c]/10',
    link: 'https://forms.gle/test3',
    image: '/assets/events/event_erasmus.png'
  },
  {
    id: 'e4',
    title: 'Giao lưu Sinh viên Ngoại thương và Doanh nghiệp',
    date: '02/10/2026 - 18:00 PM',
    location: 'Sân nhà G',
    organizer: 'Hội Sinh viên FTU',
    tagText: 'Networking',
    tagColor: 'text-[#00e676] border-[#00e676]/30 bg-[#00e676]/10',
    link: 'https://forms.gle/test4',
    image: '/assets/events/event_networking.png'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    requestAnimationFrame(() => {
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    requestAnimationFrame(() => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    });
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 dark:bg-[#05050a] flex items-center justify-center"><p className="text-gray-500 dark:text-[#999999] font-bold animate-pulse">Đang tải Sự kiện...</p></div>;
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-[#05050a] text-gray-900 dark:text-white font-sans pb-16 selection:bg-ftu-red-700/20 dark:selection:bg-[#ff385c]/30 selection:text-gray-900 dark:selection:text-white relative overflow-hidden">
      {/* Ambient Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-ftu-red-500/10 dark:from-[#0099ff]/15 to-transparent pointer-events-none z-0"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-ftu-gold/10 dark:from-[#d44df0]/15 to-transparent pointer-events-none z-0"></div>

      <div className="relative z-10">
        <Navbar profileName={profile?.name} profileId={user?.uid} profilePhoto={profile?.photoURL} onSignOut={handleSignOut} />

        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center sm:text-left border-b border-gray-200 dark:border-white/10 pb-8"
          >
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-ftu-red-700 to-ftu-red-500 dark:from-white dark:to-[#a0a0b0] tracking-tight uppercase">Sự kiện <span className="bg-clip-text text-transparent bg-gradient-to-r from-ftu-red-600 to-ftu-red-400 dark:from-[#00e5ff] dark:to-[#0099ff]">Độc quyền</span></h1>
            <p className="text-gray-600 dark:text-[#a0a0b0] mt-3 text-lg font-medium max-w-2xl">Khám phá các bộ sưu tập sự kiện và cơ hội tuyển dụng mới nhất từ các tổ chức sinh viên hàng đầu.</p>
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
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="holo-card bg-white dark:bg-white/[0.03] backdrop-blur-sm rounded-[1.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.05)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-gray-100 dark:border-white/10 overflow-hidden flex flex-col group cursor-pointer hover:border-ftu-red-200 dark:hover:border-white/30 hover:shadow-[0_8px_30px_rgba(185,28,28,0.1)] dark:hover:shadow-[0_0_30px_rgba(0,153,255,0.2)] transition-all duration-300 relative"
              >
                {/* 3D Holo Glare Layer */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-ftu-red-500/5 dark:from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-30 mix-blend-overlay"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-ftu-red-600 to-ftu-red-400 dark:from-[#00e5ff] dark:to-[#0099ff] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"></div>

                {/* Cover Image */}
                <div className="h-[180px] w-full relative overflow-hidden flex items-start justify-end p-5 border-b border-gray-100 dark:border-white/5">
                  <Image 
                    src={event.image} 
                    alt={event.title} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:brightness-110" 
                  />
                  {/* Fade out to dark bottom */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white dark:from-black/20 dark:via-black/40 dark:to-[#05050a] pointer-events-none"></div>
                  
                  {/* Tag */}
                  <div className={`relative z-10 border ${event.tagColor} px-3 py-1 rounded-[100px] text-[10px] font-extrabold uppercase shadow-sm backdrop-blur-md`}>
                    {event.tagText}
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6 flex-1 flex flex-col relative z-20 bg-gradient-to-b from-transparent to-gray-50/50 dark:to-black/20">
                  <p className="text-[12px] font-bold text-gray-500 dark:text-[#a0a0b0] uppercase tracking-widest mb-3 line-clamp-1">{event.organizer}</p>
                  <h3 className="text-xl font-extrabold text-gray-900 dark:text-white mb-5 leading-snug group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-ftu-red-600 group-hover:to-ftu-red-500 dark:group-hover:from-[#00e5ff] dark:group-hover:to-[#0099ff] transition-all line-clamp-2">{event.title}</h3>
                  
                  <div className="space-y-3 mb-8 flex-1">
                    <div className="flex items-center text-[14px] text-gray-700 dark:text-[#e0e0e0] font-medium">
                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mr-3 shadow-inner border border-gray-200 dark:border-white/5">
                        <svg className="w-4 h-4 text-ftu-red-600 dark:text-[#0099ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      </div>
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center text-[14px] text-gray-700 dark:text-[#e0e0e0] font-medium">
                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mr-3 shadow-inner border border-gray-200 dark:border-white/5">
                        <svg className="w-4 h-4 text-ftu-red-600 dark:text-[#ff385c]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      </div>
                      <span>{event.location}</span>
                    </div>
                  </div>

                  {/* Register Button */}
                  <a 
                    href={event.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full block text-center bg-gradient-to-r from-ftu-red-700 to-ftu-red-600 hover:from-ftu-red-800 hover:to-ftu-red-700 dark:from-white dark:to-gray-200 dark:hover:from-gray-100 dark:hover:to-gray-300 text-white dark:text-black font-extrabold py-3 rounded-xl transition-all shadow-[0_4px_15px_rgba(185,28,28,0.2)] dark:shadow-[0_4px_15px_rgba(255,255,255,0.15)] hover:-translate-y-1 relative overflow-hidden group/btn"
                  >
                    <span className="relative z-10">Đăng ký tham gia</span>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-10 dark:group-hover/btn:opacity-20 transition-opacity"></div>
                  </a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
