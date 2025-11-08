# Text→Music Feature Implementation

## Overview
This document describes the Text→Music feature implementation for MusePilot using Meta's MusicGen model via HuggingFace Inference API.

## MusicGen Documentation Summary

Based on HuggingFace documentation for `facebook/musicgen-small`:

1. **Model**: MusicGen Small - Text-to-audio generation model by Meta AI
2. **API Endpoint**: `https://router.huggingface.co/hf-inference/models/facebook/musicgen-small` (new router endpoint)
3. **Authentication**: Bearer token via `Authorization: Bearer YOUR_HF_TOKEN`
4. **Input Format**: JSON with `inputs` field containing text prompt
5. **Output Format**: Audio file (WAV format, 32kHz sample rate, mono/stereo)
6. **Supported Parameters**: 
   - `inputs`: Text prompt describing the music
   - `parameters.max_new_tokens`: Controls generation length
7. **Rate Limits**: Free tier has rate limits; requests may be queued
8. **Typical Inference Time**: 10-30 seconds depending on duration and server load
9. **Max Duration**: ~20-30 seconds for small model (free tier)
10. **Example Prompts**: 
    - "a funky house with 80s hip hop vibes"
    - "a chill song with influences from lofi, chillstep and downtempo"
    - "a catchy beat for a podcast intro"
11. **Pipeline**: text-to-audio using Transformers library
12. **License**: CC-BY-NC-4.0 (non-commercial use only)

**Note**: MusicGen doesn't have explicit tempo/key parameters. Musical characteristics must be described in the text prompt.

## Files Added/Updated

### 1. API Route: `app/api/gen/text/route.ts`
**Purpose**: Server-side API endpoint for text-to-music generation

**Features**:
- Validates prompt length (10-500 characters)
- Clamps duration to max 20 seconds
- Implements exponential backoff retry logic (3 attempts)
- Handles timeouts (30s max)
- Enhances prompts with tempo/key context
- Returns audio as base64 data URL
- Comprehensive error handling

### 2. UI Component: `components/TextToMusicPanel.tsx`
**Purpose**: Frontend interface for text-to-music generation

**Features**:
- Text prompt input with character counter
- Duration slider (5-20 seconds)
- Three sample prompts (Lo-fi, Cinematic, Upbeat Pop)
- Loading state with progress indicator
- Audio player for generated music
- Error display with user-friendly messages
- Recent generations history
- Updates session context with generated audio

### 3. Updated: `components/MainLayout.tsx`
**Purpose**: Integrated Text-to-Music panel into main UI

**Changes**:
- Added 'textToMusic' to PanelView type
- Added sidebar button for Text-to-Music
- Added panel rendering for TextToMusicPanel
- Added "Generate Music" button to home screen

### 4. Updated: `.env.example`
**Purpose**: Already includes HUGGINGFACE_API_KEY

**No changes needed** - the file already has the required environment variable.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure HuggingFace API Key

Create a `.env.local` file in the project root:

```bash
# Get your free API key from https://huggingface.co/settings/tokens
HUGGINGFACE_API_KEY=hf_your_token_here
```

**How to get a HuggingFace API key**:
1. Go to https://huggingface.co/join to create a free account
2. Navigate to https://huggingface.co/settings/tokens
3. Click "New token"
4. Give it a name (e.g., "MusePilot")
5. Select "Read" permissions
6. Copy the token and paste it in `.env.local`

### 3. Run Development Server
```bash
npm run dev
```

### 4. Access the Feature
1. Open http://localhost:3000
2. Click "Generate Music" button or the music note icon in the sidebar
3. Enter a prompt or use a sample prompt
4. Adjust duration if needed
5. Click "Generate Music"
6. Wait 10-30 seconds for generation
7. Play the generated audio

## Testing

### Manual Testing Steps

1. **Basic Generation Test**:
   ```
   Prompt: "a relaxing piano melody with soft strings"
   Duration: 10 seconds
   Expected: Audio file generated and playable
   ```

2. **Sample Prompt Test**:
   - Click "Lo-fi Chill" sample
   - Click "Generate Music"
   - Expected: Audio generated with lo-fi characteristics

3. **Duration Test**:
   - Set duration to 5 seconds
   - Generate music
   - Set duration to 20 seconds
   - Generate music
   - Expected: Different length audio files

4. **Error Handling Test**:
   - Try with empty prompt → Should show validation error
   - Try with 5-character prompt → Should show validation error
   - Try without API key → Should show configuration error

5. **Session Context Test**:
   - Generate music
   - Check that `session.generatedAudio` is updated
   - Generate another piece
   - Check that history shows both

### API Testing with curl

**Basic Request**:
```bash
curl -X POST http://localhost:3000/api/gen/text \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "a chill lofi hip hop beat with mellow piano",
    "durationSec": 10
  }'
```

**With Musical Context**:
```bash
curl -X POST http://localhost:3000/api/gen/text \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "an upbeat electronic dance track",
    "durationSec": 15,
    "tempo": 128,
    "key": "Am"
  }'
```

**Expected Response** (success):
```json
{
  "success": true,
  "audioUrl": "data:audio/wav;base64,UklGR...",
  "duration": 10,
  "meta": {
    "model": "musicgen-small",
    "promptUsed": "Compose a 10s piece: a chill lofi hip hop beat..."
  }
}
```

**Expected Response** (error):
```json
{
  "success": false,
  "error": "Prompt must be between 10 and 500 characters"
}
```

### JavaScript Testing Example

```javascript
async function testTextToMusic() {
  const response = await fetch('/api/gen/text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: 'a peaceful ambient soundscape',
      durationSec: 10,
      tempo: 80,
      key: 'C'
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    console.log('Audio generated!', data.audioUrl.substring(0, 50) + '...');
    // Create audio element and play
    const audio = new Audio(data.audioUrl);
    audio.play();
  } else {
    console.error('Error:', data.error);
  }
}
```

## Prompt Engineering

The API automatically enhances prompts with musical context:

**Input**:
```json
{
  "prompt": "a relaxing melody",
  "durationSec": 10,
  "tempo": 80,
  "key": "Am"
}
```

**Enhanced Prompt** (sent to MusicGen):
```
"Compose a 10s piece: a relaxing melody in key Am at ~80 BPM (slow tempo). Return a clean stereo mix suitable for looped playback."
```

### Optimized Sample Prompts

1. **Lo-fi Chill**:
   ```
   "a chill lofi hip hop beat with mellow piano, soft drums, and vinyl crackle"
   ```

2. **Cinematic Epic**:
   ```
   "an epic cinematic orchestral piece with powerful strings, brass, and dramatic percussion"
   ```

3. **Upbeat Pop**:
   ```
   "an upbeat pop song with catchy synths, energetic drums, and a memorable melody"
   ```

## Error Handling & Fallbacks

### Common Errors

1. **Model Loading (503)**:
   - Message: "Model is loading. Please try again in a few moments."
   - Cause: HuggingFace is loading the model (cold start)
   - Solution: Wait 30-60 seconds and retry

2. **Timeout (504)**:
   - Message: "Generation timed out. The model might be busy."
   - Cause: Request took longer than 30 seconds
   - Solution: Retry with shorter duration or simpler prompt

3. **API Key Missing (500)**:
   - Message: "HUGGINGFACE_API_KEY not configured"
   - Cause: Environment variable not set
   - Solution: Add API key to `.env.local`

4. **Rate Limit (429)**:
   - Message: "HuggingFace API error: 429 Too Many Requests"
   - Cause: Exceeded free tier rate limits
   - Solution: Wait a few minutes before retrying

### Fallback Recommendations

If HuggingFace is unavailable:

1. **Use Demo Audio**: Load pre-generated sample audio files
2. **Queue System**: Implement a queue for requests during high load
3. **Alternative Models**: Consider other text-to-music APIs (e.g., Replicate, Stability AI)
4. **Local Generation**: Use local MusicGen model (requires GPU)

## Performance Notes

- **First Request**: May take 30-60 seconds (model cold start)
- **Subsequent Requests**: 10-30 seconds typically
- **Audio Size**: ~500KB-2MB for 10-20 second clips
- **Memory**: Base64 encoding increases payload size by ~33%

## Limitations

1. **Duration**: Max 20 seconds per generation (free tier)
2. **Quality**: Small model has lower quality than medium/large
3. **Control**: Limited control over specific musical elements
4. **Rate Limits**: Free tier has request limits
5. **License**: CC-BY-NC-4.0 (non-commercial only)

## Future Enhancements

1. **MIDI Extraction**: Convert generated audio to MIDI notes
2. **Melody Conditioning**: Use existing MIDI as melody input
3. **Batch Generation**: Generate multiple variations
4. **Audio Effects**: Add reverb, EQ, compression
5. **Export Options**: MP3, FLAC, OGG formats
6. **Longer Durations**: Stitch multiple generations
7. **Model Selection**: Allow choosing small/medium/large models
8. **Paid Tier**: Integrate HuggingFace Pro for faster inference

## Troubleshooting

### Issue: "Model is loading" error persists
**Solution**: The model needs to warm up. Wait 1-2 minutes and try again.

### Issue: Audio doesn't play
**Solution**: Check browser console for errors. Ensure audio data URL is valid.

### Issue: Generation takes too long
**Solution**: Reduce duration to 5-10 seconds. Try simpler prompts.

### Issue: Poor audio quality
**Solution**: Use more descriptive prompts. Consider upgrading to medium/large model.

### Issue: API key not working
**Solution**: Verify token at https://huggingface.co/settings/tokens. Ensure it has "Read" permissions.

## Support

For issues or questions:
- HuggingFace Docs: https://huggingface.co/docs/api-inference
- MusicGen Model: https://huggingface.co/facebook/musicgen-small
- MusicGen Paper: https://arxiv.org/abs/2306.05284
