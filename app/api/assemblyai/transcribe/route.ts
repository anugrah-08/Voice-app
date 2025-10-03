import type { NextRequest } from "next/server"

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get("audio") as File

    if (!audioFile) {
      return Response.json({ error: "No audio file provided" }, { status: 400 })
    }

    const apiKey = process.env.ASSEMBLYAI_API_KEY
    if (!apiKey) {
      return Response.json(
        { error: "AssemblyAI API key not configured. Please add ASSEMBLYAI_API_KEY to your environment variables." },
        { status: 500 },
      )
    }

    console.log("[v0] Uploading audio to AssemblyAI...")

    // Step 1: Upload audio file to AssemblyAI
    const uploadResponse = await fetch("https://api.assemblyai.com/v2/upload", {
      method: "POST",
      headers: {
        authorization: apiKey,
      },
      body: await audioFile.arrayBuffer(),
    })

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text()
      console.error("[v0] AssemblyAI upload error:", error)
      return Response.json({ error: "Failed to upload audio to AssemblyAI" }, { status: uploadResponse.status })
    }

    const { upload_url } = await uploadResponse.json()
    console.log("[v0] Audio uploaded, starting transcription...")

    // Step 2: Request transcription
    const transcriptResponse = await fetch("https://api.assemblyai.com/v2/transcript", {
      method: "POST",
      headers: {
        authorization: apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        audio_url: upload_url,
        language_code: "en",
      }),
    })

    if (!transcriptResponse.ok) {
      const error = await transcriptResponse.text()
      console.error("[v0] AssemblyAI transcription request error:", error)
      return Response.json({ error: "Failed to request transcription" }, { status: transcriptResponse.status })
    }

    const { id: transcriptId } = await transcriptResponse.json()
    console.log("[v0] Transcription started, ID:", transcriptId)

    // Step 3: Poll for transcription result
    let transcript
    let attempts = 0
    const maxAttempts = 60 // 60 seconds max

    while (attempts < maxAttempts) {
      const pollingResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: {
          authorization: apiKey,
        },
      })

      if (!pollingResponse.ok) {
        const error = await pollingResponse.text()
        console.error("[v0] AssemblyAI polling error:", error)
        return Response.json({ error: "Failed to get transcription status" }, { status: pollingResponse.status })
      }

      transcript = await pollingResponse.json()

      if (transcript.status === "completed") {
        console.log("[v0] Transcription completed successfully")
        return Response.json({
          text: transcript.text,
          confidence: transcript.confidence,
        })
      } else if (transcript.status === "error") {
        console.error("[v0] AssemblyAI transcription error:", transcript.error)
        return Response.json({ error: transcript.error }, { status: 500 })
      }

      // Wait 1 second before polling again
      await new Promise((resolve) => setTimeout(resolve, 1000))
      attempts++
    }

    return Response.json({ error: "Transcription timeout" }, { status: 408 })
  } catch (error: any) {
    console.error("[v0] Transcription error:", error)
    return Response.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
