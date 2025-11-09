/**
 * usePTT Hook
 * 
 * Manages Push-to-Talk (PTT) functionality with keyboard controls.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import type { InputMode } from "@/types/voice-agent";

export function usePTT(inputMode: InputMode, isConnected: boolean) {
  const [isPTTActive, setIsPTTActive] = useState(false);
  const micGainRef = useRef<GainNode | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Only handle space key
      if (event.code !== "Space") return;

      // Ignore if user is typing in an input field
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Prevent default space behavior (page scroll)
      event.preventDefault();

      if (inputMode === "push_to_talk") {
        // PTT mode: activate while key is held
        if (isConnected) {
          setIsPTTActive((prev) => {
            if (!prev) {
              console.log("[PTT] Activated - space key pressed");
              return true;
            }
            return prev;
          });
        }
      } else if (inputMode === "toggle") {
        // Toggle mode: switch on first press (ignore repeats)
        if (!event.repeat && isConnected) {
          setIsPTTActive((prev) => {
            const newState = !prev;
            console.log(
              `[PTT] Toggled - now ${newState ? "active" : "inactive"}`
            );
            return newState;
          });
        }
      }
    },
    [inputMode, isConnected]
  );

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      if (event.code !== "Space") return;

      if (inputMode === "push_to_talk") {
        // PTT mode: deactivate when key is released
        setIsPTTActive((prev) => {
          if (prev) {
            console.log("[PTT] Deactivated - space key released");
            return false;
          }
          return prev;
        });
      }
    },
    [inputMode]
  );

  // Register keyboard event listeners
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Control microphone input based on PTT state
  useEffect(() => {
    if (!isConnected) return;

    // Control via gain node (for mixed audio scenarios)
    if (micGainRef.current) {
      if (inputMode === "always_on") {
        // Always on mode: mic always enabled
        micGainRef.current.gain.value = 1.0;
      } else {
        // PTT or Toggle mode: mic enabled only when PTT is active
        micGainRef.current.gain.value = isPTTActive ? 1.0 : 0;
      }
    }

    // Control audio tracks directly (more reliable for stopping transmission)
    if (audioStreamRef.current) {
      const audioTracks = audioStreamRef.current.getAudioTracks();
      audioTracks.forEach((track) => {
        if (inputMode === "always_on") {
          track.enabled = true;
        } else {
          // PTT or Toggle mode: enable track only when PTT is active
          track.enabled = isPTTActive;
        }
      });
      console.log(
        `[PTT Control] Audio tracks ${
          isPTTActive || inputMode === "always_on" ? "enabled" : "disabled"
        } (mode: ${inputMode}, PTT: ${isPTTActive})`
      );
    }
  }, [isPTTActive, inputMode, isConnected]);

  return {
    isPTTActive,
    setIsPTTActive,
    micGainRef,
    audioStreamRef,
  };
}

