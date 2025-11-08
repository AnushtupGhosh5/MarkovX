# AI Co-Pilot Documentation

## Overview

The AI Co-Pilot is a conversational assistant powered by Google Gemini that helps you with music production tasks in MusePilot.

## Setup

1. **Get a Gemini API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key

2. **Configure Environment Variables**
   - Create or edit `.env.local` in the project root
   - Add your API key:
     ```
     GEMINI_API_KEY=your_api_key_here
     ```

3. **Restart the Development Server**
   ```bash
   npm run dev
   ```

## Features

### Chat Interface
- Real-time conversation with AI assistant
- Context-aware responses based on your current session
- Message history with timestamps
- Loading indicators and error handling

### Session Context
The AI has access to your current session:
- Tempo (BPM)
- Key signature
- Time signature
- Number of notes
- Generated audio tracks

### Example Prompts

**Music Theory:**
- "What chord progression works well in C major?"
- "Suggest a melody for a sad song"
- "How do I transpose this to D minor?"

**Production:**
- "What tempo should I use for a dance track?"
- "How can I make my mix sound fuller?"
- "Suggest effects for a vocal track"

**Composition:**
- "Generate lyrics for a love song"
- "What instruments work well together?"
- "How do I create tension in my arrangement?"

## API Endpoints

### POST /api/gemini
Generates text using Google Gemini API.

**Request:**
```json
{
  "prompt": "Your prompt here"
}
```

**Response:**
```json
{
  "response": "Generated text response"
}
```

**Error Response:**
```json
{
  "error": "Error message"
}
```

## Client API

### generateText(prompt: string)
Main function to call the Gemini API from the frontend.

```typescript
import { generateText } from '@/src/lib/api/gemini-client';

try {
  const response = await generateText('Write a chord progression');
  console.log(response);
} catch (error) {
  console.error('Error:', error);
}
```

### GeminiAPIError
Custom error class with status codes.

```typescript
try {
  await generateText(prompt);
} catch (error) {
  if (error instanceof GeminiAPIError) {
    console.error('Status:', error.statusCode);
    console.error('Message:', error.message);
  }
}
```

## Component Usage

### AICopilot Component
The main chat interface component.

```typescript
import AICopilot from '@/components/AICopilot';

<AICopilot onClose={() => setIsChatOpen(false)} />
```

**Props:**
- `onClose: () => void` - Callback when close button is clicked

## Troubleshooting

### "Gemini API is not configured"
- Make sure `GEMINI_API_KEY` is set in `.env.local`
- Restart the development server after adding the key

### "Invalid API key"
- Verify your API key is correct
- Check if the key has the necessary permissions

### "API rate limit exceeded"
- You've hit the free tier limit
- Wait a few minutes or upgrade your plan

### No response from AI
- Check browser console for errors
- Verify your internet connection
- Check if the API endpoint is accessible

## Best Practices

1. **Be Specific**: Provide clear, detailed prompts
2. **Use Context**: The AI knows your session state
3. **Iterate**: Refine your questions based on responses
4. **Save Important Info**: Copy useful responses before clearing chat

## Limitations

- Response time depends on API latency (typically 2-5 seconds)
- Free tier has rate limits
- AI responses are suggestions, not guaranteed to be perfect
- Context is limited to current session state

## Future Enhancements

- [ ] Voice input/output
- [ ] Code generation for custom effects
- [ ] Direct manipulation of session (add notes, change tempo)
- [ ] Export conversation history
- [ ] Custom AI personalities/modes
- [ ] Integration with music generation API
