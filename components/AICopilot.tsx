'use client';

import { useState, useRef, useEffect } from 'react';
import { generateText, GeminiAPIError } from '@/src/lib/api/gemini-client';
import { useStore } from '@/src/store';
import { Song, ChatMessage } from '@/lib/firebase/songService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface AICopilotProps {
  onClose: () => void;
  song?: Song | null;
  onSaveChatMessage?: (message: ChatMessage) => Promise<void>;
}

export default function AICopilot({ onClose, song, onSaveChatMessage }: AICopilotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { session } = useStore((state) => ({ session: state.session }));

  // Initialize welcome message or load chat history
  useEffect(() => {
    setMounted(true);
    
    if (song && song.ai_chat_context && song.ai_chat_context.length > 0) {
      // Load chat history from song
      const loadedMessages: Message[] = song.ai_chat_context.map((msg, index) => ({
        id: `${msg.timestamp.getTime()}-${index}`,
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.message,
        timestamp: msg.timestamp.getTime(),
      }));
      setMessages(loadedMessages);
    } else {
      // Show welcome message
      const welcomeContent = song
        ? `Welcome back to "${song.title}"! I'm your AI music assistant. I can see you're working on a ${song.genre || 'song'} with a ${song.mood || 'creative'} mood. How can I help you today?`
        : "Welcome to MusePilot! I'm your AI music assistant. Try asking me to:\n\n• Generate music from a prompt\n• Transpose notes\n• Change tempo or key\n• Generate lyrics\n• Suggest chord progressions";
      
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: welcomeContent,
          timestamp: Date.now(),
        },
      ]);
    }
  }, [song]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const buildContext = () => {
    let context = `You are a helpful AI music assistant for MusePilot. Provide concise, actionable advice about music production, composition, and arrangement.\n\n`;
    
    // Add song context if available
    if (song) {
      context += `CURRENT SONG CONTEXT:\n`;
      context += `- Title: "${song.title}"\n`;
      if (song.genre) context += `- Genre: ${song.genre}\n`;
      if (song.mood) context += `- Mood: ${song.mood}\n`;
      if (song.tempo) context += `- Target Tempo: ${song.tempo}\n`;
      if (song.key) context += `- Key: ${song.key}\n`;
      if (song.style) context += `- Style: ${song.style}\n`;
      if (song.instruments && song.instruments.length > 0) {
        context += `- Instruments: ${song.instruments.join(', ')}\n`;
      }
      context += `- Version: ${song.version_number}\n`;
      context += `- Audio Files Generated: ${song.audio_files.length}\n`;
      if (song.notes) context += `- Notes: ${song.notes}\n`;
      context += `\n`;
    }
    
    // Add current session context
    context += `CURRENT SESSION STATE:\n`;
    context += `- Tempo: ${session.tempo} BPM\n`;
    context += `- Key: ${session.keySignature}\n`;
    context += `- Time Signature: ${session.timeSignature.join('/')}\n`;
    context += `- Notes in Piano Roll: ${session.notes.length}\n`;
    context += `- Generated Audio Tracks: ${session.generatedAudio.length}\n`;
    
    // Add lyrics if available
    if (session.lyrics?.text) {
      context += `- Lyrics: ${session.lyrics.text.substring(0, 200)}${session.lyrics.text.length > 200 ? '...' : ''}\n`;
    }
    
    context += `\n`;
    
    // Add conversation history context
    if (messages.length > 1) {
      context += `CONVERSATION HISTORY:\n`;
      const recentMessages = messages.slice(-6); // Last 3 exchanges
      recentMessages.forEach((msg) => {
        const role = msg.role === 'user' ? 'User' : 'Assistant';
        context += `${role}: ${msg.content.substring(0, 150)}${msg.content.length > 150 ? '...' : ''}\n`;
      });
      context += `\n`;
    }
    
    context += `Based on this context, provide helpful, specific guidance for this song.`;
    
    return context;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Save user message to Firebase if in song context
    if (song && onSaveChatMessage) {
      try {
        await onSaveChatMessage({
          sender: 'user',
          message: userMessage.content,
          timestamp: new Date(userMessage.timestamp),
        });
      } catch (error) {
        console.error('Failed to save user message:', error);
      }
    }

    try {
      const context = buildContext();
      const prompt = `${context}\n\nUser: ${userMessage.content}\n\nAssistant:`;
      
      const response = await generateText(prompt);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Save assistant message to Firebase if in song context
      if (song && onSaveChatMessage) {
        try {
          await onSaveChatMessage({
            sender: 'ai',
            message: assistantMessage.content,
            timestamp: new Date(assistantMessage.timestamp),
          });
        } catch (error) {
          console.error('Failed to save assistant message:', error);
        }
      }
    } catch (error) {
      console.error('Error generating response:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: error instanceof GeminiAPIError
          ? `Sorry, I encountered an error: ${error.message}`
          : 'Sorry, I encountered an unexpected error. Please try again.',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <aside className="flex w-96 flex-col border-l border-white/10 bg-black/50 backdrop-blur-xl h-full relative z-10">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5 flex-shrink-0">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <div className="h-2 w-2 rounded-full bg-emerald-400"></div>
            <h3 className="font-medium text-white text-sm">AI Co-Pilot</h3>
          </div>
          {song && (
            <div className="flex items-center gap-1.5 ml-4">
              <svg className="h-3 w-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              <span className="text-xs text-purple-400">Song Context Active</span>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
          title="Close"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3.5 py-2.5 ${
                message.role === 'user'
                  ? 'bg-white/10 text-white border border-white/15'
                  : 'bg-white/5 text-gray-200 border border-white/10'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
              <span className="text-xs text-gray-500 mt-1.5 block">
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-xs text-gray-500">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/10 p-4 flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="flex-1 rounded-lg bg-white/5 border border-white/15 px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/25 focus:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="rounded-lg bg-white/10 hover:bg-white/15 px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">Press Enter to send</p>
      </div>
    </aside>
  );
}
