'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuthAndSync } from '@/context/AuthAndSyncContext';
import { VideoItem, CustomPlaylist } from '@/types';
import {
  ArrowLeft,
  ListVideo,
  Radio,
  SkipForward,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Sparkles,
  Check,
  X,
} from 'lucide-react';

interface VideoPlayerModalProps {
  video: VideoItem;
  playlistContext?: CustomPlaylist | null;
  startTime?: number;
  onClose: () => void;
}

export function VideoPlayerModal({
  video,
  playlistContext,
  startTime = 0,
  onClose,
}: VideoPlayerModalProps) {
  const { saveWatchProgress, playVideo, isCloudSynced } = useAuthAndSync();

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentSeconds, setCurrentSeconds] = useState(startTime);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showNextCountdown, setShowNextCountdown] = useState(false);
  const [nextCountdownSeconds, setNextCountdownSeconds] = useState(5);
  const [controlsVisible, setControlsVisible] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Find next video in playlist
  const playlistVideos = playlistContext?.videos || [];
  const currentIndex = playlistVideos.findIndex((v) => v.id === video.id);
  const nextVideo = currentIndex >= 0 && currentIndex < playlistVideos.length - 1 ? playlistVideos[currentIndex + 1] : null;

  // Auto-hide controls when mouse is idle
  const handleMouseMove = () => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3500);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'f' || e.key === 'F') {
        if (!document.fullscreenElement) {
          containerRef.current?.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      } else if ((e.key === 'n' || e.key === 'N') && nextVideo) {
        playVideo(nextVideo, playlistContext, 0);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, nextVideo, playlistContext, playVideo]);

  // Periodic Watch Progress Save to Firestore (every 4 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSeconds((prev) => {
        const nextTime = prev + 4;
        saveWatchProgress(video.id, nextTime, video.duration || 600, video);
        return nextTime;
      });
    }, 4000);

    return () => {
      clearInterval(timer);
      // Save on exit
      saveWatchProgress(video.id, currentSeconds, video.duration || 600, video);
    };
  }, [video, saveWatchProgress, currentSeconds]);

  // Handle Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 z-50 bg-black flex flex-col justify-between overflow-hidden select-none"
    >
      {/* Top Header Bar */}
      <div
        className={`absolute top-0 inset-x-0 z-30 p-4 sm:p-6 bg-gradient-to-b from-black/90 via-black/40 to-transparent flex items-center justify-between transition-opacity duration-300 ${
          controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Back Button + Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-white border border-neutral-700 transition-all hover:scale-105"
            aria-label="Back to browse"
            title="Back to NetTube (Esc)"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-lg font-bold text-white tracking-tight line-clamp-1">
                {video.title}
              </h2>
              {playlistContext && (
                <span className="hidden sm:inline text-xs font-semibold bg-red-600/30 text-red-400 border border-red-500/40 px-2 py-0.5 rounded">
                  {playlistContext.title}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span className="text-neutral-300 font-medium">{video.channelTitle}</span>
              <span>·</span>
              <span>{video.quality || '4K Ultra HD'}</span>
              <span>·</span>
              <span>{video.audio || 'Dolby 5.1'}</span>
            </div>
          </div>
        </div>

        {/* Right Header: Sync Status & Playlist Drawer Button */}
        <div className="flex items-center gap-3">
          {/* Cloud Sync Pulse */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-neutral-900/80 border border-neutral-800 rounded-full text-xs text-neutral-300">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>{isCloudSynced ? 'Firestore Synced' : 'Device Mode'}</span>
          </div>

          {/* Playlist Drawer Toggle */}
          {playlistVideos.length > 1 && (
            <button
              onClick={() => setShowDrawer((prev) => !prev)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border text-xs sm:text-sm font-semibold transition-all ${
                showDrawer
                  ? 'bg-red-600 border-red-500 text-white'
                  : 'bg-neutral-900/80 hover:bg-neutral-800 border-neutral-700 text-neutral-200'
              }`}
              title="Browse category playlist videos"
            >
              <ListVideo className="w-4 h-4" />
              <span className="hidden sm:inline">Playlist ({playlistVideos.length})</span>
            </button>
          )}

          {/* Close Player */}
          <button
            onClick={onClose}
            className="p-2 sm:p-2.5 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700"
            title="Close Player"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main YouTube Embedded Video Player */}
      <div className="relative w-full h-full flex items-center justify-center bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${video.id}?autoplay=1&start=${Math.floor(
            startTime
          )}&modestbranding=1&rel=0&iv_load_policy=3&enablejsapi=1`}
          title={video.title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>

      {/* Bottom Floating Controls Bar */}
      <div
        className={`absolute bottom-0 inset-x-0 z-30 p-4 sm:p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-center justify-between transition-opacity duration-300 ${
          controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Next Video Button */}
          {nextVideo && (
            <button
              onClick={() => playVideo(nextVideo, playlistContext, 0)}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs sm:text-sm font-semibold border border-neutral-700 transition-all hover:scale-105"
              title={`Play next: ${nextVideo.title}`}
            >
              <SkipForward className="w-4 h-4 text-red-500" />
              <span className="hidden sm:inline">Next Video</span>
            </button>
          )}

          <div className="text-xs text-neutral-400">
            Resuming at <span className="text-white font-mono">{Math.floor(startTime / 60)}m {Math.floor(startTime % 60)}s</span> · Auto-syncs to cloud
          </div>
        </div>

        {/* Fullscreen Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 sm:p-2.5 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-white border border-neutral-700 transition-all"
            title="Fullscreen (F)"
          >
            <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Playlist Side Drawer Panel */}
      {showDrawer && playlistVideos.length > 0 && (
        <div className="absolute top-0 right-0 bottom-0 w-80 sm:w-96 bg-neutral-950/95 border-l border-neutral-800 z-40 backdrop-blur-xl p-4 sm:p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <ListVideo className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-white text-base truncate max-w-[200px]">
                  {playlistContext?.title || 'Category Playlist'}
                </h3>
              </div>
              <button
                onClick={() => setShowDrawer(false)}
                className="p-1 text-neutral-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-2 overflow-y-auto max-h-[calc(100vh-140px)] pr-1">
              {playlistVideos.map((item, idx) => {
                const isCurrent = item.id === video.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      playVideo(item, playlistContext, 0);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg flex items-center gap-3 transition-all ${
                      isCurrent
                        ? 'bg-red-600/20 border border-red-500/50 text-white'
                        : 'bg-neutral-900/60 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-mono font-bold text-neutral-500 w-4">
                      {idx + 1}
                    </span>
                    <img
                      src={item.thumbnailUrl || `https://i.ytimg.com/vi/${item.id}/hqdefault.jpg`}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-16 h-10 object-cover rounded shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold truncate">{item.title}</h4>
                      <p className="text-[11px] text-neutral-400 truncate">{item.channelTitle}</p>
                    </div>
                    {isCurrent && <Play className="w-4 h-4 text-red-500 fill-current shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
