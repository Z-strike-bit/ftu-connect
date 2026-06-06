"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { Suspense } from 'react';

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUser(currentUser);
          setProfile(userDoc.data());
          if (q) {
            performSearch(q);
          } else {
            setLoading(false);
          }
        } else {
          router.push('/onboarding');
        }
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router, q]);

  const performSearch = async (queryStr: string) => {
    setLoading(true);
    try {
      const queryLower = queryStr.toLowerCase().trim();
      const snapshot = await getDocs(collection(db, 'users'));
      
      const matchedUsers: any[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        const name = (data.name || '').toLowerCase();
        const email = (data.email || '').toLowerCase();
        const username = (data.username || '').toLowerCase();
        
        // Search by name, email (student ID), or username
        if (name.includes(queryLower) || email.includes(queryLower) || username.includes(queryLower)) {
          matchedUsers.push({ id: doc.id, ...data });
        }
      });
      
      setResults(matchedUsers);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#141414] flex flex-col selection:bg-ftu-red-100 selection:text-ftu-red-600 dark:selection:bg-[#fff0f2] dark:selection:text-[#0099ff]">
      <Navbar profileName={profile?.name} profileId={user?.uid} profilePhoto={profile?.photoURL} onSignOut={() => signOut(auth).then(() => router.push('/'))} />

      <div className="flex-1 overflow-y-auto p-6 sm:p-8 mt-4 custom-scrollbar">
        <div className="max-w-[1000px] mx-auto">
          <h2 className="text-[28px] font-bold text-gray-900 dark:text-white mb-2">Kết quả tìm kiếm</h2>
          <p className="text-gray-500 dark:text-[#999999] mb-8 text-[16px]">
            Tìm thấy {results.length} kết quả cho từ khóa <strong className="text-gray-900 dark:text-white">"{q}"</strong>
          </p>

          {loading ? (
            <div className="text-center py-20 text-gray-500 dark:text-[#999999] font-semibold">Đang tìm kiếm...</div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {results.map((resultUser) => (
                <div key={resultUser.id} className="bg-white dark:bg-[#090909] rounded-[14px] overflow-hidden flex flex-col border border-gray-200 dark:border-[#1a1a1a] hover:border-[#a855f7]/50 transition-all duration-300 group shadow-sm dark:shadow-none">
                  <div className="aspect-video w-full bg-gray-200 dark:bg-[#1c1c1c] overflow-hidden shrink-0 relative">
                    <img 
                      src={resultUser.coverPhotoUrl || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60" 
                      alt="Cover"
                    />
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
                      <div className="w-16 h-16 rounded-full border-4 border-white dark:border-[#090909] overflow-hidden bg-gray-100 dark:bg-[#1c1c1c]">
                        <img 
                          src={resultUser.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + resultUser.name} 
                          className="w-full h-full object-cover" 
                          alt="Avatar"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="pt-10 p-5 flex flex-col items-center flex-1 text-center">
                    <h4 className="font-semibold text-[18px] text-gray-900 dark:text-white line-clamp-1">{resultUser.name}</h4>
                    <p className="text-[14px] text-gray-500 dark:text-[#999999] line-clamp-1 mb-1">{resultUser.role === 'mentor' ? 'Mentor' : 'Mentee'} • {resultUser.major}</p>
                    {resultUser.email && (
                      <p className="text-[12px] text-gray-400 dark:text-[#666666] line-clamp-1 mb-4">{resultUser.email.split('@')[0]}</p>
                    )}
                    
                    <div className="mt-auto w-full pt-4">
                      <Link 
                        href={`/profile/${resultUser.id}`}
                        className="w-full block py-2.5 bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-white dark:text-black font-semibold rounded-lg text-[14px] dark:hover:bg-gray-200 transition-colors shadow-sm"
                      >
                        Xem hồ sơ
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-[#090909] border border-gray-200 dark:border-[#1a1a1a] rounded-2xl p-12 text-center shadow-sm dark:shadow-none">
              <div className="w-20 h-20 bg-gray-100 dark:bg-[#1c1c1c] rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200 dark:border-[#262626]">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Không tìm thấy ai</h3>
              <p className="text-gray-500 dark:text-[#999999]">Hãy thử tìm kiếm với tên hoặc mã sinh viên khác.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-[#141414] text-gray-900 dark:text-white flex items-center justify-center">Đang tải...</div>}>
      <SearchContent />
    </Suspense>
  );
}
