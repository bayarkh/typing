import { NextResponse } from "next/server"
import { DEFAULT_LANGUAGE, getRandomPrompt } from "@/lib/prompts"
import { createInitialRoom, generateRoomCode, upsertRoom } from "@/lib/server/rooms-store"
import type { LanguageCode } from "@/types"

type CreateRoomPayload = {
  name?: string
  playerId?: string
  language?: LanguageCode
}

export async function POST(request: Request) {
  const body = (await request.json()) as CreateRoomPayload
  const name = body.name?.trim() || "Anonymous"
  const playerId = body.playerId?.trim()
  const language = body.language ?? DEFAULT_LANGUAGE

  if (!playerId) {
    return NextResponse.json({ error: "playerId is required" }, { status: 400 })
  }

  const code = await generateRoomCode()
  const prompt = getRandomPrompt(language)

  const room = createInitialRoom({
    code,
    prompt,
    hostId: playerId,
    hostName: name,
    language,
  })

  const persisted = await upsertRoom(room)

  return NextResponse.json({ room: persisted })
}
