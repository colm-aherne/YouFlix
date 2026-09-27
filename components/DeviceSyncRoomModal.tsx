'use client';

import React, { useState } from 'react';
import { useAuthAndSync } from '@/context/AuthAndSyncContext';
import {
  Smartphone,
  Tv,
  Radio,
  CheckCircle2,
  Copy,
  X,
  LogIn,
  Layers,
  Sparkles,
  Laptop,
  Tablet,
} from 'lucide-react';

interface DeviceSyncRoomModalProps {
  onClose: () => void;
}

export function DeviceSyncRoomModal({ onClose }: DeviceSyncRoomModalProps) {
  const { user, signInWithGoogle, currentProfile, isCloudSynced } = useAuthAndSync();
  const [copied, setCopied] = useState(false);

  // Generate stable device pair code based on user UID or local ID
  const devicePairCode = user
    ? `NET-${user.uid.slice(0, 4).toUpperCase()}-${user.uid.slice(-4).toUpperCase()}`
    : 'NET-GUEST-SYNC';

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 my-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-lg shadow-emerald-950/40">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Cross-Device Cloud Sync</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                  Live
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Continue watching and sync your category playlists on phone, iPad, and TV.
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

        {/* Device Matrix Illustration */}
        <div className="p-4 bg-neutral-950 border border-neutral-800/80 rounded-xl space-y-3">
          <div className="flex items-center justify-around py-3 text-neutral-400 border-b border-neutral-900">
            <div className="flex flex-col items-center gap-1.5">
              <Laptop className="w-6 h-6 text-red-500" />
              <span className="text-[11px] font-medium text-neutral-300">Desktop / Mac</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-400 font-mono text-xs">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Real-time</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Tablet className="w-6 h-6 text-blue-400" />
              <span className="text-[11px] font-medium text-neutral-300">Tablet / iPad</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-400 font-mono text-xs">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Real-time</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Smartphone className="w-6 h-6 text-amber-400" />
              <span className="text-[11px] font-medium text-neutral-300">Mobile Phone</span>
            </div>
          </div>

          <div className="space-y-1.5 pt-1 text-xs text-neutral-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Continue watching shelf syncs down to the exact second.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Custom category playlists appear instantly across all devices.</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>My List and ratings remain synchronized with your profile.</span>
            </div>
          </div>
        </div>

        {/* Sync Status / Authentication Call to Action */}
        <div className="space-y-3">
          {user ? (
            <div className="p-3 bg-emerald-950/30 border border-emerald-900/50 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Connected to Firestore Cloud
                </span>
                <span className="text-neutral-400">{user.email}</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                To sync on your other devices, simply open NetTube on that device and log in with this same Google account.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-3">
              <div className="text-xs font-semibold text-white">
                Enable Instant Multi-Device Sync
              </div>
              <p className="text-xs text-neutral-400">
                Sign in with Google to enable automatic Firestore database persistence across all your screens.
              </p>
              <button
                onClick={() => {
                  signInWithGoogle();
                  onClose();
                }}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 shadow transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign in with Google</span>
              </button>
            </div>
          )}
        </div>

        {/* Share App URL */}
        <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'URL Copied to Clipboard!' : 'Copy NetTube App URL'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
