#!/usr/bin/env python3
"""
Local MusicGen Server
Runs a Flask server that generates music using Meta's MusicGen model locally.
No API key required - runs entirely on your machine.
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import torch
from audiocraft.models import MusicGen
import scipy.io.wavfile as wavfile
import numpy as np
import os
import tempfile
import logging

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global model instance
model = None

def load_model():
    """Load MusicGen model (small version for faster generation)"""
    global model
    if model is None:
        logger.info("Loading MusicGen model... This may take a minute on first run.")
        model = MusicGen.get_pretrained('facebook/musicgen-small')
        logger.info("Model loaded successfully!")
    return model

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "ok", "model_loaded": model is not None})

@app.route('/generate', methods=['POST'])
def generate_music():
    """Generate music from text prompt"""
    try:
        data = request.json
        prompt = data.get('prompt', '')
        duration = min(float(data.get('duration', 10)), 30)  # Max 30 seconds
        
        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400
        
        logger.info(f"Generating music for prompt: '{prompt}' (duration: {duration}s)")
        
        # Load model if not already loaded
        gen_model = load_model()
        
        # Set generation parameters
        gen_model.set_generation_params(
            duration=duration,
            temperature=1.0,
            top_k=250,
            top_p=0.0,
            cfg_coef=3.0
        )
        
        # Generate music
        wav = gen_model.generate([prompt])
        
        # Convert to numpy array
        audio_data = wav[0].cpu().numpy()
        
        # Normalize audio
        audio_data = audio_data / np.max(np.abs(audio_data))
        audio_data = (audio_data * 32767).astype(np.int16)
        
        # Save to temporary file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
        sample_rate = gen_model.sample_rate
        
        # Reshape if needed (handle mono/stereo)
        if len(audio_data.shape) > 1:
            audio_data = audio_data.T
        
        wavfile.write(temp_file.name, sample_rate, audio_data)
        
        logger.info(f"Music generated successfully: {temp_file.name}")
        
        # Send file and clean up
        response = send_file(
            temp_file.name,
            mimetype='audio/wav',
            as_attachment=True,
            download_name='generated.wav'
        )
        
        # Schedule cleanup
        @response.call_on_close
        def cleanup():
            try:
                os.unlink(temp_file.name)
            except Exception as e:
                logger.error(f"Error cleaning up temp file: {e}")
        
        return response
        
    except Exception as e:
        logger.error(f"Error generating music: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    logger.info("Starting MusicGen server on http://localhost:5000")
    logger.info("Note: First generation will be slow as the model downloads (~1.5GB)")
    app.run(host='0.0.0.0', port=5000, debug=False)
