"""
Simple Accompaniment Generator
Generates basic chord progressions and bass lines from melody
"""

import pretty_midi
import numpy as np
from typing import List, Tuple, Optional


# Common chord progressions (in scale degrees)
CHORD_PROGRESSIONS = {
    "pop": [0, 5, 3, 4],  # I-vi-IV-V
    "jazz": [0, 3, 4, 5],  # I-IV-V-vi
    "blues": [0, 0, 4, 4, 0, 0, 5, 4, 0, 0],  # 12-bar blues
    "simple": [0, 4, 5, 0],  # I-V-vi-I
}


def detect_key_from_notes(notes: List[Tuple[float, float, int]]) -> int:
    """
    Simple key detection based on most common pitch class
    Returns root note (0-11)
    """
    if not notes:
        return 0  # Default to C
    
    # Count pitch classes
    pitch_classes = [pitch % 12 for _, _, pitch in notes]
    pitch_class_counts = np.bincount(pitch_classes, minlength=12)
    
    # Return most common pitch class as root
    return int(np.argmax(pitch_class_counts))


def get_chord_notes(root: int, chord_type: str = "major") -> List[int]:
    """
    Get MIDI notes for a chord
    
    Args:
        root: Root note (0-11 pitch class)
        chord_type: "major", "minor", "seventh"
    """
    base_octave = 4
    root_note = base_octave * 12 + root
    
    if chord_type == "major":
        return [root_note, root_note + 4, root_note + 7]
    elif chord_type == "minor":
        return [root_note, root_note + 3, root_note + 7]
    elif chord_type == "seventh":
        return [root_note, root_note + 4, root_note + 7, root_note + 10]
    else:
        return [root_note, root_note + 4, root_note + 7]


def generate_chord_progression(
    melody_notes: List[Tuple[float, float, int]],
    progression_type: str = "pop",
    bars: int = 4,
    tempo: int = 120
) -> List[Tuple[float, float, List[int]]]:
    """
    Generate chord progression based on melody
    
    Returns:
        List of (start_time, end_time, chord_notes)
    """
    if not melody_notes:
        return []
    
    # Detect key
    key_root = detect_key_from_notes(melody_notes)
    
    # Get progression pattern
    progression = CHORD_PROGRESSIONS.get(progression_type, CHORD_PROGRESSIONS["simple"])
    
    # Calculate chord duration
    total_duration = melody_notes[-1][1]  # End time of last note
    chord_duration = total_duration / len(progression)
    
    # Generate chords
    chords = []
    major_scale = [0, 2, 4, 5, 7, 9, 11]  # Major scale intervals
    
    for i, degree in enumerate(progression):
        start_time = i * chord_duration
        end_time = (i + 1) * chord_duration
        
        # Get chord root from scale degree
        chord_root = (key_root + major_scale[degree % 7]) % 12
        
        # Determine chord quality (simple heuristic)
        chord_type = "major" if degree in [0, 3, 4] else "minor"
        
        chord_notes = get_chord_notes(chord_root, chord_type)
        chords.append((start_time, end_time, chord_notes))
    
    return chords


def generate_bass_line(
    chords: List[Tuple[float, float, List[int]]],
    pattern: str = "root"
) -> List[Tuple[float, float, int]]:
    """
    Generate bass line from chord progression
    
    Args:
        pattern: "root", "walking", "arpeggio"
    """
    bass_notes = []
    
    for start, end, chord_notes in chords:
        root = chord_notes[0] - 24  # Two octaves down
        duration = end - start
        
        if pattern == "root":
            # Just play root note
            bass_notes.append((start, end, root))
        
        elif pattern == "walking":
            # Play root and fifth
            fifth = chord_notes[0] - 24 + 7
            half_duration = duration / 2
            bass_notes.append((start, start + half_duration, root))
            bass_notes.append((start + half_duration, end, fifth))
        
        elif pattern == "arpeggio":
            # Arpeggiate the chord
            num_notes = min(4, len(chord_notes))
            note_duration = duration / num_notes
            
            for i in range(num_notes):
                note_start = start + i * note_duration
                note_end = note_start + note_duration
                note_pitch = chord_notes[i % len(chord_notes)] - 24
                bass_notes.append((note_start, note_end, note_pitch))
    
    return bass_notes


def add_accompaniment_to_midi(
    melody_midi: pretty_midi.PrettyMIDI,
    melody_notes: List[Tuple[float, float, int]],
    progression_type: str = "pop",
    add_chords: bool = True,
    add_bass: bool = True,
    bass_pattern: str = "root"
) -> pretty_midi.PrettyMIDI:
    """
    Add accompaniment to existing melody MIDI
    """
    # Generate chord progression
    chords = generate_chord_progression(melody_notes, progression_type)
    
    # Add chord track
    if add_chords and chords:
        chord_instrument = pretty_midi.Instrument(program=0)  # Piano
        
        for start, end, chord_notes in chords:
            for pitch in chord_notes:
                note = pretty_midi.Note(
                    velocity=60,  # Softer than melody
                    pitch=pitch,
                    start=start,
                    end=end
                )
                chord_instrument.notes.append(note)
        
        melody_midi.instruments.append(chord_instrument)
    
    # Add bass track
    if add_bass and chords:
        bass_notes = generate_bass_line(chords, bass_pattern)
        bass_instrument = pretty_midi.Instrument(program=32)  # Acoustic Bass
        
        for start, end, pitch in bass_notes:
            note = pretty_midi.Note(
                velocity=70,
                pitch=pitch,
                start=start,
                end=end
            )
            bass_instrument.notes.append(note)
        
        melody_midi.instruments.append(bass_instrument)
    
    return melody_midi


def synthesize_midi_to_audio(
    midi: pretty_midi.PrettyMIDI,
    output_path: str,
    sample_rate: int = 44100
) -> str:
    """
    Synthesize MIDI to audio using FluidSynth or fallback to basic synthesis
    """
    try:
        # Try FluidSynth first
        audio = midi.fluidsynth(fs=sample_rate)
        
        # Save to file
        import soundfile as sf
        sf.write(output_path, audio, sample_rate)
        
        print(f"✓ Audio synthesized with FluidSynth: {output_path}")
        return output_path
    except Exception as e:
        print(f"FluidSynth not available ({e}), using basic synthesis...")
        
        try:
            # Fallback: Use pretty_midi's synthesize method
            audio = midi.synthesize(fs=sample_rate)
            
            # Normalize audio
            if len(audio) > 0:
                audio = audio / np.max(np.abs(audio) + 1e-10)
            
            # Save to file
            import soundfile as sf
            sf.write(output_path, audio, sample_rate)
            
            print(f"✓ Audio synthesized with basic synthesis: {output_path}")
            return output_path
        except Exception as e2:
            print(f"Error: Could not synthesize audio: {e2}")
            print("Audio generation failed. MIDI file is still available.")
            return None


if __name__ == "__main__":
    # Test accompaniment generation
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python accompaniment_generator.py <midi_file>")
        sys.exit(1)
    
    midi_file = sys.argv[1]
    
    # Load MIDI
    midi = pretty_midi.PrettyMIDI(midi_file)
    
    # Extract melody notes
    melody_notes = []
    if midi.instruments:
        for note in midi.instruments[0].notes:
            melody_notes.append((note.start, note.end, note.pitch))
    
    # Add accompaniment
    midi_with_acc = add_accompaniment_to_midi(
        midi,
        melody_notes,
        progression_type="pop",
        add_chords=True,
        add_bass=True,
        bass_pattern="walking"
    )
    
    # Save
    output_file = "output_with_accompaniment.mid"
    midi_with_acc.write(output_file)
    print(f"Saved to {output_file}")
    
    # Try to synthesize
    audio_file = "output_with_accompaniment.wav"
    result = synthesize_midi_to_audio(midi_with_acc, audio_file)
    if result:
        print(f"Audio saved to {audio_file}")
