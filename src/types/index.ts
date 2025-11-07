// Core type definitions for MusePilot

export interface Note {
  id: string;
  pitch: number;        // MIDI note number (0-127)
  start: number;        // Start time in beats
  duration: number;     // Duration in beats
  velocity: number;     // Note velocity (0-127)
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface LyricsSegment {
  id: string;
  text: string;
  startTime: number;    // In seconds
  endTime: number;      // In seconds
  syllableCount?: number;
}

export interface GeneratedAudio {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

export interface SessionContext {
  id: string;
  createdAt: number;
  updatedAt: number;
  
  // Musical parameters
  tempo: number;                    // BPM, default 120
  keySignature: string;             // e.g., "C", "Am", "F#"
  timeSignature: [number, number];  // e.g., [4, 4]
  
  // MIDI data
  notes: Note[];
  
  // Audio layers
  generatedAudio: GeneratedAudio[];
  
  // Lyrics
  lyrics: {
    text: string;
    segments: LyricsSegment[];
  };
  
  // AI conversation
  conversationHistory: Message[];
  
  // Metadata
  projectName?: string;
  tags?: string[];
}
