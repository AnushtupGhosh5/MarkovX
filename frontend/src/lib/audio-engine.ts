import * as Tone from 'tone';
import { Note } from '@/src/types';

export class AudioEngine {
  private isInitialized: boolean = false;
  private synth: Tone.PolySynth | null = null;
  private scheduledPart: Tone.Part | null = null;
  private triggeredNotes: Set<string> = new Set();

  constructor() {
    // Tone.js will be initialized on first interaction
  }

  /**
   * Initialize Tone.js (must be called after user interaction)
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('✅ Audio already initialized');
      return;
    }
    
    try {
      // Start Tone.js audio context
      await Tone.start();
      console.log('✅ Tone.js started');
      
      // Create polyphonic synthesizer
      this.synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: {
          attack: 0.01,
          decay: 0.1,
          sustain: 0.3,
          release: 0.5,
        },
      }).toDestination();
      
      // Set master volume
      this.synth.volume.value = -10; // dB
      
      // Set default tempo
      Tone.Transport.bpm.value = 120;
      
      this.isInitialized = true;
      console.log('✅ Audio engine initialized successfully!');
      console.log('🎵 Tone.js context state:', Tone.context.state);
    } catch (error) {
      console.error('❌ Failed to initialize audio:', error);
      throw error;
    }
  }

  /**
   * Play a single note immediately
   */
  playNote(midiNote: number, duration: number = 0.5, velocity: number = 100): void {
    if (!this.isInitialized || !this.synth) {
      console.warn('⚠️ Audio engine not initialized, initializing now...');
      this.initialize().then(() => this.playNote(midiNote, duration, velocity));
      return;
    }

    try {
      const note = Tone.Frequency(midiNote, 'midi').toNote();
      const velocityNormalized = velocity / 127;
      
      console.log(`🎹 Playing MIDI ${midiNote} (${note}) for ${duration}s`);
      
      // Trigger note with velocity
      this.synth.triggerAttackRelease(note, duration, undefined, velocityNormalized);
      
      console.log('✅ Note playing!');
    } catch (error) {
      console.error('❌ Error playing note:', error);
    }
  }

  /**
   * Schedule notes for playback using Tone.Part
   */
  scheduleNotes(notes: Note[], loopStart: number, loopEnd: number, isLoopMode: boolean): void {
    if (!this.isInitialized || !this.synth) {
      console.warn('Audio engine not initialized');
      return;
    }

    // Clear existing scheduled part
    if (this.scheduledPart) {
      this.scheduledPart.dispose();
      this.scheduledPart = null;
    }

    // Clear triggered notes tracking
    this.triggeredNotes.clear();
    
    console.log(`🎵 Scheduling ${notes.length} notes`);

    // Create events array for Tone.Part
    const events = notes.map(note => ({
      time: `${note.start}:0:0`, // Convert beats to Tone.js time notation
      note: Tone.Frequency(note.pitch, 'midi').toNote(),
      duration: `${note.duration}:0:0`,
      velocity: note.velocity / 127,
      id: note.id,
    }));

    // Create a new Part to schedule all notes
    this.scheduledPart = new Tone.Part((time, event) => {
      // Trigger the note
      this.synth!.triggerAttackRelease(event.note, event.duration, time, event.velocity);
      console.log(`🎵 Triggered note: ${event.note} at ${time}`);
    }, events);

    // Configure loop if in loop mode
    if (isLoopMode) {
      this.scheduledPart.loop = true;
      this.scheduledPart.loopStart = `${loopStart}:0:0`;
      this.scheduledPart.loopEnd = `${loopEnd}:0:0`;
      
      Tone.Transport.loop = true;
      Tone.Transport.loopStart = `${loopStart}:0:0`;
      Tone.Transport.loopEnd = `${loopEnd}:0:0`;
    } else {
      this.scheduledPart.loop = false;
      Tone.Transport.loop = false;
    }

    // Start the part
    this.scheduledPart.start(0);
    
    console.log('✅ Notes scheduled');
  }

  /**
   * Start playback
   */
  play(): void {
    if (!this.isInitialized) {
      console.warn('Audio engine not initialized');
      return;
    }
    console.log('▶️ Starting playback');
    Tone.Transport.start();
  }

  /**
   * Pause playback
   */
  pause(): void {
    console.log('⏸️ Pausing playback');
    Tone.Transport.pause();
  }

  /**
   * Stop playback and reset position
   */
  stop(): void {
    console.log('⏹️ Stopping playback');
    Tone.Transport.stop();
    this.triggeredNotes.clear();
  }

  /**
   * Seek to a specific position in beats
   */
  seek(beats: number): void {
    console.log(`⏩ Seeking to ${beats} beats`);
    Tone.Transport.position = `${beats}:0:0`;
    this.triggeredNotes.clear();
  }

  /**
   * Set tempo in BPM
   */
  setTempo(bpm: number): void {
    console.log(`🎵 Setting tempo to ${bpm} BPM`);
    Tone.Transport.bpm.value = bpm;
  }

  /**
   * Get current playback position in beats
   */
  getCurrentPosition(): number {
    const position = Tone.Transport.position;
    // Parse position string (format: "bars:beats:sixteenths")
    const parts = position.toString().split(':');
    const bars = parseInt(parts[0]) || 0;
    const beats = parseFloat(parts[1]) || 0;
    const sixteenths = parseFloat(parts[2]) || 0;
    
    // Convert to total beats (assuming 4/4 time)
    return bars * 4 + beats + sixteenths / 4;
  }

  /**
   * Check if currently playing
   */
  isPlaying(): boolean {
    return Tone.Transport.state === 'started';
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    if (this.scheduledPart) {
      this.scheduledPart.dispose();
    }
    if (this.synth) {
      this.synth.dispose();
    }
    Tone.Transport.stop();
    Tone.Transport.cancel();
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
