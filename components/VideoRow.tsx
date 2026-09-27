'use client';

import React, { useRef, useState } from 'react';
import { VideoItem, CustomPlaylist } from '@/types';
import { VideoCard } from './VideoCard';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Flame,
  Clapperboard,
  Film,
  Headphones,
  Cpu,
  Gamepad2,
  Compass,
  FolderHeart,
  Plus,
  Trash2,
} from 'lucide-react';

interface VideoRowProps {
  title: string;
  categoryPlaylist?: CustomPlaylist | null;
  videos: VideoItem[];
  iconName?: string;
  isCustom?: boolean;
  onOpenInfo: (video: VideoItem) => void;
  onDeletePlaylist?: () => void;
  onAddVideoToPlaylist?: () => void;
  onRemoveVideoFromPlaylist?: (videoId: string) => void;
}

export function VideoRow({
  title,
  categoryPlaylist,
  videos,
  iconName,
  isCustom,
  onOpenInfo,
  onDeletePlaylist,
  onAddVideoToPlaylist,
  onRemoveVideoFromPlaylist,
}: VideoRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

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

  const renderIcon = () => {
    switch (iconName) {
      case 'Flame':
        return <Flame className="w-5 h-5 text-red-500" />;
      case 'Clapperboard':
        return <Clapperboard className="w-5 h-5 text-red-400" />;
      case 'Film':
        return <Film className="w-5 h-5 text-amber-400" />;
      case 'Headphones':
        return <Headphones className="w-5 h-5 text-pink-400" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-cyan-400" />;
      case 'Gamepad2':
        return <Gamepad2 className="w-5 h-5 text-purple-400" />;
      case 'Compass':
        return <Compass className="w-5 h-5 text-emerald-400" />;
      case 'FolderHeart':
        return <FolderHeart className="w-5 h-5 text-rose-500" />;
      default:
        return null;
    }
  };

  if (!videos || videos.length === 0) {
    if (!isCustom) return null;
  }

  return (
    <section className="relative my-6 sm:my-8 px-4 sm:px-6 lg:px-8 space-y-2">
      {/* Category Row Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {renderIcon()}
          <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>{title}</span>
            {isCustom && (
              <span className="text-[10px] font-semibold bg-red-600/30 text-red-400 border border-red-500/40 px-2 py-0.5 rounded">
                Custom Cloud Playlist
              </span>
            )}
          </h3>
          <span className="text-xs text-neutral-400 font-medium">({videos.length})</span>
        </div>

        {/* Action Controls for Custom Playlists */}
        {isCustom && (
          <div className="flex items-center gap-2 text-xs">
            {onAddVideoToPlaylist && (
              <button
                onClick={onAddVideoToPlaylist}
                className="flex items-center gap-1 text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 px-2.5 py-1 rounded transition-colors"
                title="Add YouTube video to this playlist"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Video</span>
              </button>
            )}
            {onDeletePlaylist && (
              <button
                onClick={onDeletePlaylist}
                className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded transition-colors"
                title="Delete Playlist"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Horizontal Slider Area */}
      <div className="relative group/row">
        {/* Left Arrow Button */}
        {showLeftArrow && (
          <button
            onClick={() => handleScroll('left')}
            className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-30 w-9 sm:w-11 h-20 sm:h-24 bg-black/80 hover:bg-black/95 text-white flex items-center justify-center rounded-r-md border-r border-y border-neutral-700 shadow-2xl transition-all duration-200 hover:scale-105"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Scrollable Container */}
        <div
          ref={rowRef}
          onScroll={handleScrollEvent}
          className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-3 px-1 scroll-smooth"
        >
          {videos.length === 0 ? (
            <div className="w-full py-8 text-center text-xs text-neutral-500 border border-dashed border-neutral-800 rounded-lg">
              No videos added yet to this category. Click &quot;Add Video&quot; above to paste a YouTube link.
            </div>
          ) : (
            videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                playlistContext={categoryPlaylist}
                onOpenInfo={onOpenInfo}
                onRemoveFromPlaylist={
                  onRemoveVideoFromPlaylist ? () => onRemoveVideoFromPlaylist(video.id) : undefined
                }
              />
            ))
          )}
        </div>

        {/* Right Arrow Button */}
        {showRightArrow && videos.length > 3 && (
          <button
            onClick={() => handleScroll('right')}
            className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-30 w-9 sm:w-11 h-20 sm:h-24 bg-black/80 hover:bg-black/95 text-white flex items-center justify-center rounded-l-md border-l border-y border-neutral-700 shadow-2xl transition-all duration-200 hover:scale-105"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </section>
  );
}
