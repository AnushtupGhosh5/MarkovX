# Implementation Plan

- [x] 1. Set up project foundation and infrastructure
  - Initialize Next.js 14 project with TypeScript, TailwindCSS, and App Router
  - Configure environment variables for HUGGINGFACE_API_KEY and GEMINI_API_KEY
  - Set up .gitignore to exclude .env.local and sensitive files
  - Install core dependencies: Tone.js, Zustand, and API client libraries
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 2. Implement state management and persistence
  - [x] 2.1 Create Zustand store with session state slice
    - Define SessionContext interface with tempo, key, timeSignature, notes, generatedAudio, lyrics, and conversationHistory
    - Implement store actions: updateSession, addNotes, updateNotes, deleteNotes, setTempo, setKeySignature, addMessage, updateLyrics
    - _Requirements: 5.1, 5.2, 5.4_
  
  - [ ] 2.2 Create playback state slice
    - Implement isPlaying, currentTime, and playback control actions (play, pause, stop, seek, setCurrentTime)
    - Add these to the UI slice or create a separate playback slice
    - _Requirements: 3.2, 6.1_
  
  - [x] 2.3 Create UI state slice
    - Implement selectedNotes, viewRange, activePanel, and loading states
    - _Requirements: 3.1, 3.2_
  
  - [x] 2.4 Implement local storage persistence middleware
    - Create saveToLocalStorage and loadFromLocalStorage functions
    - Implement automatic persistence on state changes
    - Add session expiration logic (24 hours)
    - _Requirements: 5.3, 5.5_

- [x] 3. Build core UI layout and components
  - [x] 3.1 Create main layout component
    - Build responsive layout with header, sidebar, main workspace, and AI chat panel
    - Implement panel switching between piano roll, lyrics, and mixer views
    - _Requirements: 3.1, 4.1_
  
  - [ ] 3.2 Create reusable UI components
    - Build Button, Input, Toast, and Modal components with TailwindCSS
    - Implement toast notification system for user feedback
    - _Requirements: 7.1, 7.2_
  
  - [ ] 3.3 Integrate audio controls with playback state
    - Connect transport controls (play, pause, stop) to useAudioEngine hook
    - Wire up tempo control with session state and validation (40-240 BPM)
    - Connect time display to currentTime from playback state
    - _Requirements: 3.2, 4.2, 5.1_

- [x] 4. Implement audio engine with Tone.js
  - [x] 4.1 Create AudioEngine class
    - Initialize Tone.js PolySynth and Transport
    - Implement loadAudio method for generated audio buffers
    - Create scheduleNotes method to schedule MIDI notes for playback
    - _Requirements: 1.2, 3.2, 6.1_
  
  - [x] 4.2 Implement playback controls
    - Create play, pause, stop, and seek methods
    - Sync Tone.Transport with Zustand playback state
    - Handle audio context initialization on user interaction
    - _Requirements: 3.2, 9.3_
  
  - [x] 4.3 Create MIDI utility functions
    - Implement noteToFrequency and frequencyToNote converters
    - Create beatsToSeconds and secondsToBeats time conversion functions
    - Add note validation and range checking (0-127)
    - _Requirements: 2.3, 3.3_

- [-] 5. Build MusicGen API integration
  - [x] 5.1 Create MusicGen API client
    - Implement API client with Hugging Face endpoint
    - Add request validation for prompt length (10-500 characters)
    - Implement timeout handling (30 seconds)
    - _Requirements: 1.1, 1.4_
  
  - [x] 5.2 Create /api/generate-music route





    - Implement POST endpoint accepting GenerateMusicRequest
    - Call MusicGen API with prompt, duration, temperature, and topK parameters
    - Store generated audio temporarily in public/audio directory
    - Return GenerateMusicResponse with audioUrl
    - _Requirements: 1.1, 1.2, 1.5_
  
  - [x] 5.3 Implement retry logic with exponential backoff
    - Create retryWithBackoff utility function
    - Configure 3 retry attempts with exponential delay
    - Log errors to console for debugging
    - _Requirements: 7.3, 7.5_
  
  - [ ] 5.4 Build music generation UI
    - Create text input component for prompts with character counter
    - Add generate button with loading state
    - Display generated audio in audio controls
    - Show error toast on API failure with retry option
    - _Requirements: 1.1, 1.3, 7.1, 7.2_

- [x] 6. Implement piano roll editor
  - [x] 6.1 Create piano roll grid component
    - Render time grid with beat divisions based on timeSignature
    - Display piano keys (7 octaves) on vertical axis
    - Implement zoom and pan controls for viewRange
    - _Requirements: 3.1, 3.5_
  
  - [x] 6.2 Implement note rendering
    - Create Note component displaying pitch, start, and duration
    - Render notes as rectangular blocks on grid
    - Implement note selection with click handling (single and multi-select)
    - _Requirements: 3.1, 3.2_
  
  - [ ] 6.3 Add note editing interactions
    - Implement drag-and-drop for note positioning with snap-to-grid
    - Add horizontal resizing for note duration (1/16th note resolution)
    - Update Zustand store on all note changes with debouncing
    - _Requirements: 3.2, 3.3, 3.4, 3.6_
  
  - [x] 6.4 Add note creation and deletion
    - Implement click-to-create notes on empty grid cells with snap-to-grid
    - Set default velocity to 100 and duration to 1 beat
    - Generate unique IDs for new notes
    - Implement delete functionality with keyboard shortcut (Delete/Backspace)
    - _Requirements: 3.1, 3.4, 3.6_

- [ ] 7. Build humming-to-melody feature
  - [ ] 7.1 Create audio recorder component
    - Implement microphone access with getUserMedia API
    - Add recording controls (start, stop) with visual feedback
    - Create waveform visualization during recording
    - Limit recording duration to configurable maximum (default 10 seconds)
    - _Requirements: 2.1_
  
  - [ ] 7.2 Implement pitch detection
    - Create /api/detect-pitch route accepting base64 audio data
    - Integrate pitch detection library (ml5.js PitchDetection or Essentia.js)
    - Convert detected frequencies to MIDI note numbers
    - Filter out notes shorter than 200ms for accuracy
    - Return Note array with pitch, start, duration, and velocity
    - _Requirements: 2.2, 2.3_
  
  - [ ] 7.3 Integrate recorder with piano roll
    - Add "Record Humming" button to UI
    - Send recorded audio to pitch detection API
    - Display detected notes in piano roll on success
    - Show error notification if detection fails with re-record option
    - _Requirements: 2.4, 2.5_

- [ ] 8. Implement AI co-pilot chat interface
  - [ ] 8.1 Create chat UI components
    - Enhance existing chat panel in MainLayout with functional message list
    - Create Message component displaying role, content, and timestamp
    - Implement ChatInput with send button and loading state
    - Add auto-scroll to latest message
    - Connect to Zustand store for conversationHistory
    - _Requirements: 4.1, 4.5_
  
  - [ ] 8.2 Create Gemini API client
    - Implement API client with Google Gemini endpoint
    - Configure gemini-pro model
    - Add timeout handling (10 seconds)
    - _Requirements: 4.1_
  
  - [ ] 8.3 Build /api/chat route
    - Implement POST endpoint accepting ChatRequest with message, sessionContext, and conversationHistory
    - Construct system prompt with current session parameters (tempo, key, noteCount, lyrics)
    - Include last 10 messages in conversation history to stay within token limits
    - Parse AI response to determine action type (edit, generate, lyrics, params, info)
    - Return ChatResponse with message and optional action
    - _Requirements: 4.1, 4.2, 4.6, 5.4_
  
  - [ ] 8.4 Implement action execution logic
    - Create parseAIResponse function to extract AIAction from response
    - Implement local MIDI edit operations (transpose, quantize, scale, delete)
    - Trigger music generation API call for generate actions
    - Apply parameter changes (tempo, key, timeSignature) to session
    - _Requirements: 4.2, 4.3, 4.4_
  
  - [ ] 8.5 Integrate chat with application state
    - Connect chat component to Zustand store
    - Update conversationHistory on each message exchange
    - Execute actions and update session state based on AI responses
    - Display action feedback in chat and via toast notifications
    - _Requirements: 4.5, 5.1, 5.2_

- [ ] 9. Build lyrics generation and synchronization
  - [ ] 9.1 Create /api/generate-lyrics route
    - Implement POST endpoint accepting GenerateLyricsRequest with optional prompt, style, and mood
    - Include sessionContext (tempo, key, mood) in Gemini prompt
    - Generate lyrics with appropriate length based on tempo and duration
    - Optionally suggest LyricsSegment timing based on syllable count
    - Return GenerateLyricsResponse with lyrics text and suggestedSegments
    - _Requirements: 8.1, 8.2, 8.4_
  
  - [ ] 9.2 Create lyrics editor component
    - Build editable text area for lyrics with character counter (max 2000)
    - Add "Generate Lyrics" button with optional prompt input
    - Display generated lyrics and allow manual editing
    - Replace placeholder in MainLayout lyrics panel
    - _Requirements: 8.3, 8.4, 8.5_
  
  - [ ] 9.3 Implement lyrics timeline synchronization
    - Create LyricsTimeline component showing segments on time axis
    - Allow users to assign startTime and endTime to segments (0.1s resolution)
    - Implement drag-to-adjust segment boundaries
    - Add automatic timing suggestion based on syllable count and tempo
    - _Requirements: 9.1, 9.2, 9.4_
  
  - [ ] 9.4 Add playback highlighting
    - Highlight current lyrics segment during audio playback
    - Sync highlighting with currentTime from playback state (max 100ms latency)
    - Implement tempo change handling to adjust timestamps proportionally
    - _Requirements: 9.3, 9.5, 9.6_

- [ ] 10. Implement audio export functionality
  - [ ] 10.1 Create audio rendering logic
    - Implement renderAudio method in AudioEngine to render MIDI notes to audio buffer
    - Mix generated audio layers with rendered MIDI
    - Apply master volume and effects
    - _Requirements: 6.1_
  
  - [ ] 10.2 Create /api/export-audio route
    - Implement POST endpoint accepting ExportAudioRequest with notes, tempo, and audioLayers
    - Render audio using Tone.js on server side or client side
    - Encode rendered audio as MP3 with 192 kbps bitrate using lamejs or similar
    - Store MP3 temporarily and return download URL
    - Generate filename with session timestamp in ISO 8601 format
    - _Requirements: 6.2, 6.3, 6.4_
  
  - [ ] 10.3 Build export UI
    - Connect "Export MP3" button in header to export functionality
    - Show loading state during export (max 5 seconds)
    - Trigger browser download on completion
    - Display error toast if export fails with retry option
    - _Requirements: 6.3, 6.5_

- [ ] 11. Implement error handling and resilience
  - [ ] 11.1 Add comprehensive error handling
    - Wrap all API calls in try-catch blocks
    - Display user-friendly error messages via toast notifications
    - Retain session state on all errors
    - Log errors to console with context for debugging
    - _Requirements: 7.1, 7.2, 7.5_
  
  - [ ] 11.2 Implement graceful degradation
    - Allow MIDI editing when MusicGen API is unavailable
    - Disable AI chat temporarily on Gemini API failure
    - Provide manual note input fallback for pitch detection failures
    - Offer WAV export as alternative if MP3 encoding fails
    - _Requirements: 7.4_
  
  - [ ] 11.3 Add environment variable validation
    - Create validateEnv function checking for required API keys
    - Display configuration error on missing variables
    - Prevent API calls when keys are missing
    - _Requirements: 10.3, 10.4_

- [ ] 12. Polish UI and user experience
  - [ ] 12.1 Improve visual design
    - Apply consistent TailwindCSS styling across all components
    - Add smooth transitions and animations for interactions
    - Ensure responsive layout works well on tablet and desktop
    - Create loading skeletons for async operations
    - _Requirements: 3.1, 3.2_
  
  - [ ] 12.2 Add keyboard shortcuts
    - Implement space bar for play/pause
    - Delete key already implemented for note deletion
    - Create undo/redo shortcuts (Ctrl+Z, Ctrl+Y)
    - _Requirements: 3.4_
  
  - [ ] 12.3 Optimize performance
    - Memoize expensive calculations (note rendering, time conversions)
    - Debounce piano roll updates to reduce re-renders
    - Lazy load Tone.js and heavy dependencies
    - Implement virtual scrolling for large note counts if needed
    - _Requirements: 3.2, 3.6_

- [ ]* 13. Testing and quality assurance
  - [ ]* 13.1 Write unit tests
    - Test MIDI utility functions (noteToFrequency, beatsToSeconds)
    - Test Zustand store actions and state updates
    - Test time conversion and validation functions
    - _Requirements: All_
  
  - [ ]* 13.2 Perform integration testing
    - Test API routes with mocked external services
    - Test component interactions with state
    - Test audio playback and export workflows
    - _Requirements: All_
  
  - [ ]* 13.3 Manual end-to-end testing
    - Test text-to-music generation with various prompts
    - Test humming-to-melody with different pitch ranges
    - Test piano roll editing (add, move, resize, delete)
    - Test AI co-pilot commands (transpose, tempo, add drums)
    - Test lyrics generation and synchronization
    - Test audio export with MIDI and generated audio
    - Test session persistence across page reloads
    - Test error handling for API failures
    - _Requirements: All_

- [ ] 14. Deployment and documentation
  - [ ] 14.1 Deploy to Vercel
    - Create Vercel project and link repository
    - Configure environment variables in Vercel dashboard
    - Set function timeout to 60 seconds for API routes
    - Test production deployment
    - _Requirements: 10.5_
  
  - [ ] 14.2 Update setup documentation
    - Update README with complete project overview and features
    - Document environment variable setup (GEMINI_API_KEY, HUGGINGFACE_API_KEY)
    - Provide local development instructions
    - Create demo script for hackathon presentation
    - _Requirements: 10.1, 10.2_
