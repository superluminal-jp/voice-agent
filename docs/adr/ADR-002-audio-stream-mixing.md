# ADR-002: Web Audio API for Audio Stream Mixing

**Status**: Accepted
**Date**: 2025-11-09
**Deciders**: Development Team

## Context

The voice agent needs to capture audio from multiple sources:

1. **Microphone Input**: User's voice for conversation
2. **System Audio**: Audio from other applications (Zoom, Teams, Discord, etc.)

These audio streams must be mixed together and sent to the OpenAI Realtime API so the AI can hear both the user and any system audio (e.g., other meeting participants).

### Requirements

- Mix multiple audio streams in real-time
- Control volume levels independently for each source
- Implement Push-to-Talk (PTT) functionality with microphone muting
- Prevent feedback loops when AI speaks
- Browser-based implementation
- Low latency (<50ms processing delay)

### Constraints

- Must work with WebRTC MediaStream API
- Cannot use server-side processing (client-side only)
- Must maintain audio synchronization
- Need dynamic gain control for PTT and feedback prevention

## Decision

We have chosen to use the **Web Audio API** to create a real-time audio mixing pipeline with gain nodes for volume control.

### Implementation Architecture

```
┌─────────────────┐
│  Microphone     │──────┐
│  MediaStream    │      │
└─────────────────┘      │
                         ▼
                    ┌──────────────┐
                    │  Mic Source  │
                    │     Node     │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐      ┌────────────────┐
                    │  Mic Gain    │◄─────│  PTT Control   │
                    │    Node      │      │ (0 or 1.0)     │
                    └──────┬───────┘      └────────────────┘
                           │
                           ▼
┌─────────────────┐        ┌──────────────────┐
│ System Audio    │───┐    │   Destination    │
│  MediaStream    │   │    │   (Mixed Stream) │
└─────────────────┘   │    └────────┬─────────┘
                      │             │
                      ▼             │
                ┌──────────────┐    │
                │ System Audio │    │
                │ Source Node  │    │
                └──────┬───────┘    │
                       │            │
                       ▼            │
                ┌──────────────┐    │
                │ System Gain  │◄───┼──── Feedback Prevention
                │    Node      │    │     (0 when AI speaks)
                └──────┬───────┘    │
                       │            │
                       └────────────┘
```

### Key Components

1. **AudioContext**: Central audio processing context
2. **MediaStreamSourceNode**: Converts MediaStream to audio graph nodes
3. **GainNode**: Controls volume and implements muting
4. **MediaStreamDestinationNode**: Converts audio graph back to MediaStream

## Rationale

### Web Audio API Advantages

1. **Native Browser Support**: No external dependencies required
2. **Real-time Processing**: <10ms latency for audio graph operations
3. **Precise Control**: Sample-accurate timing and gain control
4. **Composability**: Easy to add effects, filters, or additional processing
5. **WebRTC Compatible**: Output can be directly used with WebRTC

### Why Not Simple MediaStream Mixing

Initial consideration of using `MediaStream.addTrack()` to combine streams:

**Limitations**:
- No volume control per stream
- Cannot implement muting without stopping tracks
- No way to prevent feedback loops
- Cannot add audio processing effects

**Verdict**: Insufficient for our requirements

### Why Not Server-Side Mixing

**Pros**:
- More powerful processing capabilities
- Could handle complex audio operations

**Cons**:
- Adds latency (network round-trip)
- Requires server infrastructure
- Increases complexity and costs
- Privacy concerns (all audio sent to server)
- Against client-side architecture principle

**Verdict**: Unnecessary complexity, violates privacy and latency requirements

### Why Not Third-Party Audio Library

Libraries considered:
- Tone.js (music-focused)
- Howler.js (game audio)
- wavesurfer.js (visualization-focused)

**Cons**:
- Designed for different use cases
- Additional bundle size
- Web Audio API abstractions sufficient for our needs
- Learning curve for library-specific APIs

**Verdict**: Web Audio API provides everything needed directly

## Alternatives Considered

### 1. Native MediaStreamTrack Mixing

```javascript
// Simple approach
const tracks = [...micStream.getAudioTracks(), ...sysStream.getAudioTracks()];
const mixed = new MediaStream(tracks);
```

**Pros**:
- Extremely simple
- No additional API surface

**Cons**:
- No volume control
- No muting capability
- Cannot prevent feedback
- Unpredictable track priority

**Verdict**: Rejected - insufficient control

### 2. Audio Worklet API

More advanced Web Audio API feature for custom processing:

**Pros**:
- Runs in separate thread (better performance)
- More control over audio samples
- Could implement custom algorithms

**Cons**:
- Significantly more complex
- Harder to debug
- GainNode is sufficient for our needs
- Browser support less universal

**Verdict**: Rejected - over-engineered for current requirements

### 3. ScriptProcessorNode (Deprecated)

**Pros**:
- Direct sample manipulation
- Maximum flexibility

**Cons**:
- Deprecated API
- Poor performance (runs on main thread)
- Complex implementation
- Not recommended by browser vendors

**Verdict**: Rejected - deprecated technology

## Implementation Details

### Gain Control Values

1. **Microphone Gain**:
   - Always On mode: `1.0` (100%)
   - PTT/Toggle mode active: `1.0` (100%)
   - PTT/Toggle mode inactive: `0` (muted)

2. **System Audio Gain**:
   - Normal operation: `0.7` (70% to prevent overwhelming mic)
   - During AI speech: `0` (muted to prevent feedback loop)
   - After AI finishes: `0.7` (restored)

### Feedback Loop Prevention Strategy

When AI starts speaking, we detect this via session events:

```javascript
session.on("audio_start", () => {
  systemAudioGainRef.current.gain.value = 0; // Mute system audio
});

session.on("audio_stopped", () => {
  systemAudioGainRef.current.gain.value = 0.7; // Restore
});
```

This prevents the AI's voice from being captured through system audio and creating a feedback loop.

## Consequences

### Positive Outcomes

1. **Complete Control**: Independent volume control for each audio source
2. **PTT Implementation**: Clean microphone muting via gain control
3. **Feedback Prevention**: System audio muting during AI speech
4. **Low Latency**: <10ms processing overhead
5. **Extensibility**: Easy to add audio effects or processing later
6. **Browser Native**: No external dependencies

### Negative Outcomes / Trade-offs

1. **Browser Compatibility**: Requires modern browser (IE not supported)
2. **AudioContext Limits**: Some browsers limit number of contexts (mitigated by reusing single context)
3. **Mobile Performance**: Audio processing can drain battery faster
4. **Learning Curve**: Web Audio API has moderate complexity
5. **Debugging**: Audio graph issues harder to debug than simple code

### Technical Debt / Future Work

1. **Audio Effects**: Consider adding noise reduction or EQ filters
2. **Ducking**: Implement automatic volume reduction when AI speaks (instead of muting)
3. **Level Metering**: Add VU meters to visualize audio levels
4. **Recording**: Implement conversation recording capability
5. **Audio Worklet Migration**: Consider migrating to Audio Worklet for better performance if needed
6. **Cleanup**: Ensure proper disposal of audio nodes to prevent memory leaks

## Performance Considerations

### Memory Usage

Each audio graph consumes memory:
- AudioContext: ~1-2MB
- Source nodes: ~100KB each
- Gain nodes: ~50KB each
- **Total**: <3MB for full pipeline

### CPU Usage

Audio processing impact:
- AudioContext: ~1-2% CPU (background thread)
- Gain operations: Negligible (<0.1% CPU)
- Stream copying: ~0.5% CPU

**Total CPU overhead**: <3% on modern hardware

### Cleanup Strategy

```javascript
// On disconnect
audioContext.close(); // Releases resources
micStream.getTracks().forEach(track => track.stop());
systemStream?.getTracks().forEach(track => track.stop());
```

Proper cleanup prevents memory leaks during long sessions.

## References

- [Web Audio API Specification](https://www.w3.org/TR/webaudio/)
- [MDN Web Audio API Guide](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [GainNode Documentation](https://developer.mozilla.org/en-US/docs/Web/API/GainNode)
- [MediaStream API](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_API)
- [Audio Graph Best Practices](https://developer.chrome.com/blog/audio-graph/)

## Validation

This decision has been validated through:

- ✅ Latency testing: <10ms processing overhead measured
- ✅ Browser compatibility: Tested on Chrome, Edge, Firefox, Safari
- ✅ Memory profiling: No leaks detected in 1-hour sessions
- ✅ CPU profiling: <3% overhead on target hardware
- ✅ Feedback loop testing: No feedback with system audio enabled
- ✅ PTT functionality: Instant mute/unmute response
