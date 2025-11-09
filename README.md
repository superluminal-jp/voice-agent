# GPT Realtime Voice Agent

A minimalistic web interface for OpenAI's GPT Realtime API, featuring real-time voice conversations with AI using WebRTC transport.

## Features

- 🎤 **Real-time Voice Conversations** - Natural voice interaction with AI using OpenAI Realtime API
- 🔒 **Client-side API Key Management** - Direct ephemeral token generation
- 📝 **Live Transcript** - Real-time conversation display with history
- 🎨 **Modern UI** - Built with shadcn/ui and Tailwind CSS
- 🌙 **Dark Mode Support** - Automatic theme switching with next-themes
- 📱 **Responsive Design** - Works on desktop and mobile
- ⚙️ **Customizable System Prompts** - Edit AI behavior and personality with live updates
- 🗑️ **Conversation Management** - Clear history and toggle visibility
- 🔊 **System Audio Capture** - Capture audio from Zoom, Teams, and other apps via browser screen sharing
- 🎚️ **Audio Device Selection** - Choose microphone and speaker devices
- 🎯 **Multiple Input Modes** - Always On, Push-to-Talk, and Toggle modes
- 🎚️ **VAD Configuration** - Adjustable voice activity detection sensitivity
- 🔇 **Feedback Loop Prevention** - Automatic system audio muting during AI speech
- 📊 **Audio Level Monitoring** - Visual feedback for microphone input levels

## Tech Stack

- **Next.js 15.5.6** - React framework with App Router
- **React 19.1.0** - Latest React with concurrent features
- **TypeScript 5** - Type-safe development
- **Tailwind CSS v4** - Utility-first styling
- **shadcn/ui** - Accessible UI components
- **OpenAI Agents SDK v0.1.10** - Realtime API integration
- **Radix UI** - Headless UI primitives
- **Lucide React** - Beautiful icons

## Setup

### 1. Environment Configuration

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
```

**Note:** This implementation uses client-side API key management for development/testing purposes. For production, consider implementing server-side token generation for enhanced security.

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Usage

1. **Connect** - Click the "Connect" button to start a voice session
2. **Speak** - The AI will listen and respond in real-time
3. **View Transcript** - See the conversation history in the transcript panel
4. **Customize Behavior** - Click "System Prompt" to edit the AI's personality and instructions
5. **Manage History** - Toggle conversation visibility and clear history as needed
6. **Disconnect** - Click "Disconnect" to end the session

### Input Modes

- **Always On** - Continuous listening with automatic voice activity detection (VAD)
- **Push-to-Talk** - Hold Space key to transmit your voice
- **Toggle** - Press Space key to toggle microphone on/off

### System Audio Integration

Capture audio from apps like Zoom, Teams, Discord, and more:

1. Click "Audio Settings" button
2. In "System Audio Capture" section, click "Start Capture"
3. When prompted, select your screen/window and **check "Share system audio"**
4. The Voice Agent will now capture all system audio

**Note**: System audio capture uses browser screen sharing. For app-specific audio routing, you can use virtual audio cables (VB-Cable, BlackHole, Loopback, etc.) and select them as your microphone input device.

## Architecture

### Client-Side Implementation

- Direct API key management for development/testing
- Ephemeral tokens generated client-side using OpenAI's API
- Real-time audio processing with WebRTC
- Live transcript updates with conversation history
- Connection state management with error handling
- Customizable system prompts with live updates

### UI Components

- **Card** - Main container with gradient background
- **Button** - Connect/disconnect with loading states
- **Badge** - Connection status indicator
- **ScrollArea** - Transcript display with auto-scroll
- **Dialog** - System prompt editor with tips
- **Alert** - Error messages and notifications
- **Textarea** - Multi-line system prompt input

### Key Features

- **Type Safety** - Full TypeScript coverage with strict mode
- **Error Handling** - Comprehensive error recovery and user feedback
- **Accessibility** - ARIA labels, keyboard navigation, screen reader support
- **Performance** - Optimized re-renders and memory management
- **Security** - Client-side API key management (development mode)

## Development

### Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── VoiceAgent.tsx                    # Main voice agent component
│   │   └── voice-agent/
│   │       ├── AudioLevelIndicator.tsx       # Audio level visualization
│   │       ├── ConnectionStatus.tsx          # Connection status and controls
│   │       ├── ConversationHistory.tsx       # Conversation transcript display
│   │       ├── ErrorAlert.tsx                # Error message display
│   │       └── PreConnectionOnboarding.tsx   # Pre-connection onboarding UI
│   ├── layout.tsx                            # App layout and metadata
│   ├── page.tsx                              # Home page
│   └── globals.css                           # Global styles
├── components/
│   ├── ui/                                   # shadcn/ui components
│   │   ├── alert.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── progress.tsx
│   │   ├── scroll-area.tsx
│   │   ├── select.tsx
│   │   └── textarea.tsx
│   ├── theme-provider.tsx                    # Theme provider for dark mode
│   └── theme-toggle.tsx                      # Theme toggle component
├── hooks/
│   ├── useAudioDevices.ts                    # Audio device enumeration
│   ├── useAudioLevel.ts                      # Audio level monitoring
│   ├── usePTT.ts                             # Push-to-Talk keyboard handling
│   └── useSystemAudio.ts                     # System audio capture
├── lib/
│   ├── audio-utils.ts                        # Audio mixing and utilities
│   ├── realtime-api.ts                       # OpenAI Realtime API utilities
│   ├── vad-config.ts                         # VAD configuration presets
│   └── utils.ts                              # Utility functions (cn helper)
└── types/
    └── voice-agent.ts                        # TypeScript type definitions
```

### Key Implementation Details

- **Real-time Communication** - Uses OpenAI's Realtime API with WebRTC transport
- **Audio Processing** - Web Audio API for mixing microphone and system audio streams
- **Push-to-Talk** - Dual-layer control (GainNode + MediaStreamTrack.enabled) for reliable PTT
- **Feedback Prevention** - Automatic system audio muting during AI speech to prevent feedback loops
- **Conversation Management** - Full conversation history with role-based display
- **System Prompt Customization** - Live editing of AI behavior and personality
- **VAD Configuration** - Configurable voice activity detection with multiple presets
- **Error Recovery** - Comprehensive error handling with user-friendly messages
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Component Architecture** - Modular UI components with shadcn/ui and custom hooks

## Deployment

### Environment Variables

Ensure your production environment has:

```bash
NEXT_PUBLIC_OPENAI_API_KEY=your_production_openai_api_key
```

**Security Note:** For production deployments, consider implementing server-side token generation to avoid exposing API keys in client-side code.

### Build and Deploy

```bash
npm run build
npm start
```

## License

MIT License - see LICENSE file for details.
