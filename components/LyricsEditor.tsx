'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/src/store';
import { generateText, GeminiAPIError } from '@/src/lib/api/gemini-client';

interface LyricLine {
  id: string;
  text: string;
  timestamp: number;
  syllables: number;
  rhymeGroup?: string;
}

interface LyricSection {
  id: string;
  type: 'verse' | 'chorus' | 'bridge' | 'pre-chorus' | 'outro' | 'intro';
  lines: LyricLine[];
}

export default function LyricsEditor() {
  const [sections, setSections] = useState<LyricSection[]>([
    {
      id: '1',
      type: 'verse',
      lines: [],
    },
  ]);
  const [selectedSection, setSelectedSection] = useState<string>('1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [showPromptDialog, setShowPromptDialog] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { session } = useStore((state) => ({ session: state.session }));

  // Count syllables
  const countSyllables = (word: string): number => {
    word = word.toLowerCase().trim();
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const syllables = word.match(/[aeiouy]{1,2}/g);
    return syllables ? syllables.length : 1;
  };

  const countLineSyllables = (text: string): number => {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    return words.reduce((sum, word) => sum + countSyllables(word), 0);
  };

  const getRhymeSound = (word: string): string => {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    const vowels = 'aeiou';
    let lastVowelIndex = -1;
    for (let i = word.length - 1; i >= 0; i--) {
      if (vowels.includes(word[i])) {
        lastVowelIndex = i;
        break;
      }
    }
    return lastVowelIndex >= 0 ? word.slice(lastVowelIndex) : word;
  };

  const parseLines = (text: string): LyricLine[] => {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    return lines.map((line, index) => {
      const words = line.trim().split(/\s+/);
      const lastWord = words[words.length - 1]?.replace(/[^a-zA-Z]/g, '') || '';
      return {
        id: `${Date.now()}-${index}`,
        text: line.trim(),
        timestamp: 0,
        syllables: countLineSyllables(line),
        rhymeGroup: getRhymeSound(lastWord),
      };
    });
  };

  const updateSectionLines = (sectionId: string, text: string) => {
    setSections(prev =>
      prev.map(section =>
        section.id === sectionId
          ? { ...section, lines: parseLines(text) }
          : section
      )
    );
  };

  const addSection = (type: LyricSection['type']) => {
    const newSection: LyricSection = {
      id: Date.now().toString(),
      type,
      lines: [],
    };
    setSections(prev => [...prev, newSection]);
    setSelectedSection(newSection.id);
  };

  const deleteSection = (sectionId: string) => {
    setSections(prev => prev.filter(s => s.id !== sectionId));
    if (selectedSection === sectionId) {
      setSelectedSection(sections[0]?.id || '');
    }
  };

  const generateLyrics = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const context = `You are a professional songwriter. Generate lyrics based on:

Theme: ${prompt}
Tempo: ${session.tempo} BPM
Key: ${session.keySignature}

Generate 4-8 lines for a ${sections.find(s => s.id === selectedSection)?.type || 'verse'}.
Format: Plain text, one line per line. No labels.`;

      const response = await generateText(context);
      updateSectionLines(selectedSection, response);
      setShowPromptDialog(false);
      setPrompt('');
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof GeminiAPIError ? error.message : 'Failed to generate lyrics');
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedSectionData = sections.find(s => s.id === selectedSection);
  const totalLines = sections.reduce((sum, s) => sum + s.lines.length, 0);
  const totalSyllables = sections.reduce(
    (sum, s) => sum + s.lines.reduce((lineSum, line) => lineSum + line.syllables, 0),
    0
  );

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-black/40 to-black/20">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-white/10 px-8 py-5 bg-black/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white">Lyrics Editor</h2>
            <p className="text-sm text-gray-400 mt-1">
              {totalLines} lines • {totalSyllables} syllables
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPromptDialog(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl text-sm font-semibold transition-all shadow-lg"
            >
              ✨ AI Generate
            </button>
            <button
              onClick={() => {
                const text = sections.map(s => 
                  `[${s.type.toUpperCase()}]\n${s.lines.map(l => l.text).join('\n')}`
                ).join('\n\n');
                navigator.clipboard.writeText(text);
              }}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-sm font-semibold border border-white/10 transition-all"
            >
              📋 Copy
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Sections */}
        <div className="w-72 border-r border-white/10 bg-black/20 flex flex-col">
          <div className="p-5 border-b border-white/10">
            <button
              onClick={() => addSection('verse')}
              className="w-full px-4 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl text-sm font-medium border border-white/10 transition-all"
            >
              + Add Section
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar-thin p-5 space-y-3">
            {sections.map((section) => (
              <div
                key={section.id}
                onClick={() => setSelectedSection(section.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  selectedSection === section.id
                    ? 'bg-gradient-to-br from-purple-500/30 to-pink-500/30 border-2 border-purple-400/60 shadow-lg'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <select
                    value={section.type}
                    onChange={(e) => {
                      setSections(prev =>
                        prev.map(s =>
                          s.id === section.id
                            ? { ...s, type: e.target.value as LyricSection['type'] }
                            : s
                        )
                      );
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold capitalize border focus:outline-none transition-all ${
                      selectedSection === section.id
                        ? 'bg-white/20 text-white border-white/30'
                        : 'bg-white/10 text-gray-300 border-white/20'
                    }`}
                    style={{
                      colorScheme: 'dark'
                    }}
                  >
                    <option value="intro" className="bg-gray-900 text-white">Intro</option>
                    <option value="verse" className="bg-gray-900 text-white">Verse</option>
                    <option value="pre-chorus" className="bg-gray-900 text-white">Pre-Chorus</option>
                    <option value="chorus" className="bg-gray-900 text-white">Chorus</option>
                    <option value="bridge" className="bg-gray-900 text-white">Bridge</option>
                    <option value="outro" className="bg-gray-900 text-white">Outro</option>
                  </select>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSection(section.id);
                    }}
                    className="ml-2 p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="text-xs text-gray-400">
                  {section.lines.length} lines
                  {section.lines.length > 0 && (
                    <span className="ml-2">
                      • {section.lines.reduce((sum, l) => sum + l.syllables, 0)} syllables
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedSectionData && (
            <>
              {/* Section Title */}
              <div className="flex-shrink-0 px-10 py-6 border-b border-white/10 bg-gradient-to-b from-black/30 to-transparent">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-10 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                  <div>
                    <h3 className="text-3xl font-bold text-white capitalize">
                      {selectedSectionData.type}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {selectedSectionData.lines.length} lines • {selectedSectionData.lines.reduce((sum, l) => sum + l.syllables, 0)} syllables
                    </p>
                  </div>
                </div>
              </div>

              {/* Textarea */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
                <div className="max-w-4xl mx-auto">
                  <textarea
                    ref={textareaRef}
                    value={selectedSectionData.lines.map(l => l.text).join('\n')}
                    onChange={(e) => updateSectionLines(selectedSection, e.target.value)}
                    placeholder="Start writing your lyrics here...&#10;&#10;Each line on a new line&#10;Let your creativity flow"
                    className="w-full min-h-[500px] bg-transparent text-white text-2xl leading-loose resize-none focus:outline-none placeholder-gray-600/40 font-serif"
                    style={{ fontFamily: "'Georgia', serif" }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* AI Dialog */}
      {showPromptDialog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-white/20 rounded-2xl p-8 max-w-2xl w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">✨ Generate Lyrics</h3>
              <button
                onClick={() => setShowPromptDialog(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want... (e.g., A love song about summer nights)"
              className="w-full h-32 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors resize-none custom-scrollbar mb-6"
            />

            <div className="flex gap-3">
              <button
                onClick={generateLyrics}
                disabled={!prompt.trim() || isGenerating}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isGenerating ? 'Generating...' : '✨ Generate'}
              </button>
              <button
                onClick={() => setShowPromptDialog(false)}
                className="px-6 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
