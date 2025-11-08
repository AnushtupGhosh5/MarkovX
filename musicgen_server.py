"""
MusicGen Server - Local HuggingFace MusicGen API
Runs facebook/musicgen-small model locally using transformers
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import MusicgenForConditionalGeneration, AutoProcessor
import torch
import scipy.io.wavfile
import io
import base64
import logging

# Setup logging
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

# Global model and processor
model = None
processor = None

class GenerateRequest(BaseModel):
    prompt: str
    duration: float = 10.0

class GenerateResponse(BaseModel):
    success: bool
    audio_base64: str = None
    error: str = None

@app.on_event("startup")
async def load_model():
    """Load MusicGen model on startup"""
    global model, processor
    try:
        logger.info("Loading MusicGen model on CPU...")
        
        model = MusicgenForConditionalGeneration.from_pretrained(
            "facebook/musicgen-small",
            trust_remote_code=True
        )
        
        processor = AutoProcessor.from_pretrained(
            "facebook/musicgen-small",
            trust_remote_code=True
        )
        logger.info("✓ MusicGen model loaded successfully on CPU!")
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        logger.exception(e)
        raise

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "running",
        "model": "facebook/musicgen-small",
        "ready": model is not None and processor is not None
    }

@app.post("/generate", response_model=GenerateResponse)
async def generate_music(request: GenerateRequest):
    """Generate music from text prompt"""
    global model, processor
    
    if model is None or processor is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        logger.info(f"Generating music: '{request.prompt}' ({request.duration}s)")
        
        # Process input
        inputs = processor(
            text=[request.prompt],
            padding=True,
            return_tensors="pt"
        )
        
        # Calculate max_new_tokens based on duration (50 tokens per second)
        max_new_tokens = int(request.duration * 50)
        
        # Generate audio
        audio_values = model.generate(**inputs, max_new_tokens=max_new_tokens)
        
        # Get sampling rate
        sampling_rate = model.config.audio_encoder.sampling_rate
        
        # Convert to WAV in memory
        buffer = io.BytesIO()
        scipy.io.wavfile.write(buffer, sampling_rate, audio_values[0, 0].cpu().numpy())
        buffer.seek(0)
        
        # Encode to base64
        audio_base64 = base64.b64encode(buffer.read()).decode('utf-8')
        
        logger.info("✓ Audio generated successfully")
        
        return GenerateResponse(
            success=True,
            audio_base64=audio_base64
        )
        
    except Exception as e:
        logger.error(f"Generation failed: {e}")
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
