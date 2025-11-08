"""Generate test humming audio for testing the pipeline"""
import numpy as np
import soundfile as sf

def generate_melody_audio(notes, duration=0.5, sr=16000, output_file="test_humming.wav"):
    """
    Generate simple sine wave melody for testing
    
    Args:
        notes: List of MIDI note numbers
        duration: Duration per note in seconds
        sr: Sample rate
        output_file: Output filename
    """
    audio = []
    
    for note in notes:
        # Convert MIDI to frequency
        freq = 440 * (2 ** ((note - 69) / 12))
        
        # Generate sine wave
        t = np.linspace(0, duration, int(sr * duration))
        wave = np.sin(2 * np.pi * freq * t)
        
        # Add envelope (fade in/out)
        envelope = np.ones_like(wave)
        fade_samples = int(sr * 0.05)  # 50ms fade
        envelope[:fade_samples] = np.linspace(0, 1, fade_samples)
        envelope[-fade_samples:] = np.linspace(1, 0, fade_samples)
        
        wave = wave * envelope * 0.5  # Reduce volume
        audio.append(wave)
    
    # Concatenate all notes
    audio = np.concatenate(audio)
    
    # Save
    sf.write(output_file, audio, sr)
    print(f"Generated test audio: {output_file}")
    print(f"Duration: {len(audio)/sr:.2f}s")
    return output_file

if __name__ == "__main__":
    # Generate a simple melody: C-D-E-F-G-A-G-F-E-D-C
    melody = [60, 62, 64, 65, 67, 69, 67, 65, 64, 62, 60]
    
    output = generate_melody_audio(melody, duration=0.4)
    print(f"\nTest with: python humming_to_midi.py {output}")
