import * as Tone from 'tone';
import { Note } from '@/src/types';
import { noteToFrequency, beatsToSeconds } from '@/src/lib/midi';

/**
 * AudioEngine class manages audio playback using Tone.js
 * Handles MIDI note scheduling, audio buffer playback, and transport controls
 */
export class AudioEngine {
  private synth: Tone.PolySynth;
  private audioPlayer: Tone.Player | null = null;
  private scheduledNotes: number[] = [];
  private isInitialized = false;
  private onTimeUpdate?: (time: number) => void;
  private updateInterval: number | null = null;

  constructor() {
    // Initialize PolySynth for MIDI playback
    this.synth = new Tone.PolySynth(Tone.Synth, {
      envelope: {
        attack: 0.02,
        decay: 0.1,
        sustain: 0.3,
        release: 1,
      },
    }).toDestination();

    // Set initial volume
    this.synth.volume.value = -10;
  }

  /**
   * Initialize audio context on user interaction
   * Required by browsers for audio playback
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await Tone.start();
      this.isInitialized = true;
      console.log('AudioEngine initialized');
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      throw new Error('Failed to initialize audio engine');
    }
  }

  /**
   * Load generated audio from URL or buffer
   * @param audioUrl - URL to audio file or audio buffer
   */
  async loadAudio(audioUrl: string): Promise<void> {
    try {
      // Dispose of existing player if any
      if (this.audioPlayer) {
        this.audioPlayer.dispose();
      }

      // Create new player with the audio URL
      this.audioPlayer = new Tone.Player({
        url: audioUrl,
        onload: () => {
          console.log('Audio loaded successfully');
        },
      }).toDestination();

      // Wait for the audio to load
      await Tone.loaded();
    } catch (error) {
      console.error('Failed to load audio:', error);
      throw new Error('Failed to load audio file');
    }
  }

  /**
   * Schedule MIDI notes for playback
   * @param notes - Array of Note objects to schedule
   * @param tempo - Tempo in BPM
   */
  scheduleNotes(notes: Note[], tempo: number): void {
    // Clear previously scheduled notes
    this.clearScheduledNotes();

    // Set transport BPM
    Tone.Transport.bpm.value = tempo;

    // Schedule each note
    notes.forEach((note) => {
      const frequency = noteToFrequency(note.pitch);
      const startTime = beatsToSeconds(note.start, tempo);
      const duration = beatsToSeconds(note.duration, tempo);
      const velocity = note.velocity / 127; // Normalize to 0-1

      // Schedule note with Tone.Transport
      const eventId = Tone.Transport.schedule((time) => {
        this.synth.triggerAttackRelease(frequency, duration, time, velocity);
      }, startTime);

      this.scheduledNotes.push(eventId);
    });

    console.log(`Scheduled ${notes.length} notes at ${tempo} BPM`);
  }

  /**
   * Start playback
   * @param onTimeUpdate - Callback for time updates (called ~60fps)
   */
  async play(onTimeUpdate?: (time: number) => void): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    this.onTimeUpdate = onTimeUpdate;

    // Start transport
    Tone.Transport.start();

    // Start audio player if loaded
    if (this.audioPlayer && this.audioPlayer.loaded) {
      this.audioPlayer.start();
    }

    // Start time update interval
    this.startTimeUpdates();

    console.log('Playback started');
  }

  /**
   * Pause playback
   */
  pause(): void {
    Tone.Transport.pause();

    // Pause audio player if playing
    if (this.audioPlayer && this.audioPlayer.state === 'started') {
      this.audioPlayer.stop();
    }

    // Stop time updates
    this.stopTimeUpdates();

    console.log('Playback paused');
  }

  /**
   * Stop playback and reset to beginning
   */
  stop(): void {
    Tone.Transport.stop();
    Tone.Transport.position = 0;

    // Stop audio player
    if (this.audioPlayer) {
      this.audioPlayer.stop();
    }

    // Stop time updates
    this.stopTimeUpdates();

    console.log('Playback stopped');
  }

  /**
   * Seek to specific time position
   * @param time - Time in seconds
   */
  seek(time: number): void {
    const wasPlaying = Tone.Transport.state === 'started';

    // Stop transport
    if (wasPlaying) {
      Tone.Transport.pause();
    }

    // Set new position
    Tone.Transport.seconds = Math.max(0, time);

    // Seek audio player if loaded
    if (this.audioPlayer && this.audioPlayer.loaded) {
      this.audioPlayer.stop();
      if (wasPlaying) {
        this.audioPlayer.start('+0', time);
      }
    }

    // Resume if was playing
    if (wasPlaying) {
      Tone.Transport.start();
    }

    // Update time immediately
    if (this.onTimeUpdate) {
      this.onTimeUpdate(time);
    }

    console.log(`Seeked to ${time.toFixed(2)}s`);
  }

  /**
   * Get current playback time in seconds
   */
  getCurrentTime(): number {
    return Tone.Transport.seconds;
  }

  /**
   * Set tempo (BPM)
   * @param tempo - Tempo in beats per minute
   */
  setTempo(tempo: number): void {
    Tone.Transport.bpm.value = tempo;
  }

  /**
   * Get current tempo
   */
  getTempo(): number {
    return Tone.Transport.bpm.value;
  }

  /**
   * Check if audio engine is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stop();
    this.clearScheduledNotes();

    if (this.audioPlayer) {
      this.audioPlayer.dispose();
      this.audioPlayer = null;
    }

    this.synth.dispose();
    this.isInitialized = false;

    console.log('AudioEngine disposed');
  }

  // Private helper methods

  private clearScheduledNotes(): void {
    this.scheduledNotes.forEach((id) => {
      Tone.Transport.clear(id);
    });
    this.scheduledNotes = [];
  }

  private startTimeUpdates(): void {
    if (this.updateInterval !== null) return;

    // Update time at ~60fps
    this.updateInterval = window.setInterval(() => {
      if (this.onTimeUpdate && Tone.Transport.state === 'started') {
        this.onTimeUpdate(this.getCurrentTime());
      }
    }, 1000 / 60);
  }

  private stopTimeUpdates(): void {
    if (this.updateInterval !== null) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}

// Singleton instance for global access
let audioEngineInstance: AudioEngine | null = null;

/**
 * Get or create the global AudioEngine instance
 */
export function getAudioEngine(): AudioEngine {
  if (!audioEngineInstance) {
    audioEngineInstance = new AudioEngine();
  }
  return audioEngineInstance;
}

/**
 * Dispose the global AudioEngine instance
 */
export function disposeAudioEngine(): void {
  if (audioEngineInstance) {
    audioEngineInstance.dispose();
    audioEngineInstance = null;
  }
}
