/**
 * Gemini API Client
 * Frontend helper for calling the Gemini API route
 */

export interface GeminiRequest {
  prompt: string;
}

export interface GeminiResponse {
  response: string;
}

export interface GeminiErrorResponse {
  error: string;
}

export class GeminiAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'GeminiAPIError';
  }
}

/**
 * Calls the Gemini API to generate text from a prompt
 * @param prompt - The text prompt to send to Gemini
 * @returns Promise resolving to the generated text
 * @throws {GeminiAPIError} on API errors
 */
export async function generateText(prompt: string): Promise<string> {
  if (!prompt || typeof prompt !== 'string') {
    throw new GeminiAPIError('Prompt is required and must be a string', 400);
  }

  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt } as GeminiRequest),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorData = data as GeminiErrorResponse;
      throw new GeminiAPIError(
        errorData.error || 'Failed to generate text',
        response.status
      );
    }

    const successData = data as GeminiResponse;
    return successData.response;

  } catch (error) {
    // Re-throw GeminiAPIError
    if (error instanceof GeminiAPIError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new GeminiAPIError('Network error: Unable to reach API', undefined);
    }

    // Wrap unknown errors
    throw new GeminiAPIError(
      error instanceof Error ? error.message : 'An unexpected error occurred',
      undefined
    );
  }
}

/**
 * React hook-friendly wrapper for generateText
 * @param prompt - The text prompt to send to Gemini
 * @param onSuccess - Optional callback for successful generation
 * @param onError - Optional callback for errors
 */
export async function useGenerateText(
  prompt: string,
  onSuccess?: (text: string) => void,
  onError?: (error: GeminiAPIError) => void
): Promise<string | null> {
  try {
    const text = await generateText(prompt);
    if (onSuccess) {
      onSuccess(text);
    }
    return text;
  } catch (error) {
    const apiError = error instanceof GeminiAPIError 
      ? error 
      : new GeminiAPIError('An unexpected error occurred');
    
    if (onError) {
      onError(apiError);
    }
    return null;
  }
}
