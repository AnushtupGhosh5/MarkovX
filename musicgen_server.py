#!/usr/bin/env python3
"""
Local MusicGen Server
Runs a FastAPI server that generates music using Meta's MusicGen model locally.
No API key required - runs entirely on your machine.
"""

from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import MusicgenForConditionalGeneration, AutoProcessor
import torch
import scipy.io.wavfile
import numpy as np
import os
import tempfile
import logging
import io
import base64

try:
    import librosa
    HAS_LIBROSA = True
except ImportError:
    HAS_LIBROSA = False

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="MusicGen Server")

# Enable CORS for Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global models and processors
text_model = None
text_processor = None
melody_model = None
melody_processor = None

class GenerateRequest(BaseModel):
    prompt: str
    duration: float = 10.0

class GenerateResponse(BaseModel):
    success: bool
    audio_base64: str = None
    error: str = None

@app.on_event("startup")
async def load_models():
    """Load MusicGen models on startup"""
    global text_model, text_processor, melody_model, melody_processor
    try:
        logger.info("Loading MusicGen models on CPU...")
        
        # Load text-to-music model
        logger.info("1/2 Loading text-to-music model...")
        text_model = MusicgenForConditionalGeneration.from_pretrained(
            "facebook/musicgen-small",
            trust_remote_code=True
        )
        text_processor = AutoProcessor.from_pretrained(
            "facebook/musicgen-small",
            trust_remote_code=True
        )
        logger.info("✓ Text-to-music model loaded")
        
        # Load melody-to-music model
        logger.info("2/2 Loading melody-to-music model...")
        melody_model = MusicgenForConditionalGeneration.from_pretrained(
            "facebook/musicgen-melody",
            trust_remote_code=True
        )
        melody_processor = AutoProcessor.from_pretrained(
            "facebook/musicgen-melody",
            trust_remote_code=True
        )
        logger.info("✓ Melody-to-music model loaded")
        
        logger.info("✓ Both models loaded successfully on CPU!")
    except Exception as e:
        logger.error(f"Failed to load models: {e}")
        logger.exception(e)
        raise

@app.get('/health')
def health_check():
    """Health check endpoint"""
    return {
        "status": "running",
        "models": {
            "text_to_music": "facebook/musicgen-small",
            "melody_to_music": "facebook/musicgen-melody"
        },
        "ready": text_model is not None and melody_model is not None
    }

@app.post("/generate", response_model=GenerateResponse)
async def generate_music(request: GenerateRequest):
    """Generate music from text prompt"""
    global text_model, text_processor
    
    if text_model is None or text_processor is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        logger.info(f"Text→Music: '{request.prompt}' ({request.duration}s)")
        
        # Process input
        inputs = text_processor(
            text=[request.prompt],
            padding=True,
            return_tensors="pt"
        )
        
        # Calculate max tokens based on duration
        max_new_tokens = int(request.duration * 50)
        
        # Generate audio
        audio_values = text_model.generate(**inputs, max_new_tokens=max_new_tokens)
        
        # Get sampling rate
        sampling_rate = text_model.config.audio_encoder.sampling_rate
        
        # Convert to WAV in memory
        buffer = io.BytesIO()
        scipy.io.wavfile.write(buffer, sampling_rate, audio_values[0, 0].cpu().numpy())
        buffer.seek(0)
        
        audio_base64 = base64.b64encode(buffer.read()).decode('utf-8')
        
        logger.info("✓ Generated successfully")
        
        return GenerateResponse(
            success=True,
            audio_base64=audio_base64
        )
        
    except Exception as e:
        logger.error(f"Error generating music: {str(e)}")
        import traceback
        traceback.print_exc()
        return GenerateResponse(
            success=False,
            error=str(e)
        )

@app.post("/generate-from-melody", response_model=GenerateResponse)
async def generate_from_melody(
    audio_file: UploadFile = File(...),
    prompt: str = Form(""),
    duration: float = Form(10.0)
):
    """Generate music from humming/melody audio"""
    global melody_model, melody_processor
    
    if melody_model is None or melody_processor is None:
        raise HTTPException(status_code=503, detail="Melody model not loaded")
    
    try:
        logger.info(f"Melody→Music: '{prompt}' ({duration}s)")
        
        # Read uploaded audio
        audio_bytes = await audio_file.read()
        
        # Save to temp file (needed for audio loading)
        with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as tmp_file:
            tmp_file.write(audio_bytes)
            tmp_path = tmp_file.name
        
        try:
            # Use librosa if available (handles all formats without ffmpeg)
            if HAS_LIBROSA:
                audio_data, sample_rate = librosa.load(tmp_path, sr=None, mono=True)
                logger.info(f"Loaded with librosa: {sample_rate}Hz, {len(audio_data)} samples")
            else:
                # Fallback to scipy (WAV only)
                sample_rate, audio_data = scipy.io.wavfile.read(tmp_path)
                
                # Normalize
                if audio_data.dtype == 'int16':
                    audio_data = audio_data.astype('float32') / 32768.0
                elif audio_data.dtype == 'int32':
                    audio_data = audio_data.astype('float32') / 2147483648.0
                
                # Stereo to mono
                if len(audio_data.shape) > 1:
                    audio_data = audio_data.mean(axis=1)
        finally:
            # Windows fix: try to delete, ignore if locked
            try:
                os.unlink(tmp_path)
            except PermissionError:
                pass  # File will be cleaned up by OS eventually
        
        # Ensure audio_data is standard numpy array with float32
        if isinstance(audio_data, torch.Tensor):
            audio_data = audio_data.numpy()
        audio_data = np.array(audio_data, dtype=np.float32)
        
        # Ensure mono (1D array)
        if len(audio_data.shape) > 1:
            audio_data = audio_data.mean(axis=0)
        
        logger.info(f"Audio shape before resample: {audio_data.shape}, dtype: {audio_data.dtype}")
        
        # Resample to model's expected rate (32kHz for MusicGen)
        target_sr = melody_model.config.audio_encoder.sampling_rate
        if sample_rate != target_sr:
            audio_data = librosa.resample(audio_data, orig_sr=float(sample_rate), target_sr=float(target_sr))
            sample_rate = target_sr
            logger.info(f"Resampled to {target_sr}Hz")
        
        # Ensure sample_rate is Python int (not numpy)
        sample_rate = int(sample_rate)
        
        # Ensure 1D array
        audio_data = np.squeeze(audio_data)
        logger.info(f"Final audio shape: {audio_data.shape}, sample_rate: {sample_rate}")
        
        # Process inputs with melody processor
        if prompt:
            # With text prompt
            inputs = melody_processor(
                audio=audio_data,
                sampling_rate=sample_rate,
                text=[prompt],
                padding=True,
                return_tensors="pt"
            )
        else:
            # Audio only
            inputs = melody_processor(
                audio=audio_data,
                sampling_rate=sample_rate,
                padding=True,
                return_tensors="pt"
            )
        
        # Ensure correct key names for model
        if 'input_features' in inputs:
            inputs['input_values'] = inputs.pop('input_features')
        
        max_new_tokens = int(duration * 50)
        
        # Generate
        audio_values = melody_model.generate(**inputs, max_new_tokens=max_new_tokens)
        
        # Convert to WAV
        sampling_rate = melody_model.config.audio_encoder.sampling_rate
        buffer = io.BytesIO()
        scipy.io.wavfile.write(buffer, sampling_rate, audio_values[0, 0].cpu().numpy())
        buffer.seek(0)
        
        audio_base64 = base64.b64encode(buffer.read()).decode('utf-8')
        
        logger.info("✓ Generated successfully")
        
        return GenerateResponse(
            success=True,
            audio_base64=audio_base64
        )
        
    except Exception as e:
        logger.error(f"Melody generation failed: {e}")
        import traceback
        traceback.print_exc()
        return GenerateResponse(
            success=False,
            error=str(e)
        )

if __name__ == "__main__":
    import uvicorn
    print("=" * 60)
    print("🎵 MusicGen Server Starting...")
    print("=" * 60)
    print("Model: facebook/musicgen-small (HuggingFace)")
    print("Server: http://localhost:8000")
    print("Docs: http://localhost:8000/docs")
    print("=" * 60)
    uvicorn.run(app, host="0.0.0.0", port=8000)
