"use client"

import { useState, useEffect } from "react"
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
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSupported, setIsSupported] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (typeof window !== "undefined" && !window.speechSynthesis) {
      setIsSupported(false)
    }
  }, [])

  const speak = () => {
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to convert to speech",
        variant: "destructive",
      })
      return
    }

    if (!window.speechSynthesis) return

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "en-US"
    utterance.rate = 1
    utterance.pitch = 1
    utterance.volume = 1

    utterance.onstart = () => {
      setIsSpeaking(true)
      if (onSpeechGenerated) {
        onSpeechGenerated(text.trim())
      }
    }

    utterance.onend = () => {
      setIsSpeaking(false)
    }

    utterance.onerror = (event) => {
      console.error("[v0] Speech synthesis error:", event)
      setIsSpeaking(false)
      toast({
        title: "Error",
        description: "Failed to generate speech",
        variant: "destructive",
      })
    }

    window.speechSynthesis.speak(utterance)
    toast({
      title: "Speaking",
      description: "Playing generated speech...",
    })
  }

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  if (!isSupported) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Text to Speech</CardTitle>
          <CardDescription>Convert your text into natural-sounding speech</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">
              Speech synthesis is not supported in your browser. Please use a modern browser.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-card-foreground">Text to Speech</CardTitle>
        <CardDescription>Convert your text into speech (no API key needed!)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Enter text to convert to speech..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-32 bg-background border-border text-foreground resize-none"
        />

        {!isSpeaking ? (
          <Button onClick={speak} disabled={!text.trim()} className="w-full bg-primary hover:bg-primary/90">
            <Volume2 className="mr-2 h-4 w-4" />
            Generate Speech
          </Button>
        ) : (
          <Button onClick={stopSpeaking} variant="destructive" className="w-full">
            <Square className="mr-2 h-4 w-4" />
            Stop Speaking
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
