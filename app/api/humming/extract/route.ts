import { NextRequest, NextResponse } from 'next/server';

interface ExtractMelodyResponse {
  success: boolean;
  notes?: Array<{
    start: number;
    end: number;
    pitch: number;
    note_name: string;
    duration: number;
  }>;
  midi_url?: string;
  num_notes?: number;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<ExtractMelodyResponse>> {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio_file') as File;
    const confidenceThreshold = parseFloat(formData.get('confidence_threshold') as string) || 0.5;
    const minNoteDuration = parseFloat(formData.get('min_note_duration') as string) || 0.1;

    if (!audioFile) {
      return NextResponse.json(
        { success: false, error: 'Audio file is required' },
        { status: 400 }
      );
    }

    // Get humming server URL from environment
    const serverUrl = process.env.HUMMING_SERVER_URL || 'http://localhost:8001';
    console.log('[ExtractMelody] Calling humming server:', serverUrl);

    // Forward to Python backend
    const serverFormData = new FormData();
    serverFormData.append('audio_file', audioFile);
    serverFormData.append('confidence_threshold', confidenceThreshold.toString());
    serverFormData.append('min_note_duration', minNoteDuration.toString());

    const response = await fetch(`${serverUrl}/extract-melody`, {
      method: 'POST',
      body: serverFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ExtractMelody] Server error:', errorText);
      return NextResponse.json(
        { success: false, error: `Server error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`[ExtractMelody] Extracted ${data.num_notes} notes`);

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('[ExtractMelody] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
