/**
 * useAudioDevices Hook
 * 
 * Manages audio device enumeration and selection.
 */

import { useState, useEffect, useCallback } from "react";
import { enumerateAudioDevices } from "@/lib/audio-utils";
import type { AudioDevices } from "@/types/voice-agent";

export function useAudioDevices() {
  const [devices, setDevices] = useState<AudioDevices>({
    microphones: [],
    speakers: [],
  });
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>("");
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDevices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { microphones, speakers } = await enumerateAudioDevices();
      setDevices({ microphones, speakers });

      // Set default selections if not already set
      if (!selectedMicrophone && microphones.length > 0) {
        setSelectedMicrophone(microphones[0].deviceId);
      }
      if (!selectedSpeaker && speakers.length > 0) {
        setSelectedSpeaker(speakers[0].deviceId);
      }
    } catch (err) {
      console.error("Error enumerating audio devices:", err);
      setError(
        "Failed to access audio devices. Please check your microphone permissions."
      );
    } finally {
      setIsLoading(false);
    }
  }, [selectedMicrophone, selectedSpeaker]);

  // Load devices on mount
  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  return {
    devices,
    selectedMicrophone,
    selectedSpeaker,
    isLoading,
    error,
    setSelectedMicrophone,
    setSelectedSpeaker,
    refreshDevices: loadDevices,
  };
}

