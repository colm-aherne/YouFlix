export type AgeRating = 'G' | 'PG' | 'PG-13' | 'TV-14' | 'TV-MA';

export interface VideoItem {
  id: string; // YouTube Video ID
  title: string;
  description: string;
  channelTitle: string;
  channelAvatar?: string;
  publishedAt?: string;
  duration: number; // in seconds
  durationFormatted?: string;
  category: string;
  tags?: string[];
  viewCount?: string;
  matchScore?: number; // e.g. 98% Match
  ageRating?: AgeRating;
  quality?: '4K Ultra HD' | 'HD' | '8K Master';
  audio?: 'Dolby 5.1' | 'Spatial Stereo' | 'Lossless Audio';
  thumbnailUrl: string;
  backdropUrl?: string;
  isOriginal?: boolean;
  trailerId?: string; // YouTube ID for preview trailer
}

export interface CategoryPlaylist {
  id: string;
  title: string;
  slug: string;
  description?: string;
  category: string;
  iconName?: string;
  isCustom?: boolean;
  userId?: string;
  profileId?: string;
  videoIds: string[];
  videos: VideoItem[];
  videoCount?: number;
  coverVideoId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CustomPlaylist = CategoryPlaylist;


export interface UserProfile {
  id: string;
  userId: string;
  name: string;
  avatar: string;
  avatarBg?: string;
  isKid?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface WatchProgress {
  id: string;
  userId: string;
  profileId: string;
  videoId: string;
  title: string;
  channelTitle: string;
  duration: number;
  currentTime: number;
  progressPercent: number;
  thumbnailUrl: string;
  category: string;
  completed: boolean;
  lastWatchedAt: string;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  profileId: string;
  videoId: string;
  title: string;
  channelTitle: string;
  duration: number;
  thumbnailUrl: string;
  category: string;
  addedAt: string;
}

export interface VideoRating {
  id: string;
  userId: string;
  profileId: string;
  videoId: string;
  rating: 'like' | 'dislike' | 'loved';
  updatedAt: string;
}

export interface RoomSyncState {
  roomId: string;
  hostName: string;
  currentVideoId: string;
  currentTime: number;
  isPlaying: boolean;
  updatedAt: number;
}
