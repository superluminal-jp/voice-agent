/**
 * Audio Utilities
 * 
 * Helper functions for audio device management and system audio capture.
 */

/**
 * Check browser compatibility for system audio capture
 */
export function checkSystemAudioSupport(): {
  supported: boolean;
  reason?: string;
} {
  // Check if getDisplayMedia is available
  if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
    return {
      supported: false,
      reason: "Your browser doesn't support screen sharing.",
    };
  }

  // Check browser type
  const userAgent = navigator.userAgent.toLowerCase();
  const isChrome = userAgent.includes("chrome") && !userAgent.includes("edg");
  const isEdge = userAgent.includes("edg");
  const isFirefox = userAgent.includes("firefox");
  const isSafari =
    userAgent.includes("safari") && !userAgent.includes("chrome");

  if (isSafari) {
    return {
      supported: false,
      reason:
        "Safari doesn't support system audio capture. Please use Chrome, Edge, or Firefox.",
    };
  }

  if (isFirefox) {
    return {
      supported: true,
      reason:
        "Firefox has limited support. If it doesn't work, try Chrome or Edge.",
    };
  }

  return { supported: true };
}

/**
 * Enumerate audio devices (microphones and speakers)
 */
export async function enumerateAudioDevices(): Promise<{
  microphones: MediaDeviceInfo[];
  speakers: MediaDeviceInfo[];
}> {
  // Request microphone permission first
  await navigator.mediaDevices.getUserMedia({ audio: true });

  const devices = await navigator.mediaDevices.enumerateDevices();
  const microphones = devices.filter(
    (device) => device.kind === "audioinput"
  );
  const speakers = devices.filter((device) => device.kind === "audiooutput");

  return { microphones, speakers };
}

/**
 * Mix microphone and system audio streams
 */
export async function mixAudioStreams(
  micStream: MediaStream,
  sysStream: MediaStream | null
): Promise<{
  stream: MediaStream;
  audioContext: AudioContext;
  micGain: GainNode;
  systemAudioGain: GainNode;
}> {
  if (!sysStream) {
    // Create a minimal audio context for consistency
    const audioContext = new AudioContext();
    const micSource = audioContext.createMediaStreamSource(micStream);
    const destination = audioContext.createMediaStreamDestination();
    const micGain = audioContext.createGain();
    micGain.gain.value = 1.0;
    micSource.connect(micGain);
    micGain.connect(destination);

    return {
      stream: destination.stream,
      audioContext,
      micGain,
      systemAudioGain: audioContext.createGain(), // Dummy gain node
    };
  }

  try {
    // Create audio context
    const audioContext = new AudioContext();

    // Create source nodes
    const micSource = audioContext.createMediaStreamSource(micStream);
    const sysSource = audioContext.createMediaStreamSource(sysStream);

    // Create destination
    const destination = audioContext.createMediaStreamDestination();

    // Create gain nodes for volume control
    const micGain = audioContext.createGain();
    const sysGain = audioContext.createGain();

    // Set gain values
    micGain.gain.value = 1.0; // Microphone at 100%
    sysGain.gain.value = 0.7; // System audio at 70%

    // Connect the audio graph
    micSource.connect(micGain);
    sysSource.connect(sysGain);
    micGain.connect(destination);
    sysGain.connect(destination);

    console.log("Audio streams mixed successfully");
    return {
      stream: destination.stream,
      audioContext,
      micGain,
      systemAudioGain: sysGain,
    };
  } catch (error) {
    console.error("Error mixing audio streams:", error);
    // Fallback to mic stream only
    const audioContext = new AudioContext();
    const micSource = audioContext.createMediaStreamSource(micStream);
    const destination = audioContext.createMediaStreamDestination();
    const micGain = audioContext.createGain();
    micGain.gain.value = 1.0;
    micSource.connect(micGain);
    micGain.connect(destination);

    return {
      stream: destination.stream,
      audioContext,
      micGain,
      systemAudioGain: audioContext.createGain(),
    };
  }
}

