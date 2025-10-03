"use client"

import { useState, useRef } from "react"
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
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const { toast } = useToast()

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      })

      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        await transcribeAudio(audioBlob)

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setTranscript("")

      toast({
        title: "Recording started",
        description: "Speak now...",
      })
    } catch (error: any) {
      console.error("[v0] Error starting recording:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to start recording. Please allow microphone access.",
        variant: "destructive",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsProcessing(true)

    try {
      const formData = new FormData()
      formData.append("audio", audioBlob, "recording.webm")

      console.log("[v0] Sending audio to AssemblyAI...")

      const response = await fetch("/api/assemblyai/transcribe", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Transcription failed")
      }

      console.log("[v0] Transcription received:", data.text)

      setTranscript(data.text)

      if (onTranscriptComplete) {
        onTranscriptComplete(data.text)
      }

      toast({
        title: "Transcription complete",
        description: `Confidence: ${Math.round((data.confidence || 0) * 100)}%`,
      })
    } catch (error: any) {
      console.error("[v0] Transcription error:", error)
      toast({
        title: "Transcription failed",
        description: error.message || "Failed to transcribe audio. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-card-foreground">Speech to Text</CardTitle>
        <CardDescription>Record your voice and convert it to text with AssemblyAI</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          {!isRecording ? (
            <Button
              size="lg"
              onClick={startRecording}
              disabled={isProcessing}
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

        {isProcessing && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-primary">
              <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
              <span className="font-medium">Transcribing with AssemblyAI...</span>
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
