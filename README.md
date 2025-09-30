# MERN Voice App

A browser-based voice application that uses the Web Speech API for speech recognition and text-to-speech synthesis. No API keys or backend services required - everything runs directly in your browser.

## How It Works

This app leverages two native browser APIs:

1. **Web Speech Recognition API** - Converts spoken words into text
2. **Web Speech Synthesis API** - Converts text into spoken audio

All processing happens client-side, making it fast, free, and private.

## Architecture

### Components

**VoiceRecorder** (`components/voice-recorder.tsx`)
- Captures audio from the user's microphone
- Uses `SpeechRecognition` API to transcribe speech in real-time
- Shows interim results as you speak
- Saves final transcript to activity history when recording stops

**TextToSpeech** (`components/text-to-speech.tsx`)
- Takes text input and converts it to speech
- Uses `SpeechSynthesis` API to generate audio
- Allows voice selection from available system voices
- Saves generated speech to activity history

**TranscriptHistory** (`components/transcript-history.tsx`)
- Displays chronological list of all voice recordings and speech generations
- Shows timestamps and content for each activity
- Persists data in browser localStorage

### Data Flow

1. User interacts with VoiceRecorder or TextToSpeech component
2. Component processes the input using Web Speech API
3. On completion, component calls callback function passed from parent
4. Parent page (`app/page.tsx`) updates activity state
5. Activity is saved to localStorage and passed to TranscriptHistory
6. TranscriptHistory renders the updated activity list

### State Management

- Activity history stored in React state (`useState`)
- Persisted to localStorage for data retention across sessions
- Each activity item includes: type, content, and timestamp

## Browser Compatibility

Requires a modern browser with Web Speech API support:
- Chrome/Edge (full support)
- Safari (full support)
- Firefox (limited support for speech recognition)

## Features

- Real-time speech-to-text transcription
- Text-to-speech with voice selection
- Activity history with timestamps
- Persistent storage across sessions
- No API keys or external services needed
- Completely free and private
