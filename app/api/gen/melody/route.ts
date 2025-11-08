import { NextRequest, NextResponse } from 'next/server';

interface MelodyToMusicResponse {
  success: boolean;
  audioUrl?: string;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<MelodyToMusicResponse>> {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio_file') as File;
    const prompt = formData.get('prompt') as string || '';
    const duration = parseFloat(formData.get('duration') as string) || 10;

    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: 'Audio file is required' },
        { status: 400 }
      );
    }

    // Get server URL from environment
    const serverUrl = process.env.MUSICGEN_SERVER_URL || 'http://localhost:8000';
    console.log('[MelodyToMusic] Calling MusicGen server:', serverUrl);

    // Forward the request to the Python server
    const serverFormData = new FormData();
    serverFormData.append('audio_file', audioFile);
    serverFormData.append('prompt', prompt);
    serverFormData.append('duration', duration.toString());

    const response = await fetch(`${serverUrl}/generate-from-melody`, {
      method: 'POST',
      body: serverFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[MelodyToMusic] Server error:', {
        status: response.status,
        body: errorText,
      });

      if (response.status === 503) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'MusicGen server is not running or melody model not loaded' 
          },
          { status: 503 }
        );
      }

      return NextResponse.json(
        { 
          success: false, 
          error: `Server error: ${response.status}` 
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.success) {
      return NextResponse.json(
        { success: false, error: data.error || 'Generation failed' },
        { status: 500 }
      );
    }

    // Return base64 audio
    const audioUrl = `data:audio/wav;base64,${data.audio_base64}`;

    console.log('[MelodyToMusic] Audio generated successfully');

    return NextResponse.json({
      success: true,
      audioUrl,
    });

  } catch (error: any) {
    console.error('[MelodyToMusic] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
