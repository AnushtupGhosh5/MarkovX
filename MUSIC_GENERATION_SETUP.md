# Music Generation Setup Guide

## Overview
MusePilot includes a Text-to-Music generation feature powered by HuggingFace's MusicGen model.

## Setup Instructions

### 1. Get a HuggingFace API Key

1. Go to [HuggingFace](https://huggingface.co/)
2. Create a free account or sign in
3. Navigate to [Settings > Access Tokens](https://huggingface.co/settings/tokens)
4. Click "New token"
5. Give it a name (e.g., "MusePilot")
6. Select "Read" permissions
7. Copy the generated token

### 2. Configure Your Environment

1. Open the `.env.local` file in your project root
2. Replace `your_huggingface_api_key_here` with your actual API key:
   ```
   HUGGINGFACE_API_KEY=hf_your_actual_token_here
   ```
3. Save the file
4. Restart the development server

### 3. Using Text-to-Music

1. Click the "Text to Music" button in the sidebar (music note icon)
2. Enter a description of the music you want to create
   - Example: "a chill lofi hip hop beat with mellow piano"
3. Adjust the duration (5-20 seconds)
4. Click "Generate Music"
5. Wait 10-30 seconds for the model to generate your audio
6. Play the generated audio directly in the browser

## Features

- **Lyrics Editor**: Write and organize song lyrics with metadata
- **Mixer**: Control volume, pan, and effects for multiple tracks
- **Piano Roll**: Create MIDI sequences visually
- **Text-to-Music**: Generate audio from text descriptions
- **AI Co-Pilot**: Get AI assistance for music production

## Troubleshooting

### "Music generation service is not available"
- Make sure you've added a valid HuggingFace API key to `.env.local`
- Restart the development server after updating environment variables

### Generation takes too long
- The first request may take longer as the model loads
- Subsequent requests should be faster
- Try reducing the duration to 5-10 seconds

### Model is loading error
- Wait a minute and try again
- The HuggingFace inference API loads models on-demand

## Alternative: Local MusicGen Server

For faster generation and offline use, you can run a local MusicGen server:

1. Install Python dependencies:
   ```bash
   pip install torch transformers audiocraft
   ```

2. Run the local server:
   ```bash
   python musicgen_server.py
   ```

3. The API will automatically use the local server if available

## Notes

- Free HuggingFace API has rate limits
- Generated audio is saved to `public/audio/`
- Audio files are in WAV format
- Maximum duration is 20 seconds per generation
