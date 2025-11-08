'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import PianoRollGrid from './PianoRollGrid';
import ShaderBackground from './shader-background';
import TextToMusicPanel from './TextToMusicPanel';
import MelodyToMusicPanel from './MelodyToMusicPanel';
import HummingToMusicPanel from './HummingToMusicPanel';
import AICopilot from './AICopilot';
import Mixer from './Mixer';
import LyricsEditor from './LyricsEditor';
import NewSongDialog from './NewSongDialog';
import { useAudioEngine } from '@/src/hooks/useAudioEngine';
import { useStore } from '@/src/store';
import { UserProfile } from '@/components/auth';
import { authService } from '@/lib/auth/authService';
import { useSong } from '@/lib/hooks/useSong';
import { LogOut, Music, FolderOpen } from 'lucide-react';

type PanelView = 'pianoRoll' | 'lyrics' | 'mixer' | 'textToMusic' | 'melodyToMusic' | 'hummingToMusic';

interface MainLayoutProps {
  children?: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [activePanel, setActivePanel] = useState<PanelView | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showNewSongDialog, setShowNewSongDialog] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const songId = searchParams.get('song');
  const { song, loading: songLoading, addChatMessage } = useSong(songId);
  
  const { audioEngine, initializeAudio } = useAudioEngine();
  const { session } = useStore((state) => ({
    session: state.session
  }));

  const handlePlay = async () => {
    await initializeAudio();
    
    if (isPlaying) {
      audioEngine.pause();
      setIsPlaying(false);
    } else {
      // Set tempo
      audioEngine.setTempo(session.tempo);
      
      // Schedule all notes (no loop by default)
      audioEngine.scheduleNotes(session.notes, 0, 16, false);
      audioEngine.play();
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    audioEngine.stop();
    setIsPlaying(false);
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleExport = () => {
    // Export session as JSON
    const sessionData = {
      ...session,
      exportedAt: new Date().toISOString(),
    };
    
    const dataStr = JSON.stringify(sessionData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `musepilot-session-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleNewSong = () => {
    setShowNewSongDialog(true);
  };

  const handleSongCreated = (newSongId: string) => {
    // Navigate to the new song
    router.push(`/?song=${newSongId}`);
    setShowNewSongDialog(false);
  };

  const handleGoToMySongs = () => {
    router.push('/songs');
  };

  return (
    <div className="flex h-screen flex-col text-white relative">
      <ShaderBackground />
      {/* Header */}
      <header className="relative z-30 flex items-center justify-between border-b border-white/10 bg-black/40 backdrop-blur-xl px-6 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-white">MusePilot</h1>
          {song && (
            <div className="flex items-center gap-2 ml-4 px-3 py-1 bg-purple-600/20 border border-purple-500/30 rounded-lg">
              <Music size={16} className="text-purple-400" />
              <span className="text-sm text-purple-300">{song.title}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleGoToMySongs}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 flex items-center gap-2 transition-colors"
            title="My Songs"
          >
            <FolderOpen size={18} className="text-white" />
            <span className="text-sm text-white">My Songs</span>
          </button>
          
          <button 
            onClick={handleNewSong}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 flex items-center gap-2 transition-colors"
            title="New Song"
          >
            <Music size={18} className="text-white" />
            <span className="text-sm text-white">New Song</span>
          </button>
          
          <button 
            onClick={handleExport}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 flex items-center justify-center transition-colors"
            title="Export Session"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          
          <UserProfile />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="relative z-30 flex w-16 flex-col items-center gap-2 border-r border-white/10 bg-black/40 backdrop-blur-xl py-6">
          <button
            onClick={() => setActivePanel('pianoRoll')}
            className={`group flex h-11 w-11 items-center justify-center rounded-lg transition-colors ${
              activePanel === 'pianoRoll'
                ? 'bg-white/15 text-white border border-white/20'
                : 'text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
            title="Piano Roll"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </button>

          <button
            onClick={() => setActivePanel('lyrics')}
            className={`group flex h-11 w-11 items-center justify-center rounded-lg transition-colors ${
              activePanel === 'lyrics'
                ? 'bg-white/15 text-white border border-white/20'
                : 'text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
            title="Lyrics"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>

          <button
            onClick={() => setActivePanel('mixer')}
            className={`group flex h-11 w-11 items-center justify-center rounded-lg transition-colors ${
              activePanel === 'mixer'
                ? 'bg-white/15 text-white border border-white/20'
                : 'text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
            title="Mixer"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>

          <button
            onClick={() => setActivePanel('textToMusic')}
            className={`group flex h-11 w-11 items-center justify-center rounded-lg transition-colors ${
              activePanel === 'textToMusic'
                ? 'bg-white/15 text-white border border-white/20'
                : 'text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
            title="Text to Music"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          <button
            onClick={() => setActivePanel('melodyToMusic')}
            className={`group flex h-11 w-11 items-center justify-center rounded-lg transition-all duration-200 ${
              activePanel === 'melodyToMusic'
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
            }`}
            title="Melody to Music"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>

          <button
            onClick={() => setActivePanel('hummingToMusic')}
            className={`group flex h-11 w-11 items-center justify-center rounded-lg transition-all duration-200 ${
              activePanel === 'hummingToMusic'
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
            }`}
            title="Humming to Music"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </button>

          <div className="flex-1" />

          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`group flex h-11 w-11 items-center justify-center rounded-lg transition-colors ${
              isChatOpen
                ? 'bg-white/15 text-white border border-white/20'
                : 'text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
            title="AI Co-Pilot"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </button>
        </aside>

        {/* Main Workspace */}
        <main className="relative z-10 flex flex-1 flex-col overflow-hidden bg-gray-950/50">
          {/* Panel Content Area */}
          <div className="flex-1 overflow-auto p-8 relative z-10">
            {!activePanel && (
              <div className="flex h-full items-center justify-center">
                <div className="text-center space-y-6 max-w-2xl">
                  <h1 className="text-6xl font-bold text-white/90">
                    Create music with AI
                  </h1>
                  <p className="text-xl text-gray-400">
                    Compose, arrange, and produce your next masterpiece with intelligent assistance
                  </p>
                  <div className="flex items-center justify-center gap-4 pt-8">
                    <button
                      onClick={() => setActivePanel('textToMusic')}
                      className="px-6 py-3 bg-white text-black hover:bg-gray-100 rounded-lg font-medium transition-colors"
                    >
                      Generate Music
                    </button>
                    <button
                      onClick={() => setActivePanel('pianoRoll')}
                      className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white rounded-lg border border-white/15 transition-colors font-medium"
                    >
                      Piano Roll
                    </button>
                    <button
                      onClick={() => setActivePanel('mixer')}
                      className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg border border-white/10 transition-colors"
                    >
                      Mixer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activePanel === 'pianoRoll' && (
              <div className="absolute inset-0">
                <PianoRollGrid />
              </div>
            )}

            {activePanel === 'lyrics' && (
              <div className="h-full">
                <LyricsEditor />
              </div>
            )}

            {activePanel === 'mixer' && (
              <div className="h-full">
                <Mixer />
              </div>
            )}

            {activePanel === 'textToMusic' && (
              <div className="h-full p-8">
                <div className="max-w-4xl mx-auto">
                  <TextToMusicPanel />
                </div>
              </div>
            )}

            {activePanel === 'melodyToMusic' && (
              <div className="h-full p-8">
                <div className="max-w-4xl mx-auto">
                  <MelodyToMusicPanel />
                </div>
              </div>
            )}

            {activePanel === 'hummingToMusic' && (
              <div className="h-full p-8">
                <div className="max-w-4xl mx-auto">
                  <HummingToMusicPanel />
                </div>
              </div>
            )}

            {children}
          </div>

          {/* Audio Controls Bar */}
          <div className="relative z-30 border-t border-white/10 bg-black/40 backdrop-blur-xl px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={handlePlay}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black hover:bg-gray-100 transition-colors duration-200"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    {isPlaying ? (
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    ) : (
                      <path d="M8 5v14l11-7z" />
                    )}
                  </svg>
                </button>
                <button 
                  onClick={handleStop}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-colors duration-200"
                  title="Stop"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="4" y="4" width="16" height="16" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center gap-6">
                <span className="text-sm text-gray-400 font-mono">
                  {isPlaying ? '▶' : '⏸'} {session.notes.length} notes
                </span>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-2">
                  <span className="text-sm text-gray-400">Tempo:</span>
                  <input
                    type="number"
                    value={session.tempo}
                    onChange={(e) => {
                      const tempo = parseInt(e.target.value);
                      if (tempo >= 40 && tempo <= 240) {
                        useStore.setState((state) => ({
                          session: { ...state.session, tempo }
                        }));
                      }
                    }}
                    min={40}
                    max={240}
                    className="w-16 rounded bg-white/5 border border-white/10 px-2 py-1 text-sm text-white font-mono focus:outline-none focus:border-white/20 transition-colors"
                  />
                  <span className="text-sm text-gray-400">BPM</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* AI Chat Panel */}
        {isChatOpen && (
          <div className="relative z-30">
            <AICopilot 
              onClose={() => setIsChatOpen(false)}
              song={song}
              onSaveChatMessage={addChatMessage}
            />
          </div>
        )}
      </div>

      <NewSongDialog
        isOpen={showNewSongDialog}
        onClose={() => setShowNewSongDialog(false)}
        onSongCreated={handleSongCreated}
      />
    </div>
  );
}
