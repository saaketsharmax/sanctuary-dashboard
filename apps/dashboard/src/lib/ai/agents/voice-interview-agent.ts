// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY OS — Voice Interview Agent (Eleven Labs Integration)
// Server-side logic for voice-first interviews. Client handles WebSocket/TTS.
// ═══════════════════════════════════════════════════════════════════════════

import Anthropic from '@anthropic-ai/sdk';
import {
  VOICE_INTERVIEW_PERSONA,
  VOICE_SECTION_PROMPTS,
  VOICE_TRANSITION_PHRASES,
  VOICE_ACKNOWLEDGMENTS,
  VOICE_CLOSING,
  VOICE_INTERVIEW_SYSTEM_PROMPT,
} from '../prompts/voice-interview-system';
import type {
  VoiceAgentResponse,
  VoiceConfig,
  VoiceInterviewSession,
  VoiceTranscriptEntry,
  DEFAULT_VOICE_CONFIG,
} from '../types/voice-interview';

// ─── Section Config ──────────────────────────────────────────────────────

const SECTIONS = ['founder_dna', 'problem_interrogation', 'solution_execution', 'market_competition', 'sanctuary_fit'] as const;
const MIN_MESSAGES_PER_SECTION: Record<string, number> = {
  founder_dna: 3,
  problem_interrogation: 4,
  solution_execution: 3,
  market_competition: 2,
  sanctuary_fit: 2,
};

// ─── Voice Interview Agent ───────────────────────────────────────────────

export class VoiceInterviewAgent {
  private client: Anthropic;
  private model = 'claude-sonnet-4-20250514';

  constructor() {
    this.client = new Anthropic();
  }

  async processVoiceInput(
    transcribedText: string,
    voiceMetadata: {
      confidence: number;
      speakingRate?: number;
      pauseBefore?: number;
      emotionalTone?: string;
    },
    session: {
      currentSection: string;
      messageCount: number;
      transcript: { role: string; content: string }[];
      founderName: string;
      applicationContext: string;
    },
  ): Promise<VoiceAgentResponse> {
    const systemPrompt = VOICE_INTERVIEW_SYSTEM_PROMPT(
      session.currentSection,
      session.founderName,
      session.applicationContext,
    );

    // Build conversation history
    const messages: Anthropic.MessageParam[] = session.transcript.map((msg) => ({
      role: msg.role === 'agent' ? 'assistant' as const : 'user' as const,
      content: msg.content,
    }));

    // Add current message
    messages.push({ role: 'user', content: transcribedText });

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 512, // Voice responses must be SHORT
      system: systemPrompt,
      messages,
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    try {
      const parsed = JSON.parse(text);

      // Extract voice-specific signals from metadata
      const voiceSignals = this.extractVoiceSignals(voiceMetadata, session.currentSection);

      // Merge AI signals with voice-derived signals
      const allSignals = [...(parsed.signals || []), ...voiceSignals];

      // Check for section transition
      const sectionIndex = SECTIONS.indexOf(session.currentSection as typeof SECTIONS[number]);
      const isLastSection = sectionIndex === SECTIONS.length - 1;
      const hasEnoughMessages = session.messageCount >= (MIN_MESSAGES_PER_SECTION[session.currentSection] || 2);

      let responseText = parsed.response;
      let shouldTransition = parsed.shouldTransition && hasEnoughMessages;
      let isComplete = false;

      // Add transition phrase if moving to next section
      if (shouldTransition && !isLastSection) {
        const nextSection = SECTIONS[sectionIndex + 1];
        const transitionKey = `${session.currentSection}_to_${nextSection}`;
        const transitionPhrase = VOICE_TRANSITION_PHRASES[transitionKey];
        if (transitionPhrase) {
          responseText = `${responseText} ${transitionPhrase}`;
        }
      }

      // Check for completion
      if (shouldTransition && isLastSection) {
        isComplete = true;
        responseText = `${responseText} ${VOICE_CLOSING}`;
      }

      return {
        text: responseText,
        shouldTransition,
        isComplete,
        signals: allSignals,
        emotion: this.inferDesiredEmotion(session.currentSection),
        pace: 'normal',
      };
    } catch {
      // If JSON parse fails, use raw text
      return {
        text: text || 'Could you tell me more about that?',
        shouldTransition: false,
        isComplete: false,
        signals: [],
        pace: 'normal',
      };
    }
  }

  private extractVoiceSignals(
    metadata: { confidence: number; speakingRate?: number; pauseBefore?: number; emotionalTone?: string },
    section: string,
  ): { type: string; content: string; dimension: string; impact: number }[] {
    const signals: { type: string; content: string; dimension: string; impact: number }[] = [];

    // Long pause before answering financial/traction questions = potential uncertainty
    if (metadata.pauseBefore && metadata.pauseBefore > 5000 && ['problem_interrogation', 'solution_execution'].includes(section)) {
      signals.push({
        type: 'voice_hesitation',
        content: `Long pause (${Math.round(metadata.pauseBefore / 1000)}s) before answering — possible uncertainty`,
        dimension: section === 'problem_interrogation' ? 'problem' : 'execution',
        impact: -1,
      });
    }

    // Fast speaking rate on passion topics = genuine enthusiasm
    if (metadata.speakingRate && metadata.speakingRate > 160 && section === 'founder_dna') {
      signals.push({
        type: 'voice_enthusiasm',
        content: `High speaking rate (${metadata.speakingRate} wpm) suggests genuine passion`,
        dimension: 'founder',
        impact: 1,
      });
    }

    // Low STT confidence might indicate mumbling/uncertainty
    if (metadata.confidence < 0.7) {
      signals.push({
        type: 'voice_clarity',
        content: `Low speech clarity (${Math.round(metadata.confidence * 100)}% STT confidence) — possible uncertainty or discomfort`,
        dimension: 'founder',
        impact: -1,
      });
    }

    // Defensive emotional tone during competition section
    if (metadata.emotionalTone === 'defensive' && section === 'market_competition') {
      signals.push({
        type: 'voice_defensive',
        content: 'Defensive tone when discussing competition',
        dimension: 'execution',
        impact: -2,
      });
    }

    return signals;
  }

  private inferDesiredEmotion(section: string): string {
    const emotionMap: Record<string, string> = {
      founder_dna: 'warm',
      problem_interrogation: 'curious',
      solution_execution: 'engaged',
      market_competition: 'analytical',
      sanctuary_fit: 'encouraging',
    };
    return emotionMap[section] || 'neutral';
  }

  getVoiceConfig(): VoiceConfig {
    return {
      provider: 'elevenlabs',
      voiceId: process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB',
      modelId: 'eleven_turbo_v2_5',
      stability: 0.5,
      similarityBoost: 0.75,
      style: 0.3,
      speakerBoost: true,
    };
  }
}

// ─── Mock Agent ──────────────────────────────────────────────────────────

export class MockVoiceInterviewAgent {
  private questionIndex = 0;

  async processVoiceInput(
    transcribedText: string,
    voiceMetadata: Record<string, unknown>,
    session: { currentSection: string; messageCount: number; transcript: { role: string; content: string }[]; founderName: string; applicationContext: string },
  ): Promise<VoiceAgentResponse> {
    const acknowledgment = VOICE_ACKNOWLEDGMENTS[this.questionIndex % VOICE_ACKNOWLEDGMENTS.length];
    this.questionIndex++;

    const sectionIndex = SECTIONS.indexOf(session.currentSection as typeof SECTIONS[number]);
    const hasEnoughMessages = session.messageCount >= (MIN_MESSAGES_PER_SECTION[session.currentSection] || 2);
    const shouldTransition = hasEnoughMessages && this.questionIndex % 4 === 0;
    const isComplete = shouldTransition && sectionIndex === SECTIONS.length - 1;

    return {
      text: isComplete
        ? VOICE_CLOSING
        : `${acknowledgment} Can you tell me more about that?`,
      shouldTransition,
      isComplete,
      signals: [],
      emotion: 'warm',
      pace: 'normal',
    };
  }

  getVoiceConfig(): VoiceConfig {
    return {
      provider: 'elevenlabs',
      voiceId: 'pNInz6obpgDQGcFmaJgB',
      modelId: 'eleven_turbo_v2_5',
      stability: 0.5,
      similarityBoost: 0.75,
      style: 0.3,
      speakerBoost: true,
    };
  }
}

// ─── Factory ─────────────────────────────────────────────────────────────

export function getVoiceInterviewAgent(): VoiceInterviewAgent | MockVoiceInterviewAgent {
  if (process.env.ANTHROPIC_API_KEY) {
    return new VoiceInterviewAgent();
  }
  return new MockVoiceInterviewAgent();
}
