# MusePilot Frontend

This is the Next.js frontend application for MusePilot.

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `app/` - Next.js 14 app directory with pages and API routes
- `components/` - React components
- `src/` - Source code including audio engine, hooks, store, and types
- `lib/` - Utility functions

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the required values.

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Tone.js (audio synthesis)
- Zustand (state management)
