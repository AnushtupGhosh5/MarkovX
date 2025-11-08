'use client';

import { useState } from 'react';
import { useStore } from '@/src/store';

export default function LyricsEditor() {
  const { session, updateSession } = useStore((state) => ({
    session: state.session,
    updateSession: state.updateSession,
  }));

  const [lyrics, setLyrics] = useState(session.lyrics?.text || '');
  const [title, setTitle] = useState(session.songTitle || '');
  const [artist, setArtist] = useState(session.artist || '');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  const handleSave = () => {
    updateSession({
      lyrics: {
        text: lyrics,
        segments: session.lyrics?.segments || [],
      },
      songTitle: title,
      artist,
    });
  };

  const handleGenerateLyrics = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description for the lyrics');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Generate song lyrics based on this description: ${prompt}

Song Title: ${title || 'Untitled'}
Artist: ${artist || 'Unknown'}

Please format the lyrics with proper structure including [Verse], [Chorus], [Bridge] tags. Make it creative and meaningful.`,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to generate lyrics');
        return;
      }

      setLyrics(data.text);
      setShowPrompt(false);
      setPrompt('');
    } catch (err) {
      console.error('Error generating lyrics:', err);
      setError('Failed to generate lyrics. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const wordCount = lyrics.trim().split(/\s+/).filter(Boolean).length;
  const lineCount = lyrics.split('\n').length;

  return (
    <div className="h-full flex flex-col relative z-10 w-full px-8">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-white mb-1">Lyrics Editor</h2>
        <p className="text-sm text-gray-400">Write and edit your song lyrics</p>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {/* Song Info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="title" className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
              Song Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled"
              className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/25 transition-colors"
            />
          </div>
          <div>
            <label htmlFor="artist" className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">
              Artist
            </label>
            <input
              id="artist"
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Artist name"
              className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/25 transition-colors"
            />
          </div>
        </div>

        {/* AI Generation Prompt */}
        {showPrompt && (
          <div className="mb-4 p-4 bg-white/5 border border-white/10 rounded-md">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                AI Lyrics Generation
              </label>
              <button
                onClick={() => setShowPrompt(false)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the theme, mood, or story..."
              className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/25 transition-colors mb-3"
              disabled={isGenerating}
            />
            {error && (
              <div className="mb-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400">
                {error}
              </div>
            )}
            <button
              onClick={handleGenerateLyrics}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-2 bg-white text-black hover:bg-gray-200 rounded-md transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Generating...' : 'Generate Lyrics'}
            </button>
          </div>
        )}

        {/* Lyrics Textarea */}
        <div className="flex-1 flex flex-col min-h-0 mb-6">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="lyrics" className="block text-xs font-medium text-gray-400 uppercase tracking-wide">
              Lyrics
            </label>
            {!showPrompt && (
              <button
                onClick={() => setShowPrompt(true)}
                className="text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate with AI
              </button>
            )}
          </div>
          <textarea
            id="lyrics"
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            placeholder="[Verse 1]&#10;Write your lyrics here...&#10;&#10;[Chorus]&#10;..."
            className="flex-1 rounded-md bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/25 transition-colors resize-none font-mono leading-relaxed custom-scrollbar"
          />
        </div>

        {/* Stats and Actions */}
        <div className="flex items-center justify-between py-3 border-t border-white/10">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>{lineCount} lines</span>
            <span className="text-gray-600">•</span>
            <span>{wordCount} words</span>
            <span className="text-gray-600">•</span>
            <span>{lyrics.length} chars</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setLyrics('');
                setTitle('');
                setArtist('');
              }}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 bg-white text-black hover:bg-gray-200 rounded-md transition-colors text-sm font-medium"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
