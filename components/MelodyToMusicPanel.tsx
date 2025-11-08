"use client";

import { useState, useRef } from "react";

export default function MelodyToMusicPanel() {
  const [isRecording, setIsRecording] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState(10);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      setError("Failed to access microphone. Please allow microphone access.");
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioBlob(file);
      setError(null);
    }
  };

  const generateMusic = async () => {
    if (!audioBlob) {
      setError("Please record or upload audio first");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedAudio(null);

    try {
      const formData = new FormData();
      formData.append("audio_file", audioBlob, "melody.wav");
      formData.append("prompt", prompt);
      formData.append("duration", duration.toString());

      const response = await fetch("/api/gen/melody", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.audioUrl) {
        setGeneratedAudio(data.audioUrl);
      } else {
        setError(data.error || "Failed to generate music");
      }
    } catch (err) {
      setError("Failed to connect to server. Make sure the Colab server is running.");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const clearRecording = () => {
    setAudioBlob(null);
    setGeneratedAudio(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Melody to Music</h2>
        <p className="text-gray-600">
          Hum, whistle, or sing a melody and turn it into full music
        </p>
      </div>

      {/* Recording Section */}
      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isGenerating}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
              isRecording
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-300"
            }`}
          >
            {isRecording ? "⏹️ Stop Recording" : "🎤 Start Recording"}
          </button>

          <label className="flex-1 py-3 px-6 rounded-lg font-medium bg-gray-200 hover:bg-gray-300 text-center cursor-pointer transition-colors">
            📁 Upload Audio
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              disabled={isGenerating || isRecording}
              className="hidden"
            />
          </label>
        </div>

        {audioBlob && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-green-700">✓ Audio ready</span>
              <button
                onClick={clearRecording}
                className="text-red-500 hover:text-red-700"
              >
                Clear
              </button>
            </div>
            <audio
              controls
              src={URL.createObjectURL(audioBlob)}
              className="w-full mt-2"
            />
          </div>
        )}
      </div>

      {/* Optional Text Prompt */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Style Prompt (Optional)
        </label>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., jazz piano, rock guitar, orchestral..."
          disabled={isGenerating}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Duration Slider */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Duration: {duration} seconds
        </label>
        <input
          type="range"
          min="5"
          max="30"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          disabled={isGenerating}
          className="w-full"
        />
      </div>

      {/* Generate Button */}
      <button
        onClick={generateMusic}
        disabled={!audioBlob || isGenerating}
        className="w-full py-3 px-6 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {isGenerating ? "🎵 Generating..." : "✨ Generate Music"}
      </button>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Generated Audio */}
      {generatedAudio && (
        <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
          <h3 className="font-semibold mb-3 text-purple-900">
            🎉 Your Generated Music
          </h3>
          <audio controls src={generatedAudio} className="w-full" />
          <a
            href={generatedAudio}
            download="melody-music.wav"
            className="mt-3 inline-block text-purple-600 hover:text-purple-800 underline"
          >
            Download
          </a>
        </div>
      )}
    </div>
  );
}
