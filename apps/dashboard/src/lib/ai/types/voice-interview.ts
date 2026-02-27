// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY OS — Voice Interview Types (Eleven Labs Integration)
// ═══════════════════════════════════════════════════════════════════════════

export type VoiceProvider = 'elevenlabs';

export interface VoiceConfig {
  provider: VoiceProvider;
  voiceId: string;
  modelId: string;
  stability: number; // 0-1
  similarityBoost: number; // 0-1
  style: number; // 0-1
  speakerBoost: boolean;
}

export interface VoiceInterviewSession {
  id: string;
  applicationId: string;
  mode: 'voice' | 'text' | 'hybrid';
  voiceConfig: VoiceConfig;
  status: 'waiting' | 'connected' | 'active' | 'paused' | 'completed' | 'error';
  currentSection: string;
  startedAt: string;
  duration: number; // seconds
  transcript: VoiceTranscriptEntry[];
  signals: { type: string; content: string; dimension: string; impact: number }[];
}

export interface VoiceTranscriptEntry {
  role: 'agent' | 'founder';
  content: string;
  audioUrl?: string;
  timestamp: number; // ms from session start
  duration: number; // ms of utterance
  confidence: number; // STT confidence 0-1
  emotionalTone?: 'confident' | 'uncertain' | 'passionate' | 'defensive' | 'neutral';
  speakingRate?: number; // words per minute
  pauseBefore?: number; // ms of silence before speaking
}

export interface VoiceInterviewConfig {
  defaultVoice: VoiceConfig;
  maxSessionDuration: number; // minutes
  silenceTimeout: number; // seconds before prompting
  autoTranscribe: boolean;
  recordAudio: boolean;
  enableEmotionDetection: boolean;
}

export interface ElevenLabsWebSocketMessage {
  type: 'audio' | 'text' | 'ping' | 'flush' | 'close';
  text?: string;
  audio?: string; // base64
  try_trigger_generation?: boolean;
  flush?: boolean;
}

export interface VoiceAgentResponse {
  text: string;
  shouldTransition: boolean;
  isComplete: boolean;
  signals: { type: string; content: string; dimension: string; impact: number }[];
  ssml?: string;
  emotion?: string;
  pace?: 'slow' | 'normal' | 'fast';
  voiceConfig?: Partial<VoiceConfig>;
}

export const DEFAULT_VOICE_CONFIG: VoiceConfig = {
  provider: 'elevenlabs',
  voiceId: 'pNInz6obpgDQGcFmaJgB', // Adam — professional male voice
  modelId: 'eleven_turbo_v2_5',
  stability: 0.5,
  similarityBoost: 0.75,
  style: 0.3,
  speakerBoost: true,
};

export const VOICE_INTERVIEW_CONFIG: VoiceInterviewConfig = {
  defaultVoice: DEFAULT_VOICE_CONFIG,
  maxSessionDuration: 60,
  silenceTimeout: 15,
  autoTranscribe: true,
  recordAudio: true,
  enableEmotionDetection: true,
};
