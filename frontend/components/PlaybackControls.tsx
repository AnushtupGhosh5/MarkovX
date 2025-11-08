'use client';

import { PlaybackMode } from '@/src/store/slices/ui';

interface PlaybackControlsProps {
  isPlaying: boolean;
  playbackMode: PlaybackMode;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onModeChange: (mode: PlaybackMode) => void;
}

export default function PlaybackControls({
  isPlaying,
  playbackMode,
  onPlay,
  onPause,
  onStop,
  onModeChange,
}: PlaybackControlsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Play/Pause button */}
      <button
        onClick={isPlaying ? onPause : onPlay}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-600/60 border border-cyan-500/50 hover:bg-cyan-500/60 hover:border-cyan-400/50 transition-all"
        title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
      >
        {isPlaying ? (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg className="h-5 w-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Stop button */}
      <button
        onClick={onStop}
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800/60 border border-cyan-500/30 hover:bg-slate-700/60 hover:border-cyan-400/50 transition-all"
        title="Stop"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <rect x="6" y="6" width="12" height="12" />
        </svg>
      </button>

      {/* Divider */}
      <div className="h-6 w-px bg-cyan-500/30" />

      {/* Playback mode toggle */}
      <div className="flex items-center gap-1 bg-slate-800/60 border border-cyan-500/30 rounded-lg p-1">
        <button
          onClick={() => onModeChange('loop')}
          className={`px-3 py-1 text-xs rounded transition-all ${
            playbackMode === 'loop'
              ? 'bg-cyan-600/60 text-cyan-100 border border-cyan-500/50'
              : 'text-cyan-300/60 hover:text-cyan-300'
          }`}
          title="Loop Mode: Repeat loop region"
        >
          <div className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Loop
          </div>
        </button>
        <button
          onClick={() => onModeChange('full')}
          className={`px-3 py-1 text-xs rounded transition-all ${
            playbackMode === 'full'
              ? 'bg-cyan-600/60 text-cyan-100 border border-cyan-500/50'
              : 'text-cyan-300/60 hover:text-cyan-300'
          }`}
          title="Full Mode: Play all notes"
        >
          <div className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            </svg>
            Full
          </div>
        </button>
      </div>
    </div>
  );
}
