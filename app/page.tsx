"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-red-200">
      
      {/* Header */}
      <header className="w-full py-6 px-6 sm:px-12 flex justify-between items-center border-b border-slate-100">
        <div>
          <Image src="/logo.png" alt="FTU Connect" width={200} height={50} className="h-12 w-auto object-contain" priority />
        </div>
        
        <div>
          <Link href="/onboarding" className="font-bold text-sm bg-black text-white hover:bg-red-600 px-6 py-2.5 rounded-full transition-all shadow-md">
            Đăng nhập
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center min-h-[80vh] gap-8 p-6 text-center mt-8">
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-black leading-tight">
          Định hình <span className="text-red-600">Tương lai</span><br/>Sinh viên Ngoại Thương
        </h1>
        <p className="text-lg sm:text-xl text-slate-500 max-w-2xl font-medium">
          Nền tảng kết nối Mentor-Mentee cao cấp, cung cấp kiến thức thực chiến và hành trang sắc bén nhất để chinh phục 4 năm đại học.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/onboarding" className="inline-block px-8 py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors">
            Bắt đầu hành trình
          </Link>
          <Link href="#features" className="inline-block px-8 py-4 bg-slate-100 text-black font-bold rounded-xl hover:bg-slate-200 transition-colors">
            Tìm hiểu thêm
          </Link>
        </div>
      </main>

      {/* Product / Features Section */}
      <section id="features" className="py-24 bg-slate-50 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-black tracking-tight mb-4">Các Giải Pháp Chuyên Sâu</h2>
            <p className="text-slate-500 font-medium">Được thiết kế tỉ mỉ để tối ưu hóa trải nghiệm học tập và kết nối.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-2xl mb-6">
                🤝
              </div>
              <h3 className="text-2xl font-bold mb-3 text-black">Smart Matching</h3>
              <p className="text-slate-500 font-medium leading-relaxed mb-6">
                Thuật toán ghép cặp thông minh, tự động phân tích mục tiêu và chuyên ngành để tìm ra Mentor/Mentee tương thích 99%.
              </p>
              <Link href="/onboarding" className="text-red-600 font-bold hover:underline">Khám phá &rarr;</Link>
            </div>

            {/* Feature Card 2 */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center text-2xl mb-6">
                📚
              </div>
              <h3 className="text-2xl font-bold mb-3 text-black">Survival Guide</h3>
              <p className="text-slate-500 font-medium leading-relaxed mb-6">
                Wiki Môn học độc quyền với kho tài liệu khổng lồ và review chân thực từ hàng ngàn tiền bối. Checklist tân sinh viên tự động.
              </p>
              <Link href="/guide" className="text-red-600 font-bold hover:underline">Xem chi tiết &rarr;</Link>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-2xl mb-6">
                🎟️
              </div>
              <h3 className="text-2xl font-bold mb-3 text-black">Event Hub</h3>
              <p className="text-slate-500 font-medium leading-relaxed mb-6">
                Cập nhật tức thời các sự kiện đình đám, workshop học thuật và thông tin tuyển dụng từ các Câu lạc bộ lớn nhất FTU.
              </p>
              <Link href="/events" className="text-red-600 font-bold hover:underline">Tham gia ngay &rarr;</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 px-6 text-center">
        <p className="text-slate-400 font-medium text-sm">© 2026 FTU Connect. Thiết kế độc quyền chuẩn Premium.</p>
      </footer>
    </div>
  );
}
