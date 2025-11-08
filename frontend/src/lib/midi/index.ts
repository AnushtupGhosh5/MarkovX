/**
 * MIDI utilities module
 * Exports all MIDI-related utility functions
 */

export {
  noteToFrequency,
  frequencyToNote,
  beatsToSeconds,
  secondsToBeats,
  isValidMidiNote,
  clampMidiNote,
  validateMidiNote,
  getMidiNoteName,
  getMidiNoteFromName,
  MIDI_NOTE_MIN,
  MIDI_NOTE_MAX,
} from './utils';
