"""
Simple test to check if humming extraction works without FluidSynth
"""

import sys
sys.path.insert(0, '.')

print("Testing humming-to-MIDI without FluidSynth...")
print("=" * 60)

try:
    from humming_to_midi import audio_to_midi
    print("✓ humming_to_midi module loaded")
except Exception as e:
    print(f"✗ Failed to load module: {e}")
    sys.exit(1)

# Test with a sample audio file if it exists
import os
test_file = "../test_humming.wav"

if os.path.exists(test_file):
    print(f"\nTesting with {test_file}...")
    try:
        midi, notes = audio_to_midi(test_file, "test_output.mid")
        print(f"✓ Extracted {len(notes)} notes")
        if notes:
            print(f"  First note: {notes[0]}")
        if midi:
            print(f"✓ MIDI file created: test_output.mid")
        else:
            print("✗ MIDI creation failed (mido not installed?)")
    except Exception as e:
        print(f"✗ Processing failed: {e}")
        import traceback
        traceback.print_exc()
else:
    print(f"\nNo test file found at {test_file}")
    print("Skipping audio processing test")

print("\n" + "=" * 60)
print("If you see errors about FluidSynth, that's OK!")
print("The basic melody extraction should still work.")
print("To enable full features, install FluidSynth (see INSTALL_FLUIDSYNTH.md)")
