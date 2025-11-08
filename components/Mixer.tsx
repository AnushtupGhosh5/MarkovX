'use client';

import { useState } from 'react';
import { useStore } from '@/src/store';

interface TrackChannel {
  id: string;
  name: string;
  volume: number;
  pan: number;
  muted: boolean;
  solo: boolean;
  color: string;
}

export default function Mixer() {
  const { session, updateSession } = useStore((state) => ({
    session: state.session,
    updateSession: state.updateSession,
  }));

  const [tracks, setTracks] = useState<TrackChannel[]>([
    { id: '1', name: 'Master', volume: 75, pan: 0, muted: false, solo: false, color: 'cyan' },
    { id: '2', name: 'Melody', volume: 70, pan: 0, muted: false, solo: false, color: 'purple' },
    { id: '3', name: 'Bass', volume: 65, pan: -10, muted: false, solo: false, color: 'green' },
    { id: '4', name: 'Drums', volume: 80, pan: 0, muted: false, solo: false, color: 'orange' },
    { id: '5', name: 'Synth', volume: 60, pan: 15, muted: false, solo: false, color: 'pink' },
  ]);

  const updateTrack = (id: string, updates: Partial<TrackChannel>) => {
    setTracks(tracks.map(track => 
      track.id === id ? { ...track, ...updates } : track
    ));
  };

  const toggleMute = (id: string) => {
    const track = tracks.find(t => t.id === id);
    if (track) {
      updateTrack(id, { muted: !track.muted });
    }
  };

  const toggleSolo = (id: string) => {
    const track = tracks.find(t => t.id === id);
    if (track) {
      updateTrack(id, { solo: !track.solo });
    }
  };

  return (
    <div className="h-full flex flex-col relative z-10">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-1">Mixer</h2>
        <p className="text-sm text-gray-400">Control volume, pan, and effects for each track</p>
      </div>

      {/* Master Controls */}
      <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white">Master</h3>
          <span className="text-xs font-mono text-gray-400">{tracks[0]?.volume}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={tracks[0]?.volume || 75}
          onChange={(e) => updateTrack('1', { volume: parseInt(e.target.value) })}
          className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
        />
      </div>

      {/* Track Channels */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <div className="grid grid-cols-4 gap-4">
          {tracks.slice(1).map((track) => (
            <div
              key={track.id}
              className="bg-white/5 border border-white/10 rounded-md p-3 flex flex-col"
            >
              {/* Track Header */}
              <div className="mb-3">
                <h4 className="text-sm font-medium text-white mb-2">{track.name}</h4>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => toggleMute(track.id)}
                    className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                      track.muted
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-white/5 text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    M
                  </button>
                  <button
                    onClick={() => toggleSolo(track.id)}
                    className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                      track.solo
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-white/5 text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    S
                  </button>
                </div>
              </div>

              {/* Volume Fader */}
              <div className="flex-1 flex flex-col items-center mb-3">
                <div className="text-xs text-gray-500 mb-2">Vol</div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={track.volume}
                  onChange={(e) => updateTrack(track.id, { volume: parseInt(e.target.value) })}
                  className="h-24 bg-white/10 rounded appearance-none cursor-pointer"
                  style={{
                    WebkitAppearance: 'slider-vertical',
                    width: '6px',
                  } as React.CSSProperties}
                />
                <div className="text-xs font-mono text-gray-400 mt-2">{track.volume}</div>
              </div>

              {/* Pan Control */}
              <div>
                <div className="text-xs text-gray-500 mb-1 text-center">Pan</div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={track.pan}
                  onChange={(e) => updateTrack(track.id, { pan: parseInt(e.target.value) })}
                  className="w-full h-1 bg-white/10 rounded appearance-none cursor-pointer"
                />
                <div className="text-center text-xs font-mono text-gray-500 mt-1">
                  {track.pan > 0 ? `R${track.pan}` : track.pan < 0 ? `L${Math.abs(track.pan)}` : 'C'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="mt-6 flex items-center justify-between py-3 border-t border-white/10">
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-md transition-colors text-sm">
            Add Track
          </button>
          <button className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors">
            Reset
          </button>
        </div>
        <div className="text-xs text-gray-500">
          {tracks.filter(t => t.muted).length} muted • {tracks.filter(t => t.solo).length} solo
        </div>
      </div>
    </div>
  );
}
