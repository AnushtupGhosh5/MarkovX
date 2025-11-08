'use client';

import { useState } from 'react';

export default function ExportImportGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-xs text-cyan-400 hover:text-cyan-300 underline"
      >
        How does export/import work?
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-slate-900 border-b border-cyan-500/30 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Export & Import Guide</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Overview */}
              <section>
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">📦 What is Export/Import?</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Export/Import allows you to save your entire music project to a file and load it back later. 
                  This includes all your notes, tempo settings, AI conversation history, and more.
                </p>
              </section>

              {/* Export Section */}
              <section>
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">💾 Exporting Your Project</h3>
                <div className="space-y-3">
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-cyan-500/20">
                    <h4 className="font-semibold text-white mb-2">Export as MusePilot Project (.musepilot)</h4>
                    <p className="text-gray-300 text-sm mb-2">
                      Saves everything including:
                    </p>
                    <ul className="text-gray-400 text-sm space-y-1 ml-4">
                      <li>• All MIDI notes with timing and velocity</li>
                      <li>• Tempo, key signature, and time signature</li>
                      <li>• AI conversation history</li>
                      <li>• Lyrics and metadata</li>
                    </ul>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/20">
                    <h4 className="font-semibold text-white mb-2">Export as MIDI (.mid)</h4>
                    <p className="text-gray-300 text-sm mb-2">
                      Standard MIDI format for use in other DAWs:
                    </p>
                    <ul className="text-gray-400 text-sm space-y-1 ml-4">
                      <li>• Compatible with Ableton, FL Studio, Logic Pro, etc.</li>
                      <li>• Includes notes, tempo, and time signature</li>
                      <li>• Does not include AI context or lyrics</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Import Section */}
              <section>
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">📂 Importing a Project</h3>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-cyan-500/20">
                  <ol className="text-gray-300 text-sm space-y-2">
                    <li>1. Click the <span className="font-mono bg-slate-700 px-2 py-1 rounded">Project</span> button</li>
                    <li>2. Select <span className="font-mono bg-slate-700 px-2 py-1 rounded">Import Project</span></li>
                    <li>3. Choose a <span className="font-mono bg-slate-700 px-2 py-1 rounded">.musepilot</span> file</li>
                    <li>4. Your project loads instantly!</li>
                  </ol>
                  <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-yellow-400 text-xs">
                      ⚠️ <strong>Warning:</strong> Importing will replace your current session. 
                      Export your current work first if you want to keep it!
                    </p>
                  </div>
                </div>
              </section>

              {/* Best Practices */}
              <section>
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">✨ Best Practices</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <span className="text-green-400 text-xl">💡</span>
                    <div>
                      <p className="text-white text-sm font-medium">Export Regularly</p>
                      <p className="text-gray-400 text-xs">Save your work every 10-15 minutes</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-blue-400 text-xl">📁</span>
                    <div>
                      <p className="text-white text-sm font-medium">Organize Your Files</p>
                      <p className="text-gray-400 text-xs">Keep projects in dedicated folders</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-purple-400 text-xl">🔄</span>
                    <div>
                      <p className="text-white text-sm font-medium">Version Control</p>
                      <p className="text-gray-400 text-xs">Add version numbers to track iterations</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-yellow-400 text-xl">☁️</span>
                    <div>
                      <p className="text-white text-sm font-medium">Backup to Cloud</p>
                      <p className="text-gray-400 text-xs">Store important projects in cloud storage</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Technical Details */}
              <section>
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">🔧 Technical Details</h3>
                <div className="bg-slate-800/50 rounded-lg p-4 border border-cyan-500/20">
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li>• <strong>File Format:</strong> JSON (human-readable)</li>
                    <li>• <strong>File Size:</strong> ~1KB per 100 notes</li>
                    <li>• <strong>Processing:</strong> 100% local (no server upload)</li>
                    <li>• <strong>Privacy:</strong> Your data never leaves your device</li>
                    <li>• <strong>Compatibility:</strong> Works across all devices</li>
                  </ul>
                </div>
              </section>

              {/* Troubleshooting */}
              <section>
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">🔍 Troubleshooting</h3>
                <div className="space-y-2 text-sm">
                  <details className="bg-slate-800/50 rounded-lg border border-cyan-500/20">
                    <summary className="p-3 cursor-pointer text-white font-medium hover:bg-slate-700/50">
                      File won't download
                    </summary>
                    <div className="p-3 pt-0 text-gray-400">
                      Check your browser's download settings and ensure pop-ups aren't blocked.
                    </div>
                  </details>
                  <details className="bg-slate-800/50 rounded-lg border border-cyan-500/20">
                    <summary className="p-3 cursor-pointer text-white font-medium hover:bg-slate-700/50">
                      Import shows error
                    </summary>
                    <div className="p-3 pt-0 text-gray-400">
                      Make sure you're importing a valid .musepilot file. The file may be corrupted if manually edited.
                    </div>
                  </details>
                  <details className="bg-slate-800/50 rounded-lg border border-cyan-500/20">
                    <summary className="p-3 cursor-pointer text-white font-medium hover:bg-slate-700/50">
                      Lost my project
                    </summary>
                    <div className="p-3 pt-0 text-gray-400">
                      Check your browser's downloads folder. Files are named with timestamps for easy identification.
                    </div>
                  </details>
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-slate-900 border-t border-cyan-500/30 p-4">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
