// =====================================================
// SANCTUARY INTERVIEW AGENT — Mock Implementation
// =====================================================

import type { InterviewSection, InterviewMessage } from '@/types'
import { INTERVIEW_SECTIONS } from '@/types'
import {
  MOCK_RESPONSES,
  SECTION_TRANSITION_MESSAGES,
  INTERVIEW_CLOSING,
} from '../prompts/interview-system'

interface InterviewAgentConfig {
  typingDelayMs?: number
  messagesPerSection?: number
}

const DEFAULT_CONFIG: InterviewAgentConfig = {
  typingDelayMs: 1500,
  messagesPerSection: 4,
}

export class MockInterviewAgent {
  private config: InterviewAgentConfig
  private sectionMessageCounts: Record<InterviewSection, number>

  constructor(config: Partial<InterviewAgentConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.sectionMessageCounts = {
      founder_dna: 0,
      problem_interrogation: 0,
      solution_execution: 0,
      market_competition: 0,
      sanctuary_fit: 0,
    }
  }

  /**
   * Get the opening message for an interview
   */
  getOpeningMessage(): string {
    return SECTION_TRANSITION_MESSAGES.founder_dna
  }

  /**
   * Process a user message and generate a response
   */
  async processMessage(
    userMessage: string,
    currentSection: InterviewSection,
    messageHistory: InterviewMessage[]
  ): Promise<{
    response: string
    shouldTransition: boolean
    isComplete: boolean
  }> {
    // Simulate typing delay
    await this.simulateTyping()

    // Count user messages in current section
    const userMessagesInSection = messageHistory.filter(
      (m) => m.role === 'user' && m.section === currentSection
    ).length

    this.sectionMessageCounts[currentSection] = userMessagesInSection

    // Check if we should complete the interview
    if (currentSection === 'sanctuary_fit' && userMessagesInSection >= 3) {
      return {
        response: INTERVIEW_CLOSING,
        shouldTransition: false,
        isComplete: true,
      }
    }

    // Check if we should transition to next section
    const shouldTransition = userMessagesInSection >= (this.config.messagesPerSection || 4)

    if (shouldTransition) {
      const nextSection = this.getNextSection(currentSection)
      if (nextSection) {
        return {
          response: SECTION_TRANSITION_MESSAGES[nextSection],
          shouldTransition: true,
          isComplete: false,
        }
      }
    }

    // Generate response based on section and message count
    const response = this.getNextQuestion(currentSection, userMessagesInSection)

    return {
      response,
      shouldTransition: false,
      isComplete: false,
    }
  }

  /**
   * Get the next question for the current section
   */
  private getNextQuestion(section: InterviewSection, messageIndex: number): string {
    const sectionQuestions = MOCK_RESPONSES[section]
    const questionIndex = Math.min(messageIndex, sectionQuestions.length - 1)
    return sectionQuestions[questionIndex]
  }

  /**
   * Get the next section after the current one
   */
  private getNextSection(currentSection: InterviewSection): InterviewSection | null {
    const currentIndex = INTERVIEW_SECTIONS.findIndex((s) => s.value === currentSection)
    if (currentIndex < INTERVIEW_SECTIONS.length - 1) {
      return INTERVIEW_SECTIONS[currentIndex + 1].value as InterviewSection
    }
    return null
  }

  /**
   * Simulate typing delay
   */
  private async simulateTyping(): Promise<void> {
    const delay = this.config.typingDelayMs || 1500
    // Add some randomness to feel more natural
    const actualDelay = delay + Math.random() * 500
    await new Promise((resolve) => setTimeout(resolve, actualDelay))
  }

  /**
   * Reset the agent state
   */
  reset(): void {
    this.sectionMessageCounts = {
      founder_dna: 0,
      problem_interrogation: 0,
      solution_execution: 0,
      market_competition: 0,
      sanctuary_fit: 0,
    }
  }
}

// Singleton instance for easy use
let agentInstance: MockInterviewAgent | null = null

export function getInterviewAgent(config?: Partial<InterviewAgentConfig>): MockInterviewAgent {
  if (!agentInstance) {
    agentInstance = new MockInterviewAgent(config)
  }
  return agentInstance
}

export function resetInterviewAgent(): void {
  if (agentInstance) {
    agentInstance.reset()
  }
  agentInstance = null
}
