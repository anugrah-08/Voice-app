"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Square } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface VoiceRecorderProps {
  onTranscriptComplete?: (transcript: string) => void
}

export function VoiceRecorder({ onTranscriptComplete }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isSupported, setIsSupported] = useState(true)
  const recognitionRef = useRef<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Check if browser supports Web Speech API
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (!SpeechRecognition) {
        setIsSupported(false)
        return
      }

      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = "en-US"

      recognition.onresult = (event: any) => {
        let finalTranscript = ""
        let interimTranscript = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " "
          } else {
            interimTranscript += transcript
          }
        }

        setTranscript((prev) => prev + finalTranscript)
      }

      recognition.onerror = (event: any) => {
        console.error("[v0] Speech recognition error:", event.error)
        setIsRecording(false)
        toast({
          title: "Error",
          description: `Speech recognition error: ${event.error}`,
          variant: "destructive",
        })
      }

      recognition.onend = () => {
        setIsRecording(false)
      }

      recognitionRef.current = recognition
    }
  }, [toast])

  const startRecording = () => {
    if (!recognitionRef.current) return

    try {
      setTranscript("")
      recognitionRef.current.start()
      setIsRecording(true)
      toast({
        title: "Recording started",
        description: "Speak now...",
      })
    } catch (error) {
      console.error("[v0] Error starting recording:", error)
      toast({
        title: "Error",
        description: "Failed to start recording. Please try again.",
        variant: "destructive",
      })
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)

      if (transcript.trim() && onTranscriptComplete) {
        onTranscriptComplete(transcript.trim())
      }

      toast({
        title: "Recording stopped",
        description: "Transcription complete!",
      })
    }
  }

  if (!isSupported) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Speech to Text</CardTitle>
          <CardDescription>Record your voice and convert it to text</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">
              Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-card-foreground">Speech to Text</CardTitle>
        <CardDescription>Record your voice and convert it to text (no API key needed!)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          {!isRecording ? (
            <Button
              size="lg"
              onClick={startRecording}
              className="h-24 w-24 rounded-full bg-primary hover:bg-primary/90"
            >
              <Mic className="h-8 w-8" />
            </Button>
          ) : (
            <Button size="lg" onClick={stopRecording} variant="destructive" className="h-24 w-24 rounded-full">
              <Square className="h-8 w-8" />
            </Button>
          )}
        </div>

        {isRecording && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-destructive">
              <div className="h-3 w-3 rounded-full bg-destructive animate-pulse" />
              <span className="font-medium">Recording...</span>
            </div>
          </div>
        )}

        {transcript && (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2 text-card-foreground">Transcript</h3>
            <div className="p-4 bg-secondary rounded-lg border border-border">
              <p className="text-secondary-foreground leading-relaxed">{transcript}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
