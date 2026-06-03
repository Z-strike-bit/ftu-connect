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

  if (loading) return <div className="min-h-screen bg-white" />;

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col selection:bg-[#fff0f2] selection:text-[#ff385c]">
      <Navbar 
        profileName={currentUserProfile?.name} 
        onSignOut={() => signOut(auth).then(() => router.push('/'))} 
        profileId={currentUser?.uid} 
        profilePhoto={currentUserProfile?.photoURL} 
      />
      
      <div className="max-w-[1600px] mx-auto w-full flex flex-col md:flex-row pt-6 px-4 sm:px-6 lg:px-8 gap-8 flex-1">
        
        {/* Sidebar */}
        <div className="w-full md:w-[320px] shrink-0">
          <div className="bg-white rounded-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] border border-[#ebebeb] p-6 sticky top-[100px]">
            <h1 className="text-[24px] font-bold text-[#222222] mb-1">Chợ Sinh Viên</h1>
            <p className="text-[#6a6a6a] text-[15px] mb-6">Mua bán, pass đồ dễ dàng trong khuôn viên FTU.</p>
            
            <button className="w-full bg-[#ff385c] hover:bg-[#e00b41] text-white font-semibold py-3.5 px-4 rounded-lg mb-6 transition-all flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
              Tạo bài đăng bán
            </button>

            <h3 className="font-semibold text-[16px] text-[#222222] mb-3 px-1">Danh mục</h3>
            <div className="space-y-1">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-semibold text-[15px] text-left
                    ${activeCategory === cat.id ? 'bg-[#fff0f2] text-[#ff385c]' : 'text-[#222222] hover:bg-[#f7f7f7]'}`}
                >
                  <span className="text-xl w-6 text-center">{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-[#ebebeb]">
              <div className="bg-[#f7f7f7] text-[#222222] p-4 rounded-xl border border-[#ebebeb]">
                <p className="text-[14px] leading-relaxed">
                  💡 <strong>Tip an toàn:</strong> Luôn ưu tiên giao dịch trực tiếp tại cổng trường hoặc trong khuôn viên nhà D để đảm bảo an toàn bạn nhé!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content (Grid) */}
        <div className="flex-1 pb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="cursor-pointer group flex flex-col">
                {/* Image Wrapper */}
                <div className="aspect-square sm:aspect-[4/3] w-full relative overflow-hidden bg-[#ebebeb] rounded-[14px] mb-3">
                  <img 
                    src={product.image} 
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-[#222222] text-[13px] font-semibold px-2.5 py-1 rounded-md shadow-sm">
                    {product.condition}
                  </div>
                  <button className="absolute top-3 right-3 p-1.5 hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                  </button>
                </div>
                
                {/* Content */}
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <div className="text-[16px] font-semibold text-[#222222] truncate pr-2 flex-1">
                      {product.location}
                    </div>
                    <div className="flex items-center gap-1 text-[14px]">
                      <span className="font-semibold text-[#222222]">★ Mới</span>
                    </div>
                  </div>
                  
                  <h3 className="text-[15px] text-[#6a6a6a] line-clamp-1 mb-1">
                    {product.title}
                  </h3>
                  
                  <div className="text-[15px] text-[#6a6a6a] mb-1">
                    {product.timePosted}
                  </div>
                  
                  <div className="mt-1">
                    <span className="text-[16px] font-semibold text-[#222222]">{product.price.toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="w-full flex flex-col items-center justify-center py-20 mt-2">
              <span className="text-6xl mb-4">🛒</span>
              <p className="text-[#6a6a6a] font-medium text-[16px]">Chưa có sản phẩm nào trong danh mục này.</p>
              <button 
                onClick={() => setActiveCategory('all')}
                className="mt-4 text-[#ff385c] font-semibold hover:underline"
              >
                Xem tất cả sản phẩm
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
