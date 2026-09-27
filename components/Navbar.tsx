'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuthAndSync } from '@/context/AuthAndSyncContext';
import { AVATAR_LIST } from '@/data/defaultCategories';
import {
  Search,
  Plus,
  Sparkles,
  Smartphone,
  ChevronDown,
  User,
  LogOut,
  LogIn,
  Check,
  Film,
  Compass,
  X,
  Tv,
  ListPlus,
  Radio,
  SlidersHorizontal,
} from 'lucide-react';

interface NavbarProps {
  onOpenPlaylistCreator: () => void;
  onOpenAICurator: () => void;
  onOpenDeviceSync: () => void;
  activeNavTab: string;
  setActiveNavTab: (tab: string) => void;
}

export function Navbar({
  onOpenPlaylistCreator,
  onOpenAICurator,
  onOpenDeviceSync,
  activeNavTab,
  setActiveNavTab,
}: NavbarProps) {
  const {
    user,
    signInWithGoogle,
    signOut,
    profiles,
    currentProfile,
    selectProfile,
    setShowProfileSelector,
    searchQuery,
    setSearchQuery,
    isCloudSynced,
  } = useAuthAndSync();

  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchToggle = () => {
    setSearchOpen((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => searchInputRef.current?.focus(), 100);
      } else {
        setSearchQuery('');
      }
      return next;
    });
  };

  const currentAvatarMeta = AVATAR_LIST.find((a) => a.id === currentProfile?.avatar) || AVATAR_LIST[0];

  const NAV_LINKS = [
    { id: 'home', label: 'Home' },
    { id: 'documentaries', label: 'Documentaries' },
    { id: 'movies-shorts', label: 'Movies & Shorts' },
    { id: 'tech-science', label: 'Tech & Science' },
    { id: 'music', label: 'Music & Live' },
    { id: 'gaming', label: 'Gaming Lore' },
    { id: 'nature', label: 'Nature 4K' },
    { id: 'my-list', label: 'My List' },
    { id: 'custom-playlists', label: 'Custom Playlists' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-neutral-950/95 backdrop-blur-md shadow-2xl border-b border-neutral-900/60 py-3'
          : 'bg-gradient-to-b from-neutral-950/90 via-neutral-950/40 to-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Brand + Nav */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => {
              setActiveNavTab('home');
              setSearchQuery('');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded"
            aria-label="NetTube Home"
          >
            <div className="w-8 h-8 rounded bg-red-600 flex items-center justify-center font-black text-white text-xl tracking-tighter shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform">
              N
            </div>
            <span className="font-bold text-xl tracking-tighter text-white flex items-center">
              NET<span className="text-red-600">TUBE</span>
            </span>
          </button>

          {/* Nav Items */}
          <nav className="hidden lg:flex items-center gap-5 text-sm font-medium">
            {NAV_LINKS.map((link) => {
              const isActive = activeNavTab === link.id && searchQuery === '';
              return (
                <button
                  key={link.id}
                  onClick={() => {
                    setActiveNavTab(link.id);
                    setSearchQuery('');
                  }}
                  className={`transition-colors whitespace-nowrap text-xs xl:text-sm font-medium ${
                    isActive
                      ? 'text-white font-semibold'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Actions (Search, AI Curator, New Playlist, Device Sync, Profile Switcher) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Box */}
          <div className="relative flex items-center">
            {searchOpen ? (
              <div className="flex items-center bg-neutral-900/90 border border-neutral-700 rounded-full px-3 py-1.5 shadow-inner transition-all w-48 sm:w-64">
                <Search className="w-4 h-4 text-neutral-400 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Titles, creators, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs sm:text-sm text-white focus:outline-none px-2 w-full placeholder:text-neutral-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-neutral-400 hover:text-white p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={handleSearchToggle}
                  className="text-neutral-400 hover:text-white ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleSearchToggle}
                className="p-2 text-neutral-300 hover:text-white rounded-full hover:bg-neutral-800/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                aria-label="Search NetTube"
                title="Search videos & channels"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* AI Vibe Matcher Curator Button */}
          <button
            onClick={onOpenAICurator}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-red-600 to-rose-700 rounded-full hover:from-red-500 hover:to-rose-600 shadow-lg shadow-red-950/50 transition-all hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 shrink-0"
            title="AI Vibe Curator"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">AI Vibe Matcher</span>
          </button>

          {/* Create Custom Playlist Button */}
          <button
            onClick={onOpenPlaylistCreator}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-200 bg-neutral-800/80 hover:bg-neutral-700 border border-neutral-700/80 rounded-full transition-all hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 shrink-0"
            title="Create Custom Category Playlist"
          >
            <Plus className="w-3.5 h-3.5 text-red-500" />
            <span className="hidden md:inline">New Playlist</span>
          </button>

          {/* Cross-Device Sync / Room Button */}
          <button
            onClick={onOpenDeviceSync}
            className="relative p-2 text-neutral-300 hover:text-white rounded-full hover:bg-neutral-800/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            title="Cross-Device Sync & Room Party"
            aria-label="Cross-Device Sync"
          >
            <Smartphone className="w-5 h-5" />
            <span
              className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ring-2 ring-neutral-950 ${
                isCloudSynced ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
          </button>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileDropdownOpen((prev) => !prev)}
              className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-neutral-800/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              aria-label="Profile Menu"
            >
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded ${currentAvatarMeta.bg} flex items-center justify-center text-white shadow font-bold text-xs`}
              >
                {currentProfile?.name.charAt(0).toUpperCase() || 'U'}
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${
                  profileDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Profiles Switcher Section */}
                <div className="px-3 py-2 border-b border-neutral-800">
                  <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                    Profiles
                  </div>
                  <div className="space-y-1">
                    {profiles.map((p) => {
                      const aMeta = AVATAR_LIST.find((a) => a.id === p.avatar) || AVATAR_LIST[0];
                      const isSelected = p.id === currentProfile?.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            selectProfile(p);
                            setProfileDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors ${
                            isSelected
                              ? 'bg-neutral-800 text-white font-semibold'
                              : 'text-neutral-300 hover:bg-neutral-800/60 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-6 h-6 rounded ${aMeta.bg} flex items-center justify-center text-white text-[11px] font-bold`}
                            >
                              {p.name.charAt(0).toUpperCase()}
                            </div>
                            <span>{p.name}</span>
                            {p.isKid && (
                              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                                Kids
                              </span>
                            )}
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-red-500" />}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => {
                      setShowProfileSelector(true);
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full mt-2 text-center text-xs text-neutral-400 hover:text-white py-1 transition-colors"
                  >
                    Manage Profiles
                  </button>
                </div>

                {/* Cloud & Device Sync Status */}
                <div className="px-3 py-2 border-b border-neutral-800 text-xs">
                  <div className="flex items-center justify-between text-neutral-300">
                    <span className="flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-emerald-400" />
                      Cloud Sync
                    </span>
                    <span
                      className={`text-[11px] font-medium ${
                        isCloudSynced ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {isCloudSynced ? 'Live Firestore' : 'Local / Guest'}
                    </span>
                  </div>
                  {user ? (
                    <div className="mt-1 text-[11px] text-neutral-400 truncate">
                      {user.email || 'Authenticated'}
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        signInWithGoogle();
                        setProfileDropdownOpen(false);
                      }}
                      className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold transition-colors"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      Sign In to Sync Devices
                    </button>
                  )}
                </div>

                {/* Account Actions */}
                {user && (
                  <div className="pt-1 px-2">
                    <button
                      onClick={() => {
                        signOut();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-neutral-400 hover:text-red-400 hover:bg-neutral-800/40 rounded transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out of NetTube
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Secondary Category Scroll Bar */}
      <div className="lg:hidden flex items-center gap-2 px-4 pt-2.5 overflow-x-auto no-scrollbar text-xs font-medium">
        {NAV_LINKS.map((link) => {
          const isActive = activeNavTab === link.id && searchQuery === '';
          return (
            <button
              key={link.id}
              onClick={() => {
                setActiveNavTab(link.id);
                setSearchQuery('');
              }}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-neutral-100 text-neutral-900 font-semibold shadow-sm'
                  : 'bg-neutral-900/80 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              {link.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
