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

    // Create MusicGen client
    let client;
    try {
      client = createMusicGenClient();
    } catch (error) {
      console.error('Failed to create MusicGen client:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'MusicGen API is not configured. Please set HUGGINGFACE_API_KEY environment variable.',
        } as GenerateMusicResponse,
        { status: 500 }
      );
    }
  

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