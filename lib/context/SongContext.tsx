'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { Song } from '@/lib/firebase/songService';

interface SongContextType {
  currentSong: Song | null;
  isLoading: boolean;
}

const SongContext = createContext<SongContextType>({
  currentSong: null,
  isLoading: false,
});

export const useSongContext = () => {
  const context = useContext(SongContext);
  if (!context) {
    throw new Error('useSongContext must be used within a SongContextProvider');
  }
  return context;
};

interface SongContextProviderProps {
  children: ReactNode;
  song: Song | null;
  loading: boolean;
}

export const SongContextProvider: React.FC<SongContextProviderProps> = ({
  children,
  song,
  loading,
}) => {
  return (
    <SongContext.Provider value={{ currentSong: song, isLoading: loading }}>
      {children}
    </SongContext.Provider>
  );
};
