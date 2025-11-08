"""Test melody processing to debug the issue"""
import numpy as np
import torch
from transformers import MusicgenForConditionalGeneration, AutoProcessor

print("Loading melody model...")
melody_model = MusicgenForConditionalGeneration.from_pretrained(
    "facebook/musicgen-melody",
    trust_remote_code=True
)
melody_processor = AutoProcessor.from_pretrained(
    "facebook/musicgen-melody",
    trust_remote_code=True
)
print("✓ Model loaded")

# Create dummy audio (1 second of silence at 32kHz)
sample_rate = 32000
audio_data = np.zeros(sample_rate, dtype=np.float32)

print(f"\nAudio data type: {type(audio_data)}")
print(f"Audio dtype: {audio_data.dtype}")
print(f"Audio shape: {audio_data.shape}")
print(f"Sample rate: {sample_rate}")

# Test 1: Audio only
print("\n--- Test 1: Audio only ---")
try:
    inputs = melody_processor(
        audio=audio_data,
        sampling_rate=sample_rate,
        padding=True,
        return_tensors="pt"
    )
    print("✓ Audio-only processing works!")
    print(f"Input keys: {inputs.keys()}")
except Exception as e:
    print(f"✗ Failed: {e}")

# Test 2: Audio + text
print("\n--- Test 2: Audio + text ---")
try:
    inputs = melody_processor(
        audio=audio_data,
        sampling_rate=sample_rate,
        text=["jazz piano"],
        padding=True,
        return_tensors="pt"
    )
    print("✓ Audio+text processing works!")
    print(f"Input keys: {inputs.keys()}")
except Exception as e:
    print(f"✗ Failed: {e}")

# Test 3: Generate
print("\n--- Test 3: Generate audio ---")
try:
    inputs = melody_processor(
        audio=audio_data,
        sampling_rate=sample_rate,
        padding=True,
        return_tensors="pt"
    )
    
    with torch.no_grad():
        audio_values = melody_model.generate(**inputs, max_new_tokens=250)
    
    print("✓ Generation works!")
    print(f"Output shape: {audio_values.shape}")
except Exception as e:
    print(f"✗ Failed: {e}")
    import traceback
    traceback.print_exc()

print("\n=== All tests complete ===")
