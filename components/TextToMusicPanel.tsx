'use client';

import { useState } from 'react';
import { useStore } from '@/src/store';
import { GeneratedAudio } from '@/src/types';

const SAMPLE_PROMPTS = [
  {
    title: 'Lo-fi Chill',
    prompt: 'a chill lofi hip hop beat with mellow piano, soft drums, and vinyl crackle',
  },
  {
    title: 'Cinematic Epic',
    prompt: 'an epic cinematic orchestral piece with powerful strings, brass, and dramatic percussion',
  },
  {
    title: 'Upbeat Pop',
    prompt: 'an upbeat pop song with catchy synths, energetic drums, and a memorable melody',
  },
];

export default function TextToMusicPanel() {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  
  const { session, updateSession } = useStore((state) => ({
    session: state.session,
    updateSession: state.updateSession,
  }));

  const handleGenerate = async () => {
    if (!prompt.trim() || prompt.length < 10) {
      setError('Please enter a prompt (at least 10 characters)');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setCurrentAudio(null);

    try {
      const response = await fetch('/api/gen/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          durationSec: duration,
          tempo: session.tempo,
          key: session.keySignature,
          sessionContext: {
            tempo: session.tempo,
            key: session.keySignature,
          },
        }),
      });

      const data = await response.json();

      if (!data.success) {
        if (data.error === 'timeout') {
          setError('Generation timed out. The model might be busy. Please try again.');
        } else if (response.status === 503) {
          setError('Model is loading. Please wait a moment and try again.');
        } else {
          setError(data.error || 'Failed to generate music');
        }
        return;
      }

      // Success!
      setCurrentAudio(data.audioUrl);
      
      // Update session context
      const newAudio: GeneratedAudio = {
        id: crypto.randomUUID(),
        url: data.audioUrl,
        prompt: prompt.trim(),
        timestamp: Date.now(),
      };
      
      updateSession({
        generatedAudio: [...session.generatedAudio, newAudio],
      });

    } catch (err: any) {
      console.error('Generation error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseSample = (samplePrompt: string) => {
    setPrompt(samplePrompt);
    setError(null);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white/90 mb-2">Text to Music</h2>
        <p className="text-gray-400">Generate music from a text description</p>
      </div>

      {/* Sample Prompts */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Try a sample prompt:
        </label>
        <div className="grid grid-cols-3 gap-3">
          {SAMPLE_PROMPTS.map((sample) => (
            <button
              key={sample.title}
              onClick={() => handleUseSample(sample.prompt)}
              disabled={isGenerating}
              className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-left transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="font-medium text-white/90 mb-1">{sample.title}</div>
              <div className="text-xs text-gray-400 line-clamp-2">{sample.prompt}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Input */}
      <div className="mb-4">
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
          Describe the music you want to create:
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
            setError(null);
          }}
          disabled={isGenerating}
          placeholder="e.g., a relaxing ambient soundscape with soft pads and gentle melodies"
          className="w-full h-24 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/20 transition-colors resize-none disabled:opacity-50"
          maxLength={500}
        />
        <div className="mt-1 text-xs text-gray-500 text-right">
          {prompt.length}/500 characters
        </div>
      </div>

      {/* Duration Control */}
      <div className="mb-6">
        <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-2">
          Duration: {duration} seconds
        </label>
        <input
          id="duration"
          type="range"
          min="5"
          max="20"
          step="1"
          value={duration}
          onChange={(e) => setDuration(parseInt(e.target.value))}
          disabled={isGenerating}
          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>5s</span>
          <span>20s</span>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || !prompt.trim() || prompt.length < 10}
        className="w-full py-4 bg-white text-black rounded-xl font-medium hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating... (this may take 10-30 seconds)
          </>
        ) : (
          <>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            Generate Music
          </>
        )}
      </button>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <div className="flex items-start gap-2">
            <svg className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <div className="font-medium text-red-300">Error</div>
              <div className="text-sm text-red-200 mt-1">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Audio Player */}
      {currentAudio && (
        <div className="mt-6 p-6 bg-white/5 border border-white/10 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <div className="font-medium text-white/90">Music Generated!</div>
              <div className="text-sm text-gray-400">Your audio is ready to play</div>
            </div>
          </div>
          
          <audio
            controls
            src={currentAudio}
            className="w-full"
            style={{
              filter: 'invert(1) hue-rotate(180deg)',
              borderRadius: '0.5rem',
            }}
          />
          
          <div className="mt-4 text-xs text-gray-400">
            <strong>Prompt used:</strong> {prompt}
          </div>
        </div>
      )}

      {/* Generated Audio History */}
      {session.generatedAudio.length > 0 && !currentAudio && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Recent Generations</h3>
          <div className="space-y-2">
            {session.generatedAudio.slice(-3).reverse().map((audio) => (
              <div
                key={audio.id}
                className="p-3 bg-white/5 border border-white/10 rounded-lg"
              >
                <div className="text-sm text-white/90 mb-2 line-clamp-1">{audio.prompt}</div>
                <audio
                  controls
                  src={audio.url}
                  className="w-full h-8"
                  style={{
                    filter: 'invert(1) hue-rotate(180deg)',
                    borderRadius: '0.25rem',
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
