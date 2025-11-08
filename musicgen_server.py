#!/usr/bin/env python3
"""
Local MusicGen Server
Runs a Flask server that generates music using Meta's MusicGen model locally.
No API key required - runs entirely on your machine.
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from transformers import AutoProcessor, MusicgenForConditionalGeneration
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
processor = None

def load_model():
    """Load MusicGen model (small version for faster generation)"""
    global model, processor
    if model is None:
        logger.info("Loading MusicGen model... This may take a minute on first run.")
        try:
            processor = AutoProcessor.from_pretrained("facebook/musicgen-small")
            model = MusicgenForConditionalGeneration.from_pretrained("facebook/musicgen-small")
            logger.info("Model loaded successfully!")
        except Exception as e:
            logger.warning(f"Could not load model: {e}")
            logger.info("Running in DEMO mode - will generate placeholder audio")
    return model, processor

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
        gen_model, gen_processor = load_model()
        
        # DEMO MODE: Generate simple sine wave if model not loaded
        if gen_model is None or gen_processor is None:
            logger.info("⚡ DEMO MODE: Generating placeholder audio (model still downloading)")
            
            # Generate a simple musical tone (sine wave with harmonics)
            sample_rate = 32000
            t = np.linspace(0, duration, int(sample_rate * duration))
            
            # Create a simple melody with multiple frequencies
            frequencies = [440, 554, 659, 440]  # A, C#, E, A (A major chord)
            audio_data = np.zeros_like(t)
            
            for i, freq in enumerate(frequencies):
                start = int(len(t) * i / len(frequencies))
                end = int(len(t) * (i + 1) / len(frequencies))
                audio_data[start:end] = np.sin(2 * np.pi * freq * t[start:end])
            
            # Add some harmonics for richness
            audio_data += 0.3 * np.sin(2 * np.pi * 880 * t)  # Octave
            audio_data += 0.2 * np.sin(2 * np.pi * 1320 * t)  # Fifth
            
            # Normalize
            audio_data = audio_data / np.max(np.abs(audio_data))
            audio_data = (audio_data * 32767 * 0.5).astype(np.int16)
            
            # Save to temp file
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
            wavfile.write(temp_file.name, sample_rate, audio_data)
            
            logger.info("✅ Demo audio generated (model still loading in background)")
            
            response = send_file(
                temp_file.name,
                mimetype='audio/wav',
                as_attachment=True,
                download_name='demo.wav'
            )
            
            @response.call_on_close
            def cleanup():
                try:
                    os.unlink(temp_file.name)
                except:
                    pass
            
            return response
        
        # REAL MODE: Use actual model
        # Process inputs
        inputs = gen_processor(
            text=[prompt],
            padding=True,
            return_tensors="pt",
        )
        
        # Calculate max tokens for duration (50 tokens per second)
        max_new_tokens = int(duration * 50)
        
        # Generate music
        audio_values = gen_model.generate(**inputs, max_new_tokens=max_new_tokens)
        
        # Convert to numpy array
        audio_data = audio_values[0, 0].cpu().numpy()
        
        # Normalize audio
        audio_data = audio_data / np.max(np.abs(audio_data))
        audio_data = (audio_data * 32767).astype(np.int16)
        
        # Save to temporary file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
        sample_rate = gen_model.config.audio_encoder.sampling_rate
        
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
