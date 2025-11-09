# Developer Guide

Complete guide for developers working on the Voice Agent project.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Project Structure](#project-structure)
3. [Development Workflow](#development-workflow)
4. [Code Architecture](#code-architecture)
5. [Testing](#testing)
6. [Debugging](#debugging)
7. [Common Tasks](#common-tasks)
8. [Code Style](#code-style)
9. [Contributing](#contributing)

## Getting Started

### Prerequisites

- **Node.js**: v18.17.0 or later
- **npm**: v9.0.0 or later (comes with Node.js)
- **OpenAI API Key**: Required for Realtime API access
- **Modern Browser**: Chrome 90+, Edge 90+, or Firefox 88+

### Initial Setup

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd voice-agent
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create `.env.local` in project root:
   ```bash
   NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
   ```

   **Security Note**: Never commit `.env.local` to version control.

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open Application**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Verification

Test that everything works:

1. Click "Connect" button
2. Grant microphone permissions
3. Speak into microphone
4. Verify AI responds

If successful, you're ready to develop!

## Project Structure

```
voice-agent/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── VoiceAgent.tsx                    # Main voice agent component
│   │   │   └── voice-agent/
│   │   │       ├── AudioLevelIndicator.tsx       # Audio level visualization
│   │   │       ├── ConnectionStatus.tsx          # Connection status and controls
│   │   │       ├── ConversationHistory.tsx       # Conversation transcript display
│   │   │       ├── ErrorAlert.tsx                # Error message display
│   │   │       └── PreConnectionOnboarding.tsx   # Pre-connection onboarding UI
│   │   ├── layout.tsx                            # App layout and metadata
│   │   ├── page.tsx                              # Home page
│   │   └── globals.css                           # Global styles
│   ├── components/
│   │   ├── ui/                                   # shadcn/ui components
│   │   │   ├── alert.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── select.tsx
│   │   │   └── textarea.tsx
│   │   ├── theme-provider.tsx                    # Theme provider for dark mode
│   │   └── theme-toggle.tsx                      # Theme toggle component
│   ├── hooks/
│   │   ├── useAudioDevices.ts                    # Audio device enumeration
│   │   ├── useAudioLevel.ts                      # Audio level monitoring
│   │   ├── usePTT.ts                             # Push-to-Talk keyboard handling
│   │   └── useSystemAudio.ts                     # System audio capture
│   ├── lib/
│   │   ├── audio-utils.ts                        # Audio mixing and utilities
│   │   ├── realtime-api.ts                       # OpenAI Realtime API utilities
│   │   ├── vad-config.ts                         # VAD configuration presets
│   │   └── utils.ts                              # Utility functions (cn helper)
│   └── types/
│       └── voice-agent.ts                        # TypeScript type definitions
├── docs/                             # Documentation
│   ├── adr/                          # Architecture Decision Records
│   ├── api/                          # API documentation
│   └── features/                     # Feature guides
├── public/                           # Static assets
├── .env.local                        # Environment variables (not in git)
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # TypeScript configuration
├── next.config.ts                    # Next.js configuration
├── tailwind.config.ts                # Tailwind CSS configuration
└── README.md                         # Project overview
```

### Key Files

| File | Purpose |
|------|---------|
| `VoiceAgent.tsx` | Core voice agent implementation (~993 lines) |
| `ConnectionStatus.tsx` | Connection status display and controls |
| `ConversationHistory.tsx` | Conversation transcript display component |
| `useAudioDevices.ts` | Hook for audio device enumeration |
| `useSystemAudio.ts` | Hook for system audio capture via screen sharing |
| `usePTT.ts` | Hook for Push-to-Talk keyboard handling |
| `useAudioLevel.ts` | Hook for audio level monitoring |
| `audio-utils.ts` | Audio mixing and utility functions |
| `realtime-api.ts` | OpenAI Realtime API utilities |
| `vad-config.ts` | VAD configuration presets |
| `utils.ts` | Tailwind class merging utility |
| `layout.tsx` | App shell, metadata, fonts |
| `page.tsx` | Home page with VoiceAgent component |
| `globals.css` | Tailwind directives and custom styles |

## Development Workflow

### Daily Development

1. **Pull Latest Changes**
   ```bash
   git pull origin main
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Start Dev Server**
   ```bash
   npm run dev
   ```

4. **Make Changes**
   - Edit code in `src/`
   - Hot reload updates automatically
   - Check browser console for errors

5. **Test Locally**
   - Manual testing in browser
   - Check all input modes work
   - Test system audio if applicable

6. **Commit Changes**
   ```bash
   git add .
   git commit -m "Add feature: your feature description"
   ```

7. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Building for Production

```bash
npm run build
```

This creates an optimized production build in `.next/` directory.

### Running Production Build Locally

```bash
npm run build
npm start
```

Navigate to [http://localhost:3000](http://localhost:3000) to test production build.

## Code Architecture

### Component Architecture

The Voice Agent follows a single-component architecture with clear separation of concerns:

```
VoiceAgent Component
├── State Management (useState hooks)
├── Audio Processing (useRef for audio nodes)
├── Session Management (OpenAI Realtime API)
├── Event Handlers (keyboard, audio, session)
└── UI Rendering (JSX with shadcn/ui)
```

### State Management

**React Hooks Used**:

```typescript
// Connection state
const [isConnected, setIsConnected] = useState(false);
const [isConnecting, setIsConnecting] = useState(false);
const [error, setError] = useState<string | null>(null);

// Conversation state
const [conversationHistory, setConversationHistory] = useState<RealtimeItem[]>([]);
const [systemPrompt, setSystemPrompt] = useState("You are a helpful assistant.");

// Audio state
const [audioDevices, setAudioDevices] = useState<{...}>({...});
const [selectedMicrophone, setSelectedMicrophone] = useState<string>("");
const [systemAudioEnabled, setSystemAudioEnabled] = useState(false);

// Input control state
const [inputMode, setInputMode] = useState<InputMode>("always_on");
const [vadMode, setVadMode] = useState<VadMode>("conservative");
const [isPTTActive, setIsPTTActive] = useState(false);
const [isAISpeaking, setIsAISpeaking] = useState(false);
```

**Ref Usage** (for values that don't trigger re-renders):

```typescript
const sessionRef = useRef<RealtimeSession | null>(null);
const audioContextRef = useRef<AudioContext | null>(null);
const micGainRef = useRef<GainNode | null>(null);
const systemAudioGainRef = useRef<GainNode | null>(null);
```

### Key Functions

#### `connect()`

Establishes connection to OpenAI Realtime API.

**Flow**:
1. Generate ephemeral API key
2. Create agent with system prompt
3. Get microphone stream
4. Mix with system audio (if enabled)
5. Create WebRTC transport
6. Initialize session with VAD config
7. Register event listeners
8. Update UI state

**Parameters**: None

**Returns**: `Promise<void>`

**Side Effects**: Updates multiple state variables

#### `disconnect()`

Closes session and cleans up resources.

**Flow**:
1. Close session
2. Stop all media streams
3. Close audio context
4. Clear refs
5. Reset UI state

**Parameters**: None

**Returns**: `Promise<void>`

#### `mixAudioStreams()`

Combines microphone and system audio into single stream.

**Parameters**:
- `micStream: MediaStream` - Microphone input
- `sysStream: MediaStream | null` - System audio (optional)

**Returns**: `Promise<MediaStream>` - Mixed output stream

**Implementation**: Uses Web Audio API graph

#### `captureSystemAudio()`

Captures system audio via screen sharing.

**Parameters**: None

**Returns**: `Promise<void>`

**Side Effects**: Updates `systemAudioStream` and `systemAudioEnabled`

**Error Handling**: Sets descriptive error messages for various failure modes

#### `enumerateAudioDevices()`

Lists available audio input/output devices.

**Parameters**: None

**Returns**: `Promise<void>`

**Side Effects**: Updates `audioDevices`, `selectedMicrophone`, `selectedSpeaker`

### Event Handling

#### Keyboard Events

```typescript
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.code !== "Space") return;
  if (isTyping(event.target)) return;
  event.preventDefault();

  if (inputMode === "push_to_talk" && !isPTTActive) {
    setIsPTTActive(true);
  } else if (inputMode === "toggle" && !event.repeat) {
    setIsPTTActive(!isPTTActive);
  }
};
```

#### Session Events

```typescript
session.on("history_updated", (history: RealtimeItem[]) => {
  setConversationHistory(history);
  scrollToBottom();
});

session.on("audio_start", () => {
  setIsAISpeaking(true);
  systemAudioGainRef.current.gain.value = 0; // Feedback prevention
});

session.on("audio_stopped", () => {
  setIsAISpeaking(false);
  systemAudioGainRef.current.gain.value = 0.7;
});
```

### Audio Graph Architecture

```
Microphone
    │
    ▼
[Media Stream Source]
    │
    ▼
[Gain Node] ◄─── PTT Control (0 or 1.0)
    │
    ▼
    │         System Audio
    │              │
    │              ▼
    │         [Media Stream Source]
    │              │
    │              ▼
    │         [Gain Node] ◄─── Feedback Prevention (0 or 0.7)
    │              │
    └──────────────┘
           │
           ▼
    [Destination]
           │
           ▼
    [Mixed Stream] → WebRTC → OpenAI API
```

## Testing

### Manual Testing Checklist

#### Basic Functionality

- [ ] Application loads without errors
- [ ] Connect button works
- [ ] Microphone permission requested
- [ ] Connection established successfully
- [ ] Can speak and AI responds
- [ ] Conversation history updates
- [ ] Disconnect works properly

#### Audio Settings

- [ ] Audio Settings dialog opens
- [ ] Microphone devices listed
- [ ] Speaker devices listed
- [ ] Can select different devices
- [ ] Refresh devices button works

#### Input Modes

- [ ] Always On mode works
- [ ] Push-to-Talk activates on Space
- [ ] Push-to-Talk deactivates on release
- [ ] Toggle activates on first Space press
- [ ] Toggle deactivates on second press
- [ ] Space ignored in text fields

#### VAD Settings

- [ ] Conservative mode works (semantic VAD)
- [ ] Balanced mode works (800ms)
- [ ] Responsive mode works (500ms)
- [ ] VAD disabled in PTT/Toggle modes

#### System Audio

- [ ] System audio capture initiates
- [ ] Permission dialog shown
- [ ] Audio track captured
- [ ] Mixed with microphone
- [ ] Feedback prevention active during AI speech

#### System Prompt

- [ ] System prompt dialog opens
- [ ] Can edit prompt
- [ ] Prompt updates when saved
- [ ] Agent behavior changes accordingly

#### Error Handling

- [ ] API key missing error shown
- [ ] Mic permission denied error shown
- [ ] Connection failure error shown
- [ ] System audio errors handled gracefully

### Browser Compatibility Testing

Test on:
- ✅ Chrome 90+ (macOS, Windows, Linux)
- ✅ Edge 90+ (Windows)
- ✅ Firefox 88+ (limited system audio support)
- ❌ Safari (system audio not supported)

### Automated Testing

**Current Status**: No automated tests yet

**Future Enhancement**:
- Unit tests for utility functions
- Integration tests for API interactions
- E2E tests with Playwright
- Visual regression tests

**Recommended Tools**:
- Jest for unit tests
- React Testing Library for component tests
- Playwright for E2E tests
- Mock Service Worker for API mocking

## Debugging

### Browser Console

Always have browser console open during development:

**Chrome**: `Cmd+Option+J` (Mac) or `Ctrl+Shift+J` (Windows/Linux)

**Useful Console Commands**:

```javascript
// Check session state
console.log(sessionRef.current);

// Check audio context
console.log(audioContextRef.current);

// Check gain nodes
console.log(micGainRef.current?.gain.value);
console.log(systemAudioGainRef.current?.gain.value);
```

### Common Issues

#### Issue: Hot Reload Not Working

**Solution**:
```bash
# Kill dev server
# Clear .next cache
rm -rf .next
# Restart
npm run dev
```

#### Issue: TypeScript Errors

**Solution**:
```bash
# Check TypeScript compilation
npx tsc --noEmit

# Check specific file
npx tsc --noEmit src/app/components/VoiceAgent.tsx
```

#### Issue: Audio Not Working

**Check**:
1. Browser console for errors
2. Microphone permissions granted
3. Correct device selected
4. Audio context not suspended (Chrome autoplay policy)

**Resume Audio Context**:
```javascript
if (audioContext.state === "suspended") {
  await audioContext.resume();
}
```

#### Issue: OpenAI API Errors

**Check**:
1. API key is valid
2. API key has credits
3. Network connectivity
4. Browser console for detailed error

**Debug Ephemeral Key Generation**:
```typescript
try {
  const key = await generateEphemeralKey();
  console.log("Key generated:", key.substring(0, 10) + "...");
} catch (error) {
  console.error("Key generation failed:", error);
}
```

### Logging

Add strategic logging for debugging:

```typescript
// Connection flow
console.log("[Connect] Starting connection...");
console.log("[Connect] Ephemeral key generated");
console.log("[Connect] Agent created");
console.log("[Connect] Transport created");
console.log("[Connect] Session initialized");
console.log("[Connect] Connected!");

// PTT control
console.log("[PTT] Activated - space key pressed");
console.log("[PTT] Deactivated - space key released");
console.log("[PTT] Toggled - now active/inactive");
console.log("[PTT Control] Audio tracks enabled/disabled (mode: ${inputMode}, PTT: ${isPTTActive})");
console.log("[PTT] Initialized with tracks disabled for PTT/Toggle mode");

// Feedback prevention
console.log("[Feedback Prevention] AI started speaking");
console.log("[Feedback Prevention] AI stopped speaking");
console.log("[Feedback Prevention] AI interrupted");
```

### Performance Profiling

**React DevTools**:
1. Install React DevTools browser extension
2. Open React DevTools
3. Go to "Profiler" tab
4. Start recording
5. Perform actions
6. Stop recording
7. Analyze component re-renders

**Chrome Performance**:
1. Open Chrome DevTools
2. Go to "Performance" tab
3. Click record
4. Perform actions
5. Stop recording
6. Analyze flamegraph for bottlenecks

## Common Tasks

### Adding a New VAD Preset

1. **Update VAD_PRESETS constant**:
```typescript
const VAD_PRESETS = {
  // ... existing presets
  my_custom_preset: {
    type: "server_vad" as const,
    threshold: 0.55,
    silence_duration_ms: 600,
    prefix_padding_ms: 300,
  },
};
```

2. **Update VadMode type**:
```typescript
type VadMode = "conservative" | "balanced" | "responsive" | "my_custom_preset";
```

3. **Add to UI dropdown**:
```tsx
<SelectItem value="my_custom_preset">
  My Custom Preset
</SelectItem>
```

### Adding a New Input Mode

1. **Update InputMode type**:
```typescript
type InputMode = "always_on" | "push_to_talk" | "toggle" | "my_mode";
```

2. **Handle in keyboard events (use useCallback)**:
```typescript
const handleKeyDown = useCallback(
  (event: KeyboardEvent) => {
    // ... existing code
    if (inputMode === "my_mode") {
      // Implement your mode logic
      setIsPTTActive((prev) => {
        // Use functional updates for state
        return /* your logic */;
      });
    }
  },
  [inputMode, isConnected] // Include all dependencies
);
```

3. **Update dual-layer control logic**:
```typescript
useEffect(() => {
  if (!isConnected) return;

  // Layer 1: GainNode control
  if (micGainRef.current) {
    if (inputMode === "my_mode") {
      micGainRef.current.gain.value = /* your logic */;
    }
  }

  // Layer 2: Track.enabled control
  if (finalAudioStreamRef.current) {
    const audioTracks = finalAudioStreamRef.current.getAudioTracks();
    audioTracks.forEach((track) => {
      if (inputMode === "my_mode") {
        track.enabled = /* your logic */;
      }
    });
  }
}, [inputMode, isPTTActive, isConnected]);
```

4. **Update VAD configuration**:
```typescript
config: {
  audio: {
    input: {
      ...(inputMode === "always_on" && {
        turnDetection: VAD_PRESETS[vadMode],
      }),
      // Add your mode's VAD config if needed
    },
  },
}
```

5. **Add to UI**:
```tsx
<SelectItem value="my_mode">
  My Mode
</SelectItem>
```

6. **Update connection initialization**:
```typescript
// In connect() function, after session.connect()
if (inputMode === "my_mode" && finalAudioStreamRef.current) {
  const audioTracks = finalAudioStreamRef.current.getAudioTracks();
  audioTracks.forEach((track) => {
    track.enabled = /* initial state */;
  });
}
```

### Changing System Audio Default Volume

Current default is 70% (`0.7`). To change:

```typescript
// In mixAudioStreams()
sysGain.gain.value = 0.8; // Change to 80%

// In feedback prevention restore
systemAudioGainRef.current.gain.value = 0.8; // Must match
```

### Adding Custom System Prompt Presets

1. **Create presets object**:
```typescript
const SYSTEM_PROMPT_PRESETS = {
  default: "You are a helpful assistant.",
  professional: "You are a professional business assistant...",
  casual: "You're a friendly conversational AI...",
  technical: "You are a technical expert in software development...",
};
```

2. **Add preset selector to UI**:
```tsx
<Select value={selectedPreset} onValueChange={setSelectedPreset}>
  {Object.entries(SYSTEM_PROMPT_PRESETS).map(([key, prompt]) => (
    <SelectItem key={key} value={key}>
      {key}
    </SelectItem>
  ))}
</Select>
```

3. **Apply preset**:
```typescript
const applyPreset = (presetKey: string) => {
  const prompt = SYSTEM_PROMPT_PRESETS[presetKey];
  setSystemPrompt(prompt);
  setTempPrompt(prompt);
};
```

### Styling with Tailwind

The project uses **Tailwind CSS v4**. Example patterns:

```tsx
// Standard spacing
<div className="p-4 space-y-6">

// Conditional classes with cn() utility
<Badge className={cn(
  "gap-1",
  isPTTActive ? "bg-blue-600" : "bg-gray-200"
)}>

// Responsive design
<div className="flex flex-col md:flex-row gap-4">

// Dark mode (if implemented)
<div className="bg-white dark:bg-gray-800">
```

## Code Style

### TypeScript

- **Strict mode enabled**: No implicit `any`
- **Explicit types**: For function parameters and returns
- **Interfaces over types**: For object shapes
- **Const assertions**: For readonly objects

```typescript
// Good
const config: AudioConfig = {
  echoCancellation: true,
};

function connect(): Promise<void> {
  // ...
}

// Avoid
const config = {
  echoCancellation: true,
}; // Implicit type

function connect() {
  // ... implicit return type
}
```

### React

- **Functional components**: No class components
- **Hooks**: For state and side effects
- **TypeScript**: All components typed
- **Props destructuring**: At function signature
- **useCallback for event handlers**: Memoize handlers to prevent unnecessary re-renders
- **Functional state updates**: Use `setState((prev) => ...)` when state depends on previous value

```typescript
// Good
export default function VoiceAgent() {
  const [state, setState] = useState<string>("");
  
  // Memoize event handlers with useCallback
  const handleClick = useCallback(() => {
    setState((prev) => prev + "clicked");
  }, []); // Empty deps if handler doesn't depend on props/state
  
  // Include dependencies when handler uses them
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (someState) {
        // Use functional updates for state that depends on previous value
        setState((prev) => {
          // Always use latest state
          return prev + event.key;
        });
      }
    },
    [someState] // Include all dependencies
  );
  
  // ...
}

// For components with props
interface MyComponentProps {
  title: string;
  onClose: () => void;
}

function MyComponent({ title, onClose }: MyComponentProps) {
  // ...
}
```

### Naming Conventions

- **Components**: PascalCase (`VoiceAgent`, `AudioSettings`)
- **Functions**: camelCase (`connect`, `handleKeyDown`)
- **Constants**: UPPER_SNAKE_CASE (`VAD_PRESETS`)
- **Types/Interfaces**: PascalCase (`VadMode`, `InputMode`)
- **State variables**: camelCase with `is/has` prefix for booleans

```typescript
const [isConnected, setIsConnected] = useState(false);
const [hasPermission, setHasPermission] = useState(false);
const [userName, setUserName] = useState("");
```

### Comments

- **JSDoc**: For all exported functions
- **Inline**: For complex logic explanation
- **TODO**: For future enhancements

```typescript
/**
 * Mixes microphone and system audio streams using Web Audio API
 *
 * @param micStream - Microphone input stream
 * @param sysStream - System audio stream (optional)
 * @returns Promise resolving to mixed audio stream
 */
const mixAudioStreams = async (
  micStream: MediaStream,
  sysStream: MediaStream | null
): Promise<MediaStream> => {
  // Implementation...
};

// TODO: Add volume normalization
// TODO: Support more than 2 audio sources
```

### File Organization

```typescript
// 1. Imports
import { useState } from "react";
import { Button } from "@/components/ui/button";

// 2. Types
type VadMode = "conservative" | "balanced" | "responsive";

// 3. Constants
const VAD_PRESETS = { /* ... */ };

// 4. Component
export default function VoiceAgent() {
  // 4a. State
  const [state, setState] = useState();

  // 4b. Refs
  const ref = useRef();

  // 4c. Functions
  const connect = async () => { /* ... */ };

  // 4d. Effects
  useEffect(() => { /* ... */ }, []);

  // 4e. Render
  return <div>...</div>;
}
```

## Contributing

### Pull Request Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make Changes**
   - Follow code style guidelines
   - Add JSDoc comments
   - Update documentation if needed

3. **Test Thoroughly**
   - Manual testing
   - Check browser console for errors
   - Test on multiple browsers if applicable

4. **Commit**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

   **Commit Message Format**:
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `style:` Code style changes (formatting)
   - `refactor:` Code refactoring
   - `test:` Adding tests
   - `chore:` Maintenance tasks

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature
   ```

   - Provide clear PR description
   - Reference related issues
   - Add screenshots/videos if UI changes

### Code Review Checklist

**Reviewers should check**:

- [ ] Code follows style guidelines
- [ ] TypeScript types are correct
- [ ] No console.log statements (except strategic logging)
- [ ] Error handling is comprehensive
- [ ] No hardcoded values (use constants)
- [ ] Documentation updated if needed
- [ ] Changes tested manually
- [ ] No breaking changes without discussion

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [OpenAI Realtime API](https://platform.openai.com/docs/guides/realtime)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [WebRTC](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
