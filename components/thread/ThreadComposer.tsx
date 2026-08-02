"use client";

import React, { useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { THREAD_TAGS, COMPANIES } from '@/lib/constants/threadTags';
import posthog from 'posthog-js';

type Props = {
  user: any;
  profile: any;
  onPostCreated?: () => void;
};

export default function ThreadComposer({ user, profile, onPostCreated }: Props) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [company, setCompany] = useState('');
  const [anonymous, setAnonymous] = useState<boolean>(profile?.tier === 1);
  const [isPosting, setIsPosting] = useState(false);

  const toggleTag = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const submit = async () => {
    if (!user || !title.trim()) return;
    if (title.length > 200) return alert('Title max 200 characters');
    setIsPosting(true);
    try {
      const doc = await addDoc(collection(db, 'threads'), {
        title: title.trim(),
        content: content.trim(),
        tags,
        company: company || null,
        authorUid: user.uid,
        authorName: profile?.name || 'Unknown',
        authorPhotoURL: profile?.photoURL || user.photoURL || null,
        authorTier: profile?.tier || 1,
        anonymous,
        upvotes: 0,
        downvotes: 0,
        upvotedBy: [],
        downvotedBy: [],
        views: 0,
        commentCount: 0,
        status: 'published',
        moderationFlags: [],
        hotScore: 0,
        createdAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString()
      });

      // PostHog event
      try { posthog.capture('thread_create', { author_tier: profile?.tier || 1, anonymous, tags, company: company || null }); } catch (e) {}

      setTitle(''); setContent(''); setTags([]); setCompany(''); setAnonymous(profile?.tier === 1);
      if (onPostCreated) onPostCreated();
    } catch (e) {
      console.error(e);
      alert('Failed to create thread');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#151720] sm:rounded-[24px] shadow p-6 mb-8">
      <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Tiêu đề (max 200 ký tự)" maxLength={200} className="w-full mb-3 p-3 border rounded-lg" />
      <TextareaAutosize value={content} onChange={(e)=>setContent(e.target.value)} minRows={3} placeholder="Nội dung (tuỳ chọn)" className="w-full p-3 border rounded-lg mb-3" />
      <div className="flex gap-2 flex-wrap mb-3">
        {THREAD_TAGS.map(t => (
          <button key={t} onClick={()=>toggleTag(t)} className={`px-3 py-1 rounded ${tags.includes(t)?'bg-ftu-red-600 text-white':'bg-gray-100 text-gray-700'}`}>{t}</button>
        ))}
      </div>
      <div className="mb-3">
        <input value={company} onChange={(e)=>setCompany(e.target.value)} list="companies" placeholder="Company (autocomplete)" className="p-2 border rounded w-full" />
        <datalist id="companies">
          {COMPANIES.map(c => <option key={c} value={c} />)}
        </datalist>
      </div>
      <label className="flex items-center gap-2 mb-3">
        <input type="checkbox" checked={anonymous} onChange={()=>setAnonymous(a=>!a)} /> <span className="text-sm">Đăng ẩn danh</span>
      </label>
      <div className="flex justify-end">
        <button onClick={submit} disabled={!title.trim() || isPosting} className="px-4 py-2 bg-ftu-red-600 text-white rounded">{isPosting? 'Đang...' : 'Đăng thread'}</button>
      </div>
    </div>
  );
}
