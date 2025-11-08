import { NextRequest, NextResponse } from 'next/server';

interface TextToMusicRequest {
  prompt: string;
  durationSec?: number;
  tempo?: number;
  key?: string;
  sessionContext?: any;
}

interface TextToMusicResponse {
  success: boolean;
  audioUrl?: string;
  duration?: number;
  meta?: {
    model: string;
    promptUsed: string;
  };
  error?: string;
}

const MAX_DURATION = 20;
const MIN_PROMPT_LENGTH = 10;
const MAX_PROMPT_LENGTH = 500;
const HF_API_URL = 'https://api-inference.huggingface.co/models/facebook/musicgen-melody';
const HF_ROUTER_URL = 'https://router.huggingface.co/hf-inference/models/facebook/musicgen-melody';

// Prompt engineering template
function enhancePrompt(prompt: string, options: { durationSec?: number; tempo?: number; key?: string }): string {
  const { durationSec = 10, tempo, key } = options;
  
  let enhanced = prompt;
  
  // Add musical context if provided
  if (tempo || key) {
    const musicalContext = [];
    if (key) musicalContext.push(`in key ${key}`);
    if (tempo) {
      const tempoDesc = tempo < 90 ? 'slow' : tempo < 120 ? 'moderate' : tempo < 140 ? 'upbeat' : 'fast';
      musicalContext.push(`at ~${tempo} BPM (${tempoDesc} tempo)`);
    }
    enhanced = `${prompt} ${musicalContext.join(' ')}`;
  }
  
  // Add duration hint
  enhanced = `Compose a ${durationSec}s piece: ${enhanced}. Return a clean stereo mix suitable for looped playback.`;
  
  return enhanced;
}

export async function POST(request: NextRequest): Promise<NextResponse<TextToMusicResponse>> {
  try {
    const body: TextToMusicRequest = await request.json();
    const { prompt, durationSec = 10, tempo, key, sessionContext } = body;
    
    // Validation
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }
    
    if (prompt.length < MIN_PROMPT_LENGTH || prompt.length > MAX_PROMPT_LENGTH) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Prompt must be between ${MIN_PROMPT_LENGTH} and ${MAX_PROMPT_LENGTH} characters` 
        },
        { status: 400 }
      );
    }
    
    // Clamp duration
    const clampedDuration = Math.min(Math.max(durationSec, 5), MAX_DURATION);
    
    // Check for HuggingFace API key
    const hfApiKey = process.env.HUGGINGFACE_API_KEY;
    if (!hfApiKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'HUGGINGFACE_API_KEY not configured. Please set it in your .env.local file.' 
        },
        { status: 500 }
      );
    }
    
    // Enhance prompt with musical context
    const enhancedPrompt = enhancePrompt(prompt, { durationSec: clampedDuration, tempo, key });
    
    console.log('[TextToMusic] Generating audio:', { prompt, enhancedPrompt, durationSec: clampedDuration });
    
    // Mock mode for development/testing (set USE_MOCK_AUDIO=true in .env.local)
    if (process.env.USE_MOCK_AUDIO === 'true') {
      console.log('[TextToMusic] Using mock audio (development mode)');
      // Return a short silent audio file for testing
      const silentAudio = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
      return NextResponse.json({
        success: true,
        audioUrl: silentAudio,
        duration: clampedDuration,
        meta: {
          model: 'mock-musicgen-small',
          promptUsed: enhancedPrompt,
        },
      });
    }
    
    // Call local Python MusicGen server
    try {
      console.log('[TextToMusic] Calling local MusicGen server...');
      
      const response = await fetch('http://localhost:8000/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          duration: clampedDuration,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[TextToMusic] MusicGen server error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
        });
        
        if (response.status === 503) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'MusicGen server is not running. Please start it with: python musicgen_server.py' 
            },
            { status: 503 }
          );
        }
        
        return NextResponse.json(
          { 
            success: false, 
            error: `MusicGen server error: ${response.status} - ${errorText}` 
          },
          { status: response.status }
        );
      }
      
      // Get response from Python server
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Generation failed');
      }
      
      // Python server returns base64 audio
      const audioUrl = `data:audio/wav;base64,${data.audio_base64}`;
      
      console.log('[TextToMusic] Audio generated successfully');
      
      return NextResponse.json({
        success: true,
        audioUrl,
        duration: clampedDuration,
        meta: {
          model: 'musicgen-small',
          promptUsed: enhancedPrompt,
        },
      });
      
    } catch (error: any) {
      console.error('[TextToMusic] Error:', error);
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Music generation failed: ${error.message || 'Unknown error'}` 
        },
        { status: 500 }
      );
    }
    
  } catch (error: any) {
    console.error('[TextToMusic] Error:', error);
    
    if (error.message === 'timeout') {
      return NextResponse.json(
        { success: false, error: 'timeout' },
        { status: 504 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
