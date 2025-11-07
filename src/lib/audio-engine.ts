import { Note } from '@/src/types';
import { midiToFrequency, beatsToSeconds } from './audio-utils';

export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private isInitialized: boolean = false;
  private masterGain: GainNode | null = null;

  constructor() {
    // Audio context will be created during initialization
  }

  /**
   * Initialize audio context (must be called after user interaction)
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('✅ Audio already initialized');
      return;
    }
    
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create master gain node
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.3; // Master volume
      this.masterGain.connect(this.audioContext.destination);
      
      // Resume context if suspended (browser autoplay policy)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      this.isInitialized = true;
      console.log('✅ Audio engine initialized successfully!');
      console.log('🎵 AudioContext state:', this.audioContext.state);
    } catch (error) {
      console.error('❌ Failed to initialize audio:', error);
      throw error;
    }
  }

  /**
   * Play a single note immediately
   */
  playNote(midiNote: number, duration: number = 0.5, velocity: number = 100): void {
    if (!this.isInitialized || !this.audioContext || !this.masterGain) {
      console.warn('⚠️ Audio engine not initialized, initializing now...');
      this.initialize().then(() => this.playNote(midiNote, duration, velocity));
      return;
    }

    try {
      const frequency = midiToFrequency(midiNote);
      const now = this.audioContext.currentTime;
      
      console.log(`🎹 Playing MIDI ${midiNote} at ${frequency.toFixed(2)}Hz for ${duration}s`);
      
      // Create oscillator
      const oscillator = this.audioContext.createOscillator();
      oscillator.type = 'triangle'; // Smooth sound
      oscillator.frequency.value = frequency;
      
      // Create gain node for this note
      const gainNode = this.audioContext.createGain();
      const velocityNormalized = velocity / 127;
      
      // ADSR envelope
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(velocityNormalized * 0.3, now + 0.01); // Attack
      gainNode.gain.linearRampToValueAtTime(velocityNormalized * 0.2, now + 0.1); // Decay
      gainNode.gain.setValueAtTime(velocityNormalized * 0.2, now + duration - 0.1); // Sustain
      gainNode.gain.linearRampToValueAtTime(0, now + duration); // Release
      
      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      // Start and stop
      oscillator.start(now);
      oscillator.stop(now + duration);
      
      console.log('✅ Note playing!');
    } catch (error) {
      console.error('❌ Error playing note:', error);
    }
  }

  /**
   * Schedule notes for playback
   */
  scheduleNotes(notes: Note[], bpm: number): void {
    if (!this.isInitialized || !this.audioContext || !this.masterGain) {
      console.warn('Audio engine not initialized');
      return;
    }

    const now = this.audioContext.currentTime;
    
    console.log(`🎵 Scheduling ${notes.length} notes at ${bpm} BPM`);

    // Schedule each note
    notes.forEach(note => {
      const frequency = midiToFrequency(note.pitch);
      const startTime = now + beatsToSeconds(note.start, bpm);
      const duration = beatsToSeconds(note.duration, bpm);
      const velocityNormalized = note.velocity / 127;

      // Create oscillator for this note
      const oscillator = this.audioContext!.createOscillator();
      oscillator.type = 'triangle';
      oscillator.frequency.value = frequency;
      
      // Create gain node
      const gainNode = this.audioContext!.createGain();
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(velocityNormalized * 0.3, startTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(velocityNormalized * 0.2, startTime + 0.1);
      gainNode.gain.setValueAtTime(velocityNormalized * 0.2, startTime + duration - 0.1);
      gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
      
      // Connect and play
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain!);
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    });
  }

  /**
   * Start playback (notes are already scheduled)
   */
  play(): void {
    console.log('▶️ Play called');
  }

  /**
   * Pause playback
   */
  pause(): void {
    console.log('⏸️ Pause called');
  }

  /**
   * Stop playback
   */
  stop(): void {
    console.log('⏹️ Stop called');
  }

  /**
   * Seek to a specific position in beats
   */
  seek(beats: number): void {
    console.log(`⏩ Seek to ${beats} beats`);
  }

  /**
   * Get current playback position in beats
   */
  getCurrentPosition(): number {
    return 0;
  }

  /**
   * Check if currently playing
   */
  isPlaying(): boolean {
    return false;
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// Singleton instance
let audioEngineInstance: AudioEngine | null = null;

export function getAudioEngine(): AudioEngine {
  if (!audioEngineInstance) {
    audioEngineInstance = new AudioEngine();
  }
  return audioEngineInstance;
}
