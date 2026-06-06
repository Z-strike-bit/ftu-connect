"use client";
import React from 'react';
import Link from 'next/link';

interface SuggestionsSidebarProps {
  suggestions: any[];
}

const SuggestionsSidebar: React.FC<SuggestionsSidebarProps> = ({ suggestions }) => {
  return (
    <div className="hidden lg:block lg:col-span-3 xl:col-span-3 pr-2 xl:pr-4">
      <div className="sticky top-28 flex flex-col gap-8 pl-4 h-[calc(100vh-112px)] overflow-y-auto custom-scrollbar pb-8">
        
        {/* Sự kiện nổi bật */}
        <div className="relative rounded-[24px] p-[1.5px] bg-gradient-to-br from-gray-200 to-gray-100 dark:from-[#00e5ff] dark:via-[#d44df0] dark:to-[#ff385c] shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_10px_40px_rgba(212,77,240,0.2)] group hover:shadow-[0_10px_50px_rgba(0,229,255,0.4)] transition-all duration-500 overflow-hidden">
          {/* Animated wrapper highlight */}
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] bg-no-repeat bg-[position:-100%_0,0_0] group-hover:bg-[position:200%_0,0_0] transition-[background-position] duration-1000 ease-in-out pointer-events-none"></div>
          
          <div className="relative bg-white dark:bg-[#12141D] p-8 rounded-[23px] overflow-hidden h-full">
            {/* Holographic inner glowing orbs */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-ftu-red-500/5 dark:bg-[#d44df0]/20 rounded-full blur-[40px] pointer-events-none group-hover:bg-[#00e5ff]/30 transition-colors duration-700"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-transparent dark:bg-[#ff385c]/15 rounded-full blur-[40px] pointer-events-none group-hover:bg-[#d44df0]/25 transition-colors duration-700"></div>
            
            <div className="flex justify-between items-center mb-8 relative z-10">
              <h3 className="font-extrabold text-[20px] tracking-tight text-gray-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:to-[#c8a0e0] drop-shadow-sm">Sự kiện nổi bật</h3>
              <Link href="/events" className="text-ftu-red-700 dark:text-black text-[13px] font-extrabold bg-ftu-red-50 dark:bg-gradient-to-r dark:from-[#00e5ff] dark:to-[#0099ff] hover:bg-ftu-red-100 px-4 py-2 rounded-xl transition-all border border-ftu-red-100 dark:border-none shadow-sm dark:shadow-[0_0_15px_rgba(0,229,255,0.4)] dark:hover:shadow-[0_0_25px_rgba(0,229,255,0.6)] uppercase">Tất cả</Link>
            </div>
            
            <div className="space-y-4 relative z-10">
              <div className="flex gap-4 items-start cursor-pointer hover:bg-gray-50/80 dark:hover:bg-white/5 p-4 -mx-4 rounded-2xl transition-all group/event border border-transparent hover:border-gray-200 dark:hover:border-white/10 hover:shadow-sm dark:hover:shadow-[0_4px_20px_rgba(0,229,255,0.15)]">
                <div className="flex flex-col items-center bg-gray-50 dark:bg-[#1A1D27] rounded-xl border border-gray-100 dark:border-[#00e5ff]/30 w-16 h-18 overflow-hidden shrink-0 shadow-inner dark:shadow-[0_0_15px_rgba(0,229,255,0.2)]">
                  <span className="bg-gradient-to-r from-ftu-red-600 to-ftu-red-500 dark:from-[#00e5ff] dark:to-[#0099ff] text-white text-[11px] font-extrabold uppercase tracking-wider w-full text-center py-1.5 shadow-sm">Th 10</span>
                  <span className="text-gray-900 dark:text-white font-extrabold text-[24px] leading-none my-2 drop-shadow-sm">24</span>
                </div>
                <div className="pt-0.5">
                  <h4 className="text-[15px] font-extrabold text-gray-900 dark:text-white leading-snug group-hover/event:text-transparent group-hover/event:bg-clip-text group-hover/event:bg-gradient-to-r group-hover/event:from-ftu-red-600 group-hover/event:to-ftu-red-400 dark:group-hover/event:from-[#00e5ff] dark:group-hover/event:to-white transition-all">Ngày hội Định hướng Tân sinh viên FTU</h4>
                  <p className="text-[13px] text-gray-500 dark:text-[#a0a0b0] mt-2 font-medium flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-[#00e676] rounded-full shadow-[0_0_5px_#00e676]"></span>1,2K người quan tâm</p>
                </div>
              </div>
              
              <div className="border-b border-gray-100 dark:border-white/5"></div>

              <div className="flex gap-4 items-start cursor-pointer hover:bg-gray-50/80 dark:hover:bg-white/5 p-4 -mx-4 rounded-2xl transition-all group/event border border-transparent hover:border-gray-200 dark:hover:border-white/10 hover:shadow-sm dark:hover:shadow-[0_4px_20px_rgba(255,56,92,0.15)]">
                <div className="flex flex-col items-center bg-gray-50 dark:bg-[#1A1D27] rounded-xl border border-gray-100 dark:border-[#ff385c]/30 w-16 h-18 overflow-hidden shrink-0 shadow-inner dark:shadow-[0_0_15px_rgba(255,56,92,0.2)]">
                  <span className="bg-gradient-to-r from-ftu-red-600 to-ftu-red-500 dark:from-[#ff385c] dark:to-[#d44df0] text-white text-[11px] font-extrabold uppercase tracking-wider w-full text-center py-1.5 shadow-sm">Th 11</span>
                  <span className="text-gray-900 dark:text-white font-extrabold text-[24px] leading-none my-2 drop-shadow-sm">05</span>
                </div>
                <div className="pt-0.5">
                  <h4 className="text-[15px] font-extrabold text-gray-900 dark:text-white leading-snug group-hover/event:text-transparent group-hover/event:bg-clip-text group-hover/event:bg-gradient-to-r group-hover/event:from-ftu-red-600 group-hover/event:to-ftu-red-400 dark:group-hover/event:from-[#ff385c] dark:group-hover/event:to-white transition-all">Workshop: Lộ trình trở thành Global Citizen</h4>
                  <p className="text-[13px] text-gray-500 dark:text-[#a0a0b0] mt-2 font-medium flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-ftu-red-500 dark:bg-[#ff385c] rounded-full shadow-[0_0_5px_#EF4444] dark:shadow-[0_0_8px_#ff385c]"></span>Trực tuyến</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gợi ý kết nối / Người liên hệ */}
        <div className="bg-white dark:bg-[#151720] rounded-[24px] p-6 border border-gray-100 dark:border-[#2A2D3A] shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.8)] transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-extrabold text-[18px] text-gray-900 dark:text-white">Gợi ý kết nối</h3>
            <div className="flex gap-1">
              <button className="w-9 h-9 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full flex items-center justify-center transition-colors border border-transparent hover:border-gray-200 dark:hover:border-white/20">
                <svg className="w-5 h-5 text-gray-400 dark:text-[#a0a0b0] hover:text-gray-900 dark:hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
              </button>
            </div>
          </div>
          
          <div className="space-y-1">
            {suggestions.map(suggestion => (
              <Link 
                href={`/profile/${suggestion.id}`}
                key={suggestion.id}
                className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/10 transition-all cursor-pointer group border border-transparent hover:border-gray-200 dark:hover:border-white/10"
              >
                <div className="relative shrink-0">
                  <img src={suggestion.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + suggestion.name} className="h-11 w-11 rounded-full border-2 border-gray-200 dark:border-white/20 object-cover group-hover:border-ftu-red-700 dark:group-hover:border-[#00e5ff] transition-colors" alt="Avatar"/>
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#00e676] border-2 border-white dark:border-[#141414] rounded-full group-hover:border-gray-50 dark:group-hover:border-[#222] transition-colors shadow-[0_0_5px_#00e676]"></span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[15px] font-extrabold text-gray-900 dark:text-white truncate block group-hover:text-ftu-red-700 dark:group-hover:text-transparent dark:group-hover:bg-clip-text dark:group-hover:bg-gradient-to-r dark:group-hover:from-white dark:group-hover:to-[#c8a0e0] transition-all">{suggestion.name}</span>
                  <span className="text-[12px] font-medium text-gray-400 dark:text-[#a0a0b0] truncate block">{suggestion.major || 'Sinh viên FTU'}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-ftu-red-700 dark:group-hover:bg-[#0099ff] transition-colors shadow-inner">
                  <svg className="w-4 h-4 text-gray-500 group-hover:text-white dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                </div>
              </Link>
            ))}
            {suggestions.length === 0 && (
              <div className="py-8 flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-4 border-gray-200 dark:border-white/20 border-t-ftu-red-700 dark:border-t-[#d44df0] rounded-full animate-spin mb-3"></div>
                <p className="text-[14px] text-gray-400 dark:text-[#a0a0b0] font-medium">Đang tìm kiếm...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(SuggestionsSidebar);
