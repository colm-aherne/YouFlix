'use client';

import React, { useRef, useState } from 'react';
import { useAuthAndSync } from '@/context/AuthAndSyncContext';
import { VideoItem } from '@/types';
import { VideoCard } from './VideoCard';
import { ALL_VIDEOS_MAP } from '@/data/defaultCategories';
import { History, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

interface ContinueWatchingRowProps {
  onOpenInfo: (video: VideoItem) => void;
}

export function ContinueWatchingRow({ onOpenInfo }: ContinueWatchingRowProps) {
  const { continueWatching, currentProfile } = useAuthAndSync();
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  if (!continueWatching || continueWatching.length === 0) {
    return null;
  }

  const handleScroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      const targetScroll = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      rowRef.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
    }
  };

  const handleScrollEvent = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setShowLeftArrow(scrollLeft > 20);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
    }
  };

  return (
    <section className="relative my-6 sm:my-8 px-4 sm:px-6 lg:px-8 space-y-2">
      {/* Row Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <History className="w-5 h-5 text-red-500" />
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Continue Watching for {currentProfile?.name || 'You'}</span>
            <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Cloud Synced
            </span>
          </h3>
          <span className="text-xs text-neutral-400 font-medium">({continueWatching.length})</span>
        </div>
      </div>

      {/* Slider Area */}
      <div className="relative group/row">
        {showLeftArrow && (
          <button
            onClick={() => handleScroll('left')}
            className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-30 w-9 sm:w-11 h-20 sm:h-24 bg-black/80 hover:bg-black/95 text-white flex items-center justify-center rounded-r-md border-r border-y border-neutral-700 shadow-2xl transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        <div
          ref={rowRef}
          onScroll={handleScrollEvent}
          className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-3 px-1 scroll-smooth"
        >
          {continueWatching.map((item) => {
            const baseMeta = ALL_VIDEOS_MAP[item.videoId];
            const videoItem: VideoItem = {
              id: item.videoId,
              title: item.title,
              description: baseMeta?.description || 'Continue watching where you left off across your devices.',
              channelTitle: item.channelTitle || 'YouTube',
              duration: item.duration || 600,
              durationFormatted: baseMeta?.durationFormatted || `${Math.round(item.duration / 60)}m`,
              category: item.category || 'General',
              thumbnailUrl: item.thumbnailUrl,
              quality: baseMeta?.quality || '4K Ultra HD',
              audio: baseMeta?.audio || 'Dolby 5.1',
              matchScore: baseMeta?.matchScore || 98,
              ageRating: baseMeta?.ageRating || 'PG-13',
            };

            return (
              <VideoCard
                key={item.id}
                video={videoItem}
                progressPercent={item.progressPercent}
                resumeSeconds={item.currentTime}
                isContinueWatching={true}
                onOpenInfo={onOpenInfo}
              />
            );
          })}
        </div>

        {showRightArrow && continueWatching.length > 3 && (
          <button
            onClick={() => handleScroll('right')}
            className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-30 w-9 sm:w-11 h-20 sm:h-24 bg-black/80 hover:bg-black/95 text-white flex items-center justify-center rounded-l-md border-l border-y border-neutral-700 shadow-2xl transition-all"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </section>
  );
}
