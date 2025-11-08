'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { songService, Song } from '@/lib/firebase/songService';
import NewSongDialog from '@/components/NewSongDialog';
import { Music, Plus, Clock, Trash2, Archive } from 'lucide-react';

export default function MySongsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewSongDialog, setShowNewSongDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadSongs();
    }
  }, [user]);

  const loadSongs = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const userSongs = await songService.getUserSongs(user.uid);
      setSongs(userSongs);
      console.log('Loaded songs:', userSongs.length);
    } catch (error: any) {
      console.error('Failed to load songs:', error);
      setError(error.message || 'Failed to load songs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSongCreated = (songId: string) => {
    router.push(`/?song=${songId}`);
  };

  const handleDeleteSong = async (songId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this song? This action cannot be undone.')) {
      return;
    }

    try {
      await songService.deleteSong(songId);
      setSongs(songs.filter(s => s.song_id !== songId));
    } catch (error) {
      console.error('Failed to delete song:', error);
      alert('Failed to delete song. Please try again.');
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your songs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Songs</h1>
            <p className="text-gray-400">
              {songs.length} {songs.length === 1 ? 'song' : 'songs'} in your workspace
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadSongs}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/15 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh songs"
            >
              <svg className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={() => setShowNewSongDialog(true)}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              <Plus size={20} />
              New Song
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-600/20 border border-red-500/50 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="text-red-400 font-semibold mb-1">Error Loading Songs</h3>
                <p className="text-red-300 text-sm">{error}</p>
                <button
                  onClick={loadSongs}
                  className="mt-3 text-sm text-red-400 hover:text-red-300 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {songs.length === 0 ? (
          <div className="text-center py-16">
            <Music size={64} className="mx-auto mb-4 text-gray-600" />
            <h2 className="text-2xl font-semibold mb-2">No songs yet</h2>
            <p className="text-gray-400 mb-6">
              Create your first song to start making music with AI
            </p>
            <button
              onClick={() => setShowNewSongDialog(true)}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              Create Your First Song
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {songs.map((song) => (
              <div
                key={song.song_id}
                onClick={() => router.push(`/?song=${song.song_id}`)}
                className="bg-zinc-900 rounded-lg p-6 hover:bg-zinc-800 transition-colors cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-purple-400 transition-colors">
                      {song.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {song.genre && (
                        <span className="px-2 py-1 bg-purple-600/20 text-purple-400 text-xs rounded">
                          {song.genre}
                        </span>
                      )}
                      {song.mood && (
                        <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded">
                          {song.mood}
                        </span>
                      )}
                      {song.tempo && (
                        <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded">
                          {song.tempo}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteSong(song.song_id, e)}
                    className="p-2 hover:bg-red-600/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} className="text-red-400" />
                  </button>
                </div>

                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Music size={16} />
                    <span>{song.audio_files.length} audio files</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>Updated {formatDate(song.last_updated)}</span>
                  </div>
                  {song.notes && (
                    <p className="text-gray-500 line-clamp-2 mt-3">
                      {song.notes}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-800">
                  <span className="text-xs text-gray-500">
                    Version {song.version_number}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <NewSongDialog
        isOpen={showNewSongDialog}
        onClose={() => setShowNewSongDialog(false)}
        onSongCreated={handleSongCreated}
      />
    </div>
  );
}
