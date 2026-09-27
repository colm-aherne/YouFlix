'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType, testFirestoreConnection } from '@/lib/firebase';
import {
  UserProfile,
  CustomPlaylist,
  WatchProgress,
  WatchlistItem,
  VideoRating,
  VideoItem,
  RoomSyncState,
} from '@/types';
import { DEFAULT_CATEGORY_PLAYLISTS, ALL_VIDEOS_MAP, AVATAR_LIST } from '@/data/defaultCategories';

interface AuthAndSyncContextType {
  user: User | null;
  authLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;

  // Profiles
  profiles: UserProfile[];
  currentProfile: UserProfile | null;
  selectProfile: (profile: UserProfile) => void;
  createProfile: (name: string, avatar: string, isKid: boolean) => Promise<void>;
  updateProfile: (id: string, name: string, avatar: string) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  showProfileSelector: boolean;
  setShowProfileSelector: (show: boolean) => void;

  // Custom Category Playlists
  customPlaylists: CustomPlaylist[];
  allCategoryPlaylists: CustomPlaylist[];
  createPlaylist: (title: string, category: string, description: string, videoIds: string[]) => Promise<string>;
  updatePlaylist: (id: string, data: Partial<CustomPlaylist>) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
  addVideoToPlaylist: (playlistId: string, video: VideoItem) => Promise<void>;
  removeVideoFromPlaylist: (playlistId: string, videoId: string) => Promise<void>;

  // Continue Watching / Watch Progress
  continueWatching: WatchProgress[];
  saveWatchProgress: (videoId: string, currentTime: number, duration: number, videoMeta: Partial<VideoItem>) => Promise<void>;
  clearWatchProgress: (videoId: string) => Promise<void>;

  // Watchlist (My List)
  watchlist: WatchlistItem[];
  toggleWatchlist: (video: VideoItem) => Promise<boolean>;
  isInWatchlist: (videoId: string) => boolean;

  // Video Ratings
  ratings: Record<string, 'like' | 'dislike' | 'loved'>;
  rateVideo: (videoId: string, rating: 'like' | 'dislike' | 'loved') => Promise<void>;

  // Global Player & Info Modal state
  activePlayingVideo: VideoItem | null;
  activePlayingCategoryPlaylist: CustomPlaylist | null;
  playbackStartTime: number;
  playVideo: (video: VideoItem, playlist?: CustomPlaylist | null, startTime?: number) => void;
  closeVideo: () => void;
  infoModalVideo: VideoItem | null;
  openInfoModal: (video: VideoItem) => void;
  closeInfoModal: () => void;

  // Search & Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategorySlug: string;
  setSelectedCategorySlug: (slug: string) => void;

  // Device & Cloud Sync status
  isCloudSynced: boolean;
  deviceSyncRoom: RoomSyncState | null;
  setDeviceSyncRoom: (room: RoomSyncState | null) => void;
}

const DEFAULT_LOCAL_PROFILES: UserProfile[] = [
  {
    id: 'prof_main',
    userId: 'local',
    name: 'Viewer',
    avatar: 'avatar_red',
    isKid: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prof_cinema',
    userId: 'local',
    name: 'Cinephile',
    avatar: 'avatar_purple',
    isKid: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'prof_kids',
    userId: 'local',
    name: 'Kids Club',
    avatar: 'avatar_kids',
    isKid: true,
    createdAt: new Date().toISOString(),
  },
];

const AuthAndSyncContext = createContext<AuthAndSyncContextType | undefined>(undefined);

export function AuthAndSyncProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Profiles State
  const [profiles, setProfiles] = useState<UserProfile[]>(DEFAULT_LOCAL_PROFILES);
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      const savedProfileId = localStorage.getItem('nettube_profile_id');
      if (savedProfileId) {
        return DEFAULT_LOCAL_PROFILES.find((p) => p.id === savedProfileId) || DEFAULT_LOCAL_PROFILES[0];
      }
    }
    return DEFAULT_LOCAL_PROFILES[0];
  });
  const [showProfileSelector, setShowProfileSelector] = useState(false);

  // Playlists State
  const [customPlaylists, setCustomPlaylists] = useState<CustomPlaylist[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('nettube_custom_playlists');
        if (saved) return JSON.parse(saved);
      } catch (err) {
        console.warn('Error reading saved custom playlists:', err);
      }
    }
    return [];
  });

  // Continue Watching Progress State
  const [continueWatching, setContinueWatching] = useState<WatchProgress[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('nettube_watch_progress');
        if (saved) return JSON.parse(saved);
      } catch (err) {
        console.warn('Error reading saved watch progress:', err);
      }
    }
    return [];
  });

  // Watchlist State
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('nettube_watchlist');
        if (saved) return JSON.parse(saved);
      } catch (err) {
        console.warn('Error reading saved watchlist:', err);
      }
    }
    return [];
  });

  // Ratings State
  const [ratings, setRatings] = useState<Record<string, 'like' | 'dislike' | 'loved'>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('nettube_ratings');
        if (saved) return JSON.parse(saved);
      } catch (err) {
        console.warn('Error reading saved ratings:', err);
      }
    }
    return {};
  });

  // Player & Detail Modal State
  const [activePlayingVideo, setActivePlayingVideo] = useState<VideoItem | null>(null);
  const [activePlayingCategoryPlaylist, setActivePlayingCategoryPlaylist] = useState<CustomPlaylist | null>(null);
  const [playbackStartTime, setPlaybackStartTime] = useState<number>(0);
  const [infoModalVideo, setInfoModalVideo] = useState<VideoItem | null>(null);

  // Search & Navigation
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState('all');

  // Room / Device Sync state
  const [deviceSyncRoom, setDeviceSyncRoom] = useState<RoomSyncState | null>(null);
  const [isCloudSynced, setIsCloudSynced] = useState(false);

  // Test Firestore connection on mount
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Listen to Auth State Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
      setIsCloudSynced(!!firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  // Sync Profiles from Firestore
  useEffect(() => {
    if (!user) return;

    const path = `users/${user.uid}/profiles`;
    const colRef = collection(db, 'users', user.uid, 'profiles');

    const unsub: Unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        if (snapshot.empty) {
          // Initialize default profiles for the user in Firestore
          DEFAULT_LOCAL_PROFILES.forEach(async (dp) => {
            const docPath = `users/${user.uid}/profiles/${dp.id}`;
            try {
              await setDoc(doc(db, 'users', user.uid, 'profiles', dp.id), {
                userId: user.uid,
                name: dp.name,
                avatar: dp.avatar,
                isKid: dp.isKid || false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, docPath);
            }
          });
        } else {
          const list: UserProfile[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              id: docSnap.id,
              userId: data.userId || user.uid,
              name: data.name || 'Viewer',
              avatar: data.avatar || 'avatar_red',
              isKid: !!data.isKid,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
            });
          });
          setProfiles(list);
          setCurrentProfile((prev) => {
            if (prev && list.some((p) => p.id === prev.id)) {
              return list.find((p) => p.id === prev.id) || list[0];
            }
            return list[0];
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );

    return () => unsub();
  }, [user]);

  // Sync Custom Playlists from Firestore
  useEffect(() => {
    if (!user) return;

    const path = `users/${user.uid}/playlists`;
    const colRef = collection(db, 'users', user.uid, 'playlists');

    const unsub: Unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const list: CustomPlaylist[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const videoIds: string[] = data.videoIds || [];
          const videos: VideoItem[] = videoIds.map((vid) => {
            if (ALL_VIDEOS_MAP[vid]) return ALL_VIDEOS_MAP[vid];
            return {
              id: vid,
              title: `Video ${vid}`,
              description: 'Custom YouTube Playlist Item',
              channelTitle: 'YouTube',
              duration: 600,
              durationFormatted: '10m',
              category: data.category || 'Custom',
              thumbnailUrl: `https://i.ytimg.com/vi/${vid}/maxresdefault.jpg`,
              quality: '4K Ultra HD',
              audio: 'Dolby 5.1',
              matchScore: 95,
              ageRating: 'PG-13',
            };
          });

          list.push({
            id: docSnap.id,
            title: data.title,
            slug: `custom-${docSnap.id}`,
            description: data.description || '',
            category: data.category || 'Custom Playlists',
            isCustom: true,
            userId: data.userId,
            profileId: data.profileId,
            videoIds,
            videos,
            coverVideoId: data.coverVideoId || (videoIds[0] ?? 'kd2KEHvK-q8'),
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        });
        setCustomPlaylists(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );

    return () => unsub();
  }, [user]);

  // Sync Watch Progress from Firestore
  useEffect(() => {
    if (!user) return;

    const path = `users/${user.uid}/watchProgress`;
    const colRef = collection(db, 'users', user.uid, 'watchProgress');

    const unsub: Unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const list: WatchProgress[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (!currentProfile || data.profileId === currentProfile.id) {
            list.push({
              id: docSnap.id,
              userId: data.userId,
              profileId: data.profileId,
              videoId: data.videoId,
              title: data.title || 'Video',
              channelTitle: data.channelTitle || 'Channel',
              duration: data.duration || 0,
              currentTime: data.currentTime || 0,
              progressPercent: data.progressPercent || 0,
              thumbnailUrl: data.thumbnailUrl || `https://i.ytimg.com/vi/${data.videoId}/hqdefault.jpg`,
              category: data.category || 'Streaming',
              completed: !!data.completed,
              lastWatchedAt: data.lastWatchedAt || new Date().toISOString(),
            });
          }
        });
        // Sort descending by lastWatchedAt
        list.sort((a, b) => new Date(b.lastWatchedAt).getTime() - new Date(a.lastWatchedAt).getTime());
        setContinueWatching(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );

    return () => unsub();
  }, [user, currentProfile]);

  // Sync Watchlist from Firestore
  useEffect(() => {
    if (!user) return;

    const path = `users/${user.uid}/watchlist`;
    const colRef = collection(db, 'users', user.uid, 'watchlist');

    const unsub: Unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const list: WatchlistItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (!currentProfile || data.profileId === currentProfile.id) {
            list.push({
              id: docSnap.id,
              userId: data.userId,
              profileId: data.profileId,
              videoId: data.videoId,
              title: data.title,
              channelTitle: data.channelTitle || '',
              duration: data.duration || 0,
              thumbnailUrl: data.thumbnailUrl || `https://i.ytimg.com/vi/${data.videoId}/hqdefault.jpg`,
              category: data.category || 'General',
              addedAt: data.addedAt || new Date().toISOString(),
            });
          }
        });
        list.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
        setWatchlist(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );

    return () => unsub();
  }, [user, currentProfile]);

  // Sync Ratings from Firestore
  useEffect(() => {
    if (!user) return;

    const path = `users/${user.uid}/ratings`;
    const colRef = collection(db, 'users', user.uid, 'ratings');

    const unsub: Unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const map: Record<string, 'like' | 'dislike' | 'loved'> = {};
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (!currentProfile || data.profileId === currentProfile.id) {
            map[data.videoId] = data.rating;
          }
        });
        setRatings(map);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );

    return () => unsub();
  }, [user, currentProfile]);

  // Google Sign-In Action
  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Sign-in error:', err);
    }
  };

  // Sign-Out Action
  const signOut = async () => {
    try {
      await fbSignOut(auth);
      setProfiles(DEFAULT_LOCAL_PROFILES);
      setCurrentProfile(DEFAULT_LOCAL_PROFILES[0]);
    } catch (err) {
      console.error('Sign-out error:', err);
    }
  };

  // Profile Selection
  const selectProfile = (profile: UserProfile) => {
    setCurrentProfile(profile);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nettube_profile_id', profile.id);
    }
    setShowProfileSelector(false);
  };

  // Create Profile
  const createProfile = async (name: string, avatar: string, isKid: boolean) => {
    const newId = `prof_${Date.now()}`;
    const newProfile: UserProfile = {
      id: newId,
      userId: user?.uid || 'local',
      name: name.trim() || 'New Profile',
      avatar,
      isKid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (user) {
      const docPath = `users/${user.uid}/profiles/${newId}`;
      try {
        await setDoc(doc(db, 'users', user.uid, 'profiles', newId), {
          userId: user.uid,
          name: newProfile.name,
          avatar: newProfile.avatar,
          isKid: newProfile.isKid,
          createdAt: newProfile.createdAt,
          updatedAt: newProfile.updatedAt,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, docPath);
      }
    } else {
      const updated = [...profiles, newProfile];
      setProfiles(updated);
    }
    setCurrentProfile(newProfile);
  };

  // Update Profile
  const updateProfile = async (id: string, name: string, avatar: string) => {
    if (user) {
      const docPath = `users/${user.uid}/profiles/${id}`;
      try {
        await setDoc(
          doc(db, 'users', user.uid, 'profiles', id),
          {
            name,
            avatar,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, docPath);
      }
    } else {
      setProfiles((prev) =>
        prev.map((p) => (p.id === id ? { ...p, name, avatar, updatedAt: new Date().toISOString() } : p))
      );
      if (currentProfile?.id === id) {
        setCurrentProfile((prev) => (prev ? { ...prev, name, avatar } : null));
      }
    }
  };

  // Delete Profile
  const deleteProfile = async (id: string) => {
    if (profiles.length <= 1) return;
    if (user) {
      const docPath = `users/${user.uid}/profiles/${id}`;
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'profiles', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, docPath);
      }
    } else {
      const filtered = profiles.filter((p) => p.id !== id);
      setProfiles(filtered);
      if (currentProfile?.id === id) {
        setCurrentProfile(filtered[0]);
      }
    }
  };

  // Create Custom Playlist
  const createPlaylist = async (
    title: string,
    category: string,
    description: string,
    videoIds: string[]
  ): Promise<string> => {
    const playlistId = `pl_${Date.now()}`;
    const cleanCategory = category.trim() || 'Custom Playlists';
    const cleanTitle = title.trim() || 'My Custom Playlist';

    if (user) {
      const docPath = `users/${user.uid}/playlists/${playlistId}`;
      try {
        await setDoc(doc(db, 'users', user.uid, 'playlists', playlistId), {
          userId: user.uid,
          profileId: currentProfile?.id || 'prof_main',
          title: cleanTitle,
          category: cleanCategory,
          description: description.trim(),
          isPublic: false,
          videoCount: videoIds.length,
          coverVideoId: videoIds[0] || 'kd2KEHvK-q8',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, docPath);
      }
    } else {
      const newPl: CustomPlaylist = {
        id: playlistId,
        title: cleanTitle,
        slug: `custom-${playlistId}`,
        description,
        category: cleanCategory,
        isCustom: true,
        videoIds,
        videos: videoIds.map((vid) => ALL_VIDEOS_MAP[vid] || {
          id: vid,
          title: `Video ${vid}`,
          description: 'Custom Video',
          channelTitle: 'YouTube',
          duration: 600,
          category: cleanCategory,
          thumbnailUrl: `https://i.ytimg.com/vi/${vid}/maxresdefault.jpg`,
        }),
        coverVideoId: videoIds[0] || 'kd2KEHvK-q8',
      };
      const updated = [newPl, ...customPlaylists];
      setCustomPlaylists(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem('nettube_custom_playlists', JSON.stringify(updated));
      }
    }
    return playlistId;
  };

  // Update Playlist
  const updatePlaylist = async (id: string, data: Partial<CustomPlaylist>) => {
    if (user) {
      const docPath = `users/${user.uid}/playlists/${id}`;
      try {
        await setDoc(
          doc(db, 'users', user.uid, 'playlists', id),
          {
            ...data,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, docPath);
      }
    } else {
      setCustomPlaylists((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p))
      );
    }
  };

  // Delete Playlist
  const deletePlaylist = async (id: string) => {
    if (user) {
      const docPath = `users/${user.uid}/playlists/${id}`;
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'playlists', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, docPath);
      }
    } else {
      setCustomPlaylists((prev) => {
        const next = prev.filter((p) => p.id !== id);
        if (typeof window !== 'undefined') {
          localStorage.setItem('nettube_custom_playlists', JSON.stringify(next));
        }
        return next;
      });
    }
  };

  // Add Video to Playlist
  const addVideoToPlaylist = async (playlistId: string, video: VideoItem) => {
    const target = customPlaylists.find((p) => p.id === playlistId);
    if (!target) return;
    if (target.videoIds.includes(video.id)) return;

    const newVideoIds = [...target.videoIds, video.id];
    await updatePlaylist(playlistId, {
      videoIds: newVideoIds,
      videoCount: newVideoIds.length,
      coverVideoId: target.coverVideoId || video.id,
    });
  };

  // Remove Video from Playlist
  const removeVideoFromPlaylist = async (playlistId: string, videoId: string) => {
    const target = customPlaylists.find((p) => p.id === playlistId);
    if (!target) return;

    const newVideoIds = target.videoIds.filter((id) => id !== videoId);
    await updatePlaylist(playlistId, {
      videoIds: newVideoIds,
      videoCount: newVideoIds.length,
      coverVideoId: newVideoIds[0] || 'kd2KEHvK-q8',
    });
  };

  // Save Watch Progress (Syncs playback position in real-time)
  const saveWatchProgress = useCallback(
    async (videoId: string, currentTime: number, duration: number, videoMeta: Partial<VideoItem>) => {
      if (!currentProfile) return;
      const progressPercent = duration > 0 ? Math.min(100, Math.round((currentTime / duration) * 100)) : 0;
      const completed = progressPercent >= 95;
      const progressId = `${currentProfile.id}_${videoId}`.replace(/[^a-zA-Z0-9_-]/g, '_');

      const payload: WatchProgress = {
        id: progressId,
        userId: user?.uid || 'local',
        profileId: currentProfile.id,
        videoId,
        title: videoMeta.title || 'YouTube Video',
        channelTitle: videoMeta.channelTitle || 'Channel',
        duration: Math.round(duration),
        currentTime: Math.round(currentTime),
        progressPercent,
        thumbnailUrl: videoMeta.thumbnailUrl || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        category: videoMeta.category || 'General',
        completed,
        lastWatchedAt: new Date().toISOString(),
      };

      if (user) {
        const docPath = `users/${user.uid}/watchProgress/${progressId}`;
        try {
          await setDoc(doc(db, 'users', user.uid, 'watchProgress', progressId), payload, { merge: true });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, docPath);
        }
      } else {
        setContinueWatching((prev) => {
          const filtered = prev.filter((p) => !(p.profileId === currentProfile.id && p.videoId === videoId));
          const next = [payload, ...filtered];
          if (typeof window !== 'undefined') {
            localStorage.setItem('nettube_watch_progress', JSON.stringify(next));
          }
          return next;
        });
      }
    },
    [currentProfile, user]
  );

  // Clear Watch Progress
  const clearWatchProgress = async (videoId: string) => {
    if (!currentProfile) return;
    const progressId = `${currentProfile.id}_${videoId}`.replace(/[^a-zA-Z0-9_-]/g, '_');

    if (user) {
      const docPath = `users/${user.uid}/watchProgress/${progressId}`;
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'watchProgress', progressId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, docPath);
      }
    } else {
      setContinueWatching((prev) => {
        const next = prev.filter((p) => !(p.profileId === currentProfile.id && p.videoId === videoId));
        if (typeof window !== 'undefined') {
          localStorage.setItem('nettube_watch_progress', JSON.stringify(next));
        }
        return next;
      });
    }
  };

  // Watchlist Toggle
  const toggleWatchlist = async (video: VideoItem): Promise<boolean> => {
    if (!currentProfile) return false;
    const watchId = `${currentProfile.id}_${video.id}`.replace(/[^a-zA-Z0-9_-]/g, '_');
    const existingIndex = watchlist.findIndex((w) => w.videoId === video.id && w.profileId === currentProfile.id);

    if (existingIndex >= 0) {
      // Remove from watchlist
      if (user) {
        const docPath = `users/${user.uid}/watchlist/${watchId}`;
        try {
          await deleteDoc(doc(db, 'users', user.uid, 'watchlist', watchId));
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, docPath);
        }
      } else {
        const next = watchlist.filter((_, idx) => idx !== existingIndex);
        setWatchlist(next);
        if (typeof window !== 'undefined') {
          localStorage.setItem('nettube_watchlist', JSON.stringify(next));
        }
      }
      return false;
    } else {
      // Add to watchlist
      const item: WatchlistItem = {
        id: watchId,
        userId: user?.uid || 'local',
        profileId: currentProfile.id,
        videoId: video.id,
        title: video.title,
        channelTitle: video.channelTitle,
        duration: video.duration,
        thumbnailUrl: video.thumbnailUrl,
        category: video.category,
        addedAt: new Date().toISOString(),
      };

      if (user) {
        const docPath = `users/${user.uid}/watchlist/${watchId}`;
        try {
          await setDoc(doc(db, 'users', user.uid, 'watchlist', watchId), item);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, docPath);
        }
      } else {
        const next = [item, ...watchlist];
        setWatchlist(next);
        if (typeof window !== 'undefined') {
          localStorage.setItem('nettube_watchlist', JSON.stringify(next));
        }
      }
      return true;
    }
  };

  const isInWatchlist = useCallback(
    (videoId: string) => {
      if (!currentProfile) return false;
      return watchlist.some((w) => w.videoId === videoId && w.profileId === currentProfile.id);
    },
    [watchlist, currentProfile]
  );

  // Video Rating
  const rateVideo = async (videoId: string, rating: 'like' | 'dislike' | 'loved') => {
    if (!currentProfile) return;
    const ratingId = `${currentProfile.id}_${videoId}`.replace(/[^a-zA-Z0-9_-]/g, '_');

    if (user) {
      const docPath = `users/${user.uid}/ratings/${ratingId}`;
      try {
        await setDoc(doc(db, 'users', user.uid, 'ratings', ratingId), {
          userId: user.uid,
          profileId: currentProfile.id,
          videoId,
          rating,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, docPath);
      }
    } else {
      setRatings((prev) => {
        const next = { ...prev, [videoId]: rating };
        if (typeof window !== 'undefined') {
          localStorage.setItem('nettube_ratings', JSON.stringify(next));
        }
        return next;
      });
    }
  };

  // Play Video in Player Modal
  const playVideo = (video: VideoItem, playlist: CustomPlaylist | null = null, startTime: number = 0) => {
    // If not given explicit start time, check if there's continue watching record
    let resumeTime = startTime;
    if (startTime === 0 && currentProfile) {
      const savedProg = continueWatching.find((p) => p.videoId === video.id && p.profileId === currentProfile.id);
      if (savedProg && !savedProg.completed && savedProg.currentTime > 5) {
        resumeTime = savedProg.currentTime;
      }
    }
    setActivePlayingVideo(video);
    setActivePlayingCategoryPlaylist(playlist);
    setPlaybackStartTime(resumeTime);
    setInfoModalVideo(null); // close info modal if open
  };

  const closeVideo = () => {
    setActivePlayingVideo(null);
  };

  // Info Modal
  const openInfoModal = (video: VideoItem) => {
    setInfoModalVideo(video);
  };

  const closeInfoModal = () => {
    setInfoModalVideo(null);
  };

  // Combine Default & Custom Playlists
  const allCategoryPlaylists = useMemo(() => {
    return [...DEFAULT_CATEGORY_PLAYLISTS, ...customPlaylists];
  }, [customPlaylists]);

  return (
    <AuthAndSyncContext.Provider
      value={{
        user,
        authLoading,
        signInWithGoogle,
        signOut,

        // Profiles
        profiles,
        currentProfile,
        selectProfile,
        createProfile,
        updateProfile,
        deleteProfile,
        showProfileSelector,
        setShowProfileSelector,

        // Playlists
        customPlaylists,
        allCategoryPlaylists,
        createPlaylist,
        updatePlaylist,
        deletePlaylist,
        addVideoToPlaylist,
        removeVideoFromPlaylist,

        // Progress
        continueWatching,
        saveWatchProgress,
        clearWatchProgress,

        // Watchlist
        watchlist,
        toggleWatchlist,
        isInWatchlist,

        // Ratings
        ratings,
        rateVideo,

        // Player & Modal
        activePlayingVideo,
        activePlayingCategoryPlaylist,
        playbackStartTime,
        playVideo,
        closeVideo,
        infoModalVideo,
        openInfoModal,
        closeInfoModal,

        // Search & Filter
        searchQuery,
        setSearchQuery,
        selectedCategorySlug,
        setSelectedCategorySlug,

        // Sync & Room
        isCloudSynced,
        deviceSyncRoom,
        setDeviceSyncRoom,
      }}
    >
      {children}
    </AuthAndSyncContext.Provider>
  );
}

export function useAuthAndSync() {
  const context = useContext(AuthAndSyncContext);
  if (!context) {
    throw new Error('useAuthAndSync must be used within an AuthAndSyncProvider');
  }
  return context;
}
