'use client';

import React, { useState } from 'react';
import { useAuthAndSync } from '@/context/AuthAndSyncContext';
import { VideoItem, CustomPlaylist } from '@/types';
import {
  Play,
  Plus,
  Check,
  Info,
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
  Trash2,
  ListPlus,
  Heart,
} from 'lucide-react';

interface VideoCardProps {
  video: VideoItem;
  playlistContext?: CustomPlaylist | null;
  progressPercent?: number;
  resumeSeconds?: number;
  isContinueWatching?: boolean;
  onOpenInfo: (video: VideoItem) => void;
  onRemoveFromPlaylist?: () => void;
}

export function VideoCard({
  video,
  playlistContext,
  progressPercent,
  resumeSeconds,
  isContinueWatching,
  onOpenInfo,
  onRemoveFromPlaylist,
}: VideoCardProps) {
  const {
    playVideo,
    toggleWatchlist,
    isInWatchlist,
    ratings,
    rateVideo,
    clearWatchProgress,
    customPlaylists,
    addVideoToPlaylist,
  } = useAuthAndSync();

  const [isHovered, setIsHovered] = useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);

  const inList = isInWatchlist(video.id);
  const currentRating = ratings[video.id];

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playVideo(video, playlistContext, resumeSeconds || 0);
  };

  const handleWatchlistClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleWatchlist(video);
  };

  const handleRate = async (e: React.MouseEvent, ratingType: 'like' | 'dislike' | 'loved') => {
    e.stopPropagation();
    await rateVideo(video.id, currentRating === ratingType ? 'like' : ratingType);
  };

  const handleClearProgress = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await clearWatchProgress(video.id);
  };

  const handleAddToCustomPlaylist = async (e: React.MouseEvent, plId: string) => {
    e.stopPropagation();
    await addVideoToPlaylist(plId, video);
    setShowPlaylistMenu(false);
  };

  return (
    <div
      className="group relative flex-none w-[200px] sm:w-[240px] md:w-[280px] cursor-pointer select-none transition-all duration-300 rounded-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowPlaylistMenu(false);
      }}
      onClick={() => onOpenInfo(video)}
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full rounded-md overflow-hidden bg-neutral-900 border border-neutral-800/80 shadow-md group-hover:shadow-2xl transition-all duration-300">
        <img
          src={video.thumbnailUrl || `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
          alt={video.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Video Duration / Quality Badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
          {video.quality && (
            <span className="bg-black/75 backdrop-blur-sm text-[10px] font-semibold text-neutral-200 px-1.5 py-0.5 rounded border border-neutral-700/50">
              {video.quality}
            </span>
          )}
          {video.durationFormatted && (
            <span className="bg-black/75 backdrop-blur-sm text-[10px] font-mono text-neutral-200 px-1.5 py-0.5 rounded">
              {video.durationFormatted}
            </span>
          )}
        </div>

        {/* NetTube Mini Watermark */}
        <div className="absolute top-2 left-2 z-10">
          <span className="w-5 h-5 bg-red-600 rounded flex items-center justify-center text-[10px] font-black text-white shadow">
            N
          </span>
        </div>

        {/* Continue Watching Progress Bar */}
        {typeof progressPercent === 'number' && progressPercent > 0 && (
          <div className="absolute bottom-0 inset-x-0 h-1.5 bg-neutral-800 z-10">
            <div
              className="h-full bg-red-600 rounded-r transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(5, progressPercent))}%` }}
            />
          </div>
        )}

        {/* Bottom Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-40 transition-opacity" />
      </div>

      {/* Basic Card Title & Channel (Visible Always) */}
      <div className="pt-2 px-1 space-y-1">
        <h4 className="text-xs sm:text-sm font-semibold text-neutral-200 line-clamp-1 group-hover:text-white transition-colors">
          {video.title}
        </h4>
        <div className="flex items-center justify-between text-[11px] text-neutral-400">
          <span className="truncate max-w-[150px]">{video.channelTitle}</span>
          {video.matchScore && (
            <span className="text-emerald-400 font-bold ml-1">{video.matchScore}% Match</span>
          )}
        </div>
      </div>

      {/* Floating Expanded Netflix Hover Preview Card */}
      {isHovered && (
        <div className="absolute -top-12 -left-4 -right-4 z-50 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-200 space-y-2.5">
          {/* Top Mini Preview with Play Overlay */}
          <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-neutral-950">
            <img
              src={video.thumbnailUrl || `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
              alt={video.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            {/* Quick Play Center Button */}
            <button
              onClick={handlePlayClick}
              className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-red-600/90 hover:bg-red-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 z-20"
              aria-label="Play Video"
            >
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </button>
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              {/* Play Button */}
              <button
                onClick={handlePlayClick}
                className="w-8 h-8 rounded-full bg-white hover:bg-neutral-200 text-neutral-950 flex items-center justify-center transition-all shadow"
                title="Play Now"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </button>

              {/* Watchlist Toggle */}
              <button
                onClick={handleWatchlistClick}
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                  inList
                    ? 'bg-neutral-800 border-neutral-600 text-emerald-400'
                    : 'border-neutral-600 hover:border-white text-neutral-200 hover:text-white'
                }`}
                title={inList ? 'Remove from My List' : 'Add to My List'}
              >
                {inList ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>

              {/* Like Rating */}
              <button
                onClick={(e) => handleRate(e, 'like')}
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                  currentRating === 'like'
                    ? 'bg-red-600/20 border-red-500 text-red-400'
                    : 'border-neutral-600 hover:border-white text-neutral-300 hover:text-white'
                }`}
                title="I like this"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>

              {/* Add to Custom Playlist Trigger */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPlaylistMenu((prev) => !prev);
                  }}
                  className="w-8 h-8 rounded-full border border-neutral-600 hover:border-white text-neutral-300 hover:text-white flex items-center justify-center transition-all"
                  title="Add to Custom Category Playlist"
                >
                  <ListPlus className="w-3.5 h-3.5" />
                </button>

                {/* Custom Playlists Dropdown */}
                {showPlaylistMenu && (
                  <div className="absolute bottom-full left-0 mb-2 w-48 bg-neutral-950 border border-neutral-700 rounded-lg shadow-2xl p-2 z-50 text-xs">
                    <div className="text-[10px] uppercase font-bold text-neutral-400 px-2 py-1">
                      Add to Playlist:
                    </div>
                    {customPlaylists.length === 0 ? (
                      <div className="text-neutral-500 px-2 py-1 text-[11px]">
                        No custom playlists yet.
                      </div>
                    ) : (
                      <div className="space-y-1 max-h-36 overflow-y-auto">
                        {customPlaylists.map((pl) => (
                          <button
                            key={pl.id}
                            onClick={(e) => handleAddToCustomPlaylist(e, pl.id)}
                            className="w-full text-left px-2 py-1.5 rounded hover:bg-neutral-800 text-neutral-200 hover:text-white truncate flex items-center justify-between"
                          >
                            <span className="truncate">{pl.title}</span>
                            {pl.videoIds.includes(video.id) && (
                              <Check className="w-3 h-3 text-red-500 shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Delete / Clear from Continue Watching or Playlist */}
              {isContinueWatching && (
                <button
                  onClick={handleClearProgress}
                  className="w-8 h-8 rounded-full border border-neutral-700 hover:border-red-500 text-neutral-400 hover:text-red-400 flex items-center justify-center transition-all"
                  title="Remove from Continue Watching"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              {onRemoveFromPlaylist && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFromPlaylist();
                  }}
                  className="w-8 h-8 rounded-full border border-neutral-700 hover:border-red-500 text-neutral-400 hover:text-red-400 flex items-center justify-center transition-all"
                  title="Remove from this playlist"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* More Info */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenInfo(video);
              }}
              className="w-8 h-8 rounded-full border border-neutral-600 hover:border-white text-neutral-300 hover:text-white flex items-center justify-center transition-all"
              title="More Details & Episodes"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          {/* Details & Tags */}
          <div className="space-y-1 pt-1">
            <h4 className="text-xs font-bold text-white line-clamp-1">{video.title}</h4>
            <div className="flex items-center gap-2 text-[11px] text-neutral-300 font-medium">
              <span className="text-emerald-400 font-bold">{video.matchScore || 98}% Match</span>
              <span className="border border-neutral-700 px-1 py-0.2 rounded text-[9px] text-neutral-400">
                {video.ageRating || 'PG-13'}
              </span>
              <span className="text-neutral-400">{video.durationFormatted}</span>
            </div>
            {video.tags && video.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-0.5 text-[10px] text-neutral-400">
                {video.tags.slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="flex items-center gap-1">
                    {idx > 0 && <span>·</span>}
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
