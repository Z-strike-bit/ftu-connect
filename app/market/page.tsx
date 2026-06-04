"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface Product {
  id: string;
  title: string;
  price: number;
  location: string;
  image: string;
  category: string;
  condition: string;
  timePosted: string;
}

export default function MarketPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setCurrentUserProfile(userDoc.data());
        }
        setLoading(false);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const products: Product[] = [
    {
      id: '1',
      title: 'Giáo trình Kinh tế vĩ mô (Bản gốc - Dùng lướt)',
      price: 50000,
      location: 'KTX Ngoại Thương',
      image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80',
      category: 'books',
      condition: 'Như mới',
      timePosted: '2 giờ trước'
    },
    {
      id: '2',
      title: 'Tai nghe Sony WH-1000XM4 (Đen)',
      price: 3500000,
      location: 'Nhà D, FTU',
      image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80',
      category: 'tech',
      condition: 'Đã sử dụng',
      timePosted: '5 giờ trước'
    },
    {
      id: '3',
      title: 'MacBook Air M1 (Ram 8GB/256GB SSD)',
      price: 13500000,
      location: 'Chùa Láng, Đống Đa',
      image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80',
      category: 'tech',
      condition: 'Cũ - Còn bảo hành Apple',
      timePosted: '1 ngày trước'
    },
    {
      id: '4',
      title: 'Combo 3 cuốn Sách Tiếng Anh Chuyên Ngành',
      price: 120000,
      location: 'Thư viện FTU',
      image: 'https://images.unsplash.com/photo-1456953180671-730de08edaa7?auto=format&fit=crop&w=800&q=80',
      category: 'books',
      condition: 'Có note vài trang bằng bút chì',
      timePosted: '1 ngày trước'
    },
    {
      id: '5',
      title: 'Bàn phím cơ Keychron K2 V2 (Brown Switch)',
      price: 900000,
      location: 'Ngõ 84 Chùa Láng',
      image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=800&q=80',
      category: 'tech',
      condition: 'Fullbox, dùng kỹ',
      timePosted: '2 ngày trước'
    },
    {
      id: '6',
      title: 'Giáo trình Kế toán tài chính 1 & 2',
      price: 45000,
      location: 'Sân nhà G',
      image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=800&q=80',
      category: 'books',
      condition: 'Cũ, hơi nhăn bìa',
      timePosted: '3 ngày trước'
    },
    {
      id: '7',
      title: 'Màn hình máy tính Dell UltraSharp 24 inch',
      price: 2100000,
      location: 'Cổng trường FTU',
      image: 'https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?auto=format&fit=crop&w=800&q=80',
      category: 'tech',
      condition: 'Không điểm chết',
      timePosted: '1 tuần trước'
    }
  ];

  const categories = [
    { id: 'all', name: 'Tất cả', icon: '🛒' },
    { id: 'tech', name: 'Đồ điện tử / Công nghệ', icon: '💻' },
    { id: 'books', name: 'Sách & Giáo trình', icon: '📚' },
    { id: 'housing', name: 'Phòng trọ / Ký túc xá', icon: '🏠' },
    { id: 'other', name: 'Đồ dùng khác', icon: '🛍️' },
  ];

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  if (loading) return <div className="min-h-screen bg-[#05050a] flex items-center justify-center"><p className="text-[#999999] font-bold animate-pulse text-lg">Đang tải Chợ sinh viên...</p></div>;

  return (
    <div className="min-h-screen bg-[#05050a] font-sans flex flex-col selection:bg-[#ff385c]/30 selection:text-white relative overflow-hidden">
      {/* Ambient Orbs */}
      <div className="fixed top-[0%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-600/15 blur-[150px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#ff385c]/10 blur-[120px] pointer-events-none z-0"></div>
      
      <div className="relative z-10 flex flex-col flex-1">
        <Navbar 
          profileName={currentUserProfile?.name} 
          onSignOut={() => signOut(auth).then(() => router.push('/'))} 
          profileId={currentUser?.uid} 
          profilePhoto={currentUserProfile?.photoURL} 
        />
        
        <div className="max-w-[1600px] mx-auto w-full flex flex-col md:flex-row pt-6 px-4 sm:px-6 lg:px-8 gap-8 flex-1">
          
          {/* Sidebar */}
          <div className="w-full md:w-[320px] shrink-0">
            <div className="bg-white/[0.03] backdrop-blur-3xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/10 p-6 sticky top-[100px] overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00e5ff] via-[#d44df0] to-[#ff385c] opacity-50"></div>
              
              <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-[#c8a0e0] tracking-tight mb-2 uppercase">Chợ Sinh Viên</h1>
              <p className="text-[#a0a0b0] text-[15px] font-medium mb-8">Mua bán, pass đồ dễ dàng trong khuôn viên FTU.</p>
              
              <button className="w-full bg-gradient-to-r from-white to-gray-300 hover:from-white hover:to-white text-black font-extrabold py-3.5 px-4 rounded-xl mb-8 transition-all flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(255,255,255,0.15)] hover:shadow-[0_6px_20px_rgba(255,255,255,0.3)] hover:-translate-y-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
                Tạo bài đăng bán
              </button>

              <h3 className="font-extrabold text-[14px] text-[#a0a0b0] uppercase tracking-widest mb-4 px-2">Danh mục</h3>
              <div className="space-y-2">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all font-bold text-[15px] text-left border border-transparent group
                      ${activeCategory === cat.id 
                        ? 'bg-gradient-to-r from-[#ff385c]/20 to-[#d44df0]/20 text-white border-white/20 shadow-inner' 
                        : 'text-[#e0e0e0] hover:bg-white/5 hover:border-white/10 hover:text-white'}`}
                  >
                    <span className="text-xl w-6 text-center drop-shadow-md group-hover:scale-110 transition-transform">{cat.icon}</span>
                    {cat.name}
                  </button>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="bg-gradient-to-br from-[#00e5ff]/10 to-[#0099ff]/10 text-white p-5 rounded-2xl border border-[#00e5ff]/30 shadow-[0_0_15px_rgba(0,229,255,0.1)]">
                  <p className="text-[14px] leading-relaxed font-medium">
                    <span className="text-xl inline-block mb-2">💡</span><br/>
                    <strong className="text-[#00e5ff]">Tip an toàn:</strong> Luôn ưu tiên giao dịch trực tiếp tại cổng trường hoặc trong khuôn viên nhà D để đảm bảo an toàn bạn nhé!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content (Grid) */}
          <div className="flex-1 pb-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="cursor-pointer group flex flex-col relative">
                  {/* Image Wrapper */}
                  <div className="aspect-square sm:aspect-[4/3] w-full relative overflow-hidden bg-white/5 rounded-[20px] mb-4 border border-white/10 group-hover:border-white/30 transition-colors shadow-lg">
                    <img 
                      src={product.image} 
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#05050a]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md text-white text-[12px] font-extrabold px-3 py-1.5 rounded-lg border border-white/20 shadow-sm uppercase tracking-wide">
                      {product.condition}
                    </div>
                    <button className="absolute top-3 right-3 p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-[#ff385c]/80 hover:border-[#ff385c] hover:scale-110 transition-all shadow-sm">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                    </button>
                  </div>
                  
                  {/* Content */}
                  <div className="flex flex-col flex-1 px-1">
                    <div className="flex justify-between items-start mb-1.5">
                      <div className="text-[16px] font-extrabold text-white truncate pr-2 flex-1 drop-shadow-sm group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#00e5ff] group-hover:to-[#0099ff] transition-all">
                        {product.location}
                      </div>
                      <div className="flex items-center gap-1 text-[13px] bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
                        <span className="font-extrabold text-[#d44df0]">★ Mới</span>
                      </div>
                    </div>
                    
                    <h3 className="text-[15px] font-medium text-[#a0a0b0] line-clamp-1 mb-1.5 group-hover:text-white transition-colors">
                      {product.title}
                    </h3>
                    
                    <div className="text-[13px] font-medium text-[#6a6a6a] mb-2">
                      {product.timePosted}
                    </div>
                    
                    <div className="mt-auto pt-1">
                      <span className="text-[18px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 drop-shadow-sm">
                        {product.price.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="w-full flex flex-col items-center justify-center py-24 mt-4 bg-white/[0.02] backdrop-blur-xl rounded-[24px] border border-white/10 shadow-lg">
                <span className="text-6xl mb-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] animate-bounce">🛒</span>
                <p className="text-[#a0a0b0] font-bold text-[18px]">Chưa có sản phẩm nào trong danh mục này.</p>
                <button 
                  onClick={() => setActiveCategory('all')}
                  className="mt-5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                >
                  Xem tất cả sản phẩm
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
