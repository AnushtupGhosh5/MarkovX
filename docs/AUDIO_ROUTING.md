# Audio Routing System Documentation

## Overview

The Mixer is now fully connected to the Tone.js audio engine with real-time audio routing, volume control, panning, and MIDI note playback.

## ✅ What's Implemented

### 1. **Audio Channels**
Each track has its own audio channel with:
- **Synth**: Polyphonic synthesizer (Tone.PolySynth)
- **Volume Control**: Individual volume control (-60 to +6 dB)
- **Panner**: Stereo panning (-1 to +1)
- **Channel**: Combines volume and pan with mute capability

### 2. **Signal Flow**
```
MIDI Note → Synth → Volume → Panner → Channel → Master Volume → Destination (Speakers)
```

### 3. **Master Controls**
- **Master Volume**: Controls overall output level
- **Master Mute**: Silences all tracks
- **Analyzer**: Real-time waveform visualization

### 4. **Track Controls**
- **Volume**: -60 dB to +6 dB per track
- **Pan**: -1 (left) to +1 (right)
- **Mute**: Silence individual tracks
- **Solo**: Isolate specific tracks
- **Test Button**: Play a test note (C4)

## 🎹 How to Use

### Playing Notes on Tracks

#### Method 1: Using the Mixer API (Global)
```typescript
// Play a single note
window.mixerAPI.playNoteOnTrack('1', 60, 0.5, 100);
// trackId, midiNote (60 = C4), duration (seconds), velocity (0-127)

// Play test note
window.mixerAPI.playTestNote('1');
```

#### Method 2: Using the useMixer Hook
```typescript
import { useMixer } from '@/src/hooks/useMixer';

function MyComponent() {
  const mixer = useMixer();

  const playNote = () => {
    if (mixer.isReady) {
      mixer.playNoteOnTrack('1', 60, 0.5, 100);
    }
  };

  return <button onClick={playNote}>Play Note</button>;
}
```

### Scheduling MIDI Notes

```typescript
const notes = [
  { pitch: 60, start: 0, duration: 0.5, velocity: 100 },    // C4 at beat 0
  { pitch: 64, start: 0.5, duration: 0.5, velocity: 100 },  // E4 at beat 0.5
  { pitch: 67, start: 1, duration: 0.5, velocity: 100 },    // G4 at beat 1
];

window.mixerAPI.scheduleNotesOnTrack('1', notes);
Tone.Transport.start(); // Start playback
```

### Controlling Volume and Pan

```typescript
// Volume is automatically applied when you use the sliders
// But you can also access the audio channel directly:

const channel = window.mixerAPI.getAudioChannel('1');
if (channel) {
  channel.volume.volume.value = -10; // Set to -10 dB
  channel.panner.pan.value = 0.5;    // Pan 50% right
  channel.channel.mute = true;        // Mute the track
}
```

## 🎛️ Track Management

### Adding Tracks
```typescript
// Click "+ Add Track" button in the UI
// Or programmatically (from within Mixer component):
addTrack();
```

### Deleting Tracks
```typescript
// Click the X button on a track card
// Audio channel is automatically disposed
```

### Getting All Tracks
```typescript
const tracks = window.mixerAPI.getTracks();
console.log(tracks); // Array of track objects
```

## 🔊 Audio Features

### Volume Control
- **Range**: -60 dB (silent) to +6 dB (boosted)
- **Real-time**: Changes apply immediately
- **Per-track**: Each track has independent volume
- **Master**: Global volume control

### Panning
- **Range**: -1 (100% left) to +1 (100% right)
- **Center**: 0 (equal in both speakers)
- **Real-time**: Changes apply immediately

### Mute/Solo
- **Mute**: Silences a track without changing volume
- **Solo**: Mutes all other tracks
- **Multiple Solo**: Can solo multiple tracks at once

### Waveform Visualization
- **64-band analyzer**: Real-time frequency analysis
- **Toggle**: Click "Start Analysis" to enable
- **Performance**: Minimal CPU usage when disabled

## 🎵 Synthesizer Settings

Each track uses a polyphonic synthesizer with:
- **Oscillator**: Triangle wave
- **Attack**: 0.01s (very fast)
- **Decay**: 0.1s
- **Sustain**: 0.3 (30% of peak)
- **Release**: 0.5s

### Customizing Synth (Advanced)
```typescript
const channel = window.mixerAPI.getAudioChannel('1');
if (channel) {
  // Change oscillator type
  channel.synth.set({
    oscillator: { type: 'sawtooth' }
  });

  // Change envelope
  channel.synth.set({
    envelope: {
      attack: 0.05,
      decay: 0.2,
      sustain: 0.5,
      release: 1.0,
    }
  });
}
```

## 🔌 Integration Examples

### Example 1: Piano Roll Integration
```typescript
// In PianoRollGrid component
import { useMixer } from '@/src/hooks/useMixer';

function PianoRollGrid() {
  const mixer = useMixer();

  const playNote = (midiNote: number) => {
    if (mixer.isReady) {
      // Play on first track
      mixer.playNoteOnTrack('1', midiNote, 0.5, 100);
    }
  };

  return (
    <div onClick={() => playNote(60)}>
      Click to play C4
    </div>
  );
}
```

### Example 2: Sequence Playback
```typescript
import * as Tone from 'tone';

function playSequence() {
  const notes = [
    { pitch: 60, start: 0, duration: 0.25, velocity: 100 },
    { pitch: 62, start: 0.25, duration: 0.25, velocity: 100 },
    { pitch: 64, start: 0.5, duration: 0.25, velocity: 100 },
    { pitch: 65, start: 0.75, duration: 0.25, velocity: 100 },
  ];

  window.mixerAPI.scheduleNotesOnTrack('1', notes);
  
  Tone.Transport.bpm.value = 120;
  Tone.Transport.start();
}
```

### Example 3: Multi-Track Playback
```typescript
function playChord() {
  const tracks = window.mixerAPI.getTracks();
  
  // Play C major chord across 3 tracks
  if (tracks.length >= 3) {
    window.mixerAPI.playNoteOnTrack(tracks[0].id, 60, 1.0, 100); // C
    window.mixerAPI.playNoteOnTrack(tracks[1].id, 64, 1.0, 100); // E
    window.mixerAPI.playNoteOnTrack(tracks[2].id, 67, 1.0, 100); // G
  }
}
```

## 🐛 Troubleshooting

### No Sound
1. Check if audio is initialized (click anywhere first)
2. Check track is not muted
3. Check master volume is not muted
4. Check system volume
5. Open browser console for errors

### Distorted Sound
1. Reduce track volumes
2. Reduce master volume
3. Check for clipping (volume > 0 dB)

### Latency Issues
1. Reduce number of active tracks
2. Disable waveform analyzer
3. Use shorter note durations
4. Check system audio settings

## 📊 Performance

- **Tracks**: Tested with 10+ tracks
- **Polyphony**: Each track supports multiple simultaneous notes
- **Latency**: ~10-20ms (depends on system)
- **CPU**: Minimal when analyzer is off

## 🔮 Future Enhancements

- [ ] Effects per track (reverb, delay, EQ)
- [ ] Audio file playback
- [ ] Recording functionality
- [ ] Automation lanes
- [ ] MIDI input support
- [ ] Custom synth selection
- [ ] Preset management
- [ ] Export individual tracks

## 🎯 Quick Reference

### Play a Note
```typescript
window.mixerAPI.playNoteOnTrack(trackId, midiNote, duration, velocity);
```

### Schedule Notes
```typescript
window.mixerAPI.scheduleNotesOnTrack(trackId, notesArray);
```

### Test Sound
```typescript
window.mixerAPI.playTestNote(trackId);
```

### Get Tracks
```typescript
const tracks = window.mixerAPI.getTracks();
```

### Get Audio Channel
```typescript
const channel = window.mixerAPI.getAudioChannel(trackId);
```

---

**Version**: 1.0.0  
**Last Updated**: 2025  
**Built with**: React, TypeScript, Tone.js
