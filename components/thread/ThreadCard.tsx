"use client";

import React, { useState } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Thread } from '@/lib/types';
import TierBadge from '@/components/ui/TierBadge';

type Props = {
  thread: Thread;
};

export default function ThreadCard({ thread }: Props) {
  const userUid = auth.currentUser?.uid || null;
  const [localUpvotes, setLocalUpvotes] = useState<number>(thread.upvotes || 0);
  const [localDownvotes, setLocalDownvotes] = useState<number>(thread.downvotes || 0);
  const [upvoted, setUpvoted] = useState<boolean>((thread.upvotedBy || []).includes(userUid || ''));
  const [downvoted, setDownvoted] = useState<boolean>((thread.downvotedBy || []).includes(userUid || ''));
  const [loading, setLoading] = useState(false);

  const onToggleUpvote = async () => {
    if (!userUid) return; // not logged in
    setLoading(true);
    // optimistic
    if (upvoted) {
      setLocalUpvotes(v => Math.max(0, v - 1));
      setUpvoted(false);
    } else {
      setLocalUpvotes(v => v + 1);
      setUpvoted(true);
      if (downvoted) {
        setLocalDownvotes(v => Math.max(0, v - 1));
        setDownvoted(false);
      }
    }

    try {
      const ref = doc(db, 'threads', thread.id);
      if (upvoted) {
        // undo
        await updateDoc(ref, {
          upvotes: increment(-1),
          upvotedBy: arrayRemove(userUid)
        });
      } else {
        await updateDoc(ref, {
          upvotes: increment(1),
          upvotedBy: arrayUnion(userUid),
          // remove downvote if existed
          downvotes: downvoted ? increment(-1) : undefined,
          downvotedBy: downvoted ? arrayRemove(userUid) : undefined
        });
      }
    } catch (e) {
      // revert optimistic
      if (upvoted) {
        setLocalUpvotes(v => v + 1);
        setUpvoted(true);
      } else {
        setLocalUpvotes(v => Math.max(0, v - 1));
        setUpvoted(false);
        if (downvoted) {
          setLocalDownvotes(v => v + 1);
          setDownvoted(true);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const onToggleDownvote = async () => {
    if (!userUid) return;
    setLoading(true);
    if (downvoted) {
      setLocalDownvotes(v => Math.max(0, v - 1));
      setDownvoted(false);
    } else {
      setLocalDownvotes(v => v + 1);
      setDownvoted(true);
      if (upvoted) {
        setLocalUpvotes(v => Math.max(0, v - 1));
        setUpvoted(false);
      }
    }

    try {
      const ref = doc(db, 'threads', thread.id);
      if (downvoted) {
        await updateDoc(ref, {
          downvotes: increment(-1),
          downvotedBy: arrayRemove(userUid)
        });
      } else {
        await updateDoc(ref, {
          downvotes: increment(1),
          downvotedBy: arrayUnion(userUid),
          upvotes: upvoted ? increment(-1) : undefined,
          upvotedBy: upvoted ? arrayRemove(userUid) : undefined
        });
      }
    } catch (e) {
      // revert
      if (downvoted) {
        setLocalDownvotes(v => v + 1);
        setDownvoted(true);
      } else {
        setLocalDownvotes(v => Math.max(0, v - 1));
        setDownvoted(false);
        if (upvoted) {
          setLocalUpvotes(v => v + 1);
          setUpvoted(true);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="bg-white dark:bg-[#0b0b0c] rounded-xl shadow p-4">
      <header className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg">{thread.title}</h3>
          <div className="text-sm text-gray-500">{thread.authorName || (thread.anonymous ? `Anonymous · Tier ${thread.authorTier}` : '')}</div>
        </div>
        <div className="flex items-center gap-2">
          {thread.authorTier && <TierBadge tier={thread.authorTier} />}
        </div>
      </header>

      <div className="mt-3 text-gray-700 dark:text-gray-200">{thread.content}</div>

      <div className="mt-4 flex items-center gap-3">
        <button onClick={onToggleUpvote} disabled={loading} className={`px-3 py-1 rounded ${upvoted ? 'bg-ftu-red-600 text-white' : 'bg-gray-100'}`}>
          ▲ {localUpvotes}
        </button>
        <button onClick={onToggleDownvote} disabled={loading} className={`px-3 py-1 rounded ${downvoted ? 'bg-gray-800 text-white' : 'bg-gray-100'}`}>
          ▼ {localDownvotes}
        </button>
        <div className="ml-auto text-sm text-gray-400">{thread.tags?.map(t=> <span key={t} className="mr-2 text-xs px-2 py-1 bg-ftu-red-50 rounded">{t}</span>)}</div>
      </div>
    </article>
  );
}
