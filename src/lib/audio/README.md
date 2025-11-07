# Audio Engine

The AudioEngine module provides audio playback functionality using Tone.js, including MIDI note scheduling and audio buffer playback.

## Features

- **MIDI Playback**: Schedule and play MIDI notes with configurable tempo
- **Audio Loading**: Load and play generated audio files
- **Transport Controls**: Play, pause, stop, and seek functionality
- **State Sync**: Automatic synchronization with Zustand store
- **Audio Context Handling**: Proper initialization on user interaction

## Usage

### Using the React Hook (Recommended)

```tsx
import { useAudioEngine } from '@/src/lib/audio';

function AudioControls() {
  const { 
    isPlaying, 
    currentTime, 
    play, 
    pause, 
    stop, 
    seek,
    isReady 
  } = useAudioEngine();

  return (
    <div>
      <button onClick={play} disabled={isPlaying}>Play</button>
      <button onClick={pause} disabled={!isPlaying}>Pause</button>
      <button onClick={stop}>Stop</button>
      <div>Time: {currentTime.toFixed(2)}s</div>
      <div>Status: {isReady ? 'Ready' : 'Not initialized'}</div>
    </div>
  );
}
```

### Direct AudioEngine Usage

```typescript
import { getAudioEngine } from '@/src/lib/audio';

const audioEngine = getAudioEngine();

// Initialize (required before first use)
await audioEngine.initialize();

// Schedule MIDI notes
audioEngine.scheduleNotes(notes, tempo);

// Control playback
await audioEngine.play((time) => {
  console.log('Current time:', time);
});

audioEngine.pause();
audioEngine.stop();
audioEngine.seek(10); // Seek to 10 seconds

// Load generated audio
await audioEngine.loadAudio('/audio/generated.mp3');

// Cleanup
audioEngine.dispose();
```

## API Reference

### AudioEngine Class

#### Methods

- `initialize()`: Initialize audio context (required on user interaction)
- `loadAudio(audioUrl: string)`: Load audio file from URL
- `scheduleNotes(notes: Note[], tempo: number)`: Schedule MIDI notes for playback
- `play(onTimeUpdate?: (time: number) => void)`: Start playback
- `pause()`: Pause playback
- `stop()`: Stop playback and reset to beginning
- `seek(time: number)`: Seek to specific time in seconds
- `getCurrentTime()`: Get current playback time
- `setTempo(tempo: number)`: Set playback tempo
- `getTempo()`: Get current tempo
- `isReady()`: Check if audio engine is initialized
- `dispose()`: Clean up resources

### useAudioEngine Hook

Returns an object with:

- `audioEngine`: AudioEngine instance
- `isPlaying`: Current playback state
- `currentTime`: Current playback time in seconds
- `play()`: Start playback
- `pause()`: Pause playback
- `stop()`: Stop playback
- `seek(time: number)`: Seek to time
- `loadAudio(audioUrl: string)`: Load audio file
- `isReady`: Whether audio engine is initialized

## Implementation Details

### Audio Context Initialization

The audio engine automatically handles audio context initialization on user interaction, as required by browser policies. The first call to `play()` will initialize the context if needed.

### State Synchronization

The `useAudioEngine` hook automatically syncs:
- Playback state (play/pause/stop) with Zustand store
- Current time updates during playback
- Tempo changes
- Note scheduling when notes change

### Time Updates

During playback, the current time is updated at ~60fps and synced with the Zustand store's `currentTime` state.

### Note Scheduling

Notes are scheduled using Tone.Transport, which provides accurate timing. When notes or tempo change, they are automatically rescheduled.

## Requirements Satisfied

- **3.2**: Transport controls (play, pause, stop, seek)
- **9.3**: Tempo change handling with automatic timestamp adjustment
