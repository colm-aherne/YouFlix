'use client';

import React, { useState } from 'react';
import { useAuthAndSync } from '@/context/AuthAndSyncContext';
import { AVATAR_LIST } from '@/data/defaultCategories';
import { UserProfile } from '@/types';
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  User,
  Shield,
  Bot,
  Sparkles,
  Heart,
  Smile,
  Baby,
} from 'lucide-react';

interface ProfileSelectModalProps {
  onClose: () => void;
}

export function ProfileSelectModal({ onClose }: ProfileSelectModalProps) {
  const {
    profiles,
    currentProfile,
    selectProfile,
    createProfile,
    updateProfile,
    deleteProfile,
  } = useAuthAndSync();

  const [isManaging, setIsManaging] = useState(false);
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // New profile state
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState('avatar_red');
  const [newIsKid, setNewIsKid] = useState(false);

  const handleStartCreate = () => {
    setNewName('');
    setNewAvatar('avatar_emerald');
    setNewIsKid(false);
    setIsCreating(true);
  };

  const handleSaveNewProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await createProfile(newName, newAvatar, newIsKid);
    setIsCreating(false);
  };

  const handleSaveEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile || !editingProfile.name.trim()) return;
    await updateProfile(editingProfile.id, editingProfile.name, editingProfile.avatar);
    setEditingProfile(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this profile? All watch history for this profile will be removed.')) {
      await deleteProfile(id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/95 backdrop-blur-lg flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl text-center space-y-8 my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-0 right-0 p-2 text-neutral-400 hover:text-white rounded-full bg-neutral-900 border border-neutral-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="space-y-2">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {isManaging ? 'Manage Profiles' : "Who's watching?"}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400">
            Profiles keep your watch progress, favorite categories, and continue watching lists separate and synced.
          </p>
        </div>

        {/* Profiles Grid */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {profiles.map((prof) => {
            const avatarMeta = AVATAR_LIST.find((a) => a.id === prof.avatar) || AVATAR_LIST[0];
            const isSelected = prof.id === currentProfile?.id;

            return (
              <div
                key={prof.id}
                className="flex flex-col items-center gap-3 group cursor-pointer"
                onClick={() => {
                  if (isManaging) {
                    setEditingProfile(prof);
                  } else {
                    selectProfile(prof);
                    onClose();
                  }
                }}
              >
                {/* Avatar Card */}
                <div
                  className={`relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl ${avatarMeta.bg} flex items-center justify-center text-white text-3xl sm:text-4xl font-black shadow-xl group-hover:ring-4 group-hover:ring-white transition-all duration-200 group-hover:scale-105 ${
                    isSelected && !isManaging ? 'ring-2 ring-red-500' : ''
                  }`}
                >
                  {prof.name.charAt(0).toUpperCase()}

                  {/* Kids Badge */}
                  {prof.isKid && (
                    <span className="absolute -bottom-2 bg-amber-500 text-neutral-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-full shadow">
                      Kids
                    </span>
                  )}

                  {/* Manage Overlay Edit Icon */}
                  {isManaging && (
                    <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                      <Edit2 className="w-7 h-7 text-white" />
                    </div>
                  )}
                </div>

                {/* Profile Name */}
                <span className="text-sm sm:text-base font-semibold text-neutral-300 group-hover:text-white transition-colors">
                  {prof.name}
                </span>
              </div>
            );
          })}

          {/* Add Profile Button */}
          {profiles.length < 5 && (
            <div
              className="flex flex-col items-center gap-3 group cursor-pointer"
              onClick={handleStartCreate}
            >
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl border-2 border-dashed border-neutral-700 group-hover:border-white bg-neutral-900/50 flex items-center justify-center text-neutral-400 group-hover:text-white transition-all group-hover:scale-105">
                <Plus className="w-10 h-10" />
              </div>
              <span className="text-sm sm:text-base font-medium text-neutral-400 group-hover:text-white">
                Add Profile
              </span>
            </div>
          )}
        </div>

        {/* Bottom Toggle Button */}
        <div>
          <button
            onClick={() => setIsManaging((prev) => !prev)}
            className="px-8 py-2.5 border border-neutral-600 hover:border-white text-neutral-300 hover:text-white text-xs sm:text-sm font-semibold uppercase tracking-widest transition-all rounded"
          >
            {isManaging ? 'Done' : 'Manage Profiles'}
          </button>
        </div>

        {/* Create Profile Sub-Modal */}
        {isCreating && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-left space-y-5">
              <h3 className="text-xl font-bold text-white">Create New Profile</h3>

              <form onSubmit={handleSaveNewProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Profile Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-2">
                    Choose Avatar
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVATAR_LIST.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setNewAvatar(av.id)}
                        className={`w-10 h-10 rounded-lg ${av.bg} flex items-center justify-center text-white text-xs font-bold transition-all ${
                          newAvatar === av.id ? 'ring-2 ring-white scale-110 shadow-lg' : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        {av.name.charAt(0)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isKidCheck"
                    checked={newIsKid}
                    onChange={(e) => setNewIsKid(e.target.checked)}
                    className="w-4 h-4 accent-red-600 rounded"
                  />
                  <label htmlFor="isKidCheck" className="text-xs text-neutral-300 cursor-pointer">
                    Kids Profile (Shows only kid-friendly animations and nature)
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-4 py-2 text-xs text-neutral-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow"
                  >
                    Save Profile
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Profile Sub-Modal */}
        {editingProfile && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-left space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Edit Profile</h3>
                {profiles.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      handleDelete(editingProfile.id);
                      setEditingProfile(null);
                    }}
                    className="text-xs text-neutral-400 hover:text-red-400 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Profile</span>
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveEditProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Profile Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProfile.name}
                    onChange={(e) =>
                      setEditingProfile({ ...editingProfile, name: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-700 rounded-lg text-sm text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-2">
                    Choose Avatar
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVATAR_LIST.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() =>
                          setEditingProfile({ ...editingProfile, avatar: av.id })
                        }
                        className={`w-10 h-10 rounded-lg ${av.bg} flex items-center justify-center text-white text-xs font-bold transition-all ${
                          editingProfile.avatar === av.id
                            ? 'ring-2 ring-white scale-110 shadow-lg'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        {av.name.charAt(0)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setEditingProfile(null)}
                    className="px-4 py-2 text-xs text-neutral-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
