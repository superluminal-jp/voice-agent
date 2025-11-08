# System Audio Setup Guide

This guide explains how to connect your Voice Agent with system audio from applications like Zoom, Teams, Discord, and other communication apps.

## Table of Contents

1. [Quick Start: Browser Screen Sharing](#quick-start-browser-screen-sharing)
2. [Advanced: Virtual Audio Cables](#advanced-virtual-audio-cables)
3. [Platform-Specific Setup](#platform-specific-setup)
4. [Troubleshooting](#troubleshooting)

---

## Quick Start: Browser Screen Sharing

**Best for:** Quick setup, testing, demonstrations
**Supported browsers:** Chrome, Edge (Chromium-based)

### How to Use

1. Open the Voice Agent application
2. Click **"Audio Settings"** button
3. In the **"System Audio Capture"** section, click **"Start Capture"**
4. When prompted, select:
   - **"Entire Screen"** or **"Window"**
   - ✅ **Check "Share system audio"** or "Share audio"
5. Click **"Share"**
6. You should see "Capturing system audio" status with a green indicator

### What Gets Captured

- ✅ **ALL system audio** from your computer
- ✅ Zoom, Teams, Discord, Slack calls
- ✅ Music players (Spotify, YouTube, etc.)
- ✅ Browser audio
- ⚠️ Cannot isolate specific applications

### Limitations

- Captures all system sounds (notifications, alerts, etc.)
- Not available in Firefox or Safari
- May affect screen sharing performance
- User must approve each session

---

## Advanced: Virtual Audio Cables

**Best for:** Production use, app-specific routing, better quality
**Requires:** Installing third-party software

Virtual audio cables create "virtual audio devices" that route audio between applications without capturing your screen.

### Benefits

✅ **App-specific routing** - Only capture audio from specific apps
✅ **Better quality** - No screen sharing overhead
✅ **Mix multiple sources** - Combine multiple apps
✅ **Volume control** - Adjust levels per app
✅ **Works in all browsers**

### Concept

```
Zoom/Teams → Virtual Cable (Output) → Voice Agent (Input)
Voice Agent → Virtual Cable (Output) → Zoom/Teams (Input)
```

---

## Platform-Specific Setup

### Windows

#### Option 1: VB-Audio Virtual Cable (Free)

1. **Download & Install:**
   - Visit: https://vb-audio.com/Cable/
   - Download "VBCABLE_Driver_Pack"
   - Run installer as Administrator
   - Restart your computer

2. **Configure Windows:**
   - Right-click speaker icon → "Sound settings"
   - Under "Input", find "CABLE Output"
   - Under "Output", find "CABLE Input"

3. **Setup Zoom/Teams:**
   - In Zoom/Teams audio settings:
     - **Microphone:** Set to your physical microphone (for other participants)
     - **Speaker:** Set to "CABLE Input" (to send audio to Voice Agent)

4. **Setup Voice Agent:**
   - Click "Audio Settings"
   - **Microphone:** Select "CABLE Output"
   - This captures audio from Zoom/Teams

#### Option 2: VoiceMeeter (Free, More Features)

1. **Download & Install:**
   - Visit: https://vb-audio.com/Voicemeeter/
   - Download "VoiceMeeter Banana" (recommended)
   - Install and restart

2. **Configure VoiceMeeter:**
   - Open VoiceMeeter Banana
   - **Hardware Input 1:** Your physical microphone
   - **Hardware Out A1:** Your speakers/headphones
   - **Virtual Input:** For application audio

3. **Setup Zoom/Teams:**
   - **Speaker:** "VoiceMeeter Input" (sends to VoiceMeeter)
   - **Microphone:** Your physical mic

4. **Setup Voice Agent:**
   - **Microphone:** "VoiceMeeter Output"

5. **Route Audio in VoiceMeeter:**
   - Click "A" button on Virtual Input channel to route to output
   - Adjust faders to control volume levels

### macOS

#### Option 1: BlackHole (Free, Open Source)

1. **Install via Homebrew:**
   ```bash
   brew install blackhole-2ch
   ```

   Or download from: https://existential.audio/blackhole/

2. **Create Multi-Output Device:**
   - Open "Audio MIDI Setup" (in Applications/Utilities)
   - Click "+" → "Create Multi-Output Device"
   - Check both:
     - ✅ BlackHole 2ch
     - ✅ Your speakers/headphones (e.g., "MacBook Pro Speakers")
   - Name it "Multi-Output + BlackHole"

3. **Create Aggregate Device:**
   - Click "+" → "Create Aggregate Device"
   - Check:
     - ✅ BlackHole 2ch
     - ✅ Your microphone
   - Name it "Multi-Input + BlackHole"

4. **Setup Zoom/Teams:**
   - **Microphone:** Your physical microphone
   - **Speaker:** "Multi-Output + BlackHole"

5. **Setup Voice Agent:**
   - **Microphone:** "Multi-Input + BlackHole" or "BlackHole 2ch"
   - **Speaker:** Your speakers/headphones

6. **Set System Output:**
   - In System Settings → Sound
   - **Output:** "Multi-Output + BlackHole" (so you can hear audio)

#### Option 2: Loopback (Paid, $99)

- Visit: https://rogueamoeba.com/loopback/
- Most user-friendly option for macOS
- Visual audio routing interface
- Create virtual devices with drag-and-drop

### Linux

#### PulseAudio Virtual Sink

1. **Create Virtual Sink:**
   ```bash
   pactl load-module module-null-sink sink_name=virtual_sink sink_properties=device.description="Virtual_Sink"
   ```

2. **Create Loopback from Virtual Sink to Voice Agent:**
   ```bash
   pactl load-module module-loopback source=virtual_sink.monitor sink=<voice_agent_sink>
   ```

3. **Configure Zoom/Teams:**
   - Set output device to "Virtual_Sink"

4. **Configure Voice Agent:**
   - Set input device to "Virtual_Sink Monitor"

5. **Make Permanent (Optional):**
   Add to `~/.config/pulse/default.pa`:
   ```
   load-module module-null-sink sink_name=virtual_sink sink_properties=device.description="Virtual_Sink"
   load-module module-loopback source=virtual_sink.monitor
   ```

#### Pipewire Virtual Sink

For systems using Pipewire:

```bash
pw-loopback -m '[ FL FR ]' --capture-props='media.class=Audio/Sink node.name=virtual_sink'
```

---

## Usage Scenarios

### Scenario 1: Voice Agent Listens to Zoom Call

**Setup:**
- Zoom → Virtual Cable → Voice Agent
- Voice Agent hears everything from Zoom

**Use case:** AI assistant listens to meeting, provides real-time assistance

**Configuration:**
1. Set Zoom **speaker output** to Virtual Cable Input
2. Set Voice Agent **microphone** to Virtual Cable Output
3. Speak in Zoom, Voice Agent hears and responds

### Scenario 2: Voice Agent Joins Zoom Call as Participant

**Setup:**
- Voice Agent → Virtual Cable → Zoom
- Zoom participants hear Voice Agent

**Configuration:**
1. Set Voice Agent **speaker output** to Virtual Cable Input
2. Set Zoom **microphone** to Virtual Cable Output
3. Voice Agent responses go to Zoom call

### Scenario 3: Bidirectional (Full Integration)

**Setup:**
- Zoom ↔ Virtual Cable ↔ Voice Agent
- Voice Agent hears and speaks in Zoom

**Configuration:**
1. Install 2 virtual cables (Cable A and Cable B)
2. Zoom speaker → Cable A → Voice Agent microphone
3. Voice Agent speaker → Cable B → Zoom microphone
4. This creates full two-way communication

---

## Troubleshooting

### Browser Screen Sharing: "No audio track found"

**Solution:**
- Ensure you check "Share system audio" in the browser prompt
- Try Chrome or Edge (best support)
- Firefox and Safari don't support system audio sharing

### No Audio in Voice Agent

**Check:**
1. Virtual cable is properly installed
2. Correct device selected in Voice Agent settings
3. Zoom/Teams output is set to virtual cable
4. Volume levels are not muted
5. Click "Refresh Devices" in Audio Settings

### Echo or Feedback

**Solutions:**
- Disable audio monitoring in your virtual audio software
- Use headphones instead of speakers
- Adjust gain/volume levels
- Ensure audio routing is one-way for listening scenarios

### Voice Agent Can't See Virtual Device

**Solutions:**
1. Restart your browser after installing virtual cables
2. Grant microphone permissions when prompted
3. Click "Refresh Devices" button in Audio Settings
4. Check if virtual device appears in system sound settings

### macOS: "Can't hear audio anymore"

**Solution:**
- Ensure Multi-Output device includes your speakers/headphones
- Set system output to Multi-Output device
- Check volume levels in Audio MIDI Setup

### Windows: "Driver not working"

**Solution:**
- Run installer as Administrator
- Restart computer after installation
- Check Windows Device Manager for audio devices
- Update Windows audio drivers

### Linux: "Virtual sink disappeared"

**Solution:**
- Commands only persist until reboot
- Add to PulseAudio/Pipewire config for persistence
- Check with: `pactl list sinks` (PulseAudio)

---

## Performance Tips

1. **Lower latency:** Use virtual cables instead of screen sharing
2. **Reduce CPU:** Close unnecessary audio applications
3. **Better quality:** Use 48kHz sample rate for virtual devices
4. **Avoid echo:** Use headphones or proper echo cancellation
5. **Monitor levels:** Use audio software (VoiceMeeter, Loopback) to visualize levels

---

## Security Considerations

⚠️ **Privacy Warning:**
- System audio capture records ALL audio from your computer
- Be mindful of notifications, alerts, and other apps
- Virtual cables provide better isolation for specific apps

⚠️ **Meeting Privacy:**
- Inform meeting participants if using AI assistance
- Some organizations have policies about AI in meetings
- Check terms of service for Zoom/Teams regarding bots

---

## Recommended Setup by Use Case

| Use Case | Windows | macOS | Linux |
|----------|---------|-------|-------|
| **Quick Test** | Screen Sharing | Screen Sharing | Screen Sharing |
| **Production** | VoiceMeeter | BlackHole | PulseAudio Sink |
| **Professional** | VoiceMeeter | Loopback ($) | Pipewire |
| **Simplest** | VB-Cable | BlackHole | PulseAudio Sink |

---

## Additional Resources

### Software Links

- **VB-Audio Virtual Cable:** https://vb-audio.com/Cable/
- **VoiceMeeter:** https://vb-audio.com/Voicemeeter/
- **BlackHole (macOS):** https://existential.audio/blackhole/
- **Loopback (macOS):** https://rogueamoeba.com/loopback/

### Documentation

- **Chrome Screen Sharing:** https://support.google.com/chrome/answer/9892339
- **PulseAudio Wiki:** https://www.freedesktop.org/wiki/Software/PulseAudio/
- **Pipewire Documentation:** https://docs.pipewire.org/

---

## Need Help?

If you're still having issues:

1. Check browser console (F12) for error messages
2. Verify virtual device in system sound settings
3. Test virtual device with another application first
4. Restart browser after installing audio software
5. Check permissions in browser settings

---

**Last Updated:** 2025-11-08
**Compatible with:** Chrome 90+, Edge 90+, Firefox (limited), Safari (no system audio)
