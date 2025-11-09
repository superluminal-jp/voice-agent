# Push-to-Talk (PTT) Feature

Comprehensive guide to using and configuring Push-to-Talk mode in the Voice Agent.

## Table of Contents

1. [Overview](#overview)
2. [Input Modes](#input-modes)
3. [How to Use](#how-to-use)
4. [Configuration](#configuration)
5. [Visual Feedback](#visual-feedback)
6. [Keyboard Shortcuts](#keyboard-shortcuts)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

## Overview

The Voice Agent supports three input modes to accommodate different use cases and user preferences:

1. **Always On** - Automatic voice detection (hands-free)
2. **Push-to-Talk (PTT)** - Hold Space to transmit (walkie-talkie style)
3. **Toggle** - Press Space to start/stop transmission (toggle switch)

Push-to-Talk gives you manual control over when your microphone transmits, preventing unwanted activations and providing privacy control.

**Technical Note**: The implementation uses a dual-layer control mechanism (GainNode + MediaStreamTrack.enabled) to ensure maximum reliability and instant response when activating/deactivating transmission.

## Input Modes

### Always On Mode

**Description**: Traditional hands-free mode with automatic Voice Activity Detection (VAD).

**How it Works**:
- Microphone is always listening
- AI automatically detects when you start/stop speaking
- AI responds when it detects you've finished
- No manual control required

**Best For**:
- ✅ Quiet environments
- ✅ One-on-one conversations
- ✅ Hands-free operation needed
- ✅ Natural conversation flow

**Limitations**:
- ⚠️ Background noise can trigger unwanted responses
- ⚠️ May interrupt during natural pauses
- ⚠️ Less privacy control

### Push-to-Talk (PTT) Mode

**Description**: Hold the Space key to transmit, release to stop.

**How it Works**:
- Microphone is muted by default
- Hold Space key to activate microphone
- Speak while holding Space
- Release Space to mute microphone
- AI processes your speech and responds

**Best For**:
- ✅ Noisy environments
- ✅ Privacy-conscious usage
- ✅ Professional/enterprise settings
- ✅ Maximum transmission control
- ✅ Multi-speaker scenarios (system audio)

**Limitations**:
- ⚠️ Requires hand on keyboard
- ⚠️ Not suitable for long transmissions
- ⚠️ Not available on mobile (currently)

**Visual Indicators**:
- Gray "Hold Space" badge when inactive
- Blue "Transmitting" badge when active

### Toggle Mode

**Description**: Press Space once to start transmitting, press again to stop.

**How it Works**:
- Microphone starts muted
- Press Space to activate microphone
- Speak (hands-free during transmission)
- Press Space again to mute microphone
- AI processes your speech and responds

**Best For**:
- ✅ Long transmissions or dictation
- ✅ Hands-free during transmission
- ✅ Balance between control and convenience
- ✅ Meeting note-taking

**Limitations**:
- ⚠️ Easy to forget mic is active
- ⚠️ Requires manual deactivation

**Visual Indicators**:
- Gray "Press Space" badge when inactive
- Blue "Active" badge when transmitting

## How to Use

### Setting Up PTT

1. **Open Audio Settings**
   - Click the "Audio Settings" button in the Voice Agent interface
   - Or use the settings icon in the header

2. **Select Input Mode**
   - Scroll to the "Input Mode" section
   - Choose your preferred mode:
     - "Always On (Auto VAD)" - Default hands-free
     - "Push to Talk (Space Key)" - Hold to transmit
     - "Toggle (Space Key)" - Press to start/stop

3. **Important**: Set mode **before** connecting
   - Input mode cannot be changed during an active session
   - If already connected, disconnect first
   - Change mode, then reconnect

### Using Push-to-Talk

1. **Connect** to the Voice Agent
   - Click "Connect" button
   - Grant microphone permissions if prompted
   - Wait for "Connected" status

2. **Activate PTT**
   - **Hold** the Space key
   - Watch for blue "Transmitting" badge
   - Speak your message

3. **Release to Stop**
   - **Release** the Space key when finished
   - Badge changes back to "Hold Space"
   - AI processes and responds

### Using Toggle Mode

1. **Connect** to the Voice Agent

2. **Start Transmission**
   - **Press** Space key once
   - Badge changes to blue "Active"
   - Microphone is now active

3. **Speak**
   - Speak normally (hands-free)
   - Microphone remains active

4. **Stop Transmission**
   - **Press** Space key again
   - Badge changes to gray "Press Space"
   - AI processes and responds

## Configuration

### Changing Input Mode

**Via UI**:
1. Click "Audio Settings"
2. Find "Input Mode" dropdown
3. Select desired mode
4. Note warning if already connected

**Programmatically** (for developers):
```typescript
const [inputMode, setInputMode] = useState<InputMode>("always_on");

// Change mode (only when disconnected)
if (!isConnected) {
  setInputMode("push_to_talk"); // or "toggle" or "always_on"
}
```

### VAD Configuration with PTT

When using PTT or Toggle mode:
- **VAD is automatically disabled**
- No automatic turn detection
- You control when transmission starts/stops
- VAD settings have no effect

When using Always On mode:
- **VAD is active**
- Choose sensitivity: Conservative, Balanced, or Responsive
- AI automatically detects when you finish speaking

### Mode Persistence

Currently, input mode is **not persisted** across sessions.

**Future Enhancement**: Save preference to localStorage for automatic restore.

## Visual Feedback

### Connection States

| State | Badge | Color | Meaning |
|-------|-------|-------|---------|
| Disconnected | "Disconnected" | Gray outline | Not connected |
| Connecting | "Connecting..." | Gray | Connection in progress |
| Connected | "Connected" | Blue/Green | Active session |

### PTT States (Push-to-Talk Mode)

| State | Badge | Color | Meaning |
|-------|-------|-------|---------|
| Inactive | "Hold Space" | Gray outline | Mic muted, waiting for Space key |
| Active | "Transmitting" | Blue | Mic active, transmitting audio |

### Toggle States (Toggle Mode)

| State | Badge | Color | Meaning |
|-------|-------|-------|---------|
| Inactive | "Press Space" | Gray outline | Mic muted |
| Active | "Active" | Blue | Mic active, transmitting |

### Additional Indicators

| Indicator | Badge | Meaning |
|-----------|-------|---------|
| VAD Detection | "Listening..." | AI detected you started speaking (Always On only) |
| AI Speaking | "AI Speaking" | AI is generating response |
| System Audio | "System Audio Active" | System audio capture enabled |

## Keyboard Shortcuts

### Space Key Behavior

| Input Mode | Action | Effect |
|------------|--------|--------|
| Always On | Press Space | Scrolls page (normal browser behavior) |
| Push-to-Talk | Hold Space | Activates microphone while held |
| Push-to-Talk | Release Space | Mutes microphone |
| Toggle | Press Space | Toggles microphone on/off |

### Protected Contexts

Space key is **ignored** when typing in:
- Text input fields (`<input>`)
- Text areas (`<textarea>`)
- Content-editable elements

This prevents PTT activation while composing text.

### Connection Instructions

When you connect, the interface shows mode-specific instructions:

- **Always On**: "The agent will automatically detect when you start and stop speaking."
- **Push-to-Talk**: "Hold the Space key to transmit. Release to stop."
- **Toggle**: "Press Space to start/stop transmission."

These instructions update automatically based on your selected input mode.

### Preventing Default Behavior

When PTT/Toggle is active and you press Space:
- Default page scroll is **prevented**
- Space is captured for PTT control
- Prevents annoying page jumping

## Best Practices

### When to Use Each Mode

#### Use Always On When:
- Working in a quiet environment
- Having natural back-and-forth conversations
- Hands-free operation is essential
- Privacy is not a primary concern

#### Use Push-to-Talk When:
- Working in a noisy office or public space
- System audio captures other speakers (Zoom/Teams)
- Privacy is important (control exactly when mic is active)
- Professional enterprise setting
- Maximum control is desired

#### Use Toggle When:
- Giving long explanations or dictation
- Want control but not continuous hand on keyboard
- Taking meeting notes
- Alternating between talking and pausing

### Tips for Effective PTT Usage

1. **Brief Hold Before Speaking**
   - Hold Space for ~0.5 seconds before starting
   - Ensures audio capture starts cleanly
   - Prevents cutting off first syllable

2. **Release After Finishing**
   - Release immediately when done speaking
   - Prevents capturing background noise
   - Faster AI response

3. **Use Headphones**
   - Especially when system audio is enabled
   - Prevents audio feedback
   - Better audio quality

4. **Visual Feedback**
   - Watch the badge indicator
   - Confirm "Transmitting" before speaking
   - Ensures mic is actually active

5. **Toggle for Long Speeches**
   - Use Toggle mode for extended talking
   - Avoid hand fatigue from holding Space
   - Still maintains transmission control

### Combining with System Audio

When capturing system audio (Zoom, Teams):

**Recommended**: Push-to-Talk or Toggle mode

**Why**:
- Prevents AI from responding to other speakers
- Gives you control over when AI is listening
- Avoids confusion when multiple people talk

**Example Flow**:
1. Zoom call in progress
2. System audio captures all participants
3. You want to ask AI a question
4. Hold Space (PTT) or Press Space (Toggle)
5. Ask: "AI, summarize what Sarah just said"
6. Release Space
7. AI hears only your question, not ongoing Zoom conversation

## Troubleshooting

### Issue: Space key doesn't activate PTT

**Check**:
1. ✅ Input mode set to "Push to Talk" or "Toggle"
2. ✅ Connected to Voice Agent (not disconnected)
3. ✅ Not typing in a text field
4. ✅ Browser window has focus

**Solution**:
- Ensure you've selected PTT/Toggle mode before connecting
- Click on the page to give it focus
- Check console for JavaScript errors

### Issue: PTT activates while typing

**This should not happen** - protected contexts ignore Space key.

**If it does**:
- Report as a bug
- Workaround: Disconnect while typing

### Issue: Microphone stays muted

**Push-to-Talk**:
- Ensure you're **holding** Space (not just pressing)
- Check "Transmitting" badge appears

**Toggle**:
- Press Space once to activate
- Check "Active" badge appears
- Press again to deactivate

**Both Modes**:
- Check browser microphone permissions granted
- Try disconnecting and reconnecting
- Check Audio Settings shows correct microphone

### Issue: Can't change input mode

**Reason**: Input mode locked during active session

**Solution**:
1. Click "Disconnect"
2. Change input mode in Audio Settings
3. Click "Connect" again

### Issue: AI doesn't respond after PTT

**Check**:
1. You released Space key (PTT mode)
2. AI heard you (check conversation history)
3. No network errors (check console)
4. Session still connected

**Solution**:
- Wait a few seconds for processing
- Check conversation history for your message
- If message didn't appear, try transmitting again

### Issue: PTT cuts off my speech

**Symptoms**:
- First word missing
- AI didn't hear complete sentence

**Solution**:
1. Hold Space **before** speaking (~0.5s early)
2. Keep holding **after** finishing (~0.5s extra)
3. Check microphone volume levels
4. Ensure stable network connection

### Issue: Hand fatigue from holding Space

**Solution**:
- Switch to Toggle mode for long transmissions
- Consider Always On mode if environment permits
- Take breaks between long sessions

**Future Enhancement**: Support for foot pedal USB devices

## Advanced Usage

### Multiple Conversations

When switching between different conversations:
1. Disconnect from current session
2. (Optional) Change input mode if needed
3. Update system prompt for new context
4. Reconnect

### Integration with System Audio

**Scenario**: AI assistant listens to Zoom call

1. **Setup**:
   - Enable system audio capture
   - Set input mode to Push-to-Talk
   - Connect to Voice Agent

2. **Usage**:
   - Zoom call proceeds normally
   - When you want AI assistance:
     - Hold Space
     - Ask question
     - Release Space
   - AI responds without interfering with Zoom

3. **Benefits**:
   - AI only listens when you activate
   - Zoom participants unaffected
   - Full control over AI interaction

### Meeting Note-Taking

**Scenario**: Take notes during meeting

1. **Setup**:
   - Set input mode to Toggle
   - System prompt: "You are a note-taking assistant"
   - Connect

2. **Usage**:
   - Press Space to start dictation
   - Speak notes naturally (hands-free)
   - Press Space to stop
   - AI transcribes and organizes

3. **Benefits**:
   - Hands-free during dictation
   - Manual control over recording periods
   - Clean separation of notes from ambient sound

## Mobile Support

**Current Status**: Space key not available on mobile devices

**Workarounds**:
- Use Always On mode on mobile
- Wait for on-screen PTT button (future enhancement)

**Future Enhancement**:
- On-screen button for PTT activation
- Hold/tap gesture support
- Volume button PTT (platform-dependent)

## Accessibility

### Keyboard-Only Navigation

- Space key is large and easy to find
- Works without mouse/pointer
- Visual feedback confirms activation

### Screen Reader Support

- Badge state changes announced
- Connection status read aloud
- Input mode selection labeled

### Motor Impairments

**Challenge**: Holding Space key may be difficult

**Solutions**:
- Use Toggle mode instead (single press)
- Use Always On mode (no keyboard needed)
- Future: Foot pedal or switch support

### Visual Impairments

- High-contrast badges for state indication
- Screen reader announcements
- Audio feedback (future enhancement)

## Future Enhancements

Planned improvements to PTT feature:

1. **Customizable Hotkeys**: Let users choose activation key
2. **Foot Pedal Support**: USB foot pedal for hands-free PTT
3. **On-Screen Button**: Mobile touch button for PTT
4. **Audio Feedback**: Beep when PTT activates/deactivates
5. **Haptic Feedback**: Vibration on mobile devices
6. **Hold-to-Toggle**: Long press for toggle, short press for PTT
7. **Voice Level Indicator**: Visual waveform during transmission
8. **Mode Persistence**: Remember preferred mode across sessions

## Related Documentation

- [VAD Configuration](./voice-activity-detection.md) - Configure Always On sensitivity
- [System Audio Setup](../SYSTEM_AUDIO_SETUP.md) - Capture audio from apps
- [Audio Settings](./audio-settings.md) - Complete audio configuration guide
- [ADR-003: Push-to-Talk Implementation](../adr/ADR-003-push-to-talk-implementation.md) - Technical decision rationale
