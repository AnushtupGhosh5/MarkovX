'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useStore } from '@/src/store';
import { useAudioEngine } from '@/src/hooks/useAudioEngine';
import Note from './Note';
import PianoKey from './PianoKey';
import Playhead from './Playhead';
import LoopRegion from './LoopRegion';
import PlaybackControls from './PlaybackControls';

interface PianoRollGridProps {
  width?: number;
  height?: number;
}

const OCTAVES = 7;
const NOTES_PER_OCTAVE = 12;
const TOTAL_KEYS = OCTAVES * NOTES_PER_OCTAVE;
const KEY_HEIGHT = 20;
const BEAT_WIDTH = 80;
const PIANO_KEY_WIDTH = 60;

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const BLACK_KEYS = [1, 3, 6, 8, 10]; // C#, D#, F#, G#, A#

export default function PianoRollGrid({ width, height }: PianoRollGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const { playNote, audioEngine, initializeAudio } = useAudioEngine();
  
  const {
    viewRange,
    session,
    selectedNotes,
    setSelectedNotes,
    addSelectedNote,
    clearSelectedNotes,
    addNotes,
    deleteNotes,
    updateNotes,
    isPlaying,
    playbackPosition,
    loopStart,
    loopEnd,
    playbackMode,
    setIsPlaying,
    setPlaybackPosition,
    setLoopRange,
    setPlaybackMode,
  } = useStore((state) => ({
    viewRange: state.viewRange,
    session: state.session,
    selectedNotes: state.selectedNotes,
    setSelectedNotes: state.setSelectedNotes,
    addSelectedNote: state.addSelectedNote,
    clearSelectedNotes: state.clearSelectedNotes,
    addNotes: state.addNotes,
    deleteNotes: state.deleteNotes,
    updateNotes: state.updateNotes,
    isPlaying: state.isPlaying,
    playbackPosition: state.playbackPosition,
    loopStart: state.loopStart,
    loopEnd: state.loopEnd,
    playbackMode: state.playbackMode,
    setIsPlaying: state.setIsPlaying,
    setPlaybackPosition: state.setPlaybackPosition,
    setLoopRange: state.setLoopRange,
    setPlaybackMode: state.setPlaybackMode,
  }));
  
  const timeSignature = session.timeSignature;
  const beatsPerBar = timeSignature[0];
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size to full grid dimensions
    const totalBeats = viewRange.end - viewRange.start;
    const gridWidth = PIANO_KEY_WIDTH + (totalBeats * BEAT_WIDTH * zoom);
    const gridHeight = TOTAL_KEYS * KEY_HEIGHT * zoom;
    
    canvas.width = gridWidth;
    canvas.height = gridHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply zoom transformation
    ctx.save();
    ctx.scale(zoom, zoom);
    
    drawGrid(ctx, totalBeats * BEAT_WIDTH + PIANO_KEY_WIDTH, TOTAL_KEYS * KEY_HEIGHT);
    
    ctx.restore();
  }, [zoom, viewRange, timeSignature]);
  
  // Handle keyboard events for deleting notes
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedNotes.length > 0) {
        event.preventDefault();
        deleteNotes(selectedNotes);
        clearSelectedNotes();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNotes, deleteNotes, clearSelectedNotes]);
  
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const totalBeats = viewRange.end - viewRange.start;
    const gridWidth = totalBeats * BEAT_WIDTH;
    const gridHeight = TOTAL_KEYS * KEY_HEIGHT;
    
    // Draw background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(PIANO_KEY_WIDTH, 0, gridWidth, gridHeight);
    
    // Draw horizontal lines (piano keys)
    for (let i = 0; i <= TOTAL_KEYS; i++) {
      const y = i * KEY_HEIGHT;
      const noteIndex = (TOTAL_KEYS - i) % NOTES_PER_OCTAVE;
      const isBlackKey = BLACK_KEYS.includes(noteIndex);
      
      // Alternate row colors
      if (i < TOTAL_KEYS) {
        ctx.fillStyle = isBlackKey ? '#1e293b' : '#0f172a';
        ctx.fillRect(PIANO_KEY_WIDTH, y, gridWidth, KEY_HEIGHT);
      }
      
      // Draw horizontal grid line
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(PIANO_KEY_WIDTH, y);
      ctx.lineTo(PIANO_KEY_WIDTH + gridWidth, y);
      ctx.stroke();
    }
    
    // Draw vertical lines (beat divisions)
    const subdivisionsPerBeat = 4; // 16th notes
    const totalSubdivisions = totalBeats * subdivisionsPerBeat;
    
    for (let i = 0; i <= totalSubdivisions; i++) {
      const beat = viewRange.start + (i / subdivisionsPerBeat);
      const x = PIANO_KEY_WIDTH + (beat - viewRange.start) * BEAT_WIDTH;
      
      const isBeatStart = i % subdivisionsPerBeat === 0;
      const isBarStart = i % (beatsPerBar * subdivisionsPerBeat) === 0;
      
      if (isBarStart) {
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
      } else if (isBeatStart) {
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
      } else {
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 0.5;
      }
      
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, gridHeight);
      ctx.stroke();
    }
    
    // Draw piano keys
    drawPianoKeys(ctx, gridHeight);
  };
  
  const drawPianoKeys = (ctx: CanvasRenderingContext2D, gridHeight: number) => {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, PIANO_KEY_WIDTH, gridHeight);
    
    for (let i = 0; i < TOTAL_KEYS; i++) {
      const y = i * KEY_HEIGHT;
      const noteIndex = (TOTAL_KEYS - i - 1) % NOTES_PER_OCTAVE;
      const octave = Math.floor((TOTAL_KEYS - i - 1) / NOTES_PER_OCTAVE) + 1; // Start from C1
      const noteName = NOTE_NAMES[noteIndex];
      const isBlackKey = BLACK_KEYS.includes(noteIndex);
      
      // Draw key background
      ctx.fillStyle = isBlackKey ? '#0f172a' : '#334155';
      ctx.fillRect(0, y, PIANO_KEY_WIDTH, KEY_HEIGHT);
      
      // Draw key border
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, y, PIANO_KEY_WIDTH, KEY_HEIGHT);
      
      // Draw note label for C notes
      if (noteName === 'C') {
        ctx.fillStyle = '#06b6d4';
        ctx.font = '11px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${noteName}${octave}`, PIANO_KEY_WIDTH / 2, y + KEY_HEIGHT / 2);
      }
    }
  };
  
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      // Zoom
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom((prev) => Math.max(0.5, Math.min(3, prev * zoomFactor)));
    }
    // Otherwise allow natural scrolling
  };
  
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(3, prev * 1.2));
  };
  
  const handleZoomOut = () => {
    setZoom((prev) => Math.max(0.5, prev / 1.2));
  };
  
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };
  
  const handleNoteClick = (noteId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent canvas click handler from firing
    
    if (event.ctrlKey || event.metaKey) {
      // Multi-select: add to selection
      addSelectedNote(noteId);
    } else if (event.shiftKey) {
      // Range select: add to selection without clearing
      addSelectedNote(noteId);
    } else {
      // Single select: replace selection
      setSelectedNotes([noteId]);
    }
  };
  
  const handleNoteDelete = (noteId: string) => {
    deleteNotes([noteId]);
    // Remove from selection if it was selected
    if (selectedNotes.includes(noteId)) {
      setSelectedNotes(selectedNotes.filter(id => id !== noteId));
    }
  };
  
  const handleNoteResize = (noteId: string, newDuration: number) => {
    const note = session.notes.find(n => n.id === noteId);
    if (note) {
      updateNotes([{ ...note, duration: newDuration }]);
    }
  };
  
  // Playback control handlers
  const handlePlay = useCallback(async () => {
    await initializeAudio();
    
    // Set tempo from session
    audioEngine.setTempo(session.tempo);
    
    // Schedule notes
    const isLoopMode = playbackMode === 'loop';
    audioEngine.scheduleNotes(session.notes, loopStart, loopEnd, isLoopMode);
    
    // Start playback
    audioEngine.play();
    setIsPlaying(true);
  }, [initializeAudio, audioEngine, session.tempo, session.notes, loopStart, loopEnd, playbackMode, setIsPlaying]);
  
  const handlePause = useCallback(() => {
    audioEngine.pause();
    setIsPlaying(false);
  }, [audioEngine, setIsPlaying]);
  
  const handleStop = useCallback(() => {
    audioEngine.stop();
    setIsPlaying(false);
    setPlaybackPosition(playbackMode === 'loop' ? loopStart : 0);
  }, [audioEngine, setIsPlaying, setPlaybackPosition, playbackMode, loopStart]);
  
  const handleSeek = useCallback((position: number) => {
    audioEngine.seek(position);
    setPlaybackPosition(position);
  }, [audioEngine, setPlaybackPosition]);
  
  const handleLoopChange = useCallback((start: number, end: number) => {
    setLoopRange(start, end);
    
    // If playing, reschedule notes with new loop range
    if (isPlaying) {
      audioEngine.scheduleNotes(session.notes, start, end, playbackMode === 'loop');
    }
  }, [setLoopRange, isPlaying, audioEngine, session.notes, playbackMode]);
  
  const handleModeChange = useCallback((mode: 'loop' | 'full') => {
    setPlaybackMode(mode);
    
    // If playing, reschedule notes with new mode
    if (isPlaying) {
      audioEngine.scheduleNotes(session.notes, loopStart, loopEnd, mode === 'loop');
    }
  }, [setPlaybackMode, isPlaying, audioEngine, session.notes, loopStart, loopEnd]);
  
  // Animation loop to update playback position
  useEffect(() => {
    if (!isPlaying) return;
    
    let animationFrameId: number;
    
    const updatePosition = () => {
      const currentPos = audioEngine.getCurrentPosition();
      setPlaybackPosition(currentPos);
      animationFrameId = requestAnimationFrame(updatePosition);
    };
    
    animationFrameId = requestAnimationFrame(updatePosition);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, audioEngine, setPlaybackPosition]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Space bar for play/pause (only if not typing in an input)
      if (event.code === 'Space' && !event.repeat) {
        const target = event.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          event.preventDefault();
          if (isPlaying) {
            handlePause();
          } else {
            handlePlay();
          }
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, handlePlay, handlePause]);
  
  // Reschedule notes when they change
  useEffect(() => {
    if (isPlaying) {
      audioEngine.scheduleNotes(session.notes, loopStart, loopEnd, playbackMode === 'loop');
    }
  }, [session.notes]);
  
  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Only handle clicks on the canvas container, not on notes
    if (event.target !== event.currentTarget) {
      return;
    }
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Calculate which key was clicked (accounting for zoom and piano key width)
    const keyIndex = Math.floor(y / (KEY_HEIGHT * zoom));
    const pitch = TOTAL_KEYS - keyIndex - 1;
    
    // Calculate beat position (accounting for zoom and piano key width)
    const beatPosition = ((x - (PIANO_KEY_WIDTH * zoom)) / (BEAT_WIDTH * zoom)) + viewRange.start;
    
    // Snap to nearest 16th note (0.25 beats)
    const snapValue = 0.25;
    const snappedStart = Math.round(beatPosition / snapValue) * snapValue;
    
    // Only create note if click is within valid range
    if (pitch >= 0 && pitch < TOTAL_KEYS && snappedStart >= viewRange.start && snappedStart < viewRange.end) {
      // Create a new note with default duration of 1 beat
      const newNote = {
        id: crypto.randomUUID(),
        pitch,
        start: snappedStart,
        duration: 1, // Default 1 beat duration
        velocity: 100, // Default velocity
      };
      
      addNotes([newNote]);
      
      // Play the note sound
      playNote(pitch, 0.5, 100);
      
      // Select the newly created note
      setSelectedNotes([newNote.id]);
    } else {
      // Clear selection when clicking on empty space
      clearSelectedNotes();
    }
  };
  
  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-900/60 border-b border-cyan-500/20">
        {/* Playback Controls */}
        <PlaybackControls
          isPlaying={isPlaying}
          playbackMode={playbackMode}
          onPlay={handlePlay}
          onPause={handlePause}
          onStop={handleStop}
          onModeChange={handleModeChange}
        />
        
        <div className="h-6 w-px bg-cyan-500/30" />
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => playNote(60, 0.5, 100)}
            className="px-3 py-1.5 text-xs rounded-lg bg-cyan-600/60 border border-cyan-500/50 hover:bg-cyan-500/60 hover:border-cyan-400/50 transition-all text-white font-semibold"
            title="Test Audio (Middle C)"
          >
            🔊 Test
          </button>
          <button
            onClick={handleZoomOut}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/60 border border-cyan-500/30 hover:bg-slate-700/60 hover:border-cyan-400/50 transition-all"
            title="Zoom Out"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
          </button>
          <span className="text-sm text-cyan-300/70 font-mono min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/60 border border-cyan-500/30 hover:bg-slate-700/60 hover:border-cyan-400/50 transition-all"
            title="Zoom In"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </button>
          <button
            onClick={handleResetView}
            className="ml-2 px-3 py-1.5 text-xs rounded-lg bg-slate-800/60 border border-cyan-500/30 hover:bg-slate-700/60 hover:border-cyan-400/50 transition-all text-cyan-300"
            title="Reset View"
          >
            Reset
          </button>
        </div>
        
        <div className="flex-1" />
        
        <div className="text-xs text-cyan-300/60">
          <span className="font-mono">
            {timeSignature[0]}/{timeSignature[1]} time
          </span>
          <span className="mx-2">•</span>
          <span>
            Bars {Math.floor(viewRange.start / beatsPerBar) + 1}-{Math.ceil(viewRange.end / beatsPerBar)}
          </span>
        </div>
      </div>
      
      {/* Canvas */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-auto"
        onWheel={handleWheel}
      >
        <div className="relative" onClick={handleCanvasClick}>
          <canvas
            ref={canvasRef}
            className="block pointer-events-none"
          />
          
          {/* Interactive Piano Keys */}
          <div className="absolute top-0 left-0 z-20 pointer-events-auto" style={{ width: `${PIANO_KEY_WIDTH * zoom}px` }}>
            {Array.from({ length: TOTAL_KEYS }).map((_, i) => {
              const noteIndex = (TOTAL_KEYS - i - 1) % NOTES_PER_OCTAVE;
              const octave = Math.floor((TOTAL_KEYS - i - 1) / NOTES_PER_OCTAVE) + 1;
              const noteName = NOTE_NAMES[noteIndex];
              const isBlackKey = BLACK_KEYS.includes(noteIndex);
              const pitch = TOTAL_KEYS - i - 1;
              
              return (
                <PianoKey
                  key={i}
                  pitch={pitch}
                  noteName={noteName}
                  octave={octave}
                  isBlackKey={isBlackKey}
                  top={i * KEY_HEIGHT * zoom}
                  height={KEY_HEIGHT * zoom}
                  width={PIANO_KEY_WIDTH * zoom}
                />
              );
            })}
          </div>
          
          {/* Loop Region */}
          <LoopRegion
            loopStart={loopStart}
            loopEnd={loopEnd}
            beatWidth={BEAT_WIDTH * zoom}
            pianoKeyWidth={PIANO_KEY_WIDTH * zoom}
            viewRangeStart={viewRange.start}
            height={TOTAL_KEYS * KEY_HEIGHT * zoom}
            onLoopChange={handleLoopChange}
          />
          
          {/* Render notes on top of canvas */}
          <div className="absolute top-0 left-0 z-10 pointer-events-none" style={{ width: '100%', height: '100%' }}>
            {session.notes.map((note) => (
              <Note
                key={note.id}
                note={note}
                isSelected={selectedNotes.includes(note.id)}
                beatWidth={BEAT_WIDTH * zoom}
                keyHeight={KEY_HEIGHT * zoom}
                pianoKeyWidth={PIANO_KEY_WIDTH * zoom}
                totalKeys={TOTAL_KEYS}
                viewRangeStart={viewRange.start}
                onClick={handleNoteClick}
                onDelete={handleNoteDelete}
                onResize={handleNoteResize}
              />
            ))}
          </div>
          
          {/* Playhead */}
          <Playhead
            position={playbackPosition}
            beatWidth={BEAT_WIDTH * zoom}
            pianoKeyWidth={PIANO_KEY_WIDTH * zoom}
            viewRangeStart={viewRange.start}
            height={TOTAL_KEYS * KEY_HEIGHT * zoom}
            isPlaying={isPlaying}
            onSeek={handleSeek}
          />
        </div>
      </div>
      
      {/* Instructions */}
      <div className="absolute bottom-4 right-4 glass-panel rounded-lg px-3 py-2 text-xs text-cyan-300/60 space-y-1">
        <div>Click: Add Note • Right-Click: Delete • Drag Edge: Resize</div>
        <div>Space: Play/Pause • Drag Playhead: Seek • Drag Loop: Adjust Range</div>
        <div>Scroll: Pan • Ctrl+Scroll: Zoom</div>
      </div>
    </div>
  );
}
