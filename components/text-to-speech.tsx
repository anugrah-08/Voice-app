"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Volume2, Square } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TextToSpeechProps {
  onSpeechGenerated?: (text: string) => void
}

export function TextToSpeech({ onSpeechGenerated }: TextToSpeechProps) {
  const [text, setText] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [isSupported, setIsSupported] = useState(true)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const [voicesLoaded, setVoicesLoaded] = useState(false)
  const preferredVoiceRef = useRef<SpeechSynthesisVoice | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (typeof window !== "undefined" && !window.speechSynthesis) {
      setIsSupported(false)
      toast({
        title: "Not Supported",
        description: "Your browser doesn't support text-to-speech. Try Chrome or Edge.",
        variant: "destructive",
      })
    }
  }, [toast])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!window.speechSynthesis) return

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      if (voices && voices.length > 0) {
        // Prefer high‑quality English voices if available
        const preferred =
          voices.find(
            (v) =>
              v.lang?.toLowerCase().startsWith("en") && (v.name.includes("Google") || v.name.includes("Microsoft")),
          ) ||
          voices.find((v) => v.lang?.toLowerCase().startsWith("en")) ||
          voices[0]

        preferredVoiceRef.current = preferred || null
        setVoicesLoaded(true)
        console.log("[v0] Voices loaded:", voices.length, "Preferred:", preferred?.name)
      }
    }

    // Attempt immediate load, then fall back with small delay, and listen for dynamic load
    loadVoices()
    const t = setTimeout(loadVoices, 250)
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices)

    return () => {
      clearTimeout(t)
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices)
    }
  }, [])

  const generateSpeech = () => {
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to convert to speech",
        variant: "destructive",
      })
      return
    }

    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "Your browser doesn't support text-to-speech",
        variant: "destructive",
      })
      return
    }

    try {
      console.log("[v0] Generating speech with Web Speech API...")

      // Only cancel if something is in progress to avoid spurious onerror events
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        console.log("[v0] Canceling current speech before starting new one")
        window.speechSynthesis.cancel()
      }

      const utterance = new SpeechSynthesisUtterance(text.trim())
      utteranceRef.current = utterance

      // Configure voice settings
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 1.0
      // Default to English; if we have a preferred voice, apply it and inherit its lang
      utterance.lang = preferredVoiceRef.current?.lang || "en-US"
      if (voicesLoaded && preferredVoiceRef.current) {
        utterance.voice = preferredVoiceRef.current
      }

      utterance.onstart = () => {
        console.log("[v0] Speech started")
        setIsPlaying(true)
        onSpeechGenerated?.(text.trim())
      }

      utterance.onend = () => {
        console.log("[v0] Speech ended")
        setIsPlaying(false)
      }

      utterance.onerror = (event: any) => {
        // Some browsers fire onerror for cancellations/interruption or before voices load.
        const errType = (event?.error as string) || ""
        console.warn("[v0] Speech onerror:", errType || event)

        // Ignore benign error types that occur during normal operation
        if (errType === "canceled" || errType === "interrupted" || errType === "not-allowed") {
          setIsPlaying(false)
          return
        }

        // If voices might not be ready, advise retry
        if (!voicesLoaded) {
          setIsPlaying(false)
          toast({
            title: "Voice not ready",
            description: "Voices are still loading. Please try again in a moment.",
            variant: "destructive",
          })
          return
        }

        setIsPlaying(false)
        toast({
          title: "Speech error",
          description: "Failed to generate speech. Please try again.",
          variant: "destructive",
        })
      }

      window.speechSynthesis.speak(utterance)

      toast({
        title: "Playing speech",
        description: preferredVoiceRef.current
          ? `Using ${preferredVoiceRef.current.name}`
          : "Using browser's default voice",
      })
    } catch (error: any) {
      console.error("[v0] Text-to-speech error:", error)
      toast({
        title: "Generation failed",
        description: error?.message || "Failed to generate speech. Please try again.",
        variant: "destructive",
      })
      setIsPlaying(false)
    }
  }

  const stopSpeech = () => {
    if (utteranceRef.current) {
      console.log("[v0] Stopping speech")
      window.speechSynthesis.cancel()
      setIsPlaying(false)
      utteranceRef.current = null
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-card-foreground">Text to Speech</CardTitle>
        <CardDescription>Convert your text into speech using your browser</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Enter text to convert to speech..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-32 bg-background border-border text-foreground resize-none"
          disabled={isPlaying || !isSupported}
        />

        {!isPlaying ? (
          <Button
            onClick={generateSpeech}
            disabled={!text.trim() || !isSupported}
            className="w-full bg-primary hover:bg-primary/90"
          >
            <Volume2 className="mr-2 h-4 w-4" />
            Generate Speech
          </Button>
        ) : (
          <Button onClick={stopSpeech} variant="destructive" className="w-full">
            <Square className="mr-2 h-4 w-4" />
            Stop Playing
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
