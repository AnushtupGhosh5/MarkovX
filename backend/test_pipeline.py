"""Quick test script for humming pipeline"""
import sys
import os

# Test imports
try:
    import crepe
    print("✓ CREPE installed")
except ImportError:
    print("✗ CREPE not installed - run: pip install crepe")
    sys.exit(1)

try:
    import librosa
    print("✓ librosa installed")
except ImportError:
    print("✗ librosa not installed - run: pip install librosa")
    sys.exit(1)

try:
    import pretty_midi
    print("✓ pretty_midi installed")
except ImportError:
    print("✗ pretty_midi not installed - run: pip install pretty_midi")
    sys.exit(1)

try:
    import soundfile
    print("✓ soundfile installed")
except ImportError:
    print("✗ soundfile not installed - run: pip install soundfile")
    sys.exit(1)

print("\n✓ All dependencies installed!")
print("\nTo start the server:")
print("  python humming_server.py")
print("\nOr on Windows:")
print("  start_humming_server.bat")
