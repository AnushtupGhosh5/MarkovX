"use client";

import { useState, useRef, useEffect } from "react";
import * as Tone from "tone";

interface Note {
  start: number;
  end: number;
  pitch: number;
  note_name: string;
  duration: number;
}

export default function HummingToMusicPanel() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [extractedNotes, setExtractedNotes] = useState<Note[]>([]);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [midiUrl, setMidiUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Settings
  const [addAccompaniment, setAddAccompaniment] = useState(true);
  const [progressionType, setProgressionType] = useState("pop");
  const [bassPattern, setBassPattern] = useState("root");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const synthRef = useRef<Tone.PolySynth | null>(null);

  useEffect(() => {
    // Initialize Tone.js synth
    synthRef.current = new Tone.PolySynth(Tone.Synth).toDestination();
    
    return () => {
      synthRef.current?.dispose();
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
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
      setError("Failed to access microphone");
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const extractMelody = async () => {
    if (!audioBlob) return;

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("audio_file", audioBlob, "humming.wav");

      const response = await fetch("/api/humming/extract", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setExtractedNotes(data.notes);
        setMidiUrl(data.midi_url);
        playMelody(data.notes);
      } else {
        setError(data.error || "Failed to extract melody");
      }
    } catch (err) {
      setError("Failed to connect to server");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const generateMusic = async () => {
    if (!audioBlob) return;

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("audio_file", audioBlob, "humming.wav");
      formData.append("add_accompaniment", addAccompaniment.toString());
      formData.append("progression_type", progressionType);
      formData.append("bass_pattern", bassPattern);

      const response = await fetch("/api/humming/complete", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setExtractedNotes(data.notes);
        setMidiUrl(data.midi_url);
        if (data.audio_url) {
          setGeneratedAudioUrl(data.audio_url);
        }
      } else {
        setError(data.error || "Failed to generate music");
      }
    } catch (err) {
      setError("Failed to connect to server");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const playMelody = async (notes: Note[]) => {
    if (!synthRef.current || notes.length === 0) return;

    await Tone.start();
    const now = Tone.now();

    notes.forEach((note) => {
      const noteName = note.note_name;
      synthRef.current?.triggerAttackRelease(
        noteName,
        note.duration,
        now + note.start
      );
    });
  };

  const clearAll = () => {
    setAudioBlob(null);
    setExtractedNotes([]);
    setGeneratedAudioUrl(null);
    setMidiUrl(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Humming to Music</h2>
        <p className="text-gray-600">
          Hum a melody and we'll extract the notes and add accompaniment
        </p>
      </div>

      {/* Recording Controls */}
      <div className="space-y-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`w-full py-4 px-6 rounded-lg font-medium transition-all ${
            isRecording
              ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
              : "bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-300"
          }`}
        >
          {isRecording ? "⏹️ Stop Recording" : "🎤 Start Humming"}
        </button>

        {audioBlob && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-700 font-medium">✓ Recording ready</span>
              <button
                onClick={clearAll}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Clear
              </button>
            </div>
            <audio
              controls
              src={URL.createObjectURL(audioBlob)}
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Settings */}
      {audioBlob && (
        <div className="p-4 bg-gray-50 rounded-lg space-y-4">
          <h3 className="font-semibold">Settings</h3>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={addAccompaniment}
              onChange={(e) => setAddAccompaniment(e.target.checked)}
              className="w-4 h-4"
            />
            <span>Add accompaniment (chords + bass)</span>
          </label>

          {addAccompaniment && (
            <>
              <div>
                <label className="block text-sm mb-1">Chord Progression</label>
                <select
                  value={progressionType}
                  onChange={(e) => setProgressionType(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="pop">Pop (I-vi-IV-V)</option>
                  <option value="jazz">Jazz (I-IV-V-vi)</option>
                  <option value="blues">Blues (12-bar)</option>
                  <option value="simple">Simple (I-V-vi-I)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">Bass Pattern</label>
                <select
                  value={bassPattern}
                  onChange={(e) => setBassPattern(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="root">Root notes</option>
                  <option value="walking">Walking bass</option>
                  <option value="arpeggio">Arpeggiated</option>
                </select>
              </div>
            </>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {audioBlob && (
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={extractMelody}
            disabled={isProcessing}
            className="py-3 px-6 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium disabled:bg-gray-300"
          >
            {isProcessing ? "Processing..." : "🎵 Extract Melody Only"}
          </button>

          <button
            onClick={generateMusic}
            disabled={isProcessing}
            className="py-3 px-6 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium disabled:bg-gray-300"
          >
            {isProcessing ? "Generating..." : "✨ Generate Full Music"}
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Extracted Notes Display */}
      {extractedNotes.length > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold mb-3">Extracted Melody</h3>
          <div className="text-sm text-gray-700 mb-3">
            {extractedNotes.length} notes detected
          </div>
          
          {/* Simple Piano Roll Visualization */}
          <div className="bg-white p-4 rounded border overflow-x-auto">
            <div className="relative h-48" style={{ minWidth: "600px" }}>
              {extractedNotes.map((note, idx) => {
                const maxTime = Math.max(...extractedNotes.map(n => n.end));
                const left = (note.start / maxTime) * 100;
                const width = ((note.end - note.start) / maxTime) * 100;
                const minPitch = Math.min(...extractedNotes.map(n => n.pitch));
                const maxPitch = Math.max(...extractedNotes.map(n => n.pitch));
                const bottom = ((note.pitch - minPitch) / (maxPitch - minPitch)) * 80 + 10;

                return (
                  <div
                    key={idx}
                    className="absolute bg-blue-500 rounded opacity-80 hover:opacity-100"
                    style={{
                      left: `${left}%`,
                      width: `${width}%`,
                      bottom: `${bottom}%`,
                      height: "8px",
                    }}
                    title={`${note.note_name} (${note.duration.toFixed(2)}s)`}
                  />
                );
              })}
            </div>
          </div>

          <button
            onClick={() => playMelody(extractedNotes)}
            className="mt-3 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
          >
            ▶️ Play Melody
          </button>
        </div>
      )}

      {/* Generated Audio */}
      {generatedAudioUrl && (
        <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
          <h3 className="font-semibold mb-3 text-purple-900">
            🎉 Your Generated Music
          </h3>
          <audio controls src={generatedAudioUrl} className="w-full mb-3" />
          <a
            href={generatedAudioUrl}
            download="humming-music.wav"
            className="text-purple-600 hover:text-purple-800 underline text-sm"
          >
            Download Audio
          </a>
        </div>
      )}

      {/* MIDI Download */}
      {midiUrl && (
        <div className="text-center">
          <a
            href={midiUrl}
            download="melody.mid"
            className="inline-block px-6 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg text-sm"
          >
            📥 Download MIDI
          </a>
        </div>
      )}
    </div>
  );
}
