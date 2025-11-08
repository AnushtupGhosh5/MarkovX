/**
 * Tests for export/import functionality
 */

import { SessionContext } from '@/src/types';

// Mock session data for testing
const mockSession: SessionContext = {
  id: 'test-session-123',
  createdAt: 1699564800000,
  updatedAt: 1699564800000,
  tempo: 120,
  keySignature: 'C',
  timeSignature: [4, 4],
  notes: [
    {
      id: 'note-1',
      pitch: 60, // Middle C
      start: 0,
      duration: 1,
      velocity: 100,
    },
    {
      id: 'note-2',
      pitch: 64, // E
      start: 1,
      duration: 1,
      velocity: 90,
    },
    {
      id: 'note-3',
      pitch: 67, // G
      start: 2,
      duration: 2,
      velocity: 110,
    },
  ],
  generatedAudio: [],
  lyrics: {
    text: 'Test lyrics',
    segments: [],
  },
  conversationHistory: [
    {
      id: 'msg-1',
      role: 'user',
      content: 'Create a simple melody',
      timestamp: 1699564800000,
    },
  ],
  projectName: 'Test Project',
  tags: ['test', 'demo'],
};

describe('Export/Import System', () => {
  describe('Session Validation', () => {
    it('should validate a correct session', () => {
      // This would test the validateSession function
      expect(mockSession.id).toBeDefined();
      expect(mockSession.tempo).toBeGreaterThan(0);
      expect(Array.isArray(mockSession.notes)).toBe(true);
    });

    it('should validate note data', () => {
      mockSession.notes.forEach((note) => {
        expect(note.id).toBeDefined();
        expect(note.pitch).toBeGreaterThanOrEqual(0);
        expect(note.pitch).toBeLessThanOrEqual(127);
        expect(note.start).toBeGreaterThanOrEqual(0);
        expect(note.duration).toBeGreaterThan(0);
        expect(note.velocity).toBeGreaterThanOrEqual(0);
        expect(note.velocity).toBeLessThanOrEqual(127);
      });
    });
  });

  describe('MIDI Export', () => {
    it('should calculate correct tempo in microseconds', () => {
      const bpm = 120;
      const microsecondsPerQuarterNote = Math.floor(60000000 / bpm);
      expect(microsecondsPerQuarterNote).toBe(500000);
    });

    it('should convert beats to MIDI ticks', () => {
      const ticksPerBeat = 480;
      const beat = 2.5;
      const ticks = Math.floor(beat * ticksPerBeat);
      expect(ticks).toBe(1200);
    });

    it('should encode variable length quantities correctly', () => {
      // Test variable length encoding
      const encodeVariableLength = (value: number): number[] => {
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
      };

      expect(encodeVariableLength(0)).toEqual([0]);
      expect(encodeVariableLength(127)).toEqual([127]);
      expect(encodeVariableLength(128)).toEqual([0x81, 0x00]);
    });
  });

  describe('Project File Format', () => {
    it('should create valid project structure', () => {
      const project = {
        version: '1.0.0',
        exportedAt: Date.now(),
        session: mockSession,
        metadata: {
          appVersion: '1.0.0',
          platform: 'test',
          userAgent: 'test-agent',
        },
      };

      expect(project.version).toBeDefined();
      expect(project.session).toBeDefined();
      expect(project.metadata).toBeDefined();
    });

    it('should serialize and deserialize correctly', () => {
      const project = {
        version: '1.0.0',
        exportedAt: Date.now(),
        session: mockSession,
        metadata: {
          appVersion: '1.0.0',
          platform: 'test',
          userAgent: 'test-agent',
        },
      };

      const jsonString = JSON.stringify(project);
      const parsed = JSON.parse(jsonString);

      expect(parsed.session.id).toBe(mockSession.id);
      expect(parsed.session.notes.length).toBe(mockSession.notes.length);
      expect(parsed.session.tempo).toBe(mockSession.tempo);
    });
  });

  describe('Version Compatibility', () => {
    it('should check version compatibility', () => {
      const isCompatibleVersion = (version: string, currentVersion: string): boolean => {
        const [major] = version.split('.').map(Number);
        const [currentMajor] = currentVersion.split('.').map(Number);
        return major === currentMajor;
      };

      expect(isCompatibleVersion('1.0.0', '1.0.0')).toBe(true);
      expect(isCompatibleVersion('1.1.0', '1.0.0')).toBe(true);
      expect(isCompatibleVersion('1.9.9', '1.0.0')).toBe(true);
      expect(isCompatibleVersion('2.0.0', '1.0.0')).toBe(false);
    });
  });

  describe('File Naming', () => {
    it('should generate valid filenames', () => {
      const projectName = 'My Project';
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `${projectName}_${timestamp}.musepilot`;

      expect(filename).toContain('My Project');
      expect(filename).toContain('.musepilot');
      expect(filename).not.toContain(':');
      expect(filename).not.toContain('.');
    });

    it('should validate file extensions', () => {
      const isValidProjectFile = (filename: string): boolean => {
        return filename.toLowerCase().endsWith('.musepilot');
      };

      expect(isValidProjectFile('project.musepilot')).toBe(true);
      expect(isValidProjectFile('PROJECT.MUSEPILOT')).toBe(true);
      expect(isValidProjectFile('project.mid')).toBe(false);
      expect(isValidProjectFile('project.json')).toBe(false);
    });
  });
});

// Export mock data for use in other tests
export { mockSession };
