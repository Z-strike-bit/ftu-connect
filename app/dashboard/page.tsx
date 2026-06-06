"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
interface User {
  uid: string;
  photoURL?: string;
}
import { motion, AnimatePresence } from 'framer-motion';
import ConnectModal from '@/components/ConnectModal';
import Navbar from '@/components/Navbar';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, getDocs, doc, getDoc, addDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import dynamic from 'next/dynamic';

const TextareaAutosize = dynamic(() => import('react-textarea-autosize'), { ssr: false });

interface UserProfile {
  name: string;
  email: string;
  major: string;
  role: string;
  bio: string;
  points?: number;
  photoURL?: string;
}

interface Comment {
  uid: string;
  authorName: string;
  content: string;
  createdAt: string;
  authorPhotoUrl?: string;
}

interface Post {
  id: string;
  content: string;
  uid: string;
  authorName: string;
  authorBadge?: any;
  authorPhotoUrl?: string;
  isAnonymous: boolean;
  likes: number;
  likedBy: string[];
  tag: string;
  comments: Comment[];
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
  feeling?: string;
  createdAt: string;
}

const EMOJI_CATEGORIES: { [key: string]: { label: string; emojis: string[] } } = {
  smileys: { label: '😊 Mặt cười', emojis: ['😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😋','😎','😍','🥰','😘','😗','😙','😚','🙂','🤗','🤩','🤔','🤨','😐','😑','😶','🙄','😏','😣','😥','😮','🤐','😯','😪','😫','😴','😌','😛','😜','😝','🤤','😒','😓','😔','😕','🙃','🤑','😲','🤯','😬','😱','😨','😰','😢','😭','😤','😠','😡','🤬','😈','👿','💀','☠️','💩','🤡','👹'] },
  gestures: { label: '👋 Cử chỉ', emojis: ['👋','🤚','🖐️','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','💪','🦾'] },
  hearts: { label: '❤️ Trái tim', emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❤️‍🔥','❤️‍🩹','❣️','💕','💞','💓','💗','💖','💘','💝','💟'] },
  objects: { label: '📚 Học tập', emojis: ['📚','📖','📝','✏️','📌','📎','🖇️','📐','📏','🎓','🏫','💻','⌨️','🖥️','📱','📊','📈','📉','🗂️','📁','📂','🗓️','📅','🔔','🔍','💡','🎯','🏆','🥇','🥈','🥉','🎖️','🏅'] },
  food: { label: '🍕 Ăn uống', emojis: ['🍕','🍔','🍟','🌭','🍿','🧂','🥚','🍳','🧇','🥞','🧈','🍞','🥐','🥖','🫓','🥨','🧀','🥗','🥩','🍗','🍖','🦴','🌮','🌯','🫔','🥙','🧆','🥣','🥘','🫕','🍝','🍜','🍲','🍛','🍣','🍱','🥟','🍤','🍙','🍚','🍘','🍥','🥮','🍡','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍩','🍪','☕','🍵','🧋','🥤','🍶','🍺','🍻','🥂'] }
};

const FEELINGS = [
  { emoji: '😊', label: 'vui vẻ' },
  { emoji: '😢', label: 'buồn' },
  { emoji: '😍', label: 'yêu đời' },
  { emoji: '😤', label: 'bực bội' },
  { emoji: '🤔', label: 'đang suy nghĩ' },
  { emoji: '😴', label: 'buồn ngủ' },
  { emoji: '📚', label: 'đang học bài' },
  { emoji: '🎉', label: 'hào hứng' },
  { emoji: '😎', label: 'tự tin' },
  { emoji: '🥺', label: 'cần được thương' },
  { emoji: '🔥', label: 'đầy năng lượng' },
  { emoji: '☕', label: 'đang uống cafe' },
];

const getBadge = (points: number) => {
  if (points >= 200) return { icon: '👑', label: 'Top Mentor', color: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg' };
  if (points >= 50) return { icon: '🥇', label: 'Người Nổi Bật', color: 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white shadow-lg' };
  return { icon: '👤', label: 'Tân Binh', color: 'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white border border-gray-200 dark:border-white/20' };
};

const TAGS = ['Thảo luận', 'Hỏi đáp môn học', 'Tìm đồng đội', 'Góc tâm sự', 'Review'];

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [postContent, setPostContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiTab, setEmojiTab] = useState('smileys');
  const [showFeelingPicker, setShowFeelingPicker] = useState(false);
  const [feeling, setFeeling] = useState<string | null>(null);
  
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [showMentions, setShowMentions] = useState(false);
  
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  
  const [postTag, setPostTag] = useState('Thảo luận');
  const [expandedComments, setExpandedComments] = useState<{[key: string]: boolean}>({});
  const [commentInputs, setCommentInputs] = useState<{[key: string]: string}>({});
  
  const [posts, setPosts] = useState<Post[]>([]);
  
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedUserToConnect, setSelectedUserToConnect] = useState<any | null>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser({ uid: currentUser.uid, photoURL: currentUser.photoURL || '' });
        
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile({
            name: data.name || data.username,
            email: data.email,
            major: data.major || '',
            role: data.role || 'mentee',
            bio: data.bio || '',
            points: data.points || 0,
            photoURL: data.photoURL || currentUser.photoURL
          } as UserProfile);
        }
        setLoading(false);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users'));
    getDocs(q).then(snap => {
      const usersList = snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((u: any) => u.id !== user.uid)
        .slice(0, 5);
      setSuggestions(usersList);
    });
  }, [user]);

  useEffect(() => {
    const q = query(collection(db, 'posts'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      fetchedPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPosts(fetchedPosts);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  const handlePost = async () => {
    if (!postContent.trim() && !imageFile && !attachedFile) return;
    if (!user || !profile || isPosting) return;
    setIsPosting(true);
    try {
      let uploadedImageUrl = '';
      let uploadedFileUrl = '';
      let uploadedFileName = '';

      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.secure_url) {
          uploadedImageUrl = data.secure_url;
        }
      }

      if (attachedFile) {
        const formData = new FormData();
        formData.append('file', attachedFile);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.secure_url) {
          uploadedFileUrl = data.secure_url;
          uploadedFileName = attachedFileName || attachedFile.name;
        }
      }

      await addDoc(collection(db, 'posts'), {
        content: postContent,
        uid: user.uid,
        authorName: profile.name,
        authorPhotoUrl: profile.photoURL || user.photoURL || '',
        authorBadge: getBadge(profile.points || 0),
        isAnonymous,
        tag: postTag,
        likes: 0,
        likedBy: [],
        comments: [],
        imageUrl: uploadedImageUrl,
        fileUrl: uploadedFileUrl,
        fileName: uploadedFileName,
        feeling: feeling || '',
        createdAt: new Date().toISOString()
      });
      setPostContent('');
      setPostTag('Th\u1ea3o lu\u1eadn');
      setIsAnonymous(false);
      setImageFile(null);
      setImagePreview(null);
      setAttachedFile(null);
      setAttachedFileName(null);
      setFeeling(null);
      setShowMentions(false);
      setShowEmojiPicker(false);
      setShowFeelingPicker(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file);
      setAttachedFileName(file.name);
    }
  };

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return '📄';
    if (['doc', 'docx'].includes(ext || '')) return '📝';
    if (['ppt', 'pptx'].includes(ext || '')) return '📊';
    if (['xls', 'xlsx'].includes(ext || '')) return '📈';
    if (['zip', 'rar'].includes(ext || '')) return '📦';
    return '📎';
  };

  const insertEmoji = (emoji: string) => {
    setPostContent(prev => prev + emoji);
    textareaRef.current?.focus();
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setPostContent(val);
    const lastAtPos = val.lastIndexOf('@');
    if (lastAtPos !== -1 && (lastAtPos === 0 || val[lastAtPos - 1] === ' ' || val[lastAtPos - 1] === '\n')) {
      const query = val.slice(lastAtPos + 1);
      if (!query.includes(' ') && !query.includes('\n')) {
        setMentionQuery(query.toLowerCase());
        setShowMentions(true);
        return;
      }
    }
    setShowMentions(false);
  };

  const insertMention = (mentionName: string) => {
    const lastAtPos = postContent.lastIndexOf('@');
    if (lastAtPos !== -1) {
      const newText = postContent.slice(0, lastAtPos) + `@${mentionName} ` + postContent.slice(lastAtPos + (mentionQuery?.length || 0) + 1);
      setPostContent(newText);
    }
    setShowMentions(false);
  };

  const handleComment = async (postId: string) => {
    if (!user || !profile || !commentInputs[postId]?.trim()) return;
    const postRef = doc(db, 'posts', postId);
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const newComment = {
      uid: user.uid,
      authorName: profile.name,
      authorPhotoUrl: profile.photoURL || user.photoURL || '',
      content: commentInputs[postId].trim(),
      createdAt: new Date().toISOString()
    };

    await updateDoc(postRef, {
      comments: [...post.comments, newComment]
    });
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  const handleLike = async (postId: string, likedBy: string[], currentLikes: number) => {
    if (!user) return;
    const hasLiked = likedBy.includes(user.uid);
    const postRef = doc(db, 'posts', postId);
    
    await updateDoc(postRef, {
      likedBy: hasLiked ? likedBy.filter(id => id !== user.uid) : [...likedBy, user.uid],
      likes: hasLiked ? currentLikes - 1 : currentLikes + 1
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFBFC] dark:bg-[#05050a] font-sans flex items-center justify-center">
        <p className="text-gray-400 dark:text-[#999999] font-bold animate-pulse text-lg">Đang tải Trang chủ...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#FAFBFC] dark:bg-[#05050a] text-gray-900 dark:text-white font-sans selection:bg-ftu-red-700/20 dark:selection:bg-[#ff385c]/30 selection:text-gray-900 dark:selection:text-white relative overflow-hidden pb-28 lg:pb-16">
      {/* Ambient Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-ftu-red-50/10 dark:bg-purple-600/15 blur-[150px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-ftu-red-100/10 dark:bg-[#ff385c]/10 blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed top-[40%] left-[40%] w-[30vw] h-[30vw] rounded-full bg-amber-50/10 dark:bg-blue-500/10 blur-[100px] pointer-events-none z-0"></div>

      <div className="relative z-10">
        <Navbar profileName={profile?.name} profileId={user?.uid} profilePhoto={profile?.photoURL} onSignOut={handleSignOut} />

        <div className="w-full mx-auto px-4 sm:px-0 lg:max-w-[1600px] mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8">
            
            {/* Cột Trái: Lối tắt (Shortcuts) */}
            <div className="hidden lg:block lg:col-span-3 xl:col-span-3 pl-2 xl:pl-4">
              <div className="sticky top-28 flex flex-col gap-3 pr-4">
                <Link 
                  href={user ? `/profile/${user.uid}` : "#"}
                  className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 hover:backdrop-blur-md transition-all cursor-pointer group border border-transparent hover:border-gray-200 dark:hover:border-white/10"
                >
                  <img src={profile?.photoURL || user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + profile?.name} alt="Avatar" className="w-11 h-11 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/20 object-cover group-hover:border-ftu-red-700 dark:group-hover:border-[#d44df0] transition-colors"/>
                  <span className="font-extrabold text-[16px] text-gray-900 dark:text-white group-hover:text-ftu-red-700 dark:group-hover:text-transparent dark:group-hover:bg-clip-text dark:group-hover:bg-gradient-to-r dark:group-hover:from-white dark:group-hover:to-[#c8a0e0] transition-all">{profile?.name}</span>
                </Link>
                
                <Link href="/connect" className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 hover:backdrop-blur-md transition-all cursor-pointer group border border-transparent hover:border-gray-200 dark:hover:border-white/10">
                  <div className="w-11 h-11 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center shrink-0 border border-gray-200 dark:border-white/10 group-hover:border-ftu-red-700 dark:group-hover:border-[#00e5ff] shadow-inner transition-colors">
                    <svg className="w-5 h-5 text-gray-500 dark:text-white group-hover:text-ftu-red-700 dark:group-hover:text-[#00e5ff] transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                  </div>
                  <span className="font-semibold text-[16px] text-gray-500 dark:text-[#e0e0e0] group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Bạn bè / Kết nối</span>
                </Link>
                
                <Link href="/events" className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 hover:backdrop-blur-md transition-all cursor-pointer group border border-transparent hover:border-gray-200 dark:hover:border-white/10">
                  <div className="w-11 h-11 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center shrink-0 border border-gray-200 dark:border-white/10 group-hover:border-ftu-red-700 dark:group-hover:border-[#d44df0] shadow-inner transition-colors">
                    <svg className="w-5 h-5 text-gray-500 dark:text-white group-hover:text-ftu-red-700 dark:group-hover:text-[#d44df0] transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/></svg>
                  </div>
                  <span className="font-semibold text-[16px] text-gray-500 dark:text-[#e0e0e0] group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Sự kiện độc quyền</span>
                </Link>
                
                <Link href="/guide" className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 hover:backdrop-blur-md transition-all cursor-pointer group border border-transparent hover:border-gray-200 dark:hover:border-white/10">
                  <div className="w-11 h-11 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center shrink-0 border border-gray-200 dark:border-white/10 group-hover:border-ftu-red-700 dark:group-hover:border-[#ff385c] shadow-inner transition-colors">
                    <svg className="w-5 h-5 text-gray-500 dark:text-white group-hover:text-ftu-red-700 dark:group-hover:text-[#ff385c] transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>
                  </div>
                  <span className="font-semibold text-[16px] text-gray-500 dark:text-[#e0e0e0] group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Cẩm nang Tân sinh viên</span>
                </Link>
                
                <div className="border-b border-gray-200 dark:border-white/10 my-3 mx-3"></div>
                
                <div className="p-3">
                  <h3 className="text-[14px] font-extrabold text-gray-400 dark:text-[#a0a0b0] uppercase tracking-widest mb-4">Lối tắt của bạn</h3>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 hover:backdrop-blur-md transition-all cursor-pointer group border border-transparent hover:border-gray-200 dark:hover:border-white/10">
                      <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white flex items-center justify-center font-extrabold text-[13px] shadow-sm group-hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all">KT</span>
                      <span className="font-semibold text-[15px] text-gray-700 dark:text-white group-hover:text-ftu-red-700 dark:group-hover:text-[#c8a0e0] transition-colors">Kinh tế quốc tế K64</span>
                    </div>
                    <div className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 hover:backdrop-blur-md transition-all cursor-pointer group border border-transparent hover:border-gray-200 dark:hover:border-white/10">
                      <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white flex items-center justify-center font-extrabold text-[13px] shadow-sm group-hover:shadow-[0_0_15px_rgba(255,56,92,0.4)] transition-all">CLB</span>
                      <span className="font-semibold text-[15px] text-gray-700 dark:text-white group-hover:text-ftu-red-700 dark:group-hover:text-[#ff385c] transition-colors">TEC FTU</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
  
            {/* Cột Giữa: Feed (Bài đăng) */}
            <div className="col-span-1 lg:col-span-6 xl:col-span-6 space-y-6 max-w-[680px] mx-auto w-full px-0 sm:px-4 lg:px-8">
              
              {/* Ô Tạo bài viết */}
              <div className="bg-white dark:bg-white/[0.03] backdrop-blur-3xl sm:rounded-[24px] shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] border-x-0 sm:border border-gray-200 dark:border-white/10 p-6 mb-8 relative z-20 group/postbox dark:animate-breathing-glow">
                <div className="absolute top-0 left-0 w-full h-[3px] overflow-hidden rounded-t-[24px]">
                  <div className="w-full h-full bg-gradient-to-r from-ftu-red-600 via-ftu-red-700 to-ftu-red-600 dark:bg-[linear-gradient(90deg,#00e5ff,#d44df0,#ff385c,#d44df0,#00e5ff)] opacity-60 dark:opacity-80 animate-led-run shadow-none dark:shadow-[0_0_10px_rgba(212,77,240,0.5)] group-focus-within/postbox:animate-led-run-fast dark:group-focus-within/postbox:shadow-[0_0_20px_rgba(212,77,240,0.8)] group-focus-within/postbox:opacity-100 transition-all duration-300"></div>
                </div>
                <div className="flex gap-3 sm:gap-4 border-b border-gray-200 dark:border-white/10 pb-5">
                  <Link href={user ? `/profile/${user.uid}` : "#"}>
                    <img src={profile?.photoURL || user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + profile?.name} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-white/20 shadow-sm shrink-0 object-cover cursor-pointer hover:border-gray-400 dark:hover:border-white/50 transition-colors"/>
                  </Link>
                  <div className="flex-1 bg-gray-100 dark:bg-black/40 hover:bg-gray-200 dark:hover:bg-black/60 transition-colors rounded-3xl px-5 flex flex-col justify-center cursor-text border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10 relative">
                    <TextareaAutosize 
                      minRows={1}
                      maxRows={8}
                      className="w-full bg-transparent border-none outline-none resize-none text-[16px] placeholder-gray-400 dark:placeholder-[#8a8a9a] text-gray-900 dark:text-white font-medium py-3 custom-scrollbar"
                      placeholder={`Bạn đang nghĩ gì thế, ${String(profile?.name || '').split(' ').pop()}?`}
                      value={postContent}
                      onChange={handleContentChange}
                    />
                    
                    {/* Mention Popup */}
                    <AnimatePresence>
                      {showMentions && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute left-0 top-full mt-2 w-[280px] bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-2xl shadow-lg dark:shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden z-50"
                        >
                          <div className="p-2 text-[12px] font-bold text-gray-400 dark:text-[#a0a0b0] bg-gray-50 dark:bg-white/5 uppercase tracking-wider">
                            Gợi ý gắn thẻ
                          </div>
                          <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
                            {suggestions
                              .filter(u => String(u.name || u.username || '').toLowerCase().includes(mentionQuery || ''))
                              .map(u => (
                                <div 
                                  key={u.id}
                                  onClick={() => insertMention(u.name || u.username || 'User')}
                                  className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-white/10 cursor-pointer transition-colors"
                                >
                                  <img src={u.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (u.name || u.username)} className="w-8 h-8 rounded-full border border-gray-200 dark:border-white/20 object-cover" />
                                  <div className="flex flex-col">
                                    <span className="text-[14px] font-bold text-gray-900 dark:text-white">{u.name || u.username || 'Người dùng'}</span>
                                    <span className="text-[12px] text-gray-400 dark:text-[#a0a0b0]">{u.major || 'Sinh viên'}</span>
                                  </div>
                                </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Image Preview */}
                <AnimatePresence>
                  {imagePreview && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="relative mt-4 mb-2">
                      <div className="relative inline-block border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden max-h-[300px]">
                        <img src={imagePreview} className="max-h-[300px] w-auto object-contain" />
                        <button onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute top-2 right-2 bg-gray-100 dark:bg-black/60 hover:bg-gray-200 dark:hover:bg-black/80 text-gray-700 dark:text-white w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-colors">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* File Preview */}
                <AnimatePresence>
                  {attachedFileName && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3 mb-2">
                      <div className="flex items-center gap-3 bg-ftu-red-50 dark:bg-[#d44df0]/10 border border-ftu-red-200 dark:border-[#d44df0]/30 rounded-2xl px-4 py-3">
                        <span className="text-2xl">{getFileIcon(attachedFileName)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-bold text-gray-900 dark:text-white truncate">{attachedFileName}</p>
                          <p className="text-[12px] text-gray-400 dark:text-[#a0a0b0]">{attachedFile ? (attachedFile.size / 1024).toFixed(1) + ' KB' : ''}</p>
                        </div>
                        <button onClick={() => { setAttachedFile(null); setAttachedFileName(null); }} className="w-7 h-7 rounded-full bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 flex items-center justify-center transition-colors">
                          <svg className="w-4 h-4 text-gray-600 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Feeling Preview */}
                <AnimatePresence>
                  {feeling && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3 mb-2">
                      <div className="flex items-center gap-2 bg-ftu-red-50 dark:bg-[#ff385c]/10 border border-ftu-red-200 dark:border-[#ff385c]/30 rounded-2xl px-4 py-2">
                        <span className="text-[14px] font-bold text-gray-900 dark:text-white">Đang cảm thấy {feeling}</span>
                        <button onClick={() => setFeeling(null)} className="ml-auto w-6 h-6 rounded-full bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 flex items-center justify-center transition-colors">
                          <svg className="w-3.5 h-3.5 text-gray-600 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Format Toolbar */}
                <div className="flex gap-2 mb-4 pt-2 border-b border-gray-100 dark:border-white/5 pb-4 px-2 relative">
                  <label className="flex items-center gap-2 text-gray-400 dark:text-[#a0a0b0] hover:text-ftu-red-700 dark:hover:text-[#00e5ff] bg-gray-100 dark:bg-white/5 hover:bg-ftu-red-50 dark:hover:bg-[#00e5ff]/10 px-4 py-2 rounded-xl cursor-pointer transition-colors font-bold text-[14px]">
                    <span className="text-lg">📸</span> <span className="hidden sm:inline">Ảnh/Video</span>
                    <input type="file" accept="image/*,video/*" className="hidden" onChange={handleImageChange} />
                  </label>
                  <label className="flex items-center gap-2 text-gray-400 dark:text-[#a0a0b0] hover:text-ftu-red-700 dark:hover:text-[#d44df0] bg-gray-100 dark:bg-white/5 hover:bg-ftu-red-50 dark:hover:bg-[#d44df0]/10 px-4 py-2 rounded-xl cursor-pointer transition-colors font-bold text-[14px]">
                    <span className="text-lg">📎</span> <span className="hidden sm:inline">File</span>
                    <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.txt" className="hidden" onChange={handleFileChange} />
                  </label>
                  <div className="relative">
                    <button onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowFeelingPicker(false); }} className={`flex items-center gap-2 bg-gray-100 dark:bg-white/5 px-4 py-2 rounded-xl transition-colors font-bold text-[14px] ${showEmojiPicker ? 'text-ftu-red-700 dark:text-[#ff385c] bg-ftu-red-50 dark:bg-[#ff385c]/10' : 'text-gray-400 dark:text-[#a0a0b0] hover:text-ftu-red-700 dark:hover:text-[#ff385c] hover:bg-ftu-red-50 dark:hover:bg-[#ff385c]/10'}`}>
                      <span className="text-lg">😊</span> <span className="hidden sm:inline">Cảm xúc</span>
                    </button>

                    {/* Emoji Picker Popup */}
                    <AnimatePresence>
                      {showEmojiPicker && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute top-full mt-3 right-0 w-[320px] bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-2xl shadow-lg dark:shadow-[0_10px_60px_rgba(0,0,0,0.9)] overflow-hidden z-50"
                        >
                          {/* Tabs: Emoji vs Feeling */}
                          <div className="flex border-b border-gray-200 dark:border-white/10">
                            <button onClick={() => setShowFeelingPicker(false)} className={`flex-1 py-3 text-[13px] font-bold transition-colors ${!showFeelingPicker ? 'text-ftu-red-700 dark:text-[#ff385c] border-b-2 border-ftu-red-700 dark:border-[#ff385c] bg-ftu-red-50 dark:bg-[#ff385c]/5' : 'text-gray-400 dark:text-[#a0a0b0] hover:text-gray-900 dark:hover:text-white'}`}>😊 Emoji</button>
                            <button onClick={() => setShowFeelingPicker(true)} className={`flex-1 py-3 text-[13px] font-bold transition-colors ${showFeelingPicker ? 'text-ftu-red-700 dark:text-[#ff385c] border-b-2 border-ftu-red-700 dark:border-[#ff385c] bg-ftu-red-50 dark:bg-[#ff385c]/5' : 'text-gray-400 dark:text-[#a0a0b0] hover:text-gray-900 dark:hover:text-white'}`}>💭 Cảm xúc</button>
                          </div>

                          {!showFeelingPicker ? (
                            <>
                              {/* Emoji Category Tabs */}
                              <div className="flex overflow-x-auto hide-scrollbar border-b border-gray-100 dark:border-white/5 px-1">
                                {Object.entries(EMOJI_CATEGORIES).map(([key, cat]) => (
                                  <button key={key} onClick={() => setEmojiTab(key)} className={`shrink-0 px-3 py-2 text-[16px] transition-colors rounded-lg m-1 ${emojiTab === key ? 'bg-gray-100 dark:bg-white/10' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`} title={cat.label}>
                                    {cat.emojis[0]}
                                  </button>
                                ))}
                              </div>
                              {/* Emoji Grid */}
                              <div className="p-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-8 gap-0.5">
                                  {EMOJI_CATEGORIES[emojiTab]?.emojis.map((emoji, i) => (
                                    <button key={i} onClick={() => insertEmoji(emoji)} className="w-9 h-9 flex items-center justify-center text-[20px] hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors hover:scale-125 transform duration-150">
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </>
                          ) : (
                            /* Feeling Grid */
                            <div className="p-3 max-h-[250px] overflow-y-auto custom-scrollbar">
                              <div className="grid grid-cols-2 gap-2">
                                {FEELINGS.map((f, i) => (
                                  <button key={i} onClick={() => { setFeeling(`${f.emoji} ${f.label}`); setShowEmojiPicker(false); }} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[13px] font-bold transition-all border ${feeling === `${f.emoji} ${f.label}` ? 'border-ftu-red-700 dark:border-[#ff385c] bg-ftu-red-50 dark:bg-[#ff385c]/20 text-gray-900 dark:text-white' : 'border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-[#a0a0b0] hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20'}`}>
                                    <span className="text-[18px]">{f.emoji}</span> {f.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4 gap-2 flex-wrap px-2">
                  <div className="flex gap-2 flex-1 items-center">
                    <select 
                      value={postTag} 
                      onChange={(e) => setPostTag(e.target.value)}
                      className="bg-gray-100 dark:bg-black/40 text-[14px] font-bold text-ftu-red-700 dark:text-[#c8a0e0] hover:bg-gray-200 dark:hover:bg-black/60 px-4 py-2 rounded-xl cursor-pointer outline-none transition-colors border border-gray-200 dark:border-white/5 appearance-none shadow-sm"
                    >
                      {TAGS.map(t => <option key={t} value={t} className="bg-white dark:bg-[#141414] text-gray-900 dark:text-white">{t}</option>)}
                    </select>
  
                    <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 px-4 py-2 rounded-xl transition-colors border border-transparent hover:border-gray-200 dark:hover:border-white/10">
                      <input type="checkbox" className="w-4 h-4 rounded text-ftu-red-700 dark:text-[#ff385c] focus:ring-ftu-red-700/50 dark:focus:ring-[#ff385c]/50 bg-gray-100 dark:bg-black/40 border-gray-300 dark:border-white/20 cursor-pointer" checked={isAnonymous} onChange={() => setIsAnonymous(!isAnonymous)} />
                      <span className="text-[14px] font-bold text-gray-400 dark:text-[#a0a0b0] whitespace-nowrap">Ẩn danh</span>
                    </label>
                  </div>
  
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePost}
                    disabled={(!postContent.trim() && !imageFile) || isPosting}
                    className="relative overflow-hidden rounded-xl p-[2px] disabled:opacity-50 transition-all group"
                  >
                    <div className={`absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_70%,#B91C1C,#DC2626,#EF4444)] dark:bg-[conic-gradient(from_0deg,transparent_70%,#00e5ff,#d44df0,#ff385c)] ${(postContent.trim() || imageFile) ? 'animate-[spin_2.5s_linear_infinite]' : 'opacity-0'} transition-opacity duration-300`}></div>
                    <div className="relative bg-gradient-to-r from-gray-100 to-gray-300 group-hover:from-white group-hover:to-white text-black rounded-[10px] px-6 py-2 text-[15px] font-extrabold h-full w-full flex items-center justify-center transition-all shadow-sm dark:shadow-[0_4px_15px_rgba(255,255,255,0.15)]">
                      {isPosting ? 'Đang...' : 'Đăng bài'}
                    </div>
                  </motion.button>
                </div>
              </div>
  
              {/* Danh sách Bài viết */}
              <div className="space-y-8">
                <AnimatePresence mode="popLayout">
                  {posts.map((post) => {
                    const hasLiked = post.likedBy && post.likedBy.includes(user?.uid || '');
                    const isExpanded = !!expandedComments[post.id];
                    
                    return (
                      <motion.div 
                        key={post.id} 
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-white/[0.02] backdrop-blur-xl sm:rounded-[24px] shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)] border-x-0 sm:border border-gray-200 dark:border-white/10 overflow-hidden group"
                      >
                        {/* Post Header */}
                        <div className="p-6 flex items-start justify-between">
                          <div className="flex space-x-4 items-center">
                            <Link href={post.isAnonymous ? "#" : `/profile/${post.uid}`} className="flex-shrink-0 cursor-pointer relative">
                              {post.isAnonymous ? (
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 dark:from-gray-700 dark:to-gray-900 border-2 border-gray-200 dark:border-white/20 flex items-center justify-center text-xl shadow-inner">
                                  🕵️
                                </div>
                              ) : (
                                <img src={post.authorPhotoUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + post.authorName} alt="Avatar" className="h-12 w-12 rounded-full border-2 border-gray-200 dark:border-white/20 object-cover shadow-sm"/>
                              )}
                            </Link>
                            <div>
                              <div className="flex items-center flex-wrap gap-2 mb-1">
                                <Link href={post.isAnonymous ? "#" : `/profile/${post.uid}`} className="text-[17px] font-extrabold text-gray-900 dark:text-white cursor-pointer hover:text-ftu-red-700 dark:hover:text-transparent dark:hover:bg-clip-text dark:hover:bg-gradient-to-r dark:hover:from-white dark:hover:to-[#c8a0e0] transition-all">
                                  {post.isAnonymous ? 'Sinh viên ẩn danh' : post.authorName}
                                </Link>
                                {!post.isAnonymous && post.authorBadge && (
                                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${post.authorBadge.color}`}>
                                    {post.authorBadge.icon} {post.authorBadge.label}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center text-[13px] text-gray-400 dark:text-[#a0a0b0] font-medium gap-2">
                                <span className="hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">{new Date(post.createdAt).toLocaleString('vi-VN')}</span>
                                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-white/20"></span>
                                <span className="font-extrabold text-ftu-red-700 dark:text-[#c8a0e0] uppercase tracking-wider">{post.tag}</span>
                              </div>
                            </div>
                          </div>
                          <button className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center transition-colors">
                            <svg className="w-5 h-5 text-gray-400 dark:text-white/70" fill="currentColor" viewBox="0 0 24 24"><path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                          </button>
                        </div>
                        
                        {/* Feeling */}
                        {post.feeling && (
                          <div className="px-6 pb-2">
                            <span className="text-[14px] text-gray-400 dark:text-[#a0a0b0] font-medium">— Đang cảm thấy {post.feeling}</span>
                          </div>
                        )}

                        {/* Post Content */}
                        <div className="px-6 pb-4 text-[16px] text-gray-700 dark:text-[#e0e0e0] whitespace-pre-wrap leading-relaxed font-medium">
                          {String(post.content || '').split(/(@\S+|#\S+)/).map((part, i) => {
                            if (part.startsWith('@') || part.startsWith('#')) {
                              return <span key={i} className="text-ftu-red-700 dark:text-[#00e5ff] hover:underline cursor-pointer font-bold">{part}</span>;
                            }
                            return part;
                          })}
                        </div>

                        {/* Post Image */}
                        {post.imageUrl && (
                          <div className="px-6 pb-4">
                            <img src={post.imageUrl} className="rounded-2xl max-h-[500px] w-auto border border-gray-200 dark:border-white/10" alt="Post attachment" />
                          </div>
                        )}

                        {/* Post File Attachment */}
                        {post.fileUrl && post.fileName && (
                          <div className="px-6 pb-4">
                            <a href={post.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 rounded-2xl px-5 py-4 transition-all group">
                              <span className="text-3xl">{(() => { const ext = (post.fileName || '').split('.').pop()?.toLowerCase(); if (ext === 'pdf') return '📄'; if (['doc','docx'].includes(ext||'')) return '📝'; if (['ppt','pptx'].includes(ext||'')) return '📊'; return '📎'; })()}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-[15px] font-bold text-gray-900 dark:text-white truncate group-hover:text-ftu-red-700 dark:group-hover:text-[#00e5ff] transition-colors">{post.fileName}</p>
                                <p className="text-[12px] text-gray-400 dark:text-[#a0a0b0]">Nhấn để tải xuống</p>
                              </div>
                              <svg className="w-5 h-5 text-gray-400 dark:text-[#a0a0b0] group-hover:text-ftu-red-700 dark:group-hover:text-[#00e5ff] transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                            </a>
                          </div>
                        )}
                        
                        {/* Engagement Stats */}
                        <div className="px-6 py-3 flex items-center justify-between text-[14px] text-gray-400 dark:text-[#a0a0b0] border-b border-gray-100 dark:border-white/5">
                          <div className="flex items-center gap-2 cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors font-semibold">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-ftu-red-600 to-ftu-red-700 dark:from-[#ff385c] dark:to-[#d44df0] flex items-center justify-center shadow-sm dark:shadow-[0_0_10px_rgba(255,56,92,0.4)]">
                              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                            </div>
                            <span className="text-gray-900 dark:text-white">{post.likes || 0}</span>
                          </div>
                          <div className="flex gap-4 font-medium">
                            <span className="cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors" onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: true }))}>
                              {post.comments?.length || 0} bình luận
                            </span>
                            <span className="cursor-pointer hover:text-gray-900 dark:hover:text-white transition-colors">0 chia sẻ</span>
                          </div>
                        </div>
  
                        {/* Action Buttons */}
                        <div className="px-4 py-2 flex items-center justify-between gap-2 bg-gray-50/50 dark:bg-white/[0.01]">
                          <button 
                            onClick={() => handleLike(post.id, post.likedBy || [], post.likes || 0)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors font-bold text-[15px] ${hasLiked ? 'text-ftu-red-700 dark:text-[#ff385c]' : 'text-gray-400 dark:text-[#a0a0b0] hover:text-gray-900 dark:hover:text-white'}`}
                          >
                            <svg className={`w-5 h-5 ${hasLiked ? 'fill-current drop-shadow-[0_0_8px_rgba(255,56,92,0.6)]' : 'fill-none stroke-current'}`} strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                            Thích
                          </button>
                          <button 
                            onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !isExpanded }))}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors font-bold text-[15px] text-gray-400 dark:text-[#a0a0b0] hover:text-gray-900 dark:hover:text-white"
                          >
                            <svg className="w-5 h-5 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                            Bình luận
                          </button>
                          <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors font-bold text-[15px] text-gray-400 dark:text-[#a0a0b0] hover:text-gray-900 dark:hover:text-white">
                            <svg className="w-5 h-5 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                            Chia sẻ
                          </button>
                        </div>
  
                        {/* Comments Section */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20"
                            >
                              <div className="p-6 space-y-6">
                                {(post.comments || []).map((cmt, idx) => (
                                  <div key={idx} className="flex gap-4">
                                    <Link href={`/profile/${cmt.uid}`}>
                                      <img src={cmt.authorPhotoUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + cmt.authorName} alt="Avatar" className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/20 shrink-0 object-cover cursor-pointer hover:border-gray-400 dark:hover:border-white/50 transition-colors"/>
                                    </Link>
                                    <div className="flex-1">
                                      <div className="bg-gray-100 dark:bg-white/5 rounded-2xl px-5 py-3 text-[15px] border border-gray-200 dark:border-white/10 shadow-sm inline-block">
                                        <Link href={`/profile/${cmt.uid}`} className="font-extrabold text-gray-900 dark:text-white cursor-pointer hover:text-ftu-red-700 dark:hover:text-transparent dark:hover:bg-clip-text dark:hover:bg-gradient-to-r dark:hover:from-white dark:hover:to-[#c8a0e0] block mb-1 transition-all">{cmt.authorName}</Link>
                                        <p className="text-gray-700 dark:text-[#e0e0e0] leading-relaxed font-medium">{cmt.content}</p>
                                      </div>
                                      <div className="flex gap-4 px-3 mt-2 text-[13px] font-bold text-gray-400 dark:text-[#a0a0b0]">
                                        <span className="hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors">Thích</span>
                                        <span className="hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors">Phản hồi</span>
                                        <span className="font-medium">{new Date(cmt.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                
                                <div className="flex gap-4 items-start mt-6 pt-2">
                                  <img src={profile?.photoURL || user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + profile?.name} alt="Avatar" className="w-10 h-10 rounded-full border border-gray-200 dark:border-white/20 shrink-0 object-cover mt-0.5 cursor-pointer"/>
                                  <div className="flex-1 bg-gray-100 dark:bg-black/40 rounded-full flex items-center px-5 py-2.5 border border-gray-200 dark:border-white/10 focus-within:border-ftu-red-700 dark:focus-within:border-[#00e5ff] focus-within:shadow-sm dark:focus-within:shadow-[0_0_10px_rgba(0,229,255,0.2)] transition-all">
                                    <input
                                      type="text"
                                      placeholder="Viết bình luận công khai..."
                                      value={commentInputs[post.id] || ''}
                                      onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                      onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                                      className="flex-1 bg-transparent border-none outline-none text-[15px] placeholder-gray-400 dark:placeholder-[#6a6a6a] text-gray-900 dark:text-white py-1 font-medium"
                                    />
                                    <button
                                      onClick={() => handleComment(post.id)}
                                      disabled={!commentInputs[post.id]?.trim()}
                                      className="p-1.5 disabled:opacity-50 text-ftu-red-700 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors flex items-center justify-center shrink-0 ml-2"
                                    >
                                      <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                
                {posts.length === 0 && (
                  <div className="text-center py-20 bg-white dark:bg-white/[0.03] backdrop-blur-xl sm:rounded-[24px] border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-lg">
                    <div className="text-6xl mb-6 drop-shadow-none dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] animate-pulse">📝</div>
                    <p className="text-gray-400 dark:text-[#a0a0b0] font-extrabold text-[20px] max-w-sm mx-auto">Chưa có bài đăng nào. Hãy là người đầu tiên lên tiếng!</p>
                  </div>
                )}
              </div>
            </div>
  
            {/* Cột Phải: Suggestions & Events (Right Sidebar) */}
            <div className="hidden lg:block lg:col-span-3 xl:col-span-3 pr-2 xl:pr-4">
              <div className="sticky top-28 flex flex-col gap-8 pl-4">
                
                {/* Sự kiện nổi bật */}
                <div className="relative bg-gradient-to-br from-ftu-red-600 to-ftu-red-700 dark:from-[#6a4cf5]/80 dark:to-[#d44df0]/80 backdrop-blur-2xl text-white p-8 rounded-[24px] shadow-md dark:shadow-[0_8px_30px_rgba(106,76,245,0.3)] border border-ftu-red-500/30 dark:border-white/20 overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[50px] rounded-full pointer-events-none"></div>
                  <div className="flex justify-between items-center mb-8 relative z-10">
                    <h3 className="font-extrabold text-[20px] tracking-tight text-white drop-shadow-md">Sự kiện nổi bật</h3>
                    <Link href="/events" className="text-white text-[13px] font-extrabold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all border border-white/20 backdrop-blur-md shadow-sm hover:shadow-[0_0_10px_rgba(255,255,255,0.2)] uppercase">Tất cả</Link>
                  </div>
                  <div className="space-y-4 relative z-10">
                    <div className="flex gap-4 items-start cursor-pointer hover:bg-white/15 p-4 -mx-4 rounded-2xl transition-all group/event border border-transparent hover:border-white/20 hover:shadow-lg">
                      <div className="flex flex-col items-center bg-white/20 dark:bg-black/20 rounded-xl border border-white/20 dark:border-white/10 w-16 h-18 overflow-hidden shrink-0 shadow-inner">
                        <span className="bg-gradient-to-r from-white/20 to-white/10 dark:from-[#00e5ff]/30 dark:to-[#0099ff]/30 text-white text-[11px] font-extrabold uppercase tracking-wider w-full text-center py-1.5 backdrop-blur-md">Th 10</span>
                        <span className="text-white font-extrabold text-[24px] leading-none my-2 drop-shadow-md">24</span>
                      </div>
                      <div className="pt-0.5">
                        <h4 className="text-[15px] font-extrabold text-white leading-snug group-hover/event:text-transparent group-hover/event:bg-clip-text group-hover/event:bg-gradient-to-r group-hover/event:from-white group-hover/event:to-blue-200 transition-all">Ngày hội Định hướng Tân sinh viên FTU</h4>
                        <p className="text-[13px] text-white/80 mt-2 font-medium flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-[#00e676] rounded-full shadow-[0_0_5px_#00e676]"></span>1,2K người quan tâm</p>
                      </div>
                    </div>
                    
                    <div className="border-b border-white/10"></div>

                    <div className="flex gap-4 items-start cursor-pointer hover:bg-white/15 p-4 -mx-4 rounded-2xl transition-all group/event border border-transparent hover:border-white/20 hover:shadow-lg">
                      <div className="flex flex-col items-center bg-white/20 dark:bg-black/20 rounded-xl border border-white/20 dark:border-white/10 w-16 h-18 overflow-hidden shrink-0 shadow-inner">
                        <span className="bg-gradient-to-r from-white/20 to-white/10 dark:from-[#ff385c]/30 dark:to-[#d44df0]/30 text-white text-[11px] font-extrabold uppercase tracking-wider w-full text-center py-1.5 backdrop-blur-md">Th 11</span>
                        <span className="text-white font-extrabold text-[24px] leading-none my-2 drop-shadow-md">05</span>
                      </div>
                      <div className="pt-0.5">
                        <h4 className="text-[15px] font-extrabold text-white leading-snug group-hover/event:text-transparent group-hover/event:bg-clip-text group-hover/event:bg-gradient-to-r group-hover/event:from-white group-hover/event:to-pink-200 transition-all">Workshop: Lộ trình trở thành Global Citizen</h4>
                        <p className="text-[13px] text-white/80 mt-2 font-medium flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-[#ff385c] rounded-full shadow-[0_0_5px_#ff385c]"></span>Trực tuyến</p>
                      </div>
                    </div>
                  </div>
                </div>
  
                {/* Gợi ý kết nối / Người liên hệ */}
                <div className="bg-white dark:bg-white/[0.03] backdrop-blur-2xl rounded-[24px] p-6 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
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
  
          </div>
        </div>
  
        <ConnectModal
          isOpen={isConnectModalOpen}
          onClose={() => setIsConnectModalOpen(false)}
          targetUser={selectedUserToConnect}
        />
      </div>
    </div>
  );
}
