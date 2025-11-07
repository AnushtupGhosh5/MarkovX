'use client';

import { useState } from 'react';
import PianoRollGrid from './PianoRollGrid';

type PanelView = 'pianoRoll' | 'lyrics' | 'mixer';

interface MainLayoutProps {
  children?: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [activePanel, setActivePanel] = useState<PanelView>('mixer');
  const [isChatOpen, setIsChatOpen] = useState(true);

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white grain-overlay">
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between border-b border-cyan-500/20 bg-slate-900/40 backdrop-blur-xl px-6 py-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-cyan-400 text-glow">MusePilot</h1>
          <span className="text-sm text-cyan-300/70 font-light tracking-wide">AI Music Production</span>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="group relative rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-2.5 text-sm font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 hover:scale-105 neon-glow-sm overflow-hidden">
            <span className="relative z-10">Export MP3</span>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          <button className="rounded-xl bg-slate-800/60 backdrop-blur-sm border border-cyan-500/30 px-6 py-2.5 text-sm font-medium hover:bg-slate-700/60 hover:border-cyan-400/50 transition-all duration-300 hover:scale-105">
            New Session
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="relative z-10 flex w-20 flex-col items-center gap-3 border-r border-cyan-500/20 bg-slate-900/40 backdrop-blur-xl py-6">
          <button
            onClick={() => setActivePanel('pianoRoll')}
            className={`group flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 hover:scale-110 ${
              activePanel === 'pianoRoll'
                ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white neon-glow-sm shadow-lg'
                : 'bg-slate-800/60 text-cyan-300/60 hover:bg-slate-700/60 hover:text-cyan-300'
            }`}
            title="Piano Roll"
          >
            <svg className="h-7 w-7 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </button>

          <button
            onClick={() => setActivePanel('lyrics')}
            className={`group flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 hover:scale-110 ${
              activePanel === 'lyrics'
                ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white neon-glow-sm shadow-lg'
                : 'bg-slate-800/60 text-cyan-300/60 hover:bg-slate-700/60 hover:text-cyan-300'
            }`}
            title="Lyrics"
          >
            <svg className="h-7 w-7 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>

          <button
            onClick={() => setActivePanel('mixer')}
            className={`group flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 hover:scale-110 ${
              activePanel === 'mixer'
                ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white neon-glow-sm shadow-lg'
                : 'bg-slate-800/60 text-cyan-300/60 hover:bg-slate-700/60 hover:text-cyan-300'
            }`}
            title="Mixer"
          >
            <svg className="h-7 w-7 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>

          <div className="flex-1" />

          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`group flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 hover:scale-110 ${
              isChatOpen
                ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white neon-glow-sm shadow-lg'
                : 'bg-slate-800/60 text-cyan-300/60 hover:bg-slate-700/60 hover:text-cyan-300'
            }`}
            title="AI Co-Pilot"
          >
            <svg className="h-7 w-7 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </button>
        </aside>

        {/* Main Workspace */}
        <main className="relative flex flex-1 flex-col overflow-hidden">
          {/* Panel Content Area */}
          <div className="flex-1 overflow-auto p-8">
            {activePanel === 'pianoRoll' && (
              <div className="h-full">
                <PianoRollGrid />
              </div>
            )}

            {activePanel === 'lyrics' && (
              <div className="flex h-full items-center justify-center">
                <div className="glass-panel rounded-3xl p-12 text-center shadow-2xl">
                  <h2 className="text-3xl font-bold text-cyan-300">Lyrics Editor</h2>
                  <p className="mt-3 text-cyan-200/60">Lyrics editor will appear here</p>
                </div>
              </div>
            )}

            {activePanel === 'mixer' && (
              <div className="flex h-full items-center justify-center p-4">
                <div className="glass-panel rounded-3xl p-8 w-full max-w-4xl shadow-2xl">
                  <h2 className="text-3xl font-bold text-cyan-300 mb-6">Mixer</h2>
                  
                  {/* Waveform Visualizer */}
                  <div className="relative h-48 rounded-2xl bg-slate-950/50 border border-cyan-500/20 p-6 mb-6 overflow-hidden">
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
                      <p className="text-cyan-300/40 text-sm font-light">Audio Waveform Visualizer</p>
                    </div>
                  </div>
                  
                  <p className="text-cyan-200/60 text-center">Mixer controls will appear here</p>
                </div>
              </div>
            )}

            {children}
          </div>

          {/* Audio Controls Bar */}
          <div className="relative z-10 border-t border-cyan-500/20 bg-slate-900/60 backdrop-blur-xl px-8 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <button className="group flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 hover:scale-110 animate-pulse-glow shadow-lg">
                  <svg className="h-6 w-6 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/60 border border-cyan-500/30 hover:bg-slate-700/60 hover:border-cyan-400/50 transition-all duration-300 hover:scale-105">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/60 border border-cyan-500/30 hover:bg-slate-700/60 hover:border-cyan-400/50 transition-all duration-300 hover:scale-105">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="4" y="4" width="16" height="16" />
                  </svg>
                </button>
              </div>

              <div className="flex items-center gap-6">
                <span className="text-sm text-cyan-300/70 font-mono tracking-wider">00:00 / 00:00</span>
                <div className="flex items-center gap-3 bg-slate-800/60 backdrop-blur-sm border border-cyan-500/30 rounded-xl px-4 py-2">
                  <span className="text-sm text-cyan-300/70 font-medium">Tempo:</span>
                  <input
                    type="number"
                    defaultValue={120}
                    min={40}
                    max={240}
                    className="w-16 rounded-lg bg-slate-900/60 border border-cyan-500/20 px-3 py-1.5 text-sm text-cyan-300 font-mono focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  />
                  <span className="text-sm text-cyan-300/70 font-medium">BPM</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* AI Chat Panel */}
        {isChatOpen && (
          <aside className="relative z-10 flex w-96 flex-col border-l border-cyan-500/20 bg-slate-900/40 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-cyan-500/20 px-6 py-4 bg-slate-900/30">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-lg shadow-cyan-400/50"></div>
                <h3 className="font-bold text-cyan-300 text-lg">AI Co-Pilot</h3>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-cyan-300/60 hover:text-cyan-300 transition-all duration-300 hover:scale-110 hover:rotate-90"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <div className="glass-panel rounded-2xl p-5 shadow-xl">
                <div className="text-sm text-cyan-200/80 space-y-3">
                  <p className="font-medium">Welcome to MusePilot! I&apos;m your AI music assistant.</p>
                  <p className="text-cyan-300/60">Try asking me to:</p>
                  <ul className="space-y-2 text-cyan-200/70">
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-0.5">▸</span>
                      <span>Generate music from a prompt</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-0.5">▸</span>
                      <span>Transpose notes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-0.5">▸</span>
                      <span>Change tempo or key</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 mt-0.5">▸</span>
                      <span>Generate lyrics</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="border-t border-cyan-500/20 p-5 bg-slate-900/30">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Ask me anything..."
                  className="flex-1 rounded-xl bg-slate-800/60 backdrop-blur-sm border border-cyan-500/30 px-4 py-3 text-sm text-cyan-100 placeholder-cyan-300/40 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                />
                <button className="group relative rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all duration-300 hover:scale-105 neon-glow-sm overflow-hidden">
                  <span className="relative z-10">Send</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
