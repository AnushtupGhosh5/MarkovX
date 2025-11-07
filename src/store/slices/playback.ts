import { StateCreator } from 'zustand';

export interface PlaybackSlice {
  // Playback state
  isPlaying: boolean;
  currentTime: number; // In seconds
  
  // Playback control actions
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setCurrentTime: (time: number) => void;
}

export const createPlaybackSlice: StateCreator<PlaybackSlice> = (set) => ({
  isPlaying: false,
  currentTime: 0,
  
  play: () =>
    set(() => ({
      isPlaying: true,
    })),
  
  pause: () =>
    set(() => ({
      isPlaying: false,
    })),
  
  stop: () =>
    set(() => ({
      isPlaying: false,
      currentTime: 0,
    })),
  
  seek: (time) =>
    set(() => ({
      currentTime: Math.max(0, time),
    })),
  
  setCurrentTime: (time) =>
    set(() => ({
      currentTime: Math.max(0, time),
    })),
});
