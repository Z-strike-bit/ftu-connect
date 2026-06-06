"use client";
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import TextareaAutosize from 'react-textarea-autosize';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const TAGS = ['Thảo luận', 'Học tập', 'Sự kiện', 'CLB', 'Tuyển dụng', 'Tâm sự', 'Tìm đồ rơi', 'Khác'];

const EMOJI_CATEGORIES: Record<string, { label: string, emojis: string[] }> = {
  smileys: {
    label: 'Cảm xúc & Nụ cười',
    emojis: ['😀','😃','😄','😁','😆','😅','😂','🤣','🥲','☺️','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎','🥸','🤩','🥳','😏','😒','😞','😔','worried','😕','🙁','☹️','😣','😖','😫','😩','🥺','😢','😭','😤','😠','😡','🤬','🤯','😳','🥵','🥶','😱','😨','😰','😥','😓','🤗','🤔','🤭','🤫','🤥','😶','😐','😑','😬','🙄','😯','😦','😧','😮','😲','🥱','😴','🤤','😪','😵','🤐','🥴','🤢','🤮','🤧','😷','🤒','🤕']
  },
  hands: {
    label: 'Cử chỉ',
    emojis: ['👋','🤚','🖐️','✋','🖖','👌','🤌','🤏','✌️','🤞','🫰','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🦾','🦿','🦵','🦶','👂','🦻','👃','🫀','🫁','🧠','🦷','🦴','👀','👁️','👅','👄']
  },
  hearts: {
    label: 'Tình yêu',
    emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❤️‍🔥','❤️‍🩹','❣️','💕','💞','💓','💗','💖','💘','💝']
  },
  objects: {
    label: 'Đồ vật & Ký hiệu',
    emojis: ['🎓','📚','💻','📱','🎮','🎧','💡','✨','⭐','🌟','🔥','💯','🎵','🎶','🎉','🎊','🎈','🎂','🏆','🥇','✅','❌','❓','❗']
  }
};

const FEELINGS = [
  { emoji: '😀', label: 'hạnh phúc' },
  { emoji: '😎', label: 'ngầu' },
  { emoji: '📚', label: 'tập trung học' },
  { emoji: '😴', label: 'buồn ngủ' },
  { emoji: '🤯', label: 'áp lực' },
  { emoji: '🎉', label: 'hào hứng' },
  { emoji: '☕', label: 'thèm cà phê' },
  { emoji: '🍜', label: 'đói bụng' },
];

function getBadge(points: number) {
  if (points >= 1000) return { label: 'Top 1% Tinh hoa', color: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-[0_0_10px_rgba(234,179,8,0.5)]', icon: '👑' };
  if (points >= 500) return { label: 'Người nổi tiếng', color: 'bg-ftu-red-100 text-ftu-red-800 dark:bg-[#d44df0]/20 dark:text-[#d44df0]', icon: '🌟' };
  if (points >= 200) return { label: 'Thành viên năng nổ', color: 'bg-blue-100 text-blue-800 dark:bg-[#00e5ff]/20 dark:text-[#00e5ff]', icon: '🔥' };
  return null;
}

const getFileIcon = (fileName: string | null) => {
  if (!fileName) return '📎';
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return '📄';
  if (['doc', 'docx'].includes(ext || '')) return '📝';
  if (['ppt', 'pptx'].includes(ext || '')) return '📊';
  if (['xls', 'xlsx'].includes(ext || '')) return '📈';
  if (['zip', 'rar'].includes(ext || '')) return '🗜️';
  return '📎';
};

interface PostComposerProps {
  user: any;
  profile: any;
  suggestions: any[];
  onPostCreated?: () => void;
}

const PostComposer: React.FC<PostComposerProps> = ({ user, profile, suggestions, onPostCreated }) => {
  const [postContent, setPostContent] = useState('');
  const [postTag, setPostTag] = useState('Thảo luận');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFeelingPicker, setShowFeelingPicker] = useState(false);
  const [emojiTab, setEmojiTab] = useState('smileys');
  const [feeling, setFeeling] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  
  // Mentions
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setPostContent(val);
    const lastWord = val.split(' ').pop();
    if (lastWord?.startsWith('@')) {
      setShowMentions(true);
      setMentionQuery(lastWord.slice(1).toLowerCase());
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (name: string) => {
    const words = postContent.split(' ');
    words.pop();
    words.push(`@${name} `);
    setPostContent(words.join(' '));
    setShowMentions(false);
  };

  const insertEmoji = (emoji: string) => {
    setPostContent(prev => prev + emoji);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAttachedFile(file);
      setAttachedFileName(file.name);
    }
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
      setPostTag('Thảo luận');
      setIsAnonymous(false);
      setImageFile(null);
      setImagePreview(null);
      setAttachedFile(null);
      setAttachedFileName(null);
      setFeeling(null);
      setShowEmojiPicker(false);
      
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (error) {
      console.error("Error adding post: ", error);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#151720] sm:rounded-[24px] shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.8)] border-x-0 sm:border border-gray-100 dark:border-[#2A2D3A] p-6 mb-8 relative z-20 group/postbox transition-colors">
      {/* Decorative LED Strip */}
      <div className="absolute inset-0 sm:rounded-[24px] overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[3px]">
          <div className="w-full h-full bg-gradient-to-r from-ftu-red-600 via-ftu-red-700 to-ftu-red-600 dark:bg-[linear-gradient(90deg,#00e5ff,#d44df0,#ff385c,#d44df0,#00e5ff)] opacity-60 dark:opacity-80 animate-led-run shadow-none dark:shadow-[0_0_10px_rgba(212,77,240,0.5)] group-focus-within/postbox:animate-led-run-fast dark:group-focus-within/postbox:shadow-[0_0_20px_rgba(212,77,240,0.8)] group-focus-within/postbox:opacity-100 transition-all duration-300"></div>
        </div>
      </div>
      <div className="flex gap-3 sm:gap-4 border-b border-gray-200 dark:border-white/10 pb-5">
        <Link href={user ? `/profile/${user.uid}` : "#"}>
          <img src={profile?.photoURL || user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + profile?.name} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-gray-200 dark:border-white/20 shadow-sm shrink-0 object-cover cursor-pointer hover:border-gray-400 dark:hover:border-white/50 transition-colors"/>
        </Link>
        <div className="flex-1 bg-gray-50/50 shadow-inner border border-gray-100 hover:bg-gray-50 dark:bg-[#0B0C10] dark:hover:bg-[#10121A] transition-colors rounded-3xl px-5 flex flex-col justify-center cursor-text dark:border-[#2A2D3A] dark:hover:border-[#3A3D4A] relative">
          <TextareaAutosize 
            minRows={1}
            maxRows={8}
            className="w-full bg-transparent border-none outline-none resize-none text-[16px] placeholder-gray-400 dark:placeholder-[#8a8a9a] text-gray-900 dark:text-white font-medium py-3 custom-scrollbar"
            placeholder={`Bạn đang nghĩ gì thế, ${String(profile?.name || '').split(' ').pop()}?`}
            value={postContent}
            onChange={handleContentChange}
          />
          
          <AnimatePresence>
            {showMentions && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute left-0 top-full mt-2 w-[280px] bg-white dark:bg-[#1A1D27] border border-gray-200 dark:border-[#2A2D3A] rounded-2xl shadow-lg dark:shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden z-50"
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

          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full mt-3 right-0 w-[320px] bg-white dark:bg-[#1a1a2e] border border-gray-200 dark:border-white/10 rounded-2xl shadow-lg dark:shadow-[0_10px_60px_rgba(0,0,0,0.9)] overflow-hidden z-50"
              >
                <div className="flex border-b border-gray-200 dark:border-white/10">
                  <button onClick={() => setShowFeelingPicker(false)} className={`flex-1 py-3 text-[13px] font-bold transition-colors ${!showFeelingPicker ? 'text-ftu-red-700 dark:text-[#ff385c] border-b-2 border-ftu-red-700 dark:border-[#ff385c] bg-ftu-red-50 dark:bg-[#ff385c]/5' : 'text-gray-400 dark:text-[#a0a0b0] hover:text-gray-900 dark:hover:text-white'}`}>😊 Emoji</button>
                  <button onClick={() => setShowFeelingPicker(true)} className={`flex-1 py-3 text-[13px] font-bold transition-colors ${showFeelingPicker ? 'text-ftu-red-700 dark:text-[#ff385c] border-b-2 border-ftu-red-700 dark:border-[#ff385c] bg-ftu-red-50 dark:bg-[#ff385c]/5' : 'text-gray-400 dark:text-[#a0a0b0] hover:text-gray-900 dark:hover:text-white'}`}>💭 Cảm xúc</button>
                </div>

                {!showFeelingPicker ? (
                  <>
                    <div className="flex overflow-x-auto hide-scrollbar border-b border-gray-100 dark:border-white/5 px-1">
                      {Object.entries(EMOJI_CATEGORIES).map(([key, cat]) => (
                        <button key={key} onClick={() => setEmojiTab(key)} className={`shrink-0 px-3 py-2 text-[16px] transition-colors rounded-lg m-1 ${emojiTab === key ? 'bg-gray-100 dark:bg-white/10' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`} title={cat.label}>
                          {cat.emojis[0]}
                        </button>
                      ))}
                    </div>
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
          disabled={(!postContent.trim() && !imageFile && !attachedFile) || isPosting}
          className="relative overflow-hidden rounded-xl p-[2px] disabled:opacity-50 transition-all group"
        >
          <div className={`absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_70%,#B91C1C,#DC2626,#EF4444)] dark:bg-[conic-gradient(from_0deg,transparent_70%,#00e5ff,#d44df0,#ff385c)] ${(!isPosting && (postContent.trim() || imageFile)) ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}></div>
          <div className="relative bg-gradient-to-r from-gray-100 to-gray-300 group-hover:from-white group-hover:to-white text-black rounded-[10px] px-6 py-2 text-[15px] font-extrabold h-full w-full flex items-center justify-center transition-all shadow-sm dark:shadow-[0_4px_15px_rgba(255,255,255,0.15)]">
            {isPosting ? 'Đang...' : 'Đăng bài'}
          </div>
        </motion.button>
      </div>
    </div>
  );
};

export default React.memo(PostComposer);
