/**
 * Voice Agent Type Definitions
 * 
 * Centralized type definitions for the Voice Agent application.
 */

export type VadMode = "conservative" | "balanced" | "responsive";

export type InputMode = "always_on" | "push_to_talk" | "toggle";

export interface AudioDevices {
  microphones: MediaDeviceInfo[];
  speakers: MediaDeviceInfo[];
}

export interface AudioDeviceState {
  devices: AudioDevices;
  selectedMicrophone: string;
  selectedSpeaker: string;
  isLoading: boolean;
}

export interface SystemAudioState {
  enabled: boolean;
  stream: MediaStream | null;
}

export interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

export interface ConversationState {
  history: any[]; // RealtimeItem[] from @openai/agents/realtime
  showHistory: boolean;
}

export interface InputControlState {
  inputMode: InputMode;
  vadMode: VadMode;
  isPTTActive: boolean;
  isListening: boolean;
  isAISpeaking: boolean;
}

