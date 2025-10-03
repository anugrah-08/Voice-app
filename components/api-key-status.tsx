"use client"

import { useEffect, useState } from "react"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function ApiKeyStatus() {
  const [status, setStatus] = useState<{ assemblyai: boolean } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/status")
      .then((res) => res.json())
      .then((data) => {
        setStatus(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error("[v0] Error checking API status:", error)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return null
  }

  if (status?.assemblyai) {
    return null
  }

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>API Configuration Required</AlertTitle>
      <AlertDescription className="mt-2 space-y-2">
        <p>To use speech-to-text, you need to configure:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li className="flex items-center gap-2">
            <span className="text-destructive">✗</span>
            <span>
              <strong>ASSEMBLYAI_API_KEY</strong> - For speech-to-text transcription
            </span>
          </li>
        </ul>
        <p className="text-sm mt-3">
          Add this environment variable in your Project Settings (gear icon in top right). Text-to-speech works without
          any API keys using your browser.
        </p>
      </AlertDescription>
    </Alert>
  )
}
