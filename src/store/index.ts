import { create } from 'zustand';
import { createSessionSlice, SessionSlice } from './slices/session';
import { createPlaybackSlice, PlaybackSlice } from './slices/playback';
import { createUISlice, UISlice } from './slices/ui';
import { persist, saveToLocalStorage, loadFromLocalStorage, clearLocalStorage } from './middleware/persistence';

type StoreState = SessionSlice & PlaybackSlice & UISlice;

export const useStore = create<StoreState>()(
  persist((...a) => ({
    ...createSessionSlice(...a),
    ...createPlaybackSlice(...a),
    ...createUISlice(...a),
  }))
);

// Export persistence utilities for manual control if needed
export { saveToLocalStorage, loadFromLocalStorage, clearLocalStorage };
export type { StoreState };
