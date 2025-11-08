/**
 * Example usage of the Gemini API client
 * This file demonstrates how to use the generateText function
 */

import { generateText, GeminiAPIError } from './gemini-client';

// Example 1: Basic usage
export async function basicExample() {
  try {
    const response = await generateText('Write a short poem about music');
    console.log('Generated text:', response);
    return response;
  } catch (error) {
    if (error instanceof GeminiAPIError) {
      console.error('Gemini API error:', error.message, 'Status:', error.statusCode);
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
}

// Example 2: Usage in a React component (pseudo-code)
/*
import { useState } from 'react';
import { generateText, GeminiAPIError } from '@/src/lib/api/gemini-client';

export function MyComponent() {
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    
    try {
      const text = await generateText('Your prompt here');
      setResponse(text);
    } catch (err) {
      if (err instanceof GeminiAPIError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Text'}
      </button>
      {error && <p className="error">{error}</p>}
      {response && <p className="response">{response}</p>}
    </div>
  );
}
*/
