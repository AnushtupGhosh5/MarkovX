/**
 * MIDI Utility Functions
 * Provides conversion and validation utilities for MIDI operations
 */

/**
 * Valid MIDI note range
 */
export const MIDI_NOTE_MIN = 0;
export const MIDI_NOTE_MAX = 127;

/**
 * Standard MIDI reference: A4 = 440Hz at MIDI note 69
 */
const MIDI_A4 = 69;
const FREQ_A4 = 440;

/**
 * Convert MIDI note number to frequency in Hz
 * Uses the formula: f = 440 * 2^((n-69)/12)
 * 
 * @param midiNote - MIDI note number (0-127)
 * @returns Frequency in Hz
 * @throws Error if MIDI note is out of valid range
 */
export function noteToFrequency(midiNote: number): number {
  if (!isValidMidiNote(midiNote)) {
    throw new Error(
      `Invalid MIDI note: ${midiNote}. Must be between ${MIDI_NOTE_MIN} and ${MIDI_NOTE_MAX}`
    );
  }

  return FREQ_A4 * Math.pow(2, (midiNote - MIDI_A4) / 12);
}

/**
 * Convert frequency in Hz to nearest MIDI note number
 * Uses the formula: n = 69 + 12 * log2(f/440)
 * 
 * @param frequency - Frequency in Hz (must be positive)
 * @returns Nearest MIDI note number (0-127)
 * @throws Error if frequency is invalid
 */
export function frequencyToNote(frequency: number): number {
  if (frequency <= 0) {
    throw new Error(`Invalid frequency: ${frequency}. Must be positive`);
  }

  const midiNote = Math.round(MIDI_A4 + 12 * Math.log2(frequency / FREQ_A4));
  
  // Clamp to valid MIDI range
  return Math.max(MIDI_NOTE_MIN, Math.min(MIDI_NOTE_MAX, midiNote));
}

/**
 * Convert beats to seconds based on tempo
 * Uses the formula: seconds = (beats * 60) / tempo
 * 
 * @param beats - Number of beats
 * @param tempo - Tempo in BPM (beats per minute)
 * @returns Time in seconds
 * @throws Error if tempo is invalid
 */
export function beatsToSeconds(beats: number, tempo: number): number {
  if (tempo <= 0) {
    throw new Error(`Invalid tempo: ${tempo}. Must be positive`);
  }

  return (beats * 60) / tempo;
}

/**
 * Convert seconds to beats based on tempo
 * Uses the formula: beats = (seconds * tempo) / 60
 * 
 * @param seconds - Time in seconds
 * @param tempo - Tempo in BPM (beats per minute)
 * @returns Number of beats
 * @throws Error if tempo is invalid
 */
export function secondsToBeats(seconds: number, tempo: number): number {
  if (tempo <= 0) {
    throw new Error(`Invalid tempo: ${tempo}. Must be positive`);
  }

  return (seconds * tempo) / 60;
}

/**
 * Validate if a number is a valid MIDI note (0-127)
 * 
 * @param note - Number to validate
 * @returns True if valid MIDI note, false otherwise
 */
export function isValidMidiNote(note: number): boolean {
  return (
    Number.isFinite(note) &&
    note >= MIDI_NOTE_MIN &&
    note <= MIDI_NOTE_MAX &&
    Number.isInteger(note)
  );
}

/**
 * Clamp a MIDI note to valid range (0-127)
 * 
 * @param note - MIDI note number
 * @returns Clamped MIDI note number
 */
export function clampMidiNote(note: number): number {
  return Math.max(MIDI_NOTE_MIN, Math.min(MIDI_NOTE_MAX, Math.round(note)));
}

/**
 * Validate MIDI note and throw error if invalid
 * 
 * @param note - MIDI note number to validate
 * @throws Error if note is invalid
 */
export function validateMidiNote(note: number): void {
  if (!isValidMidiNote(note)) {
    throw new Error(
      `Invalid MIDI note: ${note}. Must be an integer between ${MIDI_NOTE_MIN} and ${MIDI_NOTE_MAX}`
    );
  }
}

/**
 * Get MIDI note name from note number
 * 
 * @param midiNote - MIDI note number (0-127)
 * @returns Note name (e.g., "C4", "A#5")
 */
export function getMidiNoteName(midiNote: number): string {
  validateMidiNote(midiNote);

  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midiNote / 12) - 1;
  const noteName = noteNames[midiNote % 12];

  return `${noteName}${octave}`;
}

/**
 * Get MIDI note number from note name
 * 
 * @param noteName - Note name (e.g., "C4", "A#5", "Bb3")
 * @returns MIDI note number (0-127)
 * @throws Error if note name is invalid
 */
export function getMidiNoteFromName(noteName: string): number {
  const match = noteName.match(/^([A-G])(#|b)?(-?\d+)$/i);
  
  if (!match) {
    throw new Error(`Invalid note name: ${noteName}`);
  }

  const [, note, accidental, octaveStr] = match;
  const octave = parseInt(octaveStr, 10);

  const noteValues: Record<string, number> = {
    'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11
  };

  let midiNote = noteValues[note.toUpperCase()] + (octave + 1) * 12;

  if (accidental === '#') {
    midiNote += 1;
  } else if (accidental === 'b') {
    midiNote -= 1;
  }

  if (!isValidMidiNote(midiNote)) {
    throw new Error(`Note ${noteName} is out of MIDI range (${MIDI_NOTE_MIN}-${MIDI_NOTE_MAX})`);
  }

  return midiNote;
}
