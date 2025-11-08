import { useEffect, useRef } from 'react';
import { useStore } from '@/src/store';
import { getAudioEngine } from './AudioEngine';

/**
 * React hook to integrate AudioEngine with Zustand store
 * Syncs playback state and handles audio engine lifecycle
 */
export function useAudioEngine() {
  const audioEngineRef = useRef(getAudioEngine());
  const audioEngine = audioEngineRef.current;

  // Get store state and actions
  const isPlaying = useStore((state) => state.isPlaying);
  const currentTime = useStore((state) => state.currentTime);
  const setCurrentTime = useStore((state) => state.setCurrentTime);
  const play = useStore((state) => state.play);
  const pause = useStore((state) => state.pause);
  const stop = useStore((state) => state.stop);
  const seek = useStore((state) => state.seek);
  
  const session = useStore((state) => state.session);
  const { tempo, notes } = session;

  // Sync tempo with audio engine
  useEffect(() => {
    if (audioEngine.isReady()) {
      audioEngine.setTempo(tempo);
    }
  }, [tempo, audioEngine]);

  // Schedule notes when they change
  useEffect(() => {
    if (audioEngine.isReady() && notes.length > 0) {
      audioEngine.scheduleNotes(notes, tempo);
    }
  }, [notes, tempo, audioEngine]);

  // Handle play/pause state changes
  useEffect(() => {
    const handlePlayback = async () => {
      if (isPlaying) {
        // Initialize audio context if needed (requires user interaction)
        if (!audioEngine.isReady()) {
          try {
            await audioEngine.initialize();
            // Schedule notes after initialization
            if (notes.length > 0) {
              audioEngine.scheduleNotes(notes, tempo);
            }
          } catch (error) {
            console.error('Failed to initialize audio:', error);
            pause(); // Revert to paused state
            return;
          }
        }

        // Start playback with time update callback
        await audioEngine.play((time) => {
          setCurrentTime(time);
        });
      } else {
        audioEngine.pause();
      }
    };

    handlePlayback();
  }, [isPlaying, audioEngine, notes, tempo, pause, setCurrentTime]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioEngine.stop();
    };
  }, [audioEngine]);

  // Wrapped control functions that handle both store and audio engine
  const handlePlay = async () => {
    play();
  };

  const handlePause = () => {
    pause();
  };

  const handleStop = () => {
    stop();
    audioEngine.stop();
  };

  const handleSeek = (time: number) => {
    seek(time);
    audioEngine.seek(time);
  };

  const handleLoadAudio = async (audioUrl: string) => {
    try {
      await audioEngine.loadAudio(audioUrl);
    } catch (error) {
      console.error('Failed to load audio:', error);
      throw error;
    }
  };

  return {
    audioEngine,
    isPlaying,
    currentTime,
    play: handlePlay,
    pause: handlePause,
    stop: handleStop,
    seek: handleSeek,
    loadAudio: handleLoadAudio,
    isReady: audioEngine.isReady(),
  };
}
