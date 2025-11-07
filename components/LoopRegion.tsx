'use client';

import { useState, useEffect, useRef } from 'react';

interface LoopRegionProps {
  loopStart: number;       // Loop start in beats
  loopEnd: number;         // Loop end in beats
  beatWidth: number;       // Width of one beat in pixels
  pianoKeyWidth: number;   // Width of piano keys area
  viewRangeStart: number;  // Start of visible range in beats
  height: number;          // Height of the loop region
  onLoopChange: (start: number, end: number) => void;  // Callback when loop changes
}

type DragMode = 'none' | 'start' | 'end' | 'body';

export default function LoopRegion({
  loopStart,
  loopEnd,
  beatWidth,
  pianoKeyWidth,
  viewRangeStart,
  height,
  onLoopChange,
}: LoopRegionProps) {
  const [dragMode, setDragMode] = useState<DragMode>('none');
  const [isHovered, setIsHovered] = useState(false);
  const dragStartX = useRef(0);
  const dragStartLoopStart = useRef(0);
  const dragStartLoopEnd = useRef(0);

  // Calculate positions
  const startX = pianoKeyWidth + (loopStart - viewRangeStart) * beatWidth;
  const endX = pianoKeyWidth + (loopEnd - viewRangeStart) * beatWidth;
  const width = endX - startX;

  const handleStartMarkerMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDragMode('start');
    dragStartX.current = e.clientX;
    dragStartLoopStart.current = loopStart;
    dragStartLoopEnd.current = loopEnd;
  };

  const handleEndMarkerMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDragMode('end');
    dragStartX.current = e.clientX;
    dragStartLoopStart.current = loopStart;
    dragStartLoopEnd.current = loopEnd;
  };

  const handleBodyMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDragMode('body');
    dragStartX.current = e.clientX;
    dragStartLoopStart.current = loopStart;
    dragStartLoopEnd.current = loopEnd;
  };

  useEffect(() => {
    if (dragMode === 'none') return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartX.current;
      const deltaBeats = deltaX / beatWidth;

      // Snap to 0.25 beat grid
      const snapValue = 0.25;

      let newStart = dragStartLoopStart.current;
      let newEnd = dragStartLoopEnd.current;

      if (dragMode === 'start') {
        newStart = dragStartLoopStart.current + deltaBeats;
        newStart = Math.round(newStart / snapValue) * snapValue;
        // Ensure start is before end and not negative
        newStart = Math.max(0, Math.min(newStart, dragStartLoopEnd.current - snapValue));
      } else if (dragMode === 'end') {
        newEnd = dragStartLoopEnd.current + deltaBeats;
        newEnd = Math.round(newEnd / snapValue) * snapValue;
        // Ensure end is after start
        newEnd = Math.max(dragStartLoopStart.current + snapValue, newEnd);
      } else if (dragMode === 'body') {
        const loopDuration = dragStartLoopEnd.current - dragStartLoopStart.current;
        newStart = dragStartLoopStart.current + deltaBeats;
        newStart = Math.round(newStart / snapValue) * snapValue;
        // Ensure start is not negative
        newStart = Math.max(0, newStart);
        newEnd = newStart + loopDuration;
      }

      onLoopChange(newStart, newEnd);
    };

    const handleMouseUp = () => {
      setDragMode('none');
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragMode, beatWidth, onLoopChange]);

  return (
    <div
      className="absolute top-0 z-20"
      style={{
        left: `${startX}px`,
        width: `${width}px`,
        height: `${height}px`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Loop region overlay */}
      <div
        className={`absolute inset-0 bg-cyan-400/10 border-t-2 border-b-2 border-cyan-400/30 pointer-events-auto cursor-move transition-all ${
          isHovered || dragMode === 'body' ? 'bg-cyan-400/20' : ''
        }`}
        onMouseDown={handleBodyMouseDown}
        title={`Loop: ${loopStart.toFixed(2)} - ${loopEnd.toFixed(2)} beats\nDrag to move`}
      />

      {/* Start marker */}
      <div
        className={`absolute top-0 -left-1 w-2 h-full pointer-events-auto cursor-ew-resize transition-all ${
          isHovered || dragMode === 'start'
            ? 'bg-cyan-400 shadow-lg shadow-cyan-400/50'
            : 'bg-cyan-500/70'
        }`}
        onMouseDown={handleStartMarkerMouseDown}
        title={`Loop Start: ${loopStart.toFixed(2)} beats\nDrag to adjust`}
      >
        {/* Start marker handle */}
        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-2 h-8 bg-cyan-400 rounded-r border border-cyan-300" />
      </div>

      {/* End marker */}
      <div
        className={`absolute top-0 -right-1 w-2 h-full pointer-events-auto cursor-ew-resize transition-all ${
          isHovered || dragMode === 'end'
            ? 'bg-cyan-400 shadow-lg shadow-cyan-400/50'
            : 'bg-cyan-500/70'
        }`}
        onMouseDown={handleEndMarkerMouseDown}
        title={`Loop End: ${loopEnd.toFixed(2)} beats\nDrag to adjust`}
      >
        {/* End marker handle */}
        <div className="absolute top-1/2 -translate-y-1/2 right-0 w-2 h-8 bg-cyan-400 rounded-l border border-cyan-300" />
      </div>

      {/* Loop duration label */}
      {(isHovered || dragMode !== 'none') && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900 border border-cyan-400 rounded px-2 py-1 text-xs text-cyan-300 font-mono whitespace-nowrap pointer-events-none">
          {(loopEnd - loopStart).toFixed(2)} beats
        </div>
      )}
    </div>
  );
}
