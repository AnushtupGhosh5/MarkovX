'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/src/store';
import * as Tone from 'tone';

interface Track {
  id: string;
  name: string;
  volume: number;
  pan: number;
  muted: boolean;
  solo: boolean;
  color: string;
  type: 'midi' | 'audio';
  audioUrl?: string;
}

interface AudioChannel {
  synth: Tone.PolySynth;
  volume: Tone.Volume;
  panner: Tone.Panner;
  channel: Tone.Channel;
}

export default function Mixer() {
  // Audio channels for each track
  const audioChannelsRef = useRef<Map<string, AudioChannel>>(new Map());
  const [tracks, setTracks] = useState<Track[]>([
    {
      id: '1',
      name: 'Piano',
      volume: -10,
      pan: 0,
      muted: false,
      solo: false,
      color: '#3b82f6',
      type: 'midi',
    },
    {
      id: '2',
      name: 'Bass',
      volume: -12,
      pan: -0.2,
      muted: false,
      solo: false,
      color: '#8b5cf6',
      type: 'midi',
    },
    {
      id: '3',
      name: 'Drums',
      volume: -8,
      pan: 0.1,
      muted: false,
      solo: false,
      color: '#ec4899',
      type: 'midi',
    },
  ]);

  const [masterVolume, setMasterVolume] = useState(-6);
  const [masterMuted, setMasterMuted] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<string | null>('1');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>(Array(64).fill(0));
  const animationRef = useRef<number>();
  const analyserRef = useRef<Tone.Analyser | null>(null);
  const masterVolumeRef = useRef<Tone.Volume | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const { session } = useStore((state) => ({ session: state.session }));

  // Initialize audio engine
  useEffect(() => {
    const initAudio = async () => {
      try {
        await Tone.start();
        console.log('✅ Audio engine started');

        // Create master volume control
        if (!masterVolumeRef.current) {
          masterVolumeRef.current = new Tone.Volume(masterVolume).toDestination();
        }

        // Create analyzer
        if (!analyserRef.current) {
          analyserRef.current = new Tone.Analyser('waveform', 64);
          masterVolumeRef.current.connect(analyserRef.current);
        }

        // Initialize channels for existing tracks
        tracks.forEach(track => {
          if (!audioChannelsRef.current.has(track.id)) {
            createAudioChannel(track);
          }
        });

        setIsInitialized(true);
        console.log('✅ Mixer initialized with', tracks.length, 'tracks');
      } catch (error) {
        console.error('❌ Failed to initialize audio:', error);
      }
    };

    initAudio();

    return () => {
      // Cleanup on unmount
      audioChannelsRef.current.forEach(channel => {
        channel.synth.dispose();
        channel.volume.dispose();
        channel.panner.dispose();
        channel.channel.dispose();
      });
      audioChannelsRef.current.clear();
    };
  }, []);

  // Create audio channel for a track
  const createAudioChannel = (track: Track): AudioChannel => {
    console.log(`🎵 Creating audio channel for ${track.name}`);

    // Create synth
    const synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.3,
        release: 0.5,
      },
    });

    // Create volume control
    const volume = new Tone.Volume(track.volume);

    // Create panner
    const panner = new Tone.Panner(track.pan);

    // Create channel (combines volume and pan)
    const channel = new Tone.Channel({
      volume: track.volume,
      pan: track.pan,
      mute: track.muted,
    });

    // Connect: synth -> volume -> panner -> channel -> master
    synth.connect(volume);
    volume.connect(panner);
    panner.connect(channel);
    
    if (masterVolumeRef.current) {
      channel.connect(masterVolumeRef.current);
    }

    const audioChannel: AudioChannel = {
      synth,
      volume,
      panner,
      channel,
    };

    audioChannelsRef.current.set(track.id, audioChannel);
    return audioChannel;
  };

  // Animate waveform
  useEffect(() => {
    const animate = () => {
      if (analyserRef.current && isAnalyzing) {
        const values = analyserRef.current.getValue() as Float32Array;
        setWaveformData(Array.from(values));
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    if (isAnalyzing) {
      animate();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnalyzing]);

  const handleVolumeChange = (trackId: string, volume: number) => {
    setTracks((prev) =>
      prev.map((track) =>
        track.id === trackId ? { ...track, volume } : track
      )
    );

    // Apply to audio channel
    const channel = audioChannelsRef.current.get(trackId);
    if (channel) {
      channel.volume.volume.value = volume;
      channel.channel.volume.value = volume;
    }
  };

  const handlePanChange = (trackId: string, pan: number) => {
    setTracks((prev) =>
      prev.map((track) =>
        track.id === trackId ? { ...track, pan } : track
      )
    );

    // Apply to audio channel
    const channel = audioChannelsRef.current.get(trackId);
    if (channel) {
      channel.panner.pan.value = pan;
      channel.channel.pan.value = pan;
    }
  };

  const toggleMute = (trackId: string) => {
    setTracks((prev) =>
      prev.map((track) => {
        if (track.id === trackId) {
          const newMuted = !track.muted;
          
          // Apply to audio channel
          const channel = audioChannelsRef.current.get(trackId);
          if (channel) {
            channel.channel.mute = newMuted;
          }
          
          return { ...track, muted: newMuted };
        }
        return track;
      })
    );
  };

  const toggleSolo = (trackId: string) => {
    setTracks((prev) => {
      const newTracks = prev.map((track) =>
        track.id === trackId ? { ...track, solo: !track.solo } : track
      );

      // Handle solo logic: mute all non-solo tracks if any track is soloed
      const hasSolo = newTracks.some(t => t.solo);
      
      newTracks.forEach(track => {
        const channel = audioChannelsRef.current.get(track.id);
        if (channel) {
          if (hasSolo) {
            channel.channel.mute = !track.solo;
          } else {
            channel.channel.mute = track.muted;
          }
        }
      });

      return newTracks;
    });
  };

  const addTrack = () => {
    const newTrack: Track = {
      id: Date.now().toString(),
      name: `Track ${tracks.length + 1}`,
      volume: -10,
      pan: 0,
      muted: false,
      solo: false,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      type: 'midi',
    };
    setTracks((prev) => [...prev, newTrack]);
    
    // Create audio channel for new track
    if (isInitialized) {
      createAudioChannel(newTrack);
    }
  };

  const deleteTrack = (trackId: string) => {
    // Dispose audio channel
    const channel = audioChannelsRef.current.get(trackId);
    if (channel) {
      channel.synth.dispose();
      channel.volume.dispose();
      channel.panner.dispose();
      channel.channel.dispose();
      audioChannelsRef.current.delete(trackId);
    }

    setTracks((prev) => prev.filter((track) => track.id !== trackId));
    if (selectedTrack === trackId) {
      setSelectedTrack(tracks[0]?.id || null);
    }
  };

  // Update master volume
  useEffect(() => {
    if (masterVolumeRef.current) {
      masterVolumeRef.current.volume.value = masterMuted ? -Infinity : masterVolume;
    }
  }, [masterVolume, masterMuted]);

  // Play a test note on a track
  const playTestNote = (trackId: string) => {
    const channel = audioChannelsRef.current.get(trackId);
    if (channel) {
      const note = 'C4';
      const duration = '8n';
      channel.synth.triggerAttackRelease(note, duration);
    }
  };

  const selectedTrackData = tracks.find((t) => t.id === selectedTrack);

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-sm">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Mixer</h2>
            <p className="text-sm text-gray-400 mt-1">
              {tracks.length} tracks • {session.tempo} BPM • {session.keySignature}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAnalyzing(!isAnalyzing)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isAnalyzing
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              {isAnalyzing ? '● Live' : 'Start Analysis'}
            </button>
            <button
              onClick={addTrack}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg text-sm font-medium border border-white/10 transition-all"
            >
              + Add Track
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Track List */}
        <div className="w-80 border-r border-white/10 overflow-y-auto overflow-x-hidden custom-scrollbar-thin">
          <div className="p-4 space-y-2">
            {tracks.map((track) => (
              <div
                key={track.id}
                onClick={() => setSelectedTrack(track.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  selectedTrack === track.id
                    ? 'bg-white/10 border-2 border-white/20'
                    : 'bg-white/5 border border-white/10 hover:bg-white/8'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: track.color }}
                    />
                    <span className="text-white font-medium">{track.name}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTrack(track.id);
                    }}
                    className="text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMute(track.id);
                    }}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                      track.muted
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-white/5 text-gray-400 border border-white/10'
                    }`}
                  >
                    M
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSolo(track.id);
                    }}
                    className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                      track.solo
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        : 'bg-white/5 text-gray-400 border border-white/10'
                    }`}
                  >
                    S
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playTestNote(track.id);
                    }}
                    className="px-3 py-1 rounded text-xs font-medium transition-all bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30"
                    title="Test sound"
                  >
                    🎵
                  </button>
                  <div className="flex-1 text-right">
                    <span className="text-xs text-gray-500 font-mono">
                      {track.volume > 0 ? '+' : ''}{track.volume.toFixed(1)} dB
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Mixer Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 custom-scrollbar">
          {/* Waveform Visualizer */}
          <div className="mb-6">
            <div className="bg-black/30 border border-white/10 rounded-2xl p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Audio Visualizer</h3>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-gray-400">
                    {isAnalyzing ? 'Monitoring' : 'Idle'}
                  </span>
                </div>
              </div>
              
              <div className="relative h-48 flex items-center justify-center gap-1">
                {waveformData.map((value, i) => {
                  const height = Math.abs(value) * 100 + 5;
                  const hue = (i / waveformData.length) * 360;
                  return (
                    <div
                      key={i}
                      className="flex-1 rounded-t-full transition-all duration-75"
                      style={{
                        height: `${height}%`,
                        backgroundColor: `hsl(${hue}, 70%, 60%)`,
                        opacity: 0.8,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Track Controls */}
          {selectedTrackData && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: selectedTrackData.color }}
                />
                <h3 className="text-xl font-semibold text-white">
                  {selectedTrackData.name}
                </h3>
                <span className="px-2 py-1 bg-white/10 rounded text-xs text-gray-400">
                  {selectedTrackData.type.toUpperCase()}
                </span>
              </div>

              <div className="space-y-6">
                {/* Volume Control */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-300">Volume</label>
                    <span className="text-sm font-mono text-white">
                      {selectedTrackData.volume > 0 ? '+' : ''}
                      {selectedTrackData.volume.toFixed(1)} dB
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-60"
                    max="6"
                    step="0.1"
                    value={selectedTrackData.volume}
                    onChange={(e) =>
                      handleVolumeChange(selectedTrackData.id, parseFloat(e.target.value))
                    }
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                {/* Pan Control */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-300">Pan</label>
                    <span className="text-sm font-mono text-white">
                      {selectedTrackData.pan === 0
                        ? 'Center'
                        : selectedTrackData.pan < 0
                        ? `${Math.abs(selectedTrackData.pan * 100).toFixed(0)}% L`
                        : `${(selectedTrackData.pan * 100).toFixed(0)}% R`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-1"
                    max="1"
                    step="0.01"
                    value={selectedTrackData.pan}
                    onChange={(e) =>
                      handlePanChange(selectedTrackData.id, parseFloat(e.target.value))
                    }
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                {/* Effects Section */}
                <div className="pt-4 border-t border-white/10">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">Effects</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <button className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-all">
                      Reverb
                    </button>
                    <button className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-all">
                      Delay
                    </button>
                    <button className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-all">
                      EQ
                    </button>
                    <button className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-all">
                      Compress
                    </button>
                    <button className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-all">
                      Distortion
                    </button>
                    <button className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-all">
                      Filter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Master Section */}
          <div className="mt-6 bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Master Output</h3>
              <button
                onClick={() => setMasterMuted(!masterMuted)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  masterMuted
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-white/10 text-white border border-white/10'
                }`}
              >
                {masterMuted ? 'Unmute' : 'Mute'} Master
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-300">Master Volume</label>
                <span className="text-lg font-mono text-white font-bold">
                  {masterVolume > 0 ? '+' : ''}
                  {masterVolume.toFixed(1)} dB
                </span>
              </div>
              <input
                type="range"
                min="-60"
                max="6"
                step="0.1"
                value={masterVolume}
                onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                className="w-full h-3 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* VU Meters */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-400 mb-2">Left</div>
                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-150"
                    style={{ width: `${Math.random() * 80 + 20}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-2">Right</div>
                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-150"
                    style={{ width: `${Math.random() * 80 + 20}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
}
