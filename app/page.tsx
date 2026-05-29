"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-red-200">
      
      {/* Header Tối giản */}
      <header className="absolute top-0 w-full z-50 py-6 px-6 sm:px-12 flex justify-between items-center">
        <div className="animate-fade-in-left">
          <Image src="/logo.png" alt="FTU Connect" width={200} height={50} className="h-12 w-auto object-contain" priority />
        </div>
        
        <div className="animate-fade-in-right">
          <Link href="/onboarding" className="font-bold text-sm bg-black text-white hover:bg-red-600 px-6 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg">
            Đăng nhập
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex flex-col items-center justify-center text-center px-4">
        
        {/* Background Decorative elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-red-50 rounded-full blur-3xl opacity-50 -z-10 pointer-events-none"></div>

        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center gap-8 relative z-10 animate-fade-in-up">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-black leading-[1.1] text-center">
            Định hình <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">Tương lai</span><br/>Sinh viên Ngoại Thương
          </h1>
          <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto font-medium text-center">
            Nền tảng kết nối Mentor-Mentee cao cấp, cung cấp kiến thức thực chiến và hành trang sắc bén nhất để chinh phục 4 năm đại học.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center mt-4">
            <Link href="/onboarding" className="w-full sm:w-auto px-8 py-4 rounded-full bg-red-600 text-white font-bold text-lg hover:bg-red-700 hover:scale-105 transition-transform shadow-xl shadow-red-600/30 text-center flex-shrink-0 whitespace-nowrap">
              Bắt đầu hành trình
            </Link>
            <Link href="#features" className="w-full sm:w-auto px-8 py-4 rounded-full bg-slate-100 text-black font-bold text-lg hover:bg-slate-200 hover:scale-105 transition-transform text-center flex-shrink-0 whitespace-nowrap">
              Tìm hiểu thêm
            </Link>
          </div>
        </div>
      </main>

      {/* Product / Features Section like E-commerce */}
      <section id="features" className="py-24 bg-slate-50 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-black tracking-tight mb-4">Các Giải Pháp Chuyên Sâu</h2>
            <p className="text-slate-500 font-medium">Được thiết kế tỉ mỉ để tối ưu hóa trải nghiệm học tập và kết nối.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature Card 1 */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 hover:shadow-xl transition-shadow group cursor-pointer hover:-translate-y-2 transform transition-transform duration-300">
              <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white transition-all">
                🤝
              </div>
              <h3 className="text-2xl font-bold mb-3 text-black">Smart Matching</h3>
              <p className="text-slate-500 font-medium leading-relaxed mb-6">
                Thuật toán ghép cặp thông minh, tự động phân tích mục tiêu và chuyên ngành để tìm ra Mentor/Mentee tương thích 99%.
              </p>
              <span className="text-red-600 font-bold group-hover:underline">Khám phá &rarr;</span>
            </div>

            {/* Feature Card 2 */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 hover:shadow-xl transition-shadow group cursor-pointer hover:-translate-y-2 transform transition-transform duration-300">
              <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 group-hover:bg-red-600 transition-all">
                📚
              </div>
              <h3 className="text-2xl font-bold mb-3 text-black">Survival Guide</h3>
              <p className="text-slate-500 font-medium leading-relaxed mb-6">
                Wiki Môn học độc quyền với kho tài liệu khổng lồ và review chân thực từ hàng ngàn tiền bối. Checklist tân sinh viên tự động.
              </p>
              <span className="text-red-600 font-bold group-hover:underline">Xem chi tiết &rarr;</span>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 hover:shadow-xl transition-shadow group cursor-pointer hover:-translate-y-2 transform transition-transform duration-300">
              <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white transition-all">
                🎟️
              </div>
              <h3 className="text-2xl font-bold mb-3 text-black">Event Hub</h3>
              <p className="text-slate-500 font-medium leading-relaxed mb-6">
                Cập nhật tức thời các sự kiện đình đám, workshop học thuật và thông tin tuyển dụng từ các Câu lạc bộ lớn nhất FTU.
              </p>
              <span className="text-red-600 font-bold group-hover:underline">Tham gia ngay &rarr;</span>
            </div>

          </div>
        </div>
      </section>

      {/* Footer minimal */}
      <footer className="border-t border-slate-200 bg-white py-12 px-6 text-center">
        <p className="text-slate-400 font-medium text-sm">© 2026 FTU Connect. Thiết kế độc quyền chuẩn Premium.</p>
      </footer>
    </div>
  );
}
