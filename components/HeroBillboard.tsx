'use client';

import React, { useState, useEffect } from 'react';
import { useAuthAndSync } from '@/context/AuthAndSyncContext';
import { FEATURED_HERO_VIDEOS } from '@/data/defaultCategories';
import { VideoItem } from '@/types';
import {
  Play,
  Plus,
  Check,
  Info,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface HeroBillboardProps {
  onOpenInfo: (video: VideoItem) => void;
}

export function HeroBillboard({ onOpenInfo }: HeroBillboardProps) {
  const { playVideo, toggleWatchlist, isInWatchlist } = useAuthAndSync();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [showVideoPreview, setShowVideoPreview] = useState(false);

  const currentVideo = FEATURED_HERO_VIDEOS[activeIndex] || FEATURED_HERO_VIDEOS[0];
  const inList = isInWatchlist(currentVideo.id);

  // Delay video trailer playback by 1.5s to let backdrop display first
  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) {
        setShowVideoPreview(true);
      }
    }, 1500);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [activeIndex]);

  const handleNextHero = () => {
    setShowVideoPreview(false);
    setActiveIndex((prev) => (prev + 1) % FEATURED_HERO_VIDEOS.length);
  };

  const handlePrevHero = () => {
    setShowVideoPreview(false);
    setActiveIndex((prev) => (prev - 1 + FEATURED_HERO_VIDEOS.length) % FEATURED_HERO_VIDEOS.length);
  };

  return (
    <section className="relative w-full h-[70vh] sm:h-[80vh] lg:h-[88vh] min-h-[500px] max-h-[850px] overflow-hidden bg-neutral-950 select-none">
      {/* Background Media (Poster / Trailer Embed) */}
      <div className="absolute inset-0 w-full h-full">
        {/* Static High-Res Backdrop Image */}
        <div
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
            showVideoPreview ? 'opacity-0' : 'opacity-100'
          }`}
          style={{
            backgroundImage: `url(${currentVideo.backdropUrl || currentVideo.thumbnailUrl})`,
          }}
        />

        {/* Ambient Video Trailer Embed */}
        {showVideoPreview && (
          <div className="absolute inset-0 w-full h-full pointer-events-none scale-125 transition-opacity duration-1000 opacity-100">
            <iframe
              src={`https://www.youtube.com/embed/${currentVideo.trailerId || currentVideo.id}?autoplay=1&mute=${
                isMuted ? 1 : 0
              }&controls=0&showinfo=0&rel=0&loop=1&playlist=${currentVideo.trailerId || currentVideo.id}&modestbranding=1&enablejsapi=1`}
              title={currentVideo.title}
              className="w-full h-full object-cover"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        )}

        {/* Gradient Scrim Overlays (Netflix Signature Black Vignette) */}
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/70 to-transparent w-full md:w-3/4 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-transparent z-10" />
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-neutral-950/80 to-transparent z-10" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-20 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16 sm:pb-24">
        <div className="max-w-2xl space-y-3 sm:space-y-4">
          {/* Brand Tag / Series Label */}
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-red-500 uppercase">
            <span className="bg-red-600/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded text-[10px]">
              NET<span className="text-white font-bold">TUBE</span> ORIGINAL
            </span>
            <span className="text-neutral-400">·</span>
            <span className="text-neutral-300 font-medium">{currentVideo.category}</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] text-balance drop-shadow-2xl">
            {currentVideo.title}
          </h1>

          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-medium text-neutral-300 pt-1">
            <span className="text-emerald-400 font-bold">{currentVideo.matchScore}% Match</span>
            <span className="text-neutral-500">·</span>
            <span className="text-neutral-300">{currentVideo.publishedAt}</span>
            <span className="text-neutral-500">·</span>
            <span className="border border-neutral-600 px-1.5 py-0.2 rounded text-[11px] font-mono text-neutral-300">
              {currentVideo.ageRating || 'PG-13'}
            </span>
            <span className="text-neutral-500">·</span>
            <span className="text-neutral-300">{currentVideo.durationFormatted}</span>
            <span className="text-neutral-500">·</span>
            <span className="border border-neutral-700 bg-neutral-900/60 px-1.5 py-0.2 rounded text-[11px] font-mono text-neutral-300">
              {currentVideo.quality || '4K Ultra HD'}
            </span>
          </div>

          {/* Synopsis */}
          <p className="text-xs sm:text-sm md:text-base text-neutral-300 line-clamp-3 leading-relaxed max-w-xl drop-shadow">
            {currentVideo.description}
          </p>

          {/* Creator / Channel Kicker */}
          <div className="text-xs text-neutral-400">
            Channel: <span className="text-neutral-200 font-semibold">{currentVideo.channelTitle}</span>
            {currentVideo.viewCount && (
              <span className="ml-2 text-neutral-400">({currentVideo.viewCount} views)</span>
            )}
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {/* Play Button */}
            <button
              onClick={() => playVideo(currentVideo)}
              className="flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-white hover:bg-neutral-200 text-neutral-950 font-bold text-sm sm:text-base rounded-md transition-all duration-200 hover:scale-105 active:scale-95 shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Play</span>
            </button>

            {/* My List Toggle */}
            <button
              onClick={() => toggleWatchlist(currentVideo)}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 font-semibold text-sm sm:text-base rounded-md transition-all duration-200 border focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 ${
                inList
                  ? 'bg-neutral-800/90 text-white border-neutral-600 hover:bg-neutral-700'
                  : 'bg-neutral-900/80 hover:bg-neutral-800 text-white border-neutral-700/80 backdrop-blur-sm'
              }`}
            >
              {inList ? <Check className="w-5 h-5 text-emerald-400" /> : <Plus className="w-5 h-5" />}
              <span>{inList ? 'In My List' : 'My List'}</span>
            </button>

            {/* More Info */}
            <button
              onClick={() => onOpenInfo(currentVideo)}
              className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-neutral-800/80 hover:bg-neutral-700/90 text-neutral-200 hover:text-white font-semibold text-sm sm:text-base rounded-md backdrop-blur-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400"
            >
              <Info className="w-5 h-5" />
              <span>More Info</span>
            </button>
          </div>
        </div>

        {/* Right Bottom Audio & Carousel Switcher */}
        <div className="absolute right-4 sm:right-8 bottom-16 sm:bottom-24 flex items-center gap-3 z-30">
          {/* Mute / Unmute Trailer Sound */}
          <button
            onClick={() => setIsMuted((prev) => !prev)}
            className="p-2.5 rounded-full bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white backdrop-blur-md transition-all shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            aria-label={isMuted ? 'Unmute preview sound' : 'Mute preview sound'}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-red-400" />}
          </button>

          {/* Carousel Slide Switchers */}
          <div className="flex items-center gap-1 bg-neutral-900/70 border border-neutral-800 rounded-full p-1 backdrop-blur-sm">
            <button
              onClick={handlePrevHero}
              className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
              aria-label="Previous Featured Movie"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1 px-1">
              {FEATURED_HERO_VIDEOS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === activeIndex ? 'w-5 bg-red-600' : 'w-1.5 bg-neutral-600 hover:bg-neutral-400'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
            <button
              onClick={handleNextHero}
              className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
              aria-label="Next Featured Movie"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
