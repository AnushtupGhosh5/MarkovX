'use client';

import { Note as NoteType } from '@/src/types';

interface NoteProps {
  note: NoteType;
  isSelected: boolean;
  beatWidth: number;
  keyHeight: number;
  pianoKeyWidth: number;
  totalKeys: number;
  viewRangeStart: number;
  onClick: (noteId: string, event: React.MouseEvent) => void;
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
}: NoteProps) {
  // Calculate position and dimensions
  const x = pianoKeyWidth + (note.start - viewRangeStart) * beatWidth;
  const width = note.duration * beatWidth;
  
  // Convert MIDI pitch to grid position (higher pitch = lower y position)
  const y = (totalKeys - note.pitch - 1) * keyHeight;
  const height = keyHeight;
  
  // Calculate opacity based on velocity
  const velocityOpacity = note.velocity / 127;
  
  const handleClick = (e: React.MouseEvent) => {
    onClick(note.id, e);
  };
  
  return (
    <div
      className={`absolute cursor-pointer transition-all duration-150 rounded-sm ${
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
      title={`Pitch: ${note.pitch}, Start: ${note.start}, Duration: ${note.duration}, Velocity: ${note.velocity}`}
    >
      {/* Note content - only show if wide enough */}
      {width > 30 && (
        <div className="flex items-center justify-center h-full text-xs font-mono text-white/80 px-1">
          {note.pitch}
        </div>
      )}
    </div>
  );
}
