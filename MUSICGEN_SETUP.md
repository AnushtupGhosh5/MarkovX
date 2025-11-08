# Local MusicGen Setup Guide

## Prerequisites
- Python 3.9 or higher
- pip (Python package manager)

## Installation Steps

### 1. Install Python Dependencies
```bash
pip install -r requirements.txt
```

Note: First installation will download ~1.5GB of model files.

### 2. Start the MusicGen Server
```bash
python musicgen_server.py
```

The server will start on http://localhost:5000

### 3. Update Environment Variables
In your `.env.local` file, uncomment this line:
```
MUSICGEN_MODE=local
```

### 4. Restart Your Next.js Dev Server
Stop and restart your development server for the changes to take effect.

## Usage
Once the server is running, the Text-to-Music feature will automatically use your local server instead of the HuggingFace API.

## Troubleshooting

### "Module not found" errors
Make sure all dependencies are installed:
```bash
pip install --upgrade -r requirements.txt
```

### Out of memory errors
The model requires ~2GB of RAM. If you encounter memory issues, close other applications or use a smaller duration (5-10 seconds).

### Slow generation
First generation is slow as the model downloads. Subsequent generations are faster (typically 30-60 seconds for 10 seconds of audio).

## Notes
- Generation time: ~30-60 seconds for 10 seconds of audio
- Max duration: 30 seconds per generation
- Model: facebook/musicgen-small (1.5GB)
- No internet required after initial model download
