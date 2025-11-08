# Mixer Documentation

## Overview

The Mixer is a professional-grade audio mixing interface with real-time visualization, multi-track control, and effects management.

## Features

### 🎚️ Multi-Track Mixing
- **Unlimited Tracks**: Add as many tracks as you need
- **Individual Controls**: Volume, pan, mute, and solo for each track
- **Color Coding**: Visual identification with custom colors
- **Track Types**: Support for MIDI and audio tracks

### 📊 Real-Time Visualization
- **Live Waveform Display**: 64-band frequency analyzer
- **Color-Coded Spectrum**: Rainbow gradient visualization
- **VU Meters**: Left/right channel level monitoring
- **Live Monitoring**: Toggle real-time audio analysis

### 🎛️ Track Controls

#### Volume Control
- Range: -60 dB to +6 dB
- Precision: 0.1 dB steps
- Real-time adjustment with smooth sliders

#### Pan Control
- Range: 100% Left to 100% Right
- Center position indicator
- Stereo field visualization

#### Mute/Solo
- **Mute (M)**: Silence individual tracks
- **Solo (S)**: Isolate tracks for focused listening
- Visual indicators for active states

### 🎨 Effects (Coming Soon)
- Reverb
- Delay
- EQ
- Compression
- Distortion
- Filter

### 🎼 Master Section
- **Master Volume**: Global output control
- **Master Mute**: Quick silence all tracks
- **VU Meters**: Stereo level monitoring
- **Session Info**: Tempo, key, and track count

## Usage

### Opening the Mixer
1. Click the **Mixer icon** (sliders) in the left sidebar
2. Or click **"Open Mixer"** from the welcome screen

### Adding Tracks
1. Click **"+ Add Track"** button
2. New track appears with default settings
3. Click track to select and edit

### Adjusting Track Settings
1. **Select a track** from the left panel
2. Use the **sliders** to adjust volume and pan
3. Click **M** to mute, **S** to solo
4. View real-time changes in the visualizer

### Live Monitoring
1. Click **"Start Analysis"** to enable live visualization
2. Play audio to see waveform in real-time
3. Click **"● Live"** to stop monitoring

### Deleting Tracks
1. Click the **X button** on any track card
2. Track is removed immediately
3. Selection moves to first available track

## Keyboard Shortcuts (Coming Soon)
- `M` - Toggle mute on selected track
- `S` - Toggle solo on selected track
- `Delete` - Remove selected track
- `↑/↓` - Navigate tracks
- `Space` - Play/Pause

## Technical Details

### Audio Engine
- Built on **Tone.js** for professional audio processing
- Real-time FFT analysis with 64 frequency bands
- Low-latency audio routing
- Hardware-accelerated rendering

### Performance
- Optimized React rendering with `useRef` and `useCallback`
- Smooth 60fps animations
- Efficient waveform data processing
- Minimal CPU usage when idle

### Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (requires user interaction for audio)

## Tips & Tricks

### Mixing Best Practices
1. **Start with volume**: Get levels right before adding effects
2. **Use panning**: Create space in the stereo field
3. **Solo tracks**: Focus on individual elements
4. **Monitor levels**: Keep master below 0 dB to avoid clipping

### Workflow Tips
1. **Color code tracks**: Use colors to organize by instrument type
2. **Name tracks clearly**: Easy identification in large projects
3. **Use solo sparingly**: Too many solos can be confusing
4. **Save often**: Export your mix regularly

### Performance Optimization
1. **Disable live monitoring** when not needed
2. **Remove unused tracks** to reduce CPU load
3. **Close other browser tabs** for best performance

## Troubleshooting

### No Audio Output
- Check if tracks are muted
- Verify master volume is not at -60 dB
- Ensure browser audio is enabled
- Check system volume settings

### Visualizer Not Working
- Click "Start Analysis" button
- Play some audio
- Check browser console for errors
- Refresh the page if needed

### Laggy Performance
- Disable live monitoring
- Close other applications
- Reduce number of tracks
- Use a modern browser

## Future Enhancements

- [ ] Real-time effects processing
- [ ] Automation lanes
- [ ] EQ with visual feedback
- [ ] Compressor with gain reduction meter
- [ ] Export individual tracks
- [ ] Save/load mixer presets
- [ ] MIDI learn for hardware controllers
- [ ] Plugin support (VST/AU)
- [ ] Spectrum analyzer
- [ ] Phase correlation meter

## API Reference

### Track Interface
```typescript
interface Track {
  id: string;
  name: string;
  volume: number;      // -60 to 6 dB
  pan: number;         // -1 to 1 (L to R)
  muted: boolean;
  solo: boolean;
  color: string;       // Hex color
  type: 'midi' | 'audio';
  audioUrl?: string;
}
```

### Component Props
```typescript
interface MixerProps {
  // No props required - uses global store
}
```

## Support

For issues or feature requests, please check the main README or contact support.

---

**Version**: 1.0.0  
**Last Updated**: 2025  
**Built with**: React, TypeScript, Tone.js, Tailwind CSS
