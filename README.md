# Voice AI Studio

A professional voice application powered by AssemblyAI for speech-to-text and ElevenLabs for text-to-speech. Capture microphone audio in the browser, get accurate AI transcriptions, and generate natural-sounding AI voices.

## How It Works

This app integrates two powerful AI services:

1. **AssemblyAI** - Industry-leading speech recognition with high accuracy and confidence scores
2. **ElevenLabs** - Natural-sounding AI voice generation with realistic intonation

Audio is captured in the browser and sent to these services via API routes for processing.

## Architecture

### Components

**VoiceRecorder** (`components/voice-recorder.tsx`)
- Captures audio from the user's microphone using MediaRecorder API
- Records audio in WebM format
- Sends audio to AssemblyAI API for transcription
- Displays transcription with confidence score
- Saves final transcript to activity history

**TextToSpeech** (`components/text-to-speech.tsx`)
- Takes text input and converts it to natural AI speech
- Uses ElevenLabs API to generate high-quality audio
- Plays generated audio directly in the browser
- Saves generated speech to activity history

**TranscriptHistory** (`components/transcript-history.tsx`)
- Displays chronological list of all voice recordings and speech generations
- Shows timestamps and content for each activity
- Persists data in browser localStorage

### API Routes

**AssemblyAI Transcription** (`app/api/assemblyai/transcribe/route.ts`)
- Receives audio file from client
- Uploads audio to AssemblyAI
- Polls for transcription completion
- Returns transcript text and confidence score

**ElevenLabs Text-to-Speech** (`app/api/elevenlabs/text-to-speech/route.ts`)
- Receives text from client
- Sends to ElevenLabs API for voice generation
- Returns audio file (MP3 format)
- Uses Rachel voice (high-quality default)

### Data Flow

1. **Speech-to-Text Flow:**
   - User clicks record button
   - Browser captures microphone audio
   - Audio sent to `/api/assemblyai/transcribe`
   - API uploads to AssemblyAI and polls for result
   - Transcript returned and displayed with confidence score

2. **Text-to-Speech Flow:**
   - User enters text and clicks generate
   - Text sent to `/api/elevenlabs/text-to-speech`
   - API calls ElevenLabs to generate audio
   - Audio blob returned and played in browser

3. **Activity Tracking:**
   - Completed actions saved to activity history
   - Stored in localStorage for persistence
   - Displayed in TranscriptHistory component

### State Management

- Activity history stored in React state (`useState`)
- Persisted to localStorage for data retention across sessions
- Each activity item includes: type, content, and timestamp

## Setup

### Environment Variables

You need to add two API keys to your environment variables:

1. **ASSEMBLYAI_API_KEY** - Get from [AssemblyAI Dashboard](https://www.assemblyai.com/dashboard)
2. **ELEVENLABS_API_KEY** - Get from [ElevenLabs Dashboard](https://elevenlabs.io/app/settings/api-keys)

Add these in your Vercel Project Settings or local `.env.local` file:

\`\`\`env
ASSEMBLYAI_API_KEY=your_assemblyai_key_here
ELEVENLABS_API_KEY=your_elevenlabs_key_here
\`\`\`

### Installation

\`\`\`bash
npm install
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- Real-time microphone recording
- High-accuracy AI transcription with confidence scores
- Natural AI voice generation
- Activity history with timestamps
- Persistent storage across sessions
- Real-time processing feedback

## Browser Compatibility

Requires a modern browser with:
- MediaRecorder API support (Chrome, Edge, Firefox, Safari)
- Audio playback capabilities

## API Services

- **AssemblyAI**: Speech-to-text transcription with industry-leading accuracy
- **ElevenLabs**: Natural AI voice generation with realistic intonation and emotion

## Live Link

- https://v0-mern-voice-app.vercel.app/
