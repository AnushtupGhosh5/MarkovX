import { StateCreator } from 'zustand';
import { SessionContext, Note, Message, LyricsSegment } from '@/src/types';
import { clearLocalStorage } from '../middleware/persistence';

export interface SessionSlice {
  session: SessionContext;
  
  // Actions
  updateSession: (updates: Partial<SessionContext>) => void;
  addNotes: (notes: Note[]) => void;
  updateNotes: (notes: Note[]) => void;
  deleteNotes: (noteIds: string[]) => void;
  setTempo: (tempo: number) => void;
  setKeySignature: (key: string) => void;
  addMessage: (message: Message) => void;
  updateLyrics: (lyrics: string, segments?: LyricsSegment[]) => void;
  clearSession: () => void;
}

const createInitialSession = (): SessionContext => ({
  id: crypto.randomUUID(),
  createdAt: Date.now(),
  updatedAt: Date.now(),
  tempo: 120,
  keySignature: 'C',
  timeSignature: [4, 4],
  notes: [],
  generatedAudio: [],
  lyrics: {
    text: '',
    segments: [],
  },
  conversationHistory: [],
});

export const createSessionSlice: StateCreator<SessionSlice> = (set) => ({
  session: createInitialSession(),
  
  updateSession: (updates) =>
    set((state) => ({
      session: {
        ...state.session,
        ...updates,
        updatedAt: Date.now(),
      },
    })),
  
  addNotes: (notes) =>
    set((state) => ({
      session: {
        ...state.session,
        notes: [...state.session.notes, ...notes],
        updatedAt: Date.now(),
      },
    })),
  
  updateNotes: (notes) =>
    set((state) => {
      const noteMap = new Map(notes.map((note) => [note.id, note]));
      const updatedNotes = state.session.notes.map((note) =>
        noteMap.has(note.id) ? noteMap.get(note.id)! : note
      );
      
      return {
        session: {
          ...state.session,
          notes: updatedNotes,
          updatedAt: Date.now(),
        },
      };
    }),
  
  deleteNotes: (noteIds) =>
    set((state) => {
      const noteIdSet = new Set(noteIds);
      const filteredNotes = state.session.notes.filter(
        (note) => !noteIdSet.has(note.id)
      );
      
      return {
        session: {
          ...state.session,
          notes: filteredNotes,
          updatedAt: Date.now(),
        },
      };
    }),
  
  setTempo: (tempo) =>
    set((state) => ({
      session: {
        ...state.session,
        tempo,
        updatedAt: Date.now(),
      },
    })),
  
  setKeySignature: (key) =>
    set((state) => ({
      session: {
        ...state.session,
        keySignature: key,
        updatedAt: Date.now(),
      },
    })),
  
  addMessage: (message) =>
    set((state) => ({
      session: {
        ...state.session,
        conversationHistory: [...state.session.conversationHistory, message],
        updatedAt: Date.now(),
      },
    })),
  
  updateLyrics: (lyrics, segments) =>
    set((state) => ({
      session: {
        ...state.session,
        lyrics: {
          text: lyrics,
          segments: segments || state.session.lyrics.segments,
        },
        updatedAt: Date.now(),
      },
    })),
  
  clearSession: () => {
    clearLocalStorage();
    set(() => ({
      session: createInitialSession(),
    }));
  },
});
