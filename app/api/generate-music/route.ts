import { NextRequest, NextResponse } from 'next/server';
import { createMusicGenClient, MusicGenAPIError } from '@/src/lib/api/musicgen';
import { retryWithBackoff } from '@/src/lib/api/retry';
import { GenerateMusicRequest, GenerateMusicResponse } from '@/src/types';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * POST /api/generate-music
 * Generates music from a text prompt using MusicGen API
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: GenerateMusicRequest = await request.json();

    // Validate request
    if (!body.prompt) {
      return NextResponse.json(
        {
          success: false,
          error: 'Prompt is required',
        } as GenerateMusicResponse,
        { status: 400 }
      );
    }

    // Check if we should use local server
    const musicgenMode = process.env.MUSICGEN_MODE;
    const useLocalServer = musicgenMode === 'local';

    if (useLocalServer) {
      console.log('[MusicGen] Using local Python server');
      
      try {
        // Call local MusicGen server
        const localServerUrl = 'http://localhost:5000/generate';
        const response = await fetch(localServerUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: body.prompt,
            duration: body.duration || 10,
          }),
        });

        if (!response.ok) {
          throw new Error(`Local server error: ${response.statusText}`);
        }

        // Get audio blob from response
        const audioBlob = await response.blob();

        // Ensure public/audio directory exists
        const audioDir = join(process.cwd(), 'public', 'audio');
        if (!existsSync(audioDir)) {
          await mkdir(audioDir, { recursive: true });
        }

        // Generate unique filename with timestamp
        const timestamp = Date.now();
        const filename = `generated-${timestamp}.wav`;
        const filepath = join(audioDir, filename);

        // Convert blob to buffer and save to file
        const arrayBuffer = await audioBlob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await writeFile(filepath, buffer);

        // Return response with audio URL
        const audioUrl = `/audio/${filename}`;
        
        console.log('[MusicGen] Music generated successfully (local):', audioUrl);
        
        return NextResponse.json(
          {
            success: true,
            audioUrl,
          } as GenerateMusicResponse,
          { status: 200 }
        );

      } catch (error) {
        console.error('[MusicGen] Local server error:', error);
        return NextResponse.json(
          {
            success: false,
            error: 'Local MusicGen server is not running. Please start it with: python musicgen_server.py',
          } as GenerateMusicResponse,
          { status: 503 }
        );
      }
    }

    // Check if we're in demo mode (no valid API key)
    const hfApiKey = process.env.HUGGINGFACE_API_KEY;
    const isDemoMode = !hfApiKey || hfApiKey === 'your_huggingface_api_key_here';

    if (isDemoMode) {
      console.log('[MusicGen] No valid API key or local server configured');
      
      return NextResponse.json(
        {
          success: false,
          error: 'Music generation requires either:\n1. A valid HUGGINGFACE_API_KEY in .env.local, OR\n2. Set MUSICGEN_MODE=local and run: python musicgen_server.py\n\nSee MUSICGEN_SETUP.md for instructions.',
        } as GenerateMusicResponse,
        { status: 503 }
      );
    }

    // Create MusicGen client
    let client;
    try {
      client = createMusicGenClient();
    } catch (error) {
      console.error('Failed to create MusicGen client:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'MusicGen API is not configured properly. Please check your HUGGINGFACE_API_KEY in .env.local',
        } as GenerateMusicResponse,
        { status: 500 }
      );
    }
  
    console.log('[MusicGen] Generating music with prompt:', body.prompt);

    // Generate music with retry logic
    const audioBlob = await retryWithBackoff(
      () => client.generateMusic(body),
      {
        maxRetries: 3,
        baseDelay: 1000,
        onRetry: (attempt, error) => {
          console.log(`Retry attempt ${attempt} for music generation:`, error.message);
        },
      }
    );

    // Ensure public/audio directory exists
    const audioDir = join(process.cwd(), 'public', 'audio');
    if (!existsSync(audioDir)) {
      await mkdir(audioDir, { recursive: true });
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const filename = `generated-${timestamp}.wav`;
    const filepath = join(audioDir, filename);

    // Convert blob to buffer and save to file
    const arrayBuffer = await audioBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(filepath, buffer);

    // Return response with audio URL
    const audioUrl = `/audio/${filename}`;
    
    console.log('[MusicGen] Music generated successfully:', audioUrl);
    
    return NextResponse.json(
      {
        success: true,
        audioUrl,
      } as GenerateMusicResponse,
      { status: 200 }
    );

  } catch (error) {
    console.error('Error generating music:', error);

    // Handle MusicGen API errors
    if (error instanceof MusicGenAPIError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        } as GenerateMusicResponse,
        { status: error.statusCode || 500 }
      );
    }

    // Handle unknown errors
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred while generating music',
      } as GenerateMusicResponse,
      { status: 500 }
    );
  }
}