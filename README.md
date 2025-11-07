# MusePilot

AI-powered music generation platform built with Next.js 14, TypeScript, and TailwindCSS.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Add your API keys to `.env.local`:
- `GEMINI_API_KEY`: Your Google Gemini API key
- `HUGGINGFACE_API_KEY`: Your Hugging Face API key

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Tone.js (Audio synthesis)
- Zustand (State management)
- Google Gemini API
- Hugging Face API
