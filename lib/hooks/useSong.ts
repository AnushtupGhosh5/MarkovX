import { useState, useEffect } from 'react';
import { songService, Song, ChatMessage } from '@/lib/firebase/songService';
import { useAuth } from '@/lib/auth/AuthContext';

export function useSong(songId: string | null) {
  const { user } = useAuth();
  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (songId) {
      loadSong(songId);
    } else {
      setSong(null);
    }
  }, [songId]);

  const loadSong = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const songData = await songService.getSong(id);
      setSong(songData);
    } catch (err) {
      setError('Failed to load song');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addChatMessage = async (message: ChatMessage) => {
    if (!songId) return;
    
    try {
      await songService.addChatMessage(songId, message);
      // Update local state
      if (song) {
        setSong({
          ...song,
          ai_chat_context: [...song.ai_chat_context, message]
        });
      }
    } catch (err) {
      console.error('Failed to add chat message:', err);
      throw err;
    }
  };

  const uploadAudio = async (audioBlob: Blob, filename: string) => {
    if (!songId || !user) return null;
    
    try {
      const url = await songService.uploadAudioFile(songId, user.uid, audioBlob, filename);
      // Reload song to get updated data
      await loadSong(songId);
      return url;
    } catch (err) {
      console.error('Failed to upload audio:', err);
      throw err;
    }
  };

  const updateSongMetadata = async (updates: Partial<Song>) => {
    if (!songId) return;
    
    try {
      await songService.updateSong(songId, updates);
      // Reload song to get updated data
      await loadSong(songId);
    } catch (err) {
      console.error('Failed to update song:', err);
      throw err;
    }
  };

  const incrementVersion = async () => {
    if (!songId) return;
    
    try {
      await songService.incrementVersion(songId);
      // Update local state
      if (song) {
        setSong({
          ...song,
          version_number: song.version_number + 1
        });
      }
    } catch (err) {
      console.error('Failed to increment version:', err);
      throw err;
    }
  };

  return {
    song,
    loading,
    error,
    addChatMessage,
    uploadAudio,
    updateSongMetadata,
    incrementVersion,
    reloadSong: () => songId && loadSong(songId)
  };
}
