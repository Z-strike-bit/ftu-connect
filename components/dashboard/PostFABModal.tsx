"use client";
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PostComposer from './PostComposer';

interface PostFABModalProps {
  user: any;
  profile: any;
  suggestions: any[];
}

const PostFABModal: React.FC<PostFABModalProps> = ({ user, profile, suggestions }) => {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  const handlePostCreated = useCallback(() => {
    setIsPostModalOpen(false);
  }, []);

  return (
    <>
      {/* Floating Action Button (FAB) for Creating Post */}
      <div className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 z-[90]">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00e5ff] to-[#d44df0] rounded-full blur-md opacity-60 group-hover:opacity-100 group-hover:blur-lg animate-pulse transition-all duration-500"></div>
          <button 
            onClick={() => setIsPostModalOpen(true)}
            className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#00e5ff] to-[#d44df0] text-black shadow-[0_8px_20px_rgba(0,229,255,0.3)] flex items-center justify-center hover:scale-110 transition-transform duration-300 z-10 border border-white/20"
          >
            <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Post Composer Modal */}
      <AnimatePresence>
        {isPostModalOpen && (
          <div className="fixed inset-0 z-[9999] overflow-y-auto custom-scrollbar">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/80"
              onClick={() => setIsPostModalOpen(false)}
            />
            <div className="min-h-full flex items-center justify-center p-4 sm:p-6 relative z-10">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.15 }}
                className="relative w-full max-w-[680px]"
              >
                <div className="absolute -top-12 right-0">
                  <button onClick={() => setIsPostModalOpen(false)} className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors border border-white/10">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-transparent rounded-[24px]">
                  <PostComposer user={user} profile={profile} suggestions={suggestions} onPostCreated={handlePostCreated} />
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default React.memo(PostFABModal);
