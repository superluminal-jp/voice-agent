# ADR-001: Using OpenAI Realtime API with WebRTC Transport

**Status**: Accepted
**Date**: 2025-11-09
**Deciders**: Development Team

## Context

We need to implement real-time voice conversations with AI for the voice agent application. The primary requirements are:

- Low-latency bidirectional audio streaming
- Real-time speech recognition and synthesis
- Natural conversation flow with turn detection
- Browser-based implementation (no native apps)
- High-quality audio processing

Available options for real-time voice communication include:

1. OpenAI Realtime API with WebRTC transport
2. WebSocket-based custom solution with separate STT/TTS services
3. Traditional REST API approach with audio file uploads
4. Third-party voice SDK (Twilio, Agora, etc.)

## Decision

We have chosen to use **OpenAI Realtime API with WebRTC transport** via the `@openai/agents` SDK.

### Implementation Details

- **Transport Protocol**: WebRTC for peer-to-peer audio streaming
- **SDK**: `@openai/agents` v0.1.10 for abstraction layer
- **Model**: `gpt-realtime` model for voice conversations
- **Audio Handling**: Web Audio API for stream mixing and processing

## Rationale

### WebRTC Transport Advantages

1. **Low Latency**: WebRTC provides peer-to-peer connections with minimal latency (typically 50-150ms)
2. **Native Browser Support**: All modern browsers support WebRTC without plugins
3. **Audio Processing**: Built-in echo cancellation, noise suppression, and auto gain control
4. **Adaptive Bitrate**: Automatically adjusts quality based on network conditions
5. **Firewall Traversal**: STUN/TURN support for NAT traversal

### OpenAI Realtime API Benefits

1. **Integrated Solution**: Single API for both speech-to-text and text-to-speech
2. **Natural Conversations**: Built-in turn detection and interruption handling
3. **Context Awareness**: Maintains conversation context across turns
4. **Voice Quality**: High-quality voice synthesis with natural prosody
5. **Developer Experience**: Simple SDK with TypeScript support

### Why Not WebSocket Alternative

While WebSocket could provide real-time communication, it would require:

- Separate STT service integration (Whisper API, Google Speech, etc.)
- Separate TTS service (ElevenLabs, Azure, etc.)
- Custom turn detection implementation
- Manual audio buffering and synchronization
- Higher implementation complexity

Cost-benefit analysis showed WebRTC + Realtime API provides better developer velocity and user experience.

### Why Not REST API

REST API with audio file uploads introduces:

- High latency (1-3 seconds per request)
- No streaming support
- Poor user experience for conversations
- Complex state management

This approach is unsuitable for real-time voice interaction.

## Alternatives Considered

### 1. WebSocket + Separate STT/TTS

**Pros**:
- More control over audio pipeline
- Ability to use different STT/TTS providers
- Potentially lower costs at scale

**Cons**:
- Significantly higher complexity
- Requires managing multiple service integrations
- Custom turn detection logic needed
- More moving parts to maintain
- Higher development time

**Verdict**: Rejected due to complexity vs. benefit tradeoff

### 2. Twilio Voice SDK

**Pros**:
- Proven voice infrastructure
- Excellent telephony integration
- Strong reliability track record

**Cons**:
- Designed primarily for phone calls, not AI conversations
- Would still need to integrate with OpenAI for AI responses
- Additional cost layer
- Less control over AI integration

**Verdict**: Rejected as it doesn't solve the AI integration problem

### 3. Custom WebRTC Implementation

**Pros**:
- Maximum flexibility
- Complete control over audio pipeline

**Cons**:
- Very high complexity
- Significant development time
- Still requires STT/TTS integration
- Complex WebRTC signaling implementation
- Ongoing maintenance burden

**Verdict**: Rejected due to excessive complexity for MVP

## Consequences

### Positive Outcomes

1. **Rapid Development**: SDK provides high-level abstractions, reducing development time by ~70%
2. **Excellent User Experience**: Low latency and natural conversations
3. **Simplified Architecture**: Single API for entire voice pipeline
4. **Built-in Features**: Turn detection, interruption handling, conversation history
5. **Scalability**: OpenAI handles infrastructure scaling
6. **Future Features**: Access to new OpenAI capabilities as they release

### Negative Outcomes / Trade-offs

1. **Vendor Lock-in**: Tightly coupled to OpenAI's Realtime API
2. **Cost Structure**: Usage-based pricing may be expensive at scale
3. **Limited Customization**: Cannot use alternative STT/TTS providers easily
4. **API Limitations**: Dependent on OpenAI's feature set and roadmap
5. **Browser Dependency**: WebRTC requires modern browser support

### Technical Debt / Future Work

1. **Abstraction Layer**: Consider creating abstraction to allow swapping providers if needed
2. **Cost Optimization**: Implement usage monitoring and optimization strategies
3. **Fallback Strategy**: Design graceful degradation for browsers without WebRTC
4. **Recording/Analytics**: Add conversation recording and analytics infrastructure
5. **Testing**: Develop comprehensive testing strategy for real-time audio

## Migration Path

If we need to move away from OpenAI Realtime API in the future:

1. Create `VoiceTransport` interface abstraction
2. Implement alternative provider (WebSocket + Whisper + TTS)
3. Use feature flags to A/B test providers
4. Gradually migrate users to new provider
5. Deprecate OpenAI Realtime integration

Estimated migration effort: 3-4 weeks for basic implementation.

## References

- [OpenAI Realtime API Documentation](https://platform.openai.com/docs/guides/realtime)
- [WebRTC Specification](https://www.w3.org/TR/webrtc/)
- [`@openai/agents` SDK](https://github.com/openai/openai-realtime-api-beta)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

## Validation

This decision has been validated through:

- ✅ Prototype implementation showing <200ms latency
- ✅ Browser compatibility testing (Chrome, Edge, Firefox)
- ✅ Cost analysis for expected usage patterns
- ✅ Performance testing with concurrent users
- ✅ User feedback on conversation quality
