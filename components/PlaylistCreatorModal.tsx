'use client';

import React, { useState } from 'react';
import { useAuthAndSync } from '@/context/AuthAndSyncContext';
import { VideoItem } from '@/types';
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  Link2,
  FolderPlus,
  CheckCircle2,
  Play,
} from 'lucide-react';

interface PlaylistCreatorModalProps {
  onClose: () => void;
}

// Utility to parse YouTube video IDs from any YouTube URL format
function extractYouTubeId(input: string): string | null {
  const trimmed = input.trim();
  // Direct 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  // Standard watch URL: youtube.com/watch?v=...
  const watchMatch = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/i);
  if (watchMatch && watchMatch[1]) {
    return watchMatch[1];
  }
  return null;
}

export function PlaylistCreatorModal({ onClose }: PlaylistCreatorModalProps) {
  const { createPlaylist, isCloudSynced } = useAuthAndSync();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Custom Playlists');
  const [description, setDescription] = useState('');
  const [videoInput, setVideoInput] = useState('');
  const [videoIds, setVideoIds] = useState<string[]>(['kd2KEHvK-q8', 'sCNlt5nvSI8']);
  const [inputError, setInputError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const PRESET_CATEGORIES = [
    'Custom Playlists',
    'Sci-Fi Cinema',
    'Documentaries & Deep Dives',
    'Future Tech & Science',
    'Live Music & Concerts',
    'Gaming Lore & Speedruns',
    'Nature & Earth 4K',
    'Coding & Developer Flow',
  ];

  const handleAddVideo = () => {
    setInputError('');
    if (!videoInput.trim()) return;

    const extractedId = extractYouTubeId(videoInput);
    if (!extractedId) {
      setInputError('Please enter a valid YouTube Video URL (e.g. https://youtu.be/...) or 11-character ID.');
      return;
    }

    if (videoIds.includes(extractedId)) {
      setInputError('This video is already in the playlist.');
      return;
    }

    setVideoIds((prev) => [...prev, extractedId]);
    setVideoInput('');
  };

  const handleRemoveVideo = (idToRemove: string) => {
    setVideoIds((prev) => prev.filter((id) => id !== idToRemove));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (videoIds.length === 0) {
      setInputError('Please add at least 1 YouTube video.');
      return;
    }

    setIsSaving(true);
    try {
      await createPlaylist(title, category, description, videoIds);
      onClose();
    } catch (err) {
      console.error('Failed to create playlist:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 my-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Create Synced Category Playlist</h2>
              <p className="text-xs text-neutral-400">
                Playlists automatically sync across all your phones, tablets, and TVs via Firestore.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          {/* Playlist Title */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Playlist Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Epic Space Documentaries & Ambient Soundtracks"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Category / Shelf Genre
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
            >
              {PRESET_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="A curated collection of late-night deep dives..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none focus:border-red-500 transition-colors resize-none"
            />
          </div>

          {/* Add YouTube Video Input */}
          <div className="pt-2 border-t border-neutral-800 space-y-2">
            <label className="block text-xs font-semibold text-neutral-300">
              Add YouTube Videos (Paste URL or Video ID)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=... or ID"
                  value={videoInput}
                  onChange={(e) => {
                    setVideoInput(e.target.value);
                    setInputError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddVideo();
                    }
                  }}
                  className="w-full pl-9 pr-3.5 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:border-red-500"
                />
              </div>
              <button
                type="button"
                onClick={handleAddVideo}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-semibold border border-neutral-700 transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-red-500" />
                <span>Add</span>
              </button>
            </div>
            {inputError && <p className="text-xs text-red-400 font-medium">{inputError}</p>}
          </div>

          {/* Added Videos Preview Grid */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-neutral-400">
              Playlist Items ({videoIds.length} videos)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-1">
              {videoIds.map((vid, idx) => (
                <div
                  key={vid}
                  className="relative group rounded-lg overflow-hidden bg-neutral-950 border border-neutral-800 aspect-video"
                >
                  <img
                    src={`https://i.ytimg.com/vi/${vid}/hqdefault.jpg`}
                    alt={`Video ${vid}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1 left-1 bg-black/80 px-1 rounded text-[10px] font-mono text-neutral-300">
                    #{idx + 1}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveVideo(vid)}
                    className="absolute top-1 right-1 p-1 bg-black/80 hover:bg-red-600 text-white rounded transition-colors"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex items-center justify-between border-t border-neutral-800">
            <div className="flex items-center gap-1.5 text-xs text-neutral-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{isCloudSynced ? 'Syncs with Firestore Cloud' : 'Saves to Local Device'}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || !title.trim() || videoIds.length === 0}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow transition-all hover:scale-105"
              >
                {isSaving ? 'Creating...' : 'Create & Sync'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
