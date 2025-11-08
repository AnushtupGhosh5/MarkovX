/**
 * Export/Import utilities for MusePilot projects
 * Handles serialization and deserialization of complete session data
 */

import { SessionContext } from '@/src/types';

export interface MusePilotProject {
  version: string;
  exportedAt: number;
  session: SessionContext;
  metadata: {
    appVersion: string;
    platform: string;
    userAgent: string;
  };
}

const CURRENT_VERSION = '1.0.0';
const FILE_EXTENSION = '.musepilot';

/**
 * Export session data to a downloadable JSON file
 */
export function exportProject(session: SessionContext, filename?: string): void {
  const project: MusePilotProject = {
    version: CURRENT_VERSION,
    exportedAt: Date.now(),
    session: {
      ...session,
      updatedAt: Date.now(),
    },
    metadata: {
      appVersion: CURRENT_VERSION,
      platform: typeof window !== 'undefined' ? window.navigator.platform : 'unknown',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
    },
  };

  const jsonString = JSON.stringify(project, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const projectName = session.projectName || 'untitled';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const defaultFilename = `${projectName}_${timestamp}${FILE_EXTENSION}`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename || defaultFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Import project from a file
 */
export async function importProject(file: File): Promise<SessionContext> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const project: MusePilotProject = JSON.parse(content);

        // Validate project structure
        if (!project.version || !project.session) {
          throw new Error('Invalid project file format');
        }

        // Version compatibility check
        if (!isCompatibleVersion(project.version)) {
          console.warn(`Project version ${project.version} may not be fully compatible with current version ${CURRENT_VERSION}`);
        }

        // Validate session data
        validateSession(project.session);

        resolve(project.session);
      } catch (error) {
        reject(new Error(`Failed to parse project file: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

/**
 * Check if a version is compatible with the current version
 */
function isCompatibleVersion(version: string): boolean {
  const [major] = version.split('.').map(Number);
  const [currentMajor] = CURRENT_VERSION.split('.').map(Number);
  return major === currentMajor;
}

/**
 * Validate session data structure
 */
function validateSession(session: any): void {
  if (!session.id || typeof session.id !== 'string') {
    throw new Error('Invalid session ID');
  }

  if (!session.tempo || typeof session.tempo !== 'number') {
    throw new Error('Invalid tempo');
  }

  if (!Array.isArray(session.notes)) {
    throw new Error('Invalid notes array');
  }

  // Validate each note
  session.notes.forEach((note: any, index: number) => {
    if (!note.id || typeof note.id !== 'string') {
      throw new Error(`Invalid note ID at index ${index}`);
    }
    if (typeof note.pitch !== 'number' || note.pitch < 0 || note.pitch > 127) {
      throw new Error(`Invalid pitch at note ${index}`);
    }
    if (typeof note.start !== 'number' || note.start < 0) {
      throw new Error(`Invalid start time at note ${index}`);
    }
    if (typeof note.duration !== 'number' || note.duration <= 0) {
      throw new Error(`Invalid duration at note ${index}`);
    }
    if (typeof note.velocity !== 'number' || note.velocity < 0 || note.velocity > 127) {
      throw new Error(`Invalid velocity at note ${index}`);
    }
  });
}

/**
 * Export session as MIDI file
 */
export function exportAsMIDI(session: SessionContext, filename?: string): void {
  // Create MIDI file structure
  const midiData = createMIDIFile(session);
  const blob = new Blob([midiData], { type: 'audio/midi' });
  const url = URL.createObjectURL(blob);

  const projectName = session.projectName || 'untitled';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const defaultFilename = `${projectName}_${timestamp}.mid`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename || defaultFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Create a MIDI file from session data
 */
function createMIDIFile(session: SessionContext): Uint8Array {
  const { notes, tempo, timeSignature } = session;

  // MIDI file header
  const header = new Uint8Array([
    0x4d, 0x54, 0x68, 0x64, // "MThd"
    0x00, 0x00, 0x00, 0x06, // Header length (6 bytes)
    0x00, 0x00,             // Format 0 (single track)
    0x00, 0x01,             // Number of tracks (1)
    0x01, 0xe0,             // Ticks per quarter note (480)
  ]);

  // Calculate microseconds per quarter note from BPM
  const microsecondsPerQuarterNote = Math.floor(60000000 / tempo);

  // Track header
  const trackEvents: number[] = [];

  // Add tempo meta event
  trackEvents.push(
    0x00, // Delta time
    0xff, 0x51, 0x03, // Tempo meta event
    (microsecondsPerQuarterNote >> 16) & 0xff,
    (microsecondsPerQuarterNote >> 8) & 0xff,
    microsecondsPerQuarterNote & 0xff
  );

  // Add time signature meta event
  trackEvents.push(
    0x00, // Delta time
    0xff, 0x58, 0x04, // Time signature meta event
    timeSignature[0], // Numerator
    Math.log2(timeSignature[1]), // Denominator (as power of 2)
    24, // MIDI clocks per metronome click
    8   // 32nd notes per quarter note
  );

  // Sort notes by start time
  const sortedNotes = [...notes].sort((a, b) => a.start - b.start);

  // Convert notes to MIDI events
  const ticksPerBeat = 480;
  let currentTick = 0;

  sortedNotes.forEach((note) => {
    const startTick = Math.floor(note.start * ticksPerBeat);
    const endTick = Math.floor((note.start + note.duration) * ticksPerBeat);

    // Note On event
    const deltaTimeOn = startTick - currentTick;
    trackEvents.push(...encodeVariableLength(deltaTimeOn));
    trackEvents.push(0x90, note.pitch, note.velocity); // Note On, channel 0

    // Note Off event
    const deltaTimeOff = endTick - startTick;
    trackEvents.push(...encodeVariableLength(deltaTimeOff));
    trackEvents.push(0x80, note.pitch, 0x40); // Note Off, channel 0

    currentTick = endTick;
  });

  // End of track
  trackEvents.push(0x00, 0xff, 0x2f, 0x00);

  // Track chunk
  const trackLength = trackEvents.length;
  const trackHeader = new Uint8Array([
    0x4d, 0x54, 0x72, 0x6b, // "MTrk"
    (trackLength >> 24) & 0xff,
    (trackLength >> 16) & 0xff,
    (trackLength >> 8) & 0xff,
    trackLength & 0xff,
  ]);

  // Combine header, track header, and track events
  const midiFile = new Uint8Array(header.length + trackHeader.length + trackEvents.length);
  midiFile.set(header, 0);
  midiFile.set(trackHeader, header.length);
  midiFile.set(trackEvents, header.length + trackHeader.length);

  return midiFile;
}

/**
 * Encode a number as MIDI variable-length quantity
 */
function encodeVariableLength(value: number): number[] {
  const bytes: number[] = [];
  let buffer = value & 0x7f;

  while (value >>= 7) {
    buffer <<= 8;
    buffer |= 0x80;
    buffer += value & 0x7f;
  }

  while (true) {
    bytes.push(buffer & 0xff);
    if (buffer & 0x80) {
      buffer >>= 8;
    } else {
      break;
    }
  }

  return bytes;
}

/**
 * Get file extension for project files
 */
export function getProjectFileExtension(): string {
  return FILE_EXTENSION;
}

/**
 * Check if a file is a valid MusePilot project file
 */
export function isValidProjectFile(filename: string): boolean {
  return filename.toLowerCase().endsWith(FILE_EXTENSION);
}
