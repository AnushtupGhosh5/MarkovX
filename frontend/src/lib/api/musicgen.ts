/**
 * MusicGen API Client
 * Integrates with Hugging Face's MusicGen model for text-to-music generation
 */

export interface GenerateMusicRequest {
  prompt: string;
  duration?: number;        // In seconds, default 10
  temperature?: number;     // 0-1, default 0.8
  topK?: number;           // Default 250
}

export interface GenerateMusicResponse {
  success: boolean;
  audioUrl?: string;        // Temporary URL to generated audio
  error?: string;
}

export class MusicGenAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'MusicGenAPIError';
  }
}

/**
 * Validates the music generation request
 * @throws {MusicGenAPIError} if validation fails
 */
function validateRequest(request: GenerateMusicRequest): void {
  const { prompt, duration, temperature, topK } = request;

  // Validate prompt length (10-500 characters as per requirements)
  if (!prompt || typeof prompt !== 'string') {
    throw new MusicGenAPIError('Prompt is required and must be a string');
  }

  const trimmedPrompt = prompt.trim();
  if (trimmedPrompt.length < 10) {
    throw new MusicGenAPIError(
      `Prompt must be at least 10 characters long (current: ${trimmedPrompt.length})`
    );
  }

  if (trimmedPrompt.length > 500) {
    throw new MusicGenAPIError(
      `Prompt must not exceed 500 characters (current: ${trimmedPrompt.length})`
    );
  }

  // Validate optional parameters
  if (duration !== undefined) {
    if (typeof duration !== 'number' || duration <= 0 || duration > 30) {
      throw new MusicGenAPIError('Duration must be a positive number between 0 and 30 seconds');
    }
  }

  if (temperature !== undefined) {
    if (typeof temperature !== 'number' || temperature < 0 || temperature > 1) {
      throw new MusicGenAPIError('Temperature must be a number between 0 and 1');
    }
  }

  if (topK !== undefined) {
    if (typeof topK !== 'number' || topK < 0 || !Number.isInteger(topK)) {
      throw new MusicGenAPIError('TopK must be a positive integer');
    }
  }
}

/**
 * MusicGen API Client
 * Handles communication with Hugging Face MusicGen API
 */
export class MusicGenClient {
  private readonly apiKey: string;
  private readonly endpoint: string;
  private readonly timeout: number;

  constructor(
    apiKey?: string,
    endpoint: string = 'https://api-inference.huggingface.co/models/facebook/musicgen-small',
    timeout: number = 30000 // 30 seconds as per requirements
  ) {
    if (!apiKey) {
      throw new MusicGenAPIError('Hugging Face API key is required');
    }
    this.apiKey = apiKey;
    this.endpoint = endpoint;
    this.timeout = timeout;
  }

  /**
   * Generates music from a text prompt
   * @param request - The music generation request
   * @returns Promise resolving to the generated audio data
   * @throws {MusicGenAPIError} on validation or API errors
   */
  async generateMusic(request: GenerateMusicRequest): Promise<Blob> {
    // Validate request
    validateRequest(request);

    const { prompt, duration = 10, temperature = 0.8, topK = 250 } = request;

    // Create abort controller for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt.trim(),
          parameters: {
            duration,
            temperature,
            top_k: topK,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new MusicGenAPIError(
          `MusicGen API request failed: ${response.statusText}`,
          response.status,
          errorText
        );
      }

      // Check content type
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('audio')) {
        // If not audio, try to parse error message
        const errorData = await response.json().catch(() => ({}));
        throw new MusicGenAPIError(
          `Unexpected response type: ${contentType}. ${JSON.stringify(errorData)}`,
          response.status
        );
      }

      // Return audio blob
      const audioBlob = await response.blob();
      
      if (audioBlob.size === 0) {
        throw new MusicGenAPIError('Received empty audio response from API');
      }

      return audioBlob;

    } catch (error) {
      clearTimeout(timeoutId);

      // Handle timeout
      if (error instanceof Error && error.name === 'AbortError') {
        throw new MusicGenAPIError(
          `Request timed out after ${this.timeout / 1000} seconds`,
          undefined,
          error
        );
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new MusicGenAPIError(
          'Network error: Unable to reach MusicGen API',
          undefined,
          error
        );
      }

      // Re-throw MusicGenAPIError
      if (error instanceof MusicGenAPIError) {
        throw error;
      }

      // Wrap unknown errors
      throw new MusicGenAPIError(
        'Unexpected error during music generation',
        undefined,
        error
      );
    }
  }

  /**
   * Checks if the API is available
   * @returns Promise resolving to true if API is reachable
   */
  async healthCheck(): Promise<boolean> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(this.endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok || response.status === 503; // 503 means model is loading
    } catch {
      clearTimeout(timeoutId);
      return false;
    }
  }
}

/**
 * Creates a MusicGen client instance with environment configuration
 * @returns MusicGenClient instance
 * @throws {MusicGenAPIError} if API key is not configured
 */
export function createMusicGenClient(): MusicGenClient {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  
  if (!apiKey) {
    throw new MusicGenAPIError(
      'HUGGINGFACE_API_KEY environment variable is not set'
    );
  }

  return new MusicGenClient(apiKey);
}
