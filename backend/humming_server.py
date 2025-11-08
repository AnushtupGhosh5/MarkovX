"""
FastAPI Server for Humming-to-Music Pipeline
"""

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import tempfile
import shutil
from pathlib import Path
from typing import Optional
import json

from humming_to_midi import audio_to_midi, midi_to_bytes
from accompaniment_generator import (
    add_accompaniment_to_midi,
    synthesize_midi_to_audio
)

app = FastAPI(title="Humming-to-Music API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create output directory
OUTPUT_DIR = Path("outputs")
OUTPUT_DIR.mkdir(exist_ok=True)


@app.get("/")
async def root():
    return {
        "message": "Humming-to-Music API",
        "endpoints": {
            "/extract-melody": "Extract MIDI from humming audio",
            "/add-accompaniment": "Add chords and bass to melody",
            "/synthesize": "Convert MIDI to audio"
        }
    }


@app.post("/extract-melody")
async def extract_melody(
    audio_file: UploadFile = File(...),
    confidence_threshold: float = Form(0.5),
    min_note_duration: float = Form(0.1),
    smooth_window: int = Form(5)
):
    """
    Extract melody from humming audio
    
    Returns:
        - notes: List of detected notes with timing
        - midi_url: URL to download MIDI file
    """
    # Save uploaded file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_audio:
        shutil.copyfileobj(audio_file.file, tmp_audio)
        tmp_audio_path = tmp_audio.name
    
    try:
        # Process audio
        midi, notes_data = audio_to_midi(
            tmp_audio_path,
            confidence_threshold=confidence_threshold,
            min_note_duration=min_note_duration,
            smooth_window=smooth_window
        )
        
        # Save MIDI
        midi_filename = f"melody_{os.urandom(8).hex()}.mid"
        midi_path = OUTPUT_DIR / midi_filename
        midi.write(str(midi_path))
        
        return JSONResponse({
            "success": True,
            "notes": notes_data,
            "midi_url": f"/download/{midi_filename}",
            "num_notes": len(notes_data)
        })
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
    
    finally:
        # Cleanup temp file
        if os.path.exists(tmp_audio_path):
            os.unlink(tmp_audio_path)


@app.post("/add-accompaniment")
async def add_accompaniment(
    midi_file: UploadFile = File(...),
    progression_type: str = Form("pop"),
    add_chords: bool = Form(True),
    add_bass: bool = Form(True),
    bass_pattern: str = Form("root"),
    synthesize: bool = Form(True)
):
    """
    Add accompaniment to melody MIDI
    
    Args:
        progression_type: "pop", "jazz", "blues", "simple"
        bass_pattern: "root", "walking", "arpeggio"
        synthesize: Whether to generate audio file
    """
    import pretty_midi
    
    # Save uploaded MIDI
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mid") as tmp_midi:
        shutil.copyfileobj(midi_file.file, tmp_midi)
        tmp_midi_path = tmp_midi.name
    
    try:
        # Load MIDI
        midi = pretty_midi.PrettyMIDI(tmp_midi_path)
        
        # Extract melody notes
        melody_notes = []
        if midi.instruments:
            for note in midi.instruments[0].notes:
                melody_notes.append((note.start, note.end, note.pitch))
        
        # Add accompaniment
        midi_with_acc = add_accompaniment_to_midi(
            midi,
            melody_notes,
            progression_type=progression_type,
            add_chords=add_chords,
            add_bass=add_bass,
            bass_pattern=bass_pattern
        )
        
        # Save enhanced MIDI
        midi_filename = f"enhanced_{os.urandom(8).hex()}.mid"
        midi_path = OUTPUT_DIR / midi_filename
        midi_with_acc.write(str(midi_path))
        
        response_data = {
            "success": True,
            "midi_url": f"/download/{midi_filename}",
            "num_tracks": len(midi_with_acc.instruments)
        }
        
        # Synthesize to audio if requested
        if synthesize:
            audio_filename = f"enhanced_{os.urandom(8).hex()}.wav"
            audio_path = OUTPUT_DIR / audio_filename
            
            result = synthesize_midi_to_audio(midi_with_acc, str(audio_path))
            if result:
                response_data["audio_url"] = f"/download/{audio_filename}"
        
        return JSONResponse(response_data)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
    
    finally:
        if os.path.exists(tmp_midi_path):
            os.unlink(tmp_midi_path)


@app.post("/humming-to-music")
async def humming_to_music(
    audio_file: UploadFile = File(...),
    add_accompaniment: bool = Form(True),
    progression_type: str = Form("pop"),
    bass_pattern: str = Form("root"),
    confidence_threshold: float = Form(0.5)
):
    """
    Complete pipeline: humming audio -> melody + accompaniment
    """
    import pretty_midi
    
    # Save uploaded file
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_audio:
        shutil.copyfileobj(audio_file.file, tmp_audio)
        tmp_audio_path = tmp_audio.name
    
    try:
        # Extract melody
        midi, notes_data = audio_to_midi(
            tmp_audio_path,
            confidence_threshold=confidence_threshold
        )
        
        # Add accompaniment if requested
        if add_accompaniment and notes_data:
            melody_notes = [(n["start"], n["end"], n["pitch"]) for n in notes_data]
            midi = add_accompaniment_to_midi(
                midi,
                melody_notes,
                progression_type=progression_type,
                add_chords=True,
                add_bass=True,
                bass_pattern=bass_pattern
            )
        
        # Save MIDI
        midi_filename = f"music_{os.urandom(8).hex()}.mid"
        midi_path = OUTPUT_DIR / midi_filename
        midi.write(str(midi_path))
        
        # Synthesize to audio
        audio_filename = f"music_{os.urandom(8).hex()}.wav"
        audio_path = OUTPUT_DIR / audio_filename
        audio_result = synthesize_midi_to_audio(midi, str(audio_path))
        
        response_data = {
            "success": True,
            "notes": notes_data,
            "midi_url": f"/download/{midi_filename}",
            "num_notes": len(notes_data),
            "num_tracks": len(midi.instruments)
        }
        
        if audio_result:
            response_data["audio_url"] = f"/download/{audio_filename}"
        
        return JSONResponse(response_data)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
    
    finally:
        if os.path.exists(tmp_audio_path):
            os.unlink(tmp_audio_path)


@app.get("/download/{filename}")
async def download_file(filename: str):
    """Download generated files"""
    file_path = OUTPUT_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="application/octet-stream"
    )


@app.delete("/cleanup")
async def cleanup_old_files(max_age_hours: int = 24):
    """Clean up old generated files"""
    import time
    
    current_time = time.time()
    deleted_count = 0
    
    for file_path in OUTPUT_DIR.iterdir():
        if file_path.is_file():
            file_age = current_time - file_path.stat().st_mtime
            if file_age > max_age_hours * 3600:
                file_path.unlink()
                deleted_count += 1
    
    return {"deleted_files": deleted_count}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
