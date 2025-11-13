import { NextRequest, NextResponse } from 'next/server';

interface HummingToMusicResponse {
  success: boolean;
  notes?: any[];
  midi_url?: string;
  audio_url?: string;
  num_notes?: number;
  num_tracks?: number;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<HummingToMusicResponse>> {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio_file') as File;
    const addAccompaniment = formData.get('add_accompaniment') === 'true';
    const progressionType = formData.get('progression_type') as string || 'pop';
    const bassPattern = formData.get('bass_pattern') as string || 'root';

    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: 'Audio file is required' },
        { status: 400 }
      );
    }

    const serverUrl = process.env.HUMMING_SERVER_URL || 'http://localhost:8001';
    console.log('[HummingToMusic] Processing complete pipeline');

    const serverFormData = new FormData();
    serverFormData.append('audio_file', audioFile);
    serverFormData.append('add_accompaniment', addAccompaniment.toString());
    serverFormData.append('progression_type', progressionType);
    serverFormData.append('bass_pattern', bassPattern);

    const response = await fetch(`${serverUrl}/humming-to-music`, {
      method: 'POST',
      body: serverFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[HummingToMusic] Server error:', errorText);
      return NextResponse.json(
        { success: false, error: `Server error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`[HummingToMusic] Generated ${data.num_tracks} tracks`);

    // Convert backend URLs to full URLs
    if (data.audio_url) {
      data.audio_url = `${serverUrl}${data.audio_url}`;
    }
    if (data.midi_url) {
      data.midi_url = `${serverUrl}${data.midi_url}`;
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('[HummingToMusic] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
