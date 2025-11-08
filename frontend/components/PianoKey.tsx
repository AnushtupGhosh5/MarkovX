'use client';

import { useState } from 'react';
import { useAudioEngine } from '@/src/hooks/useAudioEngine';

interface PianoKeyProps {
  pitch: number;
  noteName: string;
  octave: number;
  isBlackKey: boolean;
  top: number;
  height: number;
  width: number;
}

export default function PianoKey({
  pitch,
  noteName,
  octave,
  isBlackKey,
  top,
  height,
  width,
}: PianoKeyProps) {
  const [isPressed, setIsPressed] = useState(false);
  const { playNote } = useAudioEngine();

  const handleClick = () => {
    console.log(`🎹 Piano key clicked! Pitch: ${pitch}, Note: ${noteName}${octave}`);
    setIsPressed(true);
    playNote(pitch, 0.3, 100);
    
    // Reset animation after a short delay
    setTimeout(() => setIsPressed(false), 150);
  };

  return (
    <div
      className={`absolute cursor-pointer transition-all duration-75 border-r border-slate-600/50 ${
        isBlackKey
          ? 'bg-slate-800 hover:bg-slate-700'
          : 'bg-slate-700 hover:bg-slate-600'
      } ${isPressed ? 'brightness-150 scale-95' : ''}`}
      style={{
        top: `${top}px`,
        left: 0,
        width: `${width}px`,
        height: `${height}px`,
      }}
      onClick={handleClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
    >
      {/* Show note name for C notes */}
      {noteName === 'C' && (
        <div className="flex items-center justify-center h-full">
          <span className="text-[10px] font-mono text-cyan-400 font-semibold">
            {noteName}{octave}
          </span>
        </div>
      )}
      
      {/* Glow effect when pressed */}
      {isPressed && (
        <div className="absolute inset-0 bg-cyan-400/30 animate-pulse" />
      )}
    </div>
  );
}
