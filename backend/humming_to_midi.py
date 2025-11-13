"""
Humming-to-MIDI Pipeline
Extracts pitch from humming audio and converts to MIDI notes
"""

import numpy as np
import librosa
import crepe
import pretty_midi
from typing import List, Tuple, Optional
import io


def extract_pitch_from_audio(
    audio_path: str,
    sr: int = 16000,
    hop_length: int = 160,
    confidence_threshold: float = 0.3
) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Extract pitch contour from audio using CREPE
    
    Returns:
        time: Time stamps in seconds
        frequency: Frequency in Hz
        confidence: Confidence scores (0-1)
    """
    # Load audio
    audio, sr = librosa.load(audio_path, sr=sr)
    
    # Extract pitch using CREPE (tiny model for speed)
    time, frequency, confidence, activation = crepe.predict(
        audio,
        sr,
        model_capacity='tiny',  # Use 'tiny' for speed, 'full' for accuracy
        viterbi=True,
        step_size=hop_length / sr * 1000  # Convert to milliseconds
    )
    
    # Filter out low-confidence predictions
    frequency[confidence < confidence_threshold] = 0
    
    return time, frequency, confidence


def frequency_to_midi(frequency: float) -> int:
    """Convert frequency in Hz to MIDI note number"""
    if frequency <= 0:
        return 0
    return int(round(69 + 12 * np.log2(frequency / 440.0)))


def smooth_pitch_contour(
    frequency: np.ndarray,
    confidence: np.ndarray,
    window_size: int = 5
) -> np.ndarray:
    """Smooth pitch contour to reduce jitter"""
    smoothed = np.copy(frequency)
    
    for i in range(len(frequency)):
        if frequency[i] > 0:
            start = max(0, i - window_size // 2)
            end = min(len(frequency), i + window_size // 2 + 1)
            
            # Only average over confident, non-zero values
            window = frequency[start:end]
            conf_window = confidence[start:end]
            valid = (window > 0) & (conf_window > 0.5)
            
            if np.any(valid):
                smoothed[i] = np.mean(window[valid])
    
    return smoothed


def segment_notes(
    time: np.ndarray,
    frequency: np.ndarray,
    min_note_duration: float = 0.1,
    pitch_tolerance: int = 1
) -> List[Tuple[float, float, int]]:
    """
    Segment continuous pitch into discrete notes
    
    Returns:
        List of (start_time, end_time, midi_note)
    """
    notes = []
    
    if len(frequency) == 0:
        return notes
    
    current_note = None
    note_start = None
    
    for i, (t, freq) in enumerate(zip(time, frequency)):
        if freq > 0:
            midi_note = frequency_to_midi(freq)
            
            if current_note is None:
                # Start new note
                current_note = midi_note
                note_start = t
            elif abs(midi_note - current_note) > pitch_tolerance:
                # Note changed, save previous note
                if note_start is not None and (t - note_start) >= min_note_duration:
                    notes.append((note_start, t, current_note))
                current_note = midi_note
                note_start = t
        else:
            # Silence detected, end current note
            if current_note is not None and note_start is not None:
                if (t - note_start) >= min_note_duration:
                    notes.append((note_start, t, current_note))
                current_note = None
                note_start = None
    
    # Add final note if exists
    if current_note is not None and note_start is not None:
        if (time[-1] - note_start) >= min_note_duration:
            notes.append((note_start, time[-1], current_note))
    
    return notes


def create_midi_from_notes(
    notes: List[Tuple[float, float, int]],
    tempo: int = 120,
    velocity: int = 80
) -> pretty_midi.PrettyMIDI:
    """
    Create MIDI file from note list
    
    Args:
        notes: List of (start_time, end_time, midi_note)
        tempo: BPM
        velocity: Note velocity (0-127)
    """
    midi = pretty_midi.PrettyMIDI(initial_tempo=tempo)
    instrument = pretty_midi.Instrument(program=0)  # Acoustic Grand Piano
    
    for start, end, pitch in notes:
        note = pretty_midi.Note(
            velocity=velocity,
            pitch=pitch,
            start=start,
            end=end
        )
        instrument.notes.append(note)
    
    midi.instruments.append(instrument)
    return midi


def audio_to_midi(
    audio_path: str,
    output_path: Optional[str] = None,
    confidence_threshold: float = 0.3,
    min_note_duration: float = 0.05,
    smooth_window: int = 5
) -> Tuple[pretty_midi.PrettyMIDI, List[dict]]:
    """
    Complete pipeline: audio -> MIDI
    
    Returns:
        midi: PrettyMIDI object
        notes_data: List of note dictionaries for frontend display
    """
    # Extract pitch
    time, frequency, confidence = extract_pitch_from_audio(
        audio_path,
        confidence_threshold=confidence_threshold
    )
    
    # Smooth pitch contour
    frequency = smooth_pitch_contour(frequency, confidence, window_size=smooth_window)
    
    # Segment into notes
    notes = segment_notes(time, frequency, min_note_duration=min_note_duration)
    
    # Create MIDI
    midi = create_midi_from_notes(notes)
    
    # Save if output path provided
    if output_path:
        midi.write(output_path)
    
    # Format notes for frontend
    notes_data = [
        {
            "start": float(start),
            "end": float(end),
            "pitch": int(pitch),
            "note_name": pretty_midi.note_number_to_name(pitch),
            "duration": float(end - start)
        }
        for start, end, pitch in notes
    ]
    
    return midi, notes_data


def midi_to_bytes(midi: pretty_midi.PrettyMIDI) -> bytes:
    """Convert MIDI object to bytes for API response"""
    buffer = io.BytesIO()
    midi.write(buffer)
    buffer.seek(0)
    return buffer.read()


if __name__ == "__main__":
    # Test the pipeline
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python humming_to_midi.py <audio_file>")
        sys.exit(1)
    
    audio_file = sys.argv[1]
    output_file = "output.mid"
    
    print(f"Processing {audio_file}...")
    midi, notes = audio_to_midi(audio_file, output_file)
    
    print(f"\nExtracted {len(notes)} notes:")
    for note in notes[:10]:  # Show first 10
        print(f"  {note['note_name']}: {note['start']:.2f}s - {note['end']:.2f}s")
    
    print(f"\nMIDI saved to {output_file}")
