/**
 * useAudioLevel Hook
 * 
 * Monitors audio input level in real-time using AnalyserNode.
 */

import { useState, useEffect, useRef } from "react";

export function useAudioLevel(audioStream: MediaStream | null) {
  const [audioLevel, setAudioLevel] = useState(0); // 0-100
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!audioStream) {
      setAudioLevel(0);
      return;
    }

    // Check if stream has active tracks
    const audioTracks = audioStream.getAudioTracks();
    if (audioTracks.length === 0) {
      console.warn("[useAudioLevel] No audio tracks in stream");
      setAudioLevel(0);
      return;
    }

    const activeTracks = audioTracks.filter(
      (track) => track.readyState === "live" && track.enabled
    );
    if (activeTracks.length === 0) {
      console.warn("[useAudioLevel] No active audio tracks in stream");
      setAudioLevel(0);
      return;
    }

    try {
      // Create audio context and analyser
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256; // Smaller FFT size for faster updates
      analyser.smoothingTimeConstant = 0.8; // Smooth the values

      // Connect audio stream to analyser
      const source = audioContext.createMediaStreamSource(audioStream);
      source.connect(analyser);

      analyserRef.current = analyser;
      audioContextRef.current = audioContext;

      console.log("[useAudioLevel] Audio level monitoring started");

      // Start monitoring audio level
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateAudioLevel = () => {
        if (!analyserRef.current) return;

        // Get time domain data (waveform)
        analyserRef.current.getByteTimeDomainData(dataArray);

        // Calculate RMS (Root Mean Square) for volume level
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const normalized = (dataArray[i] - 128) / 128;
          sum += normalized * normalized;
        }
        const rms = Math.sqrt(sum / dataArray.length);

        // Convert to 0-100 scale
        // RMS is typically 0-1, but we amplify it for better visibility
        const level = Math.min(100, Math.max(0, rms * 200));

        setAudioLevel(level);

        animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
      };

      updateAudioLevel();
    } catch (error) {
      console.error("[useAudioLevel] Error setting up audio level monitoring:", error);
      setAudioLevel(0);
    }

    return () => {
      // Cleanup
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
      }
      analyserRef.current = null;
      audioContextRef.current = null;
      setAudioLevel(0);
    };
  }, [audioStream]);

  return audioLevel;
}

