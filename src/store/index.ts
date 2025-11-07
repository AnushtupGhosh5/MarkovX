import { create } from 'zustand';
import { createSessionSlice, SessionSlice } from './slices/session';
import { createPlaybackSlice, PlaybackSlice } from './slices/playback';

type StoreState = SessionSlice & PlaybackSlice;

export const useStore = create<StoreState>()((...a) => ({
  ...createSessionSlice(...a),
  ...createPlaybackSlice(...a),
}));

export type { StoreState };
