'use client';

import { useState, useEffect, useRef } from 'react';
import { Note as NoteType } from '@/src/types';
import { useAudioEngine } from '@/src/hooks/useAudioEngine';

interface NoteProps {
  note: NoteType;
  isSelected: boolean;
  beatWidth: number;
  keyHeight: number;
  pianoKeyWidth: number;
  totalKeys: number;
  viewRangeStart: number;
  onClick: (noteId: string, event: React.MouseEvent) => void;
  onDelete: (noteId: string) => void;
  onResize: (noteId: string, newDuration: number) => void;
}

export default function Note({
  note,
  isSelected,
  beatWidth,
  keyHeight,
  pianoKeyWidth,
  totalKeys,
  viewRangeStart,
  onClick,
  onDelete,
  onResize,
}: NoteProps) {
  const { playNote } = useAudioEngine();
  const [isResizing, setIsResizing] = useState(false);
  const [tempDuration, setTempDuration] = useState(note.duration);
  const [isHovered, setIsHovered] = useState(false);
  const resizeStartX = useRef(0);
  const originalDuration = useRef(note.duration);
  
  // Calculate position and dimensions
  const x = pianoKeyWidth + (note.start - viewRangeStart) * beatWidth;
  const currentDuration = isResizing ? tempDuration : note.duration;
  const width = currentDuration * beatWidth;
  
  // Convert MIDI pitch to grid position (higher pitch = lower y position)
  const y = (totalKeys - note.pitch - 1) * keyHeight;
  const height = keyHeight;
  
  // Calculate opacity based on velocity
  const velocityOpacity = note.velocity / 127;
  
  const handleClick = (e: React.MouseEvent) => {
    if (isResizing) return; // Don't trigger click during resize
    console.log(`🎵 Note clicked! Pitch: ${note.pitch}, Duration: ${note.duration}, Velocity: ${note.velocity}`);
    // Play the note sound
    playNote(note.pitch, note.duration * 0.5, note.velocity);
    onClick(note.id, e);
  };
  
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(note.id);
  };
  
  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    resizeStartX.current = e.clientX;
    originalDuration.current = note.duration;
  };
  
  useEffect(() => {
    if (!isResizing) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStartX.current;
      const deltaDuration = deltaX / beatWidth;
      const newDuration = originalDuration.current + deltaDuration;
      
      // Snap to 0.25 beat grid
      const snapValue = 0.25;
      const snappedDuration = Math.round(newDuration / snapValue) * snapValue;
      
      // Enforce minimum duration
      const finalDuration = Math.max(snapValue, snappedDuration);
      
      setTempDuration(finalDuration);
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      
      // Commit the change if duration actually changed
      if (tempDuration !== note.duration) {
        onResize(note.id, tempDuration);
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, beatWidth, note.duration, note.id, onResize, tempDuration]);
  
  // Reset temp duration when note duration changes
  useEffect(() => {
    if (!isResizing) {
      setTempDuration(note.duration);
    }
  }, [note.duration, isResizing]);
  
  return (
    <div
      className={`absolute transition-all duration-150 rounded-sm pointer-events-auto ${
        isResizing ? 'cursor-ew-resize' : 'cursor-pointer'
      } ${
        isSelected
          ? 'bg-cyan-400 border-2 border-cyan-300 shadow-lg shadow-cyan-400/50 z-10'
          : 'bg-blue-500 border border-blue-400 hover:bg-blue-400 hover:border-blue-300'
      }`}
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        opacity: 0.7 + (velocityOpacity * 0.3),
      }}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={`Pitch: ${note.pitch}, Start: ${note.start}, Duration: ${currentDuration.toFixed(2)}, Velocity: ${note.velocity}\nRight-click to delete`}
    >
      {/* Note content - only show if wide enough */}
      {width > 30 && (
        <div className="flex items-center justify-center h-full text-xs font-mono text-white/80 px-1">
          {note.pitch}
        </div>
      )}
      
      {/* Resize handle */}
      <div
        className={`absolute top-0 right-0 h-full w-2 cursor-ew-resize transition-opacity ${
          isHovered || isSelected || isResizing ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.5))',
        }}
        onMouseDown={handleResizeStart}
        title="Drag to resize"
      />
    </div>
  );
}
