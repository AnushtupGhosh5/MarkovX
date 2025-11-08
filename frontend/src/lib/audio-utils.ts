/**
 * Audio utility functions for MIDI and frequency conversions
 */

/**
 * Convert MIDI note number to frequency in Hz
 * MIDI note 69 (A4) = 440 Hz
 */
export function midiToFrequency(midiNote: number): number {
  return 440 * Math.pow(2, (midiNote - 69) / 12);
}

/**
 * Convert MIDI note number to note name with octave
 */
export function midiToNoteName(midiNote: number): string {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midiNote / 12) - 1;
  const noteName = noteNames[midiNote % 12];
  return `${noteName}${octave}`;
}

/**
 * Convert beats to seconds based on tempo
 */
export function beatsToSeconds(beats: number, bpm: number): number {
  return (beats * 60) / bpm;
}

/**
 * Convert seconds to beats based on tempo
 */
export function secondsToBeats(seconds: number, bpm: number): number {
  return (seconds * bpm) / 60;
}
