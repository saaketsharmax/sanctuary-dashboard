'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import type { VoiceConfig } from '@/lib/ai/types/voice-interview'

// ═══════════════════════════════════════════════════════════════════════════
// SANCTUARY OS — Voice Interview Client Hook
// Browser STT (Web Speech API) + Eleven Labs TTS + Voice Interview API
// ═══════════════════════════════════════════════════════════════════════════

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error'

interface VoiceSignal {
  type: string
  content: string
  dimension: string
  impact: number
}

interface VoiceResponse {
  text: string
  shouldTransition: boolean
  isComplete: boolean
  signals: VoiceSignal[]
  voice: {
    config: VoiceConfig
    emotion?: string
    pace?: string
  }
}

interface UseVoiceInterviewOptions {
  applicationId: string
  currentSection: string
  messageCount: number
  transcript: { role: string; content: string }[]
  founderName: string
  applicationContext: string
  onTranscript: (text: string, metadata: TranscriptMetadata) => void
  onResponse: (response: VoiceResponse) => void
  onError: (error: string) => void
  elevenLabsApiKey?: string
}

export interface TranscriptMetadata {
  confidence: number
  speakingRate?: number
  pauseBefore?: number
  emotionalTone?: string
  duration?: number
}

// ─── SpeechRecognition types ─────────────────────────────────────────────

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionResultList {
  readonly length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  readonly length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionErrorEvent {
  error: string
  message?: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
  onspeechstart: (() => void) | null
  onspeechend: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

// ─── Hook ────────────────────────────────────────────────────────────────

export function useVoiceInterview(options: UseVoiceInterviewOptions) {
  const {
    applicationId,
    currentSection,
    messageCount,
    transcript,
    founderName,
    applicationContext,
    onTranscript,
    onResponse,
    onError,
    elevenLabsApiKey,
  } = options

  const [voiceState, setVoiceState] = useState<VoiceState>('idle')
  const voiceStateRef = useRef<VoiceState>('idle')
  const [interimText, setInterimText] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const [volume, setVolume] = useState(0) // 0-1 for visual feedback

  // Keep ref in sync with state for closure access
  const updateVoiceState = useCallback((state: VoiceState) => {
    voiceStateRef.current = state
    setVoiceState(state)
  }, [])

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const currentAudioRef = useRef<HTMLAudioElement | null>(null)
  const speechStartTimeRef = useRef<number>(0)
  const lastSpeechEndRef = useRef<number>(0)
  const wordCountRef = useRef<number>(0)
  const volumeAnimRef = useRef<number>(0)

  // Check browser support
  useEffect(() => {
    const supported = typeof window !== 'undefined' && (
      'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
    )
    setIsSupported(supported)
  }, [])

  // Volume monitoring for visual feedback
  const startVolumeMonitoring = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      audioSourceRef.current = audioContextRef.current.createMediaStreamSource(stream)
      audioSourceRef.current.connect(analyserRef.current)

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)

      const updateVolume = () => {
        if (!analyserRef.current) return
        analyserRef.current.getByteFrequencyData(dataArray)
        const avg = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length
        setVolume(Math.min(1, avg / 128))
        volumeAnimRef.current = requestAnimationFrame(updateVolume)
      }
      updateVolume()
    } catch {
      // Mic access denied — continue without volume monitoring
    }
  }, [])

  const stopVolumeMonitoring = useCallback(() => {
    if (volumeAnimRef.current) {
      cancelAnimationFrame(volumeAnimRef.current)
    }
    if (audioSourceRef.current) {
      audioSourceRef.current.disconnect()
      audioSourceRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    setVolume(0)
  }, [])

  // Initialize speech recognition
  const initRecognition = useCallback(() => {
    if (!isSupported) return null

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1

    return recognition
  }, [isSupported])

  // Text-to-speech via Eleven Labs
  const speakWithElevenLabs = useCallback(async (text: string, voiceConfig: VoiceConfig) => {
    const apiKey = elevenLabsApiKey || process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY
    if (!apiKey) {
      // Fall back to browser TTS
      return speakWithBrowserTTS(text)
    }

    updateVoiceState('speaking')

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceConfig.voiceId}`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            model_id: voiceConfig.modelId,
            voice_settings: {
              stability: voiceConfig.stability,
              similarity_boost: voiceConfig.similarityBoost,
              style: voiceConfig.style,
              use_speaker_boost: voiceConfig.speakerBoost,
            },
          }),
        },
      )

      if (!response.ok) {
        throw new Error(`Eleven Labs API error: ${response.status}`)
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      currentAudioRef.current = audio

      return new Promise<void>((resolve) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl)
          currentAudioRef.current = null
          updateVoiceState('idle')
          resolve()
        }
        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl)
          currentAudioRef.current = null
          updateVoiceState('idle')
          resolve()
        }
        audio.play().catch(() => {
          updateVoiceState('idle')
          resolve()
        })
      })
    } catch (error) {
      console.error('Eleven Labs TTS error:', error)
      return speakWithBrowserTTS(text)
    }
  }, [elevenLabsApiKey])

  // Browser TTS fallback
  const speakWithBrowserTTS = useCallback((text: string): Promise<void> => {
    updateVoiceState('speaking')
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        updateVoiceState('idle')
        resolve()
        return
      }

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 1.0

      utterance.onend = () => {
        updateVoiceState('idle')
        resolve()
      }
      utterance.onerror = () => {
        updateVoiceState('idle')
        resolve()
      }

      window.speechSynthesis.speak(utterance)
    })
  }, [])

  // Send voice input to the API
  const sendToVoiceAPI = useCallback(async (
    transcribedText: string,
    metadata: TranscriptMetadata,
  ): Promise<VoiceResponse | null> => {
    updateVoiceState('processing')

    try {
      const response = await fetch('/api/interview/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcribedText,
          voiceMetadata: {
            confidence: metadata.confidence,
            speakingRate: metadata.speakingRate,
            pauseBefore: metadata.pauseBefore,
            emotionalTone: metadata.emotionalTone,
          },
          session: {
            currentSection,
            messageCount,
            transcript,
            founderName,
            applicationContext,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Voice API error: ${response.status}`)
      }

      const data = await response.json()
      return {
        text: data.response,
        shouldTransition: data.shouldTransition,
        isComplete: data.isComplete,
        signals: data.signals || [],
        voice: data.voice || {},
      }
    } catch (error) {
      console.error('Voice API error:', error)
      onError('Failed to process voice input')
      updateVoiceState('error')
      return null
    }
  }, [currentSection, messageCount, transcript, founderName, applicationContext, onError])

  // Start listening
  const startListening = useCallback(() => {
    if (!isSupported || voiceState === 'listening') return

    const recognition = initRecognition()
    if (!recognition) return

    recognitionRef.current = recognition
    speechStartTimeRef.current = Date.now()
    wordCountRef.current = 0

    recognition.onstart = () => {
      updateVoiceState('listening')
      startVolumeMonitoring()
    }

    recognition.onspeechstart = () => {
      speechStartTimeRef.current = Date.now()
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = ''
      let interim = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else {
          interim += result[0].transcript
        }
      }

      setInterimText(interim)

      if (finalTranscript) {
        const words = finalTranscript.trim().split(/\s+/)
        wordCountRef.current += words.length
        const durationSec = (Date.now() - speechStartTimeRef.current) / 1000
        const speakingRate = durationSec > 0 ? Math.round((wordCountRef.current / durationSec) * 60) : undefined
        const pauseBefore = lastSpeechEndRef.current > 0
          ? Date.now() - lastSpeechEndRef.current
          : undefined

        const confidence = event.results[event.results.length - 1]?.[0]?.confidence ?? 0.9

        const metadata: TranscriptMetadata = {
          confidence,
          speakingRate,
          pauseBefore,
          duration: durationSec * 1000,
        }

        setInterimText('')
        onTranscript(finalTranscript.trim(), metadata)
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'no-speech') return // normal — just silence
      if (event.error === 'aborted') return // we stopped it
      console.error('Speech recognition error:', event.error)
      onError(`Speech recognition error: ${event.error}`)
      updateVoiceState('error')
    }

    recognition.onend = () => {
      lastSpeechEndRef.current = Date.now()
      // Auto-restart if we're still supposed to be listening (use ref to avoid stale closure)
      if (voiceStateRef.current === 'listening' && recognitionRef.current === recognition) {
        try {
          recognition.start()
        } catch {
          // Already started or disposed
        }
      }
    }

    try {
      recognition.start()
    } catch (error) {
      console.error('Failed to start speech recognition:', error)
      onError('Failed to start microphone')
      updateVoiceState('error')
    }
  }, [isSupported, voiceState, initRecognition, startVolumeMonitoring, onTranscript, onError])

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null // prevent auto-restart
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    stopVolumeMonitoring()
    setInterimText('')
    if (voiceStateRef.current === 'listening') {
      updateVoiceState('idle')
    }
  }, [stopVolumeMonitoring, updateVoiceState])

  // Full voice turn: send text to API, then speak the response
  const processVoiceTurn = useCallback(async (
    transcribedText: string,
    metadata: TranscriptMetadata,
  ) => {
    stopListening()

    const response = await sendToVoiceAPI(transcribedText, metadata)
    if (!response) {
      updateVoiceState('idle')
      return
    }

    onResponse(response)

    // Speak the response
    const voiceConfig = response.voice?.config
    if (voiceConfig) {
      await speakWithElevenLabs(response.text, voiceConfig)
    } else {
      await speakWithBrowserTTS(response.text)
    }

    // Auto-resume listening after speaking (unless interview is complete)
    if (!response.isComplete) {
      startListening()
    }
  }, [stopListening, sendToVoiceAPI, onResponse, speakWithElevenLabs, speakWithBrowserTTS, startListening])

  // Stop speaking (interrupt)
  const stopSpeaking = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current = null
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    updateVoiceState('idle')
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening()
      stopSpeaking()
      stopVolumeMonitoring()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    voiceState,
    interimText,
    isSupported,
    volume,
    startListening,
    stopListening,
    stopSpeaking,
    processVoiceTurn,
  }
}
