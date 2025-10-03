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

      // Stop any currently playing speech
      if (utteranceRef.current) {
        window.speechSynthesis.cancel()
      }

      const utterance = new SpeechSynthesisUtterance(text.trim())
      utteranceRef.current = utterance

      // Configure voice settings
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 1.0

      // Try to use a high-quality voice if available
      const voices = window.speechSynthesis.getVoices()
      const preferredVoice = voices.find(
        (voice) => voice.lang.startsWith("en") && (voice.name.includes("Google") || voice.name.includes("Microsoft")),
      )
      if (preferredVoice) {
        utterance.voice = preferredVoice
      }

      utterance.onstart = () => {
        console.log("[v0] Speech started")
        setIsPlaying(true)
        if (onSpeechGenerated) {
          onSpeechGenerated(text.trim())
        }
      }

      utterance.onend = () => {
        console.log("[v0] Speech ended")
        setIsPlaying(false)
      }

      utterance.onerror = (event) => {
        console.error("[v0] Speech error:", event)
        setIsPlaying(false)
        toast({
          title: "Error",
          description: "Failed to generate speech. Please try again.",
          variant: "destructive",
        })
      }

      window.speechSynthesis.speak(utterance)

      toast({
        title: "Playing speech",
        description: "Using browser's text-to-speech engine",
      })
    } catch (error: any) {
      console.error("[v0] Text-to-speech error:", error)
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate speech. Please try again.",
        variant: "destructive",
      })
    }
  }

  const stopSpeech = () => {
    if (utteranceRef.current) {
      window.speechSynthesis.cancel()
      setIsPlaying(false)
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
