import { StateCreator } from 'zustand';

export type ActivePanel = 'pianoRoll' | 'lyrics' | 'mixer';
export type PlaybackMode = 'loop' | 'full';

export interface ViewRange {
  start: number;  // Start time in beats
  end: number;    // End time in beats
}

export interface UISlice {
  // UI state
  selectedNotes: string[];
  viewRange: ViewRange;
  activePanel: ActivePanel;
  
  // Playback state
  isPlaying: boolean;
  playbackPosition: number;  // Current position in beats
  loopStart: number;         // Loop start in beats
  loopEnd: number;           // Loop end in beats
  playbackMode: PlaybackMode;
  
  // Loading states
  isGenerating: boolean;
  isRecording: boolean;
  isExporting: boolean;
  
  // UI actions
  setSelectedNotes: (noteIds: string[]) => void;
  addSelectedNote: (noteId: string) => void;
  removeSelectedNote: (noteId: string) => void;
  clearSelectedNotes: () => void;
  setViewRange: (range: ViewRange) => void;
  setActivePanel: (panel: ActivePanel) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setIsRecording: (isRecording: boolean) => void;
  setIsExporting: (isExporting: boolean) => void;
  
  // Playback actions
  setIsPlaying: (isPlaying: boolean) => void;
  setPlaybackPosition: (position: number) => void;
  setLoopStart: (start: number) => void;
  setLoopEnd: (end: number) => void;
  setLoopRange: (start: number, end: number) => void;
  setPlaybackMode: (mode: PlaybackMode) => void;
}

export const createUISlice: StateCreator<UISlice> = (set) => ({
  selectedNotes: [],
  viewRange: {
    start: 0,
    end: 16, // Default to 4 bars at 4/4 time
  },
  activePanel: 'pianoRoll',
  isPlaying: false,
  playbackPosition: 0,
  loopStart: 0,
  loopEnd: 4, // Default 4 beats (2 seconds at 120 BPM)
  playbackMode: 'loop',
  isGenerating: false,
  isRecording: false,
  isExporting: false,
  
  setSelectedNotes: (noteIds) =>
    set(() => ({
      selectedNotes: noteIds,
    })),
  
  addSelectedNote: (noteId) =>
    set((state) => ({
      selectedNotes: state.selectedNotes.includes(noteId)
        ? state.selectedNotes
        : [...state.selectedNotes, noteId],
    })),
  
  removeSelectedNote: (noteId) =>
    set((state) => ({
      selectedNotes: state.selectedNotes.filter((id) => id !== noteId),
    })),
  
  clearSelectedNotes: () =>
    set(() => ({
      selectedNotes: [],
    })),
  
  setViewRange: (range) =>
    set(() => ({
      viewRange: range,
    })),
  
  setActivePanel: (panel) =>
    set(() => ({
      activePanel: panel,
    })),
  
  setIsGenerating: (isGenerating) =>
    set(() => ({
      isGenerating,
    })),
  
  setIsRecording: (isRecording) =>
    set(() => ({
      isRecording,
    })),
  
  setIsExporting: (isExporting) =>
    set(() => ({
      isExporting,
    })),
  
  setIsPlaying: (isPlaying) =>
    set(() => ({
      isPlaying,
    })),
  
  setPlaybackPosition: (position) =>
    set(() => ({
      playbackPosition: position,
    })),
  
  setLoopStart: (start) =>
    set(() => ({
      loopStart: start,
    })),
  
  setLoopEnd: (end) =>
    set(() => ({
      loopEnd: end,
    })),
  
  setLoopRange: (start, end) =>
    set(() => ({
      loopStart: start,
      loopEnd: end,
    })),
  
  setPlaybackMode: (mode) =>
    set(() => ({
      playbackMode: mode,
    })),
});
