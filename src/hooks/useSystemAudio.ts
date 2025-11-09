/**
 * useSystemAudio Hook
 * 
 * Manages system audio capture via screen sharing.
 */

import { useState, useCallback } from "react";
import { checkSystemAudioSupport } from "@/lib/audio-utils";

export function useSystemAudio() {
  const [enabled, setEnabled] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const capture = useCallback(async () => {
    // Clear any previous errors
    setError(null);

    // Check browser compatibility
    const compatibility = checkSystemAudioSupport();
    if (!compatibility.supported) {
      setError(compatibility.reason || "Browser not supported");
      return;
    }

    try {
      // Request screen sharing with audio
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } as any,
      });

      // Extract only the audio track
      const audioTrack = displayStream.getAudioTracks()[0];

      // Stop the video track as we only need audio
      displayStream.getVideoTracks().forEach((track) => track.stop());

      if (!audioTrack) {
        console.warn(
          "No audio track found. User may not have checked 'Share system audio'."
        );

        setError(
          "No system audio detected. Please try again and make sure to:\n" +
            "1. Check the 'Share system audio' or 'Share tab audio' checkbox\n" +
            "2. Select a tab/window that's actually playing audio\n" +
            (compatibility.reason ? `\n${compatibility.reason}` : "")
        );

        setEnabled(false);
        return;
      }

      // Create a new stream with only audio
      const audioStream = new MediaStream([audioTrack]);
      setStream(audioStream);
      setEnabled(true);

      // Clear any error messages on success
      setError(null);

      // Listen for when the user stops sharing
      audioTrack.onended = () => {
        setEnabled(false);
        setStream(null);
        console.log("System audio capture stopped");
      };

      console.log("System audio captured successfully");
    } catch (err) {
      console.error("Error capturing system audio:", err);

      // Provide specific error messages based on the error type
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          setError(
            "Permission denied. Please allow screen sharing to capture system audio."
          );
        } else if (err.name === "NotFoundError") {
          setError(
            "No screen sharing source found. Please try again and select a screen or window."
          );
        } else if (err.name === "NotSupportedError") {
          setError(
            "System audio capture is not supported by your browser. " +
              (compatibility.reason ||
                "Try using Chrome or Edge for best results.")
          );
        } else {
          setError(
            `Failed to capture system audio: ${err.message}\n\n` +
              "Tips:\n" +
              "• Make sure to check 'Share system audio' in the dialog\n" +
              "• Select a tab/window that's playing audio\n" +
              "• Try Chrome or Edge for best compatibility"
          );
        }
      } else {
        setError(
          "Failed to capture system audio. Make sure to check 'Share system audio' when selecting the screen."
        );
      }

      setEnabled(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setEnabled(false);
    setError(null);
  }, [stream]);

  return {
    enabled,
    stream,
    error,
    capture,
    stop,
  };
}

