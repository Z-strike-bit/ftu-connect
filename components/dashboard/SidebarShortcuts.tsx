"use client";
import React from 'react';
import Link from 'next/link';

interface SidebarShortcutsProps {
  user: any;
  profile: any;
}

const SidebarShortcuts: React.FC<SidebarShortcutsProps> = ({ user, profile }) => {
  return (
    <div className="hidden lg:block lg:col-span-3 xl:col-span-3 pl-2 xl:pl-4">
      <div className="sticky top-28 flex flex-col gap-3 pr-4 h-[calc(100vh-112px)] overflow-y-auto custom-scrollbar pb-8">
        <Link 
          href={user ? `/profile/${user.uid}` : "#"}
          className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer group border border-transparent hover:border-gray-200 dark:hover:border-white/10"
        >
          <img src={profile?.photoURL || user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + profile?.name} alt="Avatar" className="w-11 h-11 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/20 object-cover group-hover:border-ftu-red-700 dark:group-hover:border-[#d44df0] transition-colors"/>
          <span className="font-extrabold text-[16px] text-gray-900 dark:text-white group-hover:text-ftu-red-700 dark:group-hover:text-transparent dark:group-hover:bg-clip-text dark:group-hover:bg-gradient-to-r dark:group-hover:from-white dark:group-hover:to-[#c8a0e0] transition-all">{profile?.name}</span>
        </Link>
        
        <Link href="/connect" className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer group border border-transparent hover:border-gray-200 dark:hover:border-white/10">
          <div className="w-11 h-11 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center shrink-0 border border-gray-200 dark:border-white/10 group-hover:border-ftu-red-700 dark:group-hover:border-[#00e5ff] shadow-inner transition-colors">
            <svg className="w-5 h-5 text-gray-500 dark:text-white group-hover:text-ftu-red-700 dark:group-hover:text-[#00e5ff] transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
          </div>
          <span className="font-semibold text-[16px] text-gray-500 dark:text-[#e0e0e0] group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Bạn bè / Kết nối</span>
        </Link>
        
        <Link href="/events" className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer group border border-transparent hover:border-gray-200 dark:hover:border-white/10">
          <div className="w-11 h-11 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center shrink-0 border border-gray-200 dark:border-white/10 group-hover:border-ftu-red-700 dark:group-hover:border-[#d44df0] shadow-inner transition-colors">
            <svg className="w-5 h-5 text-gray-500 dark:text-white group-hover:text-ftu-red-700 dark:group-hover:text-[#d44df0] transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/></svg>
          </div>
          <span className="font-semibold text-[16px] text-gray-500 dark:text-[#e0e0e0] group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Sự kiện độc quyền</span>
        </Link>
        
        <Link href="/guide" className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer group border border-transparent hover:border-gray-200 dark:hover:border-white/10">
          <div className="w-11 h-11 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center shrink-0 border border-gray-200 dark:border-white/10 group-hover:border-ftu-red-700 dark:group-hover:border-[#ff385c] shadow-inner transition-colors">
            <svg className="w-5 h-5 text-gray-500 dark:text-white group-hover:text-ftu-red-700 dark:group-hover:text-[#ff385c] transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>
          </div>
          <span className="font-semibold text-[16px] text-gray-500 dark:text-[#e0e0e0] group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Cẩm nang Tân sinh viên</span>
        </Link>
        
        <div className="border-b border-gray-200 dark:border-white/10 my-3 mx-3"></div>
        
        <div className="p-3">
          <h3 className="text-[14px] font-extrabold text-gray-400 dark:text-[#a0a0b0] uppercase tracking-widest mb-4">Lối tắt của bạn</h3>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer group border border-transparent hover:border-gray-200 dark:hover:border-white/10 dark:hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 dark:from-[#00e5ff]/20 dark:to-[#d44df0]/20 border border-gray-200 dark:border-white/5 text-gray-700 dark:text-white flex items-center justify-center font-extrabold text-[13px] shadow-sm group-hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] dark:group-hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all">KT</span>
              <span className="font-semibold text-[15px] text-gray-700 dark:text-white group-hover:text-ftu-red-700 dark:group-hover:text-transparent dark:group-hover:bg-clip-text dark:group-hover:bg-gradient-to-r dark:group-hover:from-[#00e5ff] dark:group-hover:to-[#d44df0] transition-colors">Kinh tế quốc tế K64</span>
            </div>
            <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer group border border-transparent hover:border-gray-200 dark:hover:border-white/10 dark:hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-pink-500/20 dark:from-[#ff385c]/20 dark:to-[#d44df0]/20 border border-gray-200 dark:border-white/5 text-gray-700 dark:text-white flex items-center justify-center font-extrabold text-[13px] shadow-sm group-hover:shadow-[0_0_15px_rgba(255,56,92,0.4)] dark:group-hover:shadow-[0_0_15px_rgba(255,56,92,0.4)] transition-all">CLB</span>
              <span className="font-semibold text-[15px] text-gray-700 dark:text-white group-hover:text-ftu-red-700 dark:group-hover:text-transparent dark:group-hover:bg-clip-text dark:group-hover:bg-gradient-to-r dark:group-hover:from-[#ff385c] dark:group-hover:to-[#d44df0] transition-colors">TEC FTU</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(SidebarShortcuts);
