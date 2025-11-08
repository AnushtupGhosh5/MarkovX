// Example: How to integrate song management into your main music generation page
// This shows the key changes needed to connect your existing UI with the song system

'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSong } from '@/lib/hooks/useSong';
import { useAuth } from '@/lib/auth/AuthContext';
import NewSongDialog from '@/components/NewSongDialog';

export default function MusicGenerationPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const songId = searchParams.get('song');
  
  // Use the song hook to manage song state
  const { song, addChatMessage, uploadAudio, incrementVersion } = useSong(songId);
  
  const [showNewSongDialog, setShowNewSongDialog] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);

  // Load chat history when song loads
  useEffect(() => {
    if (song?.ai_chat_context) {
      setChatMessages(song.ai_chat_context);
    }
  }, [song]);

  // Handle new song creation
  const handleSongCreated = (newSongId: string) => {
    router.push(`/?song=${newSongId}`);
  };

  // Handle user sending a message
  const handleUserMessage = async (message: string) => {
    // Add to local state immediately
    const userMsg = { sender: 'user' as const, message, timestamp: new Date() };
    setChatMessages(prev => [...prev, userMsg]);

    // Save to Firebase if in song context
    if (songId) {
      await addChatMessage(userMsg);
    }

    // Get AI response (your existing logic)
    const aiResponse = await getAIResponse(message);
    
    // Add AI response
    const aiMsg = { sender: 'ai' as const, message: aiResponse, timestamp: new Date() };
    setChatMessages(prev => [...prev, aiMsg]);

    if (songId) {
      await addChatMessage(aiMsg);
    }
  };

  // Handle music generation
  const handleGenerateMusic = async (prompt: string) => {
    // Your existing music generation logic
    const audioBlob = await generateMusicFromAPI(prompt);

    // Save to Firebase if in song context
    if (songId && audioBlob) {
      const filename = `${song?.title || 'audio'}_${Date.now()}.wav`;
      const audioUrl = await uploadAudio(audioBlob, filename);
      
      // Increment version for tracking
      await incrementVersion();

      console.log('Audio saved to Firebase:', audioUrl);
    }

    return audioBlob;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header with navigation */}
      <header className="border-b border-zinc-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">MusePilot</h1>
            {song && (
              <span className="text-gray-400">
                Editing: <span className="text-white">{song.title}</span>
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/songs')}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
            >
              My Songs
            </button>
            <button
              onClick={() => setShowNewSongDialog(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              New Song
            </button>
            {user && (
              <div className="text-sm text-gray-400">
                {user.displayName || user.email}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Your existing music generation UI */}
      <main className="max-w-7xl mx-auto p-4">
        {/* Show prompt if no song is selected */}
        {!songId && (
          <div className="bg-yellow-600/20 border border-yellow-600/50 rounded-lg p-4 mb-4">
            <p className="text-yellow-200">
              💡 Create or open a song to save your work and chat history
            </p>
          </div>
        )}

        {/* Your existing components */}
        {/* ... */}
      </main>

      {/* New Song Dialog */}
      <NewSongDialog
        isOpen={showNewSongDialog}
        onClose={() => setShowNewSongDialog(false)}
        onSongCreated={handleSongCreated}
      />
    </div>
  );
}

// Placeholder functions - replace with your actual implementations
async function getAIResponse(message: string): Promise<string> {
  // Your AI logic here
  return "AI response";
}

async function generateMusicFromAPI(prompt: string): Promise<Blob> {
  // Your music generation logic here
  return new Blob();
}
