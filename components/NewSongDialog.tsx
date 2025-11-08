'use client';

import React, { useState } from 'react';
import { songService, CreateSongData } from '@/lib/firebase/songService';
import { useAuth } from '@/lib/auth/AuthContext';

interface NewSongDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSongCreated: (songId: string) => void;
}

export default function NewSongDialog({ isOpen, onClose, onSongCreated }: NewSongDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateSongData>({
    title: '',
    genre: '',
    mood: '',
    tempo: '',
    key: '',
    style: '',
    instruments: [],
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const songId = await songService.createSong(user.uid, formData);
      onSongCreated(songId);
      onClose();
      setFormData({
        title: '',
        genre: '',
        mood: '',
        tempo: '',
        key: '',
        style: '',
        instruments: [],
        notes: ''
      });
    } catch (error) {
      console.error('Failed to create song:', error);
      alert('Failed to create song. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Create New Song</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Song Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="My Awesome Song"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Genre</label>
              <select
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select genre</option>
                <option value="pop">Pop</option>
                <option value="rock">Rock</option>
                <option value="jazz">Jazz</option>
                <option value="classical">Classical</option>
                <option value="electronic">Electronic</option>
                <option value="hip-hop">Hip Hop</option>
                <option value="country">Country</option>
                <option value="r&b">R&B</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Mood</label>
              <select
                value={formData.mood}
                onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select mood</option>
                <option value="happy">Happy</option>
                <option value="sad">Sad</option>
                <option value="energetic">Energetic</option>
                <option value="calm">Calm</option>
                <option value="dark">Dark</option>
                <option value="uplifting">Uplifting</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tempo</label>
              <select
                value={formData.tempo}
                onChange={(e) => setFormData({ ...formData, tempo: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select tempo</option>
                <option value="slow">Slow (60-80 BPM)</option>
                <option value="medium">Medium (80-120 BPM)</option>
                <option value="fast">Fast (120-160 BPM)</option>
                <option value="very-fast">Very Fast (160+ BPM)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Key</label>
              <select
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                className="w-full px-4 py-2 bg-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select key</option>
                <option value="C">C Major</option>
                <option value="G">G Major</option>
                <option value="D">D Major</option>
                <option value="A">A Major</option>
                <option value="E">E Major</option>
                <option value="Am">A Minor</option>
                <option value="Em">E Minor</option>
                <option value="Dm">D Minor</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Style</label>
            <input
              type="text"
              value={formData.style}
              onChange={(e) => setFormData({ ...formData, style: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., Acoustic, Orchestral, Synth-heavy"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Notes / Description</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 bg-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 h-24 resize-none"
              placeholder="Add any notes or ideas for this song..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Song'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
