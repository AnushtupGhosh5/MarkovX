"""
Patch to prevent FluidSynth DLL path error on Windows
This allows pretty_midi to import without FluidSynth installed
"""

import sys
import os

# Monkey-patch os.add_dll_directory before fluidsynth tries to use it
original_add_dll_directory = os.add_dll_directory

def patched_add_dll_directory(path):
    """Silently ignore missing FluidSynth DLL directory"""
    try:
        return original_add_dll_directory(path)
    except FileNotFoundError:
        # FluidSynth not installed, that's OK
        print(f"Note: FluidSynth not found at {path} (audio synthesis disabled)")
        return None

os.add_dll_directory = patched_add_dll_directory

# Now import pretty_midi - it will work even without FluidSynth
try:
    import pretty_midi
    print("✓ pretty_midi loaded (MIDI operations available)")
    print("  Note: Audio synthesis requires FluidSynth installation")
except Exception as e:
    print(f"✗ Failed to load pretty_midi: {e}")
    sys.exit(1)
