'use client';

import React, { useState, useMemo } from 'react';
import { AuthAndSyncProvider, useAuthAndSync } from '@/context/AuthAndSyncContext';
import { Navbar } from '@/components/Navbar';
import { HeroBillboard } from '@/components/HeroBillboard';
import { VideoRow } from '@/components/VideoRow';
import { VideoCard } from '@/components/VideoCard';
import { ContinueWatchingRow } from '@/components/ContinueWatchingRow';
import { VideoPlayerModal } from '@/components/VideoPlayerModal';
import { VideoDetailModal } from '@/components/VideoDetailModal';
import { ProfileSelectModal } from '@/components/ProfileSelectModal';
import { PlaylistCreatorModal } from '@/components/PlaylistCreatorModal';
import { AICuratorModal } from '@/components/AICuratorModal';
import { DeviceSyncRoomModal } from '@/components/DeviceSyncRoomModal';
import { VideoItem, CustomPlaylist } from '@/types';
import { ALL_VIDEOS_MAP } from '@/data/defaultCategories';
import {
  Film,
  Sparkles,
  Plus,
  FolderHeart,
  Bookmark,
  Search,
  CheckCircle2,
  Radio,
  Tv,
  HelpCircle,
} from 'lucide-react';

function NetTubeAppContent() {
  const {
    allCategoryPlaylists,
    customPlaylists,
    watchlist,
    currentProfile,
    deletePlaylist,
    searchQuery,
    setSearchQuery,
    activePlayingVideo,
    activePlayingCategoryPlaylist,
    playbackStartTime,
    closeVideo,
    infoModalVideo,
    openInfoModal,
    closeInfoModal,
    showProfileSelector,
    setShowProfileSelector,
    isCloudSynced,
  } = useAuthAndSync();

  const [activeNavTab, setActiveNavTab] = useState('home');
  const [showPlaylistCreator, setShowPlaylistCreator] = useState(false);
  const [showAICurator, setShowAICurator] = useState(false);
  const [showDeviceSync, setShowDeviceSync] = useState(false);

  // Search Results filtering
  const searchResults: VideoItem[] = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const allUniqueVideos = Object.values(ALL_VIDEOS_MAP);

    return allUniqueVideos.filter((v) => {
      const matchTitle = v.title.toLowerCase().includes(q);
      const matchChannel = v.channelTitle.toLowerCase().includes(q);
      const matchDesc = v.description.toLowerCase().includes(q);
      const matchCategory = v.category.toLowerCase().includes(q);
      const matchTags = v.tags?.some((t) => t.toLowerCase().includes(q));
      return matchTitle || matchChannel || matchDesc || matchCategory || matchTags;
    });
  }, [searchQuery]);

  // Convert watchlist items into full VideoItem list
  const watchlistVideos: VideoItem[] = useMemo(() => {
    return watchlist.map((w) => {
      const base = ALL_VIDEOS_MAP[w.videoId];
      return {
        id: w.videoId,
        title: w.title,
        description: base?.description || 'Saved to My List.',
        channelTitle: w.channelTitle || 'YouTube',
        duration: w.duration || 600,
        durationFormatted: base?.durationFormatted || `${Math.round(w.duration / 60)}m`,
        category: w.category || 'My List',
        thumbnailUrl: w.thumbnailUrl,
        quality: base?.quality || '4K Ultra HD',
        audio: base?.audio || 'Dolby 5.1',
        matchScore: base?.matchScore || 98,
        ageRating: base?.ageRating || 'PG-13',
      };
    });
  }, [watchlist]);

  // Filter Category Rows based on current active nav tab
  const displayedCategoryPlaylists = useMemo(() => {
    if (activeNavTab === 'home') {
      return allCategoryPlaylists;
    }
    if (activeNavTab === 'my-list') {
      return [];
    }
    if (activeNavTab === 'custom-playlists') {
      return customPlaylists;
    }
    return allCategoryPlaylists.filter((pl) => pl.slug === activeNavTab);
  }, [activeNavTab, allCategoryPlaylists, customPlaylists]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-red-600 selection:text-white pb-24 overflow-x-hidden">
      {/* Top Navbar */}
      <Navbar
        onOpenPlaylistCreator={() => setShowPlaylistCreator(true)}
        onOpenAICurator={() => setShowAICurator(true)}
        onOpenDeviceSync={() => setShowDeviceSync(true)}
        activeNavTab={activeNavTab}
        setActiveNavTab={setActiveNavTab}
      />

      {/* Main Content Area */}
      <main className="relative pt-16">
        {/* Search Results Screen (when search input is active) */}
        {searchQuery.trim() !== '' ? (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-3">
                <Search className="w-6 h-6 text-red-500" />
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Search Results for &quot;{searchQuery}&quot;
                </h2>
              </div>
              <span className="text-xs text-neutral-400">
                Found {searchResults.length} videos
              </span>
            </div>

            {searchResults.length === 0 ? (
              <div className="text-center py-20 space-y-3">
                <p className="text-neutral-400 text-sm">
                  No videos matched your search query. Try searching for creators like &quot;Lemmino&quot;, &quot;Cercle&quot;, &quot;Veritasium&quot; or topics like &quot;Space&quot;, &quot;Sci-Fi&quot;, &quot;Music&quot;.
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {searchResults.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onOpenInfo={openInfoModal}
                  />
                ))}
              </div>
            )}
          </section>
        ) : activeNavTab === 'my-list' ? (
          /* My List Page */
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-3">
                <Bookmark className="w-6 h-6 text-red-500" />
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  My Watchlist ({currentProfile?.name || 'You'})
                </h2>
              </div>
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isCloudSynced ? 'Synced with Cloud' : 'Local'}
              </span>
            </div>

            {watchlistVideos.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <p className="text-neutral-400 text-sm">
                  You haven&apos;t added any videos to your list yet.
                </p>
                <p className="text-neutral-500 text-xs">
                  Hover over any video and click the &quot;+&quot; icon to bookmark it for later.
                </p>
                <button
                  onClick={() => setActiveNavTab('home')}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow"
                >
                  Browse Movies & Shows
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {watchlistVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onOpenInfo={openInfoModal}
                  />
                ))}
              </div>
            )}
          </section>
        ) : activeNavTab === 'custom-playlists' ? (
          /* Custom Playlists Page */
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
              <div className="flex items-center gap-3">
                <FolderHeart className="w-6 h-6 text-red-500" />
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Custom Cloud Playlists
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Category-based playlists synchronized across your devices.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPlaylistCreator(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow transition-all hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>Create Playlist</span>
              </button>
            </div>

            {customPlaylists.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <p className="text-neutral-400 text-sm">
                  You haven&apos;t created any custom category playlists yet.
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setShowPlaylistCreator(true)}
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Custom Playlist</span>
                  </button>
                  <button
                    onClick={() => setShowAICurator(true)}
                    className="px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-bold border border-neutral-700 flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Let AI Curate</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {customPlaylists.map((pl) => (
                  <VideoRow
                    key={pl.id}
                    title={pl.title}
                    categoryPlaylist={pl}
                    videos={pl.videos}
                    isCustom={true}
                    iconName="FolderHeart"
                    onOpenInfo={openInfoModal}
                    onDeletePlaylist={() => deletePlaylist(pl.id)}
                  />
                ))}
              </div>
            )}
          </section>
        ) : (
          /* Default Netflix Home / Genre Browse */
          <div className="space-y-2">
            {/* Grand Hero Billboard (only on home tab) */}
            {activeNavTab === 'home' && <HeroBillboard onOpenInfo={openInfoModal} />}

            {/* Negative Margin on Home to overlap Hero gradient gracefully */}
            <div className={`space-y-4 ${activeNavTab === 'home' ? '-mt-16 sm:-mt-24 relative z-30' : 'pt-4'}`}>
              {/* Continue Watching Shelf (synced with Firestore) */}
              {activeNavTab === 'home' && <ContinueWatchingRow onOpenInfo={openInfoModal} />}

              {/* My List Shelf on Home */}
              {activeNavTab === 'home' && watchlistVideos.length > 0 && (
                <VideoRow
                  title="My List"
                  videos={watchlistVideos}
                  iconName="Bookmark"
                  onOpenInfo={openInfoModal}
                />
              )}

              {/* Custom Cloud Playlists */}
              {customPlaylists.map((pl) => (
                <VideoRow
                  key={pl.id}
                  title={pl.title}
                  categoryPlaylist={pl}
                  videos={pl.videos}
                  isCustom={true}
                  iconName="FolderHeart"
                  onOpenInfo={openInfoModal}
                  onDeletePlaylist={() => deletePlaylist(pl.id)}
                />
              ))}

              {/* Curated Category Rows */}
              {displayedCategoryPlaylists
                .filter((pl) => !pl.isCustom)
                .map((categoryPlaylist) => (
                  <VideoRow
                    key={categoryPlaylist.id}
                    title={categoryPlaylist.title}
                    categoryPlaylist={categoryPlaylist}
                    videos={categoryPlaylist.videos}
                    iconName={categoryPlaylist.iconName}
                    onOpenInfo={openInfoModal}
                  />
                ))}
            </div>
          </div>
        )}
      </main>

      {/* Netflix Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10 border-t border-neutral-900 text-xs text-neutral-500 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-tight">
              NET<span className="text-red-600">TUBE</span> CINEMA
            </span>
            <span>·</span>
            <span>Cross-Device Synchronized YouTube Streaming</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowDeviceSync(true)}
              className="hover:text-neutral-300 transition-colors flex items-center gap-1"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-500" />
              <span>Cloud Sync Active</span>
            </button>
            <button
              onClick={() => setShowProfileSelector(true)}
              className="hover:text-neutral-300 transition-colors"
            >
              Switch Profile
            </button>
            <button
              onClick={() => setShowAICurator(true)}
              className="hover:text-neutral-300 transition-colors"
            >
              AI Vibe Matcher
            </button>
          </div>
        </div>
        <p className="text-[11px] text-neutral-600">
          Curated YouTube video streams, metadata, and custom category playlists powered by Firebase Firestore and Gemini AI.
        </p>
      </footer>

      {/* Video Player Modal */}
      {activePlayingVideo && (
        <VideoPlayerModal
          video={activePlayingVideo}
          playlistContext={activePlayingCategoryPlaylist}
          startTime={playbackStartTime}
          onClose={closeVideo}
        />
      )}

      {/* Video Details Modal */}
      {infoModalVideo && (
        <VideoDetailModal
          video={infoModalVideo}
          onClose={closeInfoModal}
        />
      )}

      {/* Profile Selector Modal */}
      {showProfileSelector && (
        <ProfileSelectModal onClose={() => setShowProfileSelector(false)} />
      )}

      {/* Custom Playlist Creator Modal */}
      {showPlaylistCreator && (
        <PlaylistCreatorModal onClose={() => setShowPlaylistCreator(false)} />
      )}

      {/* AI Curator Modal */}
      {showAICurator && (
        <AICuratorModal onClose={() => setShowAICurator(false)} />
      )}

      {/* Device Sync Room Modal */}
      {showDeviceSync && (
        <DeviceSyncRoomModal onClose={() => setShowDeviceSync(false)} />
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <AuthAndSyncProvider>
      <NetTubeAppContent />
    </AuthAndSyncProvider>
  );
}
