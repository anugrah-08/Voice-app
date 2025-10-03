import { NextResponse } from "next/server"

export async function GET() {
  const assemblyaiKey = process.env.ASSEMBLYAI_API_KEY

  return NextResponse.json({
    assemblyai: !!assemblyaiKey,
  })
}
