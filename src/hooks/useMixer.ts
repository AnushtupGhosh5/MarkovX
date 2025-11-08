/**
 * Hook to access mixer functionality from any component
 * Provides methods to play notes on specific tracks
 */

import { useEffect, useState } from 'react';

interface MixerAPI {
  playNoteOnTrack: (trackId: string, midiNote: number, duration: number, velocity?: number) => void;
  scheduleNotesOnTrack: (trackId: string, notes: Array<{pitch: number, start: number, duration: number, velocity: number}>) => void;
  playTestNote: (trackId: string) => void;
  getTracks: () => any[];
  getAudioChannel: (trackId: string) => any;
}

export function useMixer() {
  const [mixerAPI, setMixerAPI] = useState<MixerAPI | null>(null);

  useEffect(() => {
    // Check if mixer API is available
    const checkMixer = () => {
      if (typeof window !== 'undefined' && (window as any).mixerAPI) {
        setMixerAPI((window as any).mixerAPI);
      }
    };

    // Check immediately
    checkMixer();

    // Check periodically until mixer is ready
    const interval = setInterval(checkMixer, 100);

    // Cleanup
    return () => clearInterval(interval);
  }, []);

  return {
    isReady: mixerAPI !== null,
    playNoteOnTrack: mixerAPI?.playNoteOnTrack || (() => console.warn('Mixer not ready')),
    scheduleNotesOnTrack: mixerAPI?.scheduleNotesOnTrack || (() => console.warn('Mixer not ready')),
    playTestNote: mixerAPI?.playTestNote || (() => console.warn('Mixer not ready')),
    getTracks: mixerAPI?.getTracks || (() => []),
    getAudioChannel: mixerAPI?.getAudioChannel || (() => null),
  };
}
