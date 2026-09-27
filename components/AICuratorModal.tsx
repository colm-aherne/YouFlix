'use client';

import React, { useState } from 'react';
import { useAuthAndSync } from '@/context/AuthAndSyncContext';
import { VideoItem } from '@/types';
import {
  Sparkles,
  X,
  Play,
  CheckCircle2,
  FolderPlus,
  Loader2,
  Send,
  Zap,
} from 'lucide-react';

interface AICuratorModalProps {
  onClose: () => void;
}

interface CuratedResult {
  playlistTitle: string;
  category: string;
  description: string;
  recommendedVideos: {
    id: string;
    title: string;
    channelTitle: string;
    description: string;
    durationMinutes: number;
    matchScore?: number;
    ageRating?: string;
  }[];
}

export function AICuratorModal({ onClose }: AICuratorModalProps) {
  const { createPlaylist, playVideo } = useAuthAndSync();

  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CuratedResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const PRESETS = [
    '🌌 Mind-bending space mysteries, deep cosmic horizons & astrophysics',
    '🎧 Chill aesthetic lo-fi coding sessions with pixel art visuals',
    '🕹️ Speedrun rivalries & legendary video game development lore',
    '🌿 Relaxing 4K Earth drone journeys & alpine nature',
    '⚡ High-octane sci-fi short films and cyber futures',
  ];

  const handleCurate = async (targetPrompt: string) => {
    if (!targetPrompt.trim()) return;
    setLoading(true);
    setErrorMsg('');
    setResult(null);

    try {
      const res = await fetch('/api/curate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vibePrompt: targetPrompt }),
      });

      if (!res.ok) {
        throw new Error('Curation service encountered an issue. Please retry.');
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to curate vibe.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndPlay = async () => {
    if (!result) return;
    const videoIds = result.recommendedVideos.map((v) => v.id);
    const plId = await createPlaylist(
      result.playlistTitle,
      result.category,
      result.description,
      videoIds
    );

    // Play the first video immediately
    const first = result.recommendedVideos[0];
    if (first) {
      const firstVideoItem: VideoItem = {
        id: first.id,
        title: first.title,
        description: first.description || result.description,
        channelTitle: first.channelTitle,
        duration: (first.durationMinutes || 10) * 60,
        durationFormatted: `${first.durationMinutes || 10}m`,
        category: result.category,
        thumbnailUrl: `https://i.ytimg.com/vi/${first.id}/maxresdefault.jpg`,
        quality: '4K Ultra HD',
        audio: 'Dolby 5.1',
        matchScore: first.matchScore || 99,
        ageRating: (first.ageRating as any) || 'PG-13',
      };
      playVideo(firstVideoItem);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 my-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-red-900/30">
              <Sparkles className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>NetTube AI Vibe Matcher</span>
                <span className="text-[10px] bg-red-600/30 text-red-300 border border-red-500/40 px-2 py-0.5 rounded font-mono">
                  Gemini 2.5
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Describe your mood or topic, and Gemini will assemble an instant synchronized Netflix playlist!
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

        {/* Preset Pills */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-neutral-400">Try a Popular Vibe:</div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPrompt(preset);
                  handleCurate(preset);
                }}
                className="text-xs text-neutral-300 hover:text-white bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 px-3 py-1.5 rounded-full transition-all text-left"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input */}
        <div className="space-y-2">
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. Vintage synthwave music with 80s anime clips..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCurate(prompt);
                }
              }}
              className="w-full pl-4 pr-24 py-3 bg-neutral-950 border border-neutral-700 rounded-xl text-sm text-white focus:outline-none focus:border-red-500 shadow-inner"
            />
            <button
              onClick={() => handleCurate(prompt)}
              disabled={loading || !prompt.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Curate</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/40 border border-red-900 rounded-lg text-xs text-red-400">
            {errorMsg}
          </div>
        )}

        {/* Curated Results Preview */}
        {result && (
          <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">
                  {result.category}
                </span>
                <h3 className="text-base font-bold text-white tracking-tight">
                  {result.playlistTitle}
                </h3>
                <p className="text-xs text-neutral-400 mt-1">{result.description}</p>
              </div>
              <button
                onClick={handleSaveAndPlay}
                className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-neutral-200 text-neutral-950 rounded-lg text-xs font-bold transition-all hover:scale-105 shrink-0 shadow-lg"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Save & Play</span>
              </button>
            </div>

            {/* List of recommended videos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {result.recommendedVideos.map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-center gap-2.5 p-2 bg-neutral-900/90 rounded-lg border border-neutral-800"
                >
                  <img
                    src={`https://i.ytimg.com/vi/${rec.id}/hqdefault.jpg`}
                    alt={rec.title}
                    referrerPolicy="no-referrer"
                    className="w-16 h-10 object-cover rounded shrink-0 bg-neutral-950"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-white truncate">{rec.title}</h4>
                    <p className="text-[10px] text-neutral-400 truncate">{rec.channelTitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
