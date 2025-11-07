'use client';

import { useState } from 'react';
import PianoRollGrid from './PianoRollGrid';
import ShaderBackground from './shader-background';

type PanelView = 'pianoRoll' | 'lyrics' | 'mixer';

interface MainLayoutProps {
  children?: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [activePanel, setActivePanel] = useState<PanelView | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(true);

  return (
    <div className="flex h-screen flex-col text-white relative">
      <ShaderBackground />
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-white">MusePilot</h1>
          <span className="text-sm text-gray-400">AI Music Production</span>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="rounded-lg bg-white text-black px-5 py-2 text-sm font-medium hover:bg-gray-100 transition-colors duration-200">
            Export MP3
          </button>
          <button className="rounded-lg bg-white/10 hover:bg-white/15 text-white px-5 py-2 text-sm font-medium border border-white/10 transition-colors duration-200">
            New Session
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="relative z-10 flex w-16 flex-col items-center gap-2 border-r border-white/5 bg-black/20 backdrop-blur-sm py-6">
          <button
            onClick={() => setActivePanel('pianoRoll')}
            className={`group flex h-11 w-11 items-center justify-center rounded-lg transition-all duration-200 ${
              activePanel === 'pianoRoll'
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
            }`}
            title="Piano Roll"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </button>

          <button
            onClick={() => setActivePanel('lyrics')}
            className={`group flex h-11 w-11 items-center justify-center rounded-lg transition-all duration-200 ${
              activePanel === 'lyrics'
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
            }`}
            title="Lyrics"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>

          <button
            onClick={() => setActivePanel('mixer')}
            className={`group flex h-11 w-11 items-center justify-center rounded-lg transition-all duration-200 ${
              activePanel === 'mixer'
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
            }`}
            title="Mixer"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>

          <div className="flex-1" />

          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`group flex h-11 w-11 items-center justify-center rounded-lg transition-all duration-200 ${
              isChatOpen
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
            }`}
            title="AI Co-Pilot"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </button>
        </aside>

        {/* Main Workspace */}
        <main className="relative flex flex-1 flex-col overflow-hidden">
          {/* Panel Content Area */}
          <div className="flex-1 overflow-auto p-8">
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
                      onClick={() => setActivePanel('pianoRoll')}
                      className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl border border-white/10 transition-all duration-200"
                    >
                      Open Piano Roll
                    </button>
                    <button
                      onClick={() => setActivePanel('mixer')}
                      className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl border border-white/5 transition-all duration-200"
                    >
                      Open Mixer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activePanel === 'pianoRoll' && (
              <div className="h-full">
                <PianoRollGrid />
              </div>
            )}

            {activePanel === 'lyrics' && (
              <div className="flex h-full items-center justify-center">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12 text-center">
                  <h2 className="text-3xl font-bold text-white/90">Lyrics Editor</h2>
                  <p className="mt-3 text-gray-400">Lyrics editor will appear here</p>
                </div>
              </div>
            )}

            {activePanel === 'mixer' && (
              <div className="flex h-full items-center justify-center p-4">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 w-full max-w-4xl">
                  <h2 className="text-3xl font-bold text-white/90 mb-6">Mixer</h2>
                  
                  {/* Waveform Visualizer */}
                  <div className="relative h-48 rounded-xl bg-black/30 border border-white/5 p-6 mb-6 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent"></div>
                    <div className="relative flex items-end justify-center gap-1 h-full">
                      {[...Array(40)].map((_, i) => (
                        <div
                          key={i}
                          className="waveform-bar w-2 bg-gradient-to-t from-cyan-500 to-cyan-300 rounded-t-full opacity-70"
                          style={{
                            animationDelay: `${i * 0.05}s`,
                            height: `${Math.random() * 60 + 20}%`
                          }}
                        ></div>
                      ))}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-gray-500 text-sm">Audio Waveform Visualizer</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-400 text-center">Mixer controls will appear here</p>
                </div>
              </div>
            )}

            {children}
          </div>

          {/* Audio Controls Bar */}
          <div className="relative z-10 border-t border-white/5 bg-black/20 backdrop-blur-sm px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black hover:bg-gray-100 transition-colors duration-200">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
                <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-colors duration-200">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                </button>
                <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 hover:bg-white/15 text-white border border-white/10 transition-colors duration-200">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="4" y="4" width="16" height="16" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center gap-6">
                <span className="text-sm text-gray-400 font-mono">00:00 / 00:00</span>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-2">
                  <span className="text-sm text-gray-400">Tempo:</span>
                  <input
                    type="number"
                    defaultValue={120}
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
          <aside className="relative z-10 flex w-96 flex-col border-l border-white/5 bg-black/20 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-white text-base">AI Co-Pilot</h3>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                <div className="text-sm space-y-3">
                  <p className="text-white/90">Welcome to MusePilot! I&apos;m your AI music assistant.</p>
                  <p className="text-gray-400">Try asking me to:</p>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-gray-500 mt-0.5">•</span>
                      <span>Generate music from a prompt</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-500 mt-0.5">•</span>
                      <span>Transpose notes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-500 mt-0.5">•</span>
                      <span>Change tempo or key</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-500 mt-0.5">•</span>
                      <span>Generate lyrics</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 p-5">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Ask me anything..."
                  className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/20 transition-colors"
                />
                <button className="rounded-xl bg-white/10 hover:bg-white/15 px-5 py-3 text-sm font-medium text-white transition-colors duration-200">
                  Send
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
