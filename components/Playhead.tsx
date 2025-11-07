'use client';

import { useState, useEffect, useRef } from 'react';

interface PlayheadProps {
  position: number;        // Position in beats
  beatWidth: number;       // Width of one beat in pixels
  pianoKeyWidth: number;   // Width of piano keys area
  viewRangeStart: number;  // Start of visible range in beats
  height: number;          // Height of the playhead line
  isPlaying: boolean;      // Whether playback is active
  onSeek: (position: number) => void;  // Callback when user drags playhead
}

export default function Playhead({
  position,
  beatWidth,
  pianoKeyWidth,
  viewRangeStart,
  height,
  isPlaying,
  onSeek,
}: PlayheadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartPosition = useRef(0);

  // Calculate x position
  const x = pianoKeyWidth + (position - viewRangeStart) * beatWidth;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartPosition.current = position;
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartX.current;
      const deltaBeats = deltaX / beatWidth;
      const newPosition = dragStartPosition.current + deltaBeats;

      // Snap to 0.25 beat grid
      const snapValue = 0.25;
      const snappedPosition = Math.round(newPosition / snapValue) * snapValue;

      // Ensure position is not negative
      const finalPosition = Math.max(0, snappedPosition);

      onSeek(finalPosition);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, beatWidth, onSeek]);

  return (
    <div
      className="absolute top-0 pointer-events-none z-30"
      style={{
        left: `${x}px`,
        height: `${height}px`,
      }}
    >
      {/* Playhead line */}
      <div
        className={`absolute top-0 w-0.5 h-full transition-colors ${
          isPlaying ? 'bg-cyan-400 shadow-lg shadow-cyan-400/50' : 'bg-cyan-500'
        }`}
        style={{
          boxShadow: isPlaying ? '0 0 10px rgba(34, 211, 238, 0.8)' : 'none',
        }}
      />

      {/* Draggable handle at top */}
      <div
        className={`absolute top-0 -left-2 w-4 h-6 pointer-events-auto cursor-ew-resize ${
          isDragging ? 'bg-cyan-300' : 'bg-cyan-400 hover:bg-cyan-300'
        } rounded-b-md shadow-lg transition-colors`}
        onMouseDown={handleMouseDown}
        title={`Playhead: ${position.toFixed(2)} beats\nDrag to seek`}
        style={{
          clipPath: 'polygon(50% 0%, 100% 30%, 100% 100%, 0 100%, 0 30%)',
        }}
      >
        {/* Triangle indicator */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900" />
      </div>

      {/* Position label */}
      {isDragging && (
        <div className="absolute top-8 -left-8 bg-slate-900 border border-cyan-400 rounded px-2 py-1 text-xs text-cyan-300 font-mono whitespace-nowrap pointer-events-none">
          {position.toFixed(2)}
        </div>
      )}
    </div>
  );
}
