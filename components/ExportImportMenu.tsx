'use client';

import { useState, useRef } from 'react';
import { useStore } from '@/src/store';
import { exportProject, exportAsMIDI, importProject, isValidProjectFile } from '@/src/lib/export-import';
import ExportImportGuide from './ExportImportGuide';

interface ExportImportMenuProps {
  onClose: () => void;
}

export default function ExportImportMenu({ onClose }: ExportImportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { session, loadSession, clearSelectedNotes } = useStore((state) => ({
    session: state.session,
    loadSession: state.loadSession,
    clearSelectedNotes: state.clearSelectedNotes,
  }));

  const handleExportJSON = () => {
    try {
      exportProject(session);
      setIsOpen(false);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export project');
    }
  };

  const handleExportMIDI = () => {
    try {
      exportAsMIDI(session);
      setIsOpen(false);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export MIDI');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isValidProjectFile(file.name)) {
      setError('Invalid file type. Please select a .musepilot file.');
      return;
    }

    setIsImporting(true);
    setError(null);

    try {
      const importedSession = await importProject(file);
      
      // Load the imported session into the store
      loadSession(importedSession);
      clearSelectedNotes();
      
      setIsOpen(false);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import project');
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-lg bg-white/10 hover:bg-white/15 text-white px-5 py-2 text-sm font-medium border border-white/10 transition-colors duration-200 flex items-center gap-2"
        title="Export/Import Project"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
        </svg>
        Project
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 rounded-lg bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl z-20 overflow-hidden">
            <div className="p-3 border-b border-white/10">
              <p className="text-sm font-medium text-white">Project Management</p>
              <p className="text-xs text-gray-300 mt-1">
                {session.notes.length} notes • {session.tempo} BPM
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border-b border-red-500/20">
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            <div className="p-2">
              <button
                onClick={handleImportClick}
                disabled={isImporting}
                className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/5 transition-colors flex items-center gap-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <div>
                  <div className="font-medium">Import Project</div>
                  <div className="text-xs text-gray-400">Load .musepilot file</div>
                </div>
              </button>

              <button
                onClick={handleExportJSON}
                className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/5 transition-colors flex items-center gap-3 rounded-lg mt-1"
              >
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                <div>
                  <div className="font-medium">Export Project</div>
                  <div className="text-xs text-gray-400">Save as .musepilot</div>
                </div>
              </button>

              <button
                onClick={handleExportMIDI}
                className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/5 transition-colors flex items-center gap-3 rounded-lg mt-1"
              >
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                <div>
                  <div className="font-medium">Export MIDI</div>
                  <div className="text-xs text-gray-400">Save as .mid file</div>
                </div>
              </button>
            </div>

            <div className="p-3 border-t border-white/10 bg-white/5">
              <p className="text-xs text-gray-400 mb-2">
                💡 Tip: Export your project to save all notes, tempo, and AI context for later use.
              </p>
              <ExportImportGuide />
            </div>
          </div>
        </>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".musepilot"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
