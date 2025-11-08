import { useEffect, useRef } from 'react';
import { getAudioEngine } from '@/src/lib/audio-engine';

export function useAudioEngine() {
  const audioEngineRef = useRef(getAudioEngine());
  const isInitializedRef = useRef(false);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (isInitializedRef.current) {
        audioEngineRef.current.stop();
      }
    };
  }, []);

  const initializeAudio = async () => {
    if (!isInitializedRef.current) {
      console.log('🎵 Initializing audio engine...');
      try {
        await audioEngineRef.current.initialize();
        isInitializedRef.current = true;
        console.log('✅ Audio engine initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize audio engine:', error);
      }
    }
  };

  const playNote = (midiNote: number, duration?: number, velocity?: number) => {
    console.log(`🎹 Playing note: MIDI ${midiNote}, duration: ${duration}, velocity: ${velocity}`);
    initializeAudio().then(() => {
      audioEngineRef.current.playNote(midiNote, duration, velocity);
    }).catch(error => {
      console.error('❌ Error playing note:', error);
    });
  };

  return {
    audioEngine: audioEngineRef.current,
    playNote,
    initializeAudio
  };
}
