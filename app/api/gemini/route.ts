import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * POST /api/gemini
 * Generates text using Google Gemini API
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { prompt } = body;

    // Validate prompt
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    // Get API key from environment
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set');
      return NextResponse.json(
        { error: 'Gemini API is not configured' },
        { status: 500 }
      );
    }

    // Initialize Gemini API with correct model name
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-2.5-flash which is available and fast
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      }
    });

    // Generate content
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Return successful response
    return NextResponse.json(
      { response: text },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error calling Gemini API:', error);

    // Handle specific error types
    if (error instanceof Error) {
      // Check for API key errors
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Invalid API key' },
          { status: 401 }
        );
      }

      // Check for rate limit errors
      if (error.message.includes('quota') || error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'API rate limit exceeded' },
          { status: 429 }
        );
      }

      // Return generic error with message
      return NextResponse.json(
        { error: `Gemini API error: ${error.message}` },
        { status: 500 }
      );
    }

    // Handle unknown errors
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
