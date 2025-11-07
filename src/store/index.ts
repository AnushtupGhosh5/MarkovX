import { create } from 'zustand';
import { SessionSlice, createSessionSlice } from './slices/session';
import { UISlice, createUISlice } from './slices/ui';

type StoreState = SessionSlice & UISlice;

export const useStore = create<StoreState>()((...a) => ({
  ...createSessionSlice(...a),
  ...createUISlice(...a),
}));

export type { StoreState };
