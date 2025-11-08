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
        { success: false, error: 'Prompt is required and must be a string' },
        { status: 400 }
      );
    }

    // Get API key from environment
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set');
      return NextResponse.json(
        { success: false, error: 'Gemini API is not configured' },
        { status: 500 }
      );
    }

    // Initialize Gemini API with correct model name
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-2.0-flash-exp for the latest flash model
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      }
    });

    // Generate content with retry logic for rate limits
    let result;
    let lastError;
    const maxRetries = 3;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        result = await model.generateContent(prompt);
        break; // Success, exit retry loop
      } catch (err: any) {
        lastError = err;
        
        // Check if it's a rate limit error
        if (err.message?.includes('429') || err.message?.includes('rate limit') || err.message?.includes('Resource exhausted')) {
          if (attempt < maxRetries - 1) {
            // Wait with exponential backoff: 1s, 2s, 4s
            const waitTime = Math.pow(2, attempt) * 1000;
            console.log(`Rate limited, retrying in ${waitTime}ms (attempt ${attempt + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
        }
        
        // If not a rate limit error or last attempt, throw
        throw err;
      }
    }
    
    if (!result) {
      throw lastError;
    }
    
    const response = result.response;
    const text = response.text();

    // Return successful response
    return NextResponse.json(
      { success: true, text, response: text },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error calling Gemini API:', error);

    // Handle specific error types
    if (error instanceof Error) {
      // Check for API key errors
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { success: false, error: 'Invalid API key' },
          { status: 401 }
        );
      }

      // Check for rate limit errors
      if (error.message.includes('quota') || error.message.includes('rate limit') || error.message.includes('429') || error.message.includes('Resource exhausted')) {
        return NextResponse.json(
          { success: false, error: 'API rate limit exceeded. Please wait a moment and try again.' },
          { status: 429 }
        );
      }

      // Return generic error with message
      return NextResponse.json(
        { success: false, error: `Gemini API error: ${error.message}` },
        { status: 500 }
      );
    }

    // Handle unknown errors
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
