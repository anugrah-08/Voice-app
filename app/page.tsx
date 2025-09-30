"use client"

import { useState, useEffect } from "react"
import { VoiceRecorder } from "@/components/voice-recorder"
import { TextToSpeech } from "@/components/text-to-speech"
import { TranscriptHistory } from "@/components/transcript-history"

export type Activity = {
  id: string
  type: "transcription" | "speech"
  text: string
  timestamp: Date
}

export default function Home() {
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    const saved = localStorage.getItem("voice-activities")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setActivities(parsed.map((a: any) => ({ ...a, timestamp: new Date(a.timestamp) })))
      } catch (error) {
        console.error("[v0] Error loading activities:", error)
      }
    }
  }, [])

  useEffect(() => {
    if (activities.length > 0) {
      localStorage.setItem("voice-activities", JSON.stringify(activities))
    }
  }, [activities])

  const handleTranscriptComplete = (transcript: string) => {
    const newActivity: Activity = {
      id: Date.now().toString(),
      type: "transcription",
      text: transcript,
      timestamp: new Date(),
    }
    setActivities((prev) => [newActivity, ...prev])
  }

  const handleSpeechGenerated = (text: string) => {
    const newActivity: Activity = {
      id: Date.now().toString(),
      type: "speech",
      text: text,
      timestamp: new Date(),
    }
    setActivities((prev) => [newActivity, ...prev])
  }

  const handleClearHistory = () => {
    setActivities([])
    localStorage.removeItem("voice-activities")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-3 text-balance">Voice AI Studio</h1>
          <p className="text-muted-foreground text-lg">
            Transform speech to text and text to speech - completely free!
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2 mb-6">
          <VoiceRecorder onTranscriptComplete={handleTranscriptComplete} />
          <TextToSpeech onSpeechGenerated={handleSpeechGenerated} />
        </div>

        <TranscriptHistory activities={activities} onClearHistory={handleClearHistory} />
      </div>
    </div>
  )
}
