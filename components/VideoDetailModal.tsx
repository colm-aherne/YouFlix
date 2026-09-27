'use client';

import React, { useState } from 'react';
import { useAuthAndSync } from '@/context/AuthAndSyncContext';
import { VideoItem } from '@/types';
import {
  X,
  Play,
  Plus,
  Check,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  VolumeX,
  Sparkles,
  Share2,
  ListPlus,
} from 'lucide-react';

interface VideoDetailModalProps {
  video: VideoItem;
  onClose: () => void;
}

export function VideoDetailModal({ video, onClose }: VideoDetailModalProps) {
  const {
    playVideo,
    toggleWatchlist,
    isInWatchlist,
    ratings,
    rateVideo,
    allCategoryPlaylists,
    customPlaylists,
    addVideoToPlaylist,
  } = useAuthAndSync();

  const [isMuted, setIsMuted] = useState(true);
  const [showPlaylistDropdown, setShowPlaylistDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  const inList = isInWatchlist(video.id);
  const currentRating = ratings[video.id];

  // Find related playlist category
  const relatedPlaylist = allCategoryPlaylists.find((p) =>
    p.videoIds.includes(video.id) || p.category.toLowerCase() === video.category.toLowerCase()
  );

  const relatedVideos = (relatedPlaylist?.videos || []).filter((v) => v.id !== video.id);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const shareUrl = `${window.location.origin}?v=${video.id}`;
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl my-auto animate-in zoom-in-95 fade-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-neutral-950/80 hover:bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-700 flex items-center justify-center transition-all hover:scale-105"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Media Banner */}
        <div className="relative aspect-video w-full max-h-[420px] bg-neutral-950">
          <img
            src={video.backdropUrl || video.thumbnailUrl || `https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`}
            alt={video.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />

          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/80 via-transparent to-transparent" />

          {/* Overlay Actions */}
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between z-20">
            <div className="space-y-3 max-w-xl">
              <div className="text-xs font-bold uppercase tracking-wider text-red-500">
                {video.category}
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight drop-shadow-lg">
                {video.title}
              </h2>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                {/* Play Button */}
                <button
                  onClick={() => {
                    playVideo(video, relatedPlaylist || null);
                    onClose();
                  }}
                  className="flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-neutral-200 text-neutral-950 font-bold text-sm sm:text-base rounded-md transition-all hover:scale-105 shadow-xl"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Play</span>
                </button>

                {/* Watchlist Toggle */}
                <button
                  onClick={() => toggleWatchlist(video)}
                  className="w-10 h-10 rounded-full border border-neutral-600 bg-neutral-900/80 hover:bg-neutral-800 text-white flex items-center justify-center transition-all"
                  title={inList ? 'In My List' : 'Add to My List'}
                >
                  {inList ? <Check className="w-5 h-5 text-emerald-400" /> : <Plus className="w-5 h-5" />}
                </button>

                {/* Rating */}
                <button
                  onClick={() => rateVideo(video.id, currentRating === 'like' ? 'like' : 'like')}
                  className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                    currentRating === 'like'
                      ? 'bg-red-600/30 border-red-500 text-red-400'
                      : 'border-neutral-600 bg-neutral-900/80 text-neutral-300 hover:text-white'
                  }`}
                  title="Like"
                >
                  <ThumbsUp className="w-4 h-4" />
                </button>

                {/* Share Link */}
                <button
                  onClick={handleShare}
                  className="w-10 h-10 rounded-full border border-neutral-600 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center transition-all"
                  title="Copy share link"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                {copied && (
                  <span className="text-xs text-emerald-400 font-medium">Link Copied!</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body Info */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Main Grid: Info + Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left 2 Cols: Description & Details */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-medium text-neutral-300">
                <span className="text-emerald-400 font-bold">{video.matchScore || 98}% Match</span>
                <span className="text-neutral-500">·</span>
                <span>{video.publishedAt || '2024'}</span>
                <span className="text-neutral-500">·</span>
                <span className="border border-neutral-600 px-1.5 py-0.2 rounded text-[11px] font-mono">
                  {video.ageRating || 'PG-13'}
                </span>
                <span className="text-neutral-500">·</span>
                <span>{video.durationFormatted || 'Feature'}</span>
                <span className="text-neutral-500">·</span>
                <span className="bg-neutral-800 text-neutral-300 border border-neutral-700 px-1.5 py-0.2 rounded text-[11px] font-mono">
                  {video.quality || '4K Ultra HD'}
                </span>
              </div>

              <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
                {video.description}
              </p>
            </div>

            {/* Right 1 Col: Channel & Tags Sidebar */}
            <div className="space-y-3 text-xs text-neutral-400 border-t md:border-t-0 md:border-l border-neutral-800 md:pl-6 pt-4 md:pt-0">
              <div>
                <span className="text-neutral-500 block">Creator / Channel:</span>
                <span className="text-white font-semibold text-sm">{video.channelTitle}</span>
              </div>

              <div>
                <span className="text-neutral-500 block">Category:</span>
                <span className="text-neutral-200">{video.category}</span>
              </div>

              {video.tags && video.tags.length > 0 && (
                <div>
                  <span className="text-neutral-500 block">Genres / Mood:</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {video.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded text-[11px]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <span className="text-neutral-500 block">Audio & Spatial Format:</span>
                <span className="text-neutral-200">{video.audio || 'Dolby 5.1 Surround'}</span>
              </div>
            </div>
          </div>

          {/* More Like This / Playlist Videos */}
          {relatedVideos.length > 0 && (
            <div className="pt-6 border-t border-neutral-800 space-y-4">
              <h3 className="text-lg font-bold text-white tracking-tight">
                More in this Category ({relatedVideos.length})
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {relatedVideos.slice(0, 6).map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => {
                      playVideo(rel, relatedPlaylist || null);
                      onClose();
                    }}
                    className="group/rel cursor-pointer bg-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-xl overflow-hidden p-2.5 transition-all hover:scale-[1.02] shadow-md"
                  >
                    <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-neutral-900 mb-2">
                      <img
                        src={rel.thumbnailUrl || `https://i.ytimg.com/vi/${rel.id}/hqdefault.jpg`}
                        alt={rel.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover/rel:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/rel:opacity-100 transition-opacity">
                        <Play className="w-8 h-8 text-white fill-current drop-shadow-md" />
                      </div>
                      <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-[10px] font-mono text-neutral-200 px-1 rounded">
                        {rel.durationFormatted || '10m'}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-neutral-200 line-clamp-1 group-hover/rel:text-white">
                      {rel.title}
                    </h4>
                    <p className="text-[11px] text-neutral-400 truncate">{rel.channelTitle}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
