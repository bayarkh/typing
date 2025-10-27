import { NextResponse } from "next/server"
import type { LanguageCode, PlayerRow } from "@/types"
import { deleteRoom, findPlayer, getRoom, normaliseRoomState, setRoom } from "@/lib/server/rooms-store"

type StoredRoom = NonNullable<Awaited<ReturnType<typeof getRoom>>>

type JoinPayload = {
  action: "join"
  playerId?: string
  name?: string
}

type LeavePayload = {
  action: "leave"
  playerId?: string
}

type StartPayload = {
  action: "start"
  playerId?: string
  countdownMs?: number
}

type ProgressPayload = {
  action: "progress"
  playerId?: string
  progress?: number
  wpm?: number
  accuracy?: number
  mistakes?: number
  finished?: boolean
}

type ResetPayload = {
  action: "reset"
  playerId?: string
  prompt?: string
  language?: LanguageCode
}

type UpdatePayload = JoinPayload | LeavePayload | StartPayload | ProgressPayload | ResetPayload

class HttpError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function json404() {
  return NextResponse.json({ error: "Room not found" }, { status: 404 })
}

async function withRoom(
  code: string,
  mutate: (room: StoredRoom) => StoredRoom | null | Promise<StoredRoom | null>,
) {
  const current = await getRoom(code)
  if (!current) {
    return { response: json404(), room: null as StoredRoom | null }
  }

  const base = normaliseRoomState(current)
  const result = await mutate(base)

  if (!result) {
    await deleteRoom(code)
    return { response: NextResponse.json(null, { status: 204 }), room: null }
  }

  const normalised = normaliseRoomState(result)
  await setRoom(normalised)
  const persisted = await getRoom(code)

  return {
    response: NextResponse.json({ room: normaliseRoomState(persisted!) }),
    room: persisted!,
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params
  const room = await getRoom(code.toUpperCase())
  if (!room) {
    return json404()
  }

  const normalised = normaliseRoomState(room)
  if (normalised !== room) {
    await setRoom(normalised)
  }

  return NextResponse.json({ room: normaliseRoomState(normalised) })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code: rawCode } = await params
  const code = rawCode.toUpperCase()

  try {
    const payload = (await request.json()) as UpdatePayload

    switch (payload.action) {
      case "join":
        return (await withRoom(code, (room) => handleJoin(room, payload))).response
      case "leave":
        return (await withRoom(code, (room) => handleLeave(room, payload))).response
      case "start":
        return (await withRoom(code, (room) => handleStart(room, payload))).response
      case "progress":
        return (await withRoom(code, (room) => handleProgress(room, payload))).response
      case "reset":
        return (await withRoom(code, (room) => handleReset(room, payload))).response
      default:
        return NextResponse.json({ error: "Unsupported action" }, { status: 400 })
    }
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error(error)
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 })
  }
}

function ensurePlayerId(payload: { playerId?: string }) {
  const playerId = payload.playerId?.trim()
  if (!playerId) {
    throw new HttpError(400, "playerId is required")
  }
  return playerId
}

function handleJoin(room: StoredRoom, payload: JoinPayload): StoredRoom {
  const playerId = ensurePlayerId(payload)
  const name = payload.name?.trim() || "Anonymous"

  const existing = room.players.find((player) => player.id === playerId)
  const now = Date.now()

  let players: PlayerRow[]
  if (existing) {
    players = room.players.map((player) =>
      player.id === playerId ? { ...player, name, updatedAt: now } : player,
    )
  } else {
    const newcomer: PlayerRow = {
      id: playerId,
      name,
      progress: 0,
      wpm: 0,
      accuracy: 0,
      mistakes: 0,
      finished: false,
      updatedAt: now,
    }
    players = [...room.players, newcomer]
  }

  return { ...room, players }
}

function handleLeave(room: StoredRoom, payload: LeavePayload): StoredRoom | null {
  const playerId = ensurePlayerId(payload)

  if (!findPlayer(room, playerId)) {
    return room
  }

  const remaining = room.players.filter((player) => player.id !== playerId)

  if (remaining.length === 0) {
    return null
  }

  const nextHostId = room.hostId === playerId ? remaining[0].id : room.hostId

  return {
    ...room,
    hostId: nextHostId,
    players: remaining,
    status: room.status === "finished" ? "lobby" : room.status,
  }
}

function handleStart(room: StoredRoom, payload: StartPayload): StoredRoom {
  const playerId = ensurePlayerId(payload)
  if (room.hostId !== playerId) {
    throw new HttpError(403, "Only host can start the countdown")
  }

  const countdownMs = payload.countdownMs && payload.countdownMs > 0 ? payload.countdownMs : 3000
  const startsAt = Date.now() + countdownMs

  return {
    ...room,
    status: "countdown",
    startsAt,
    players: room.players.map((player) => ({
      ...player,
      progress: 0,
      wpm: 0,
      accuracy: 0,
      mistakes: 0,
      finished: false,
      updatedAt: Date.now(),
    })),
  }
}

function handleProgress(room: StoredRoom, payload: ProgressPayload): StoredRoom {
  const playerId = ensurePlayerId(payload)
  const player = findPlayer(room, playerId)
  if (!player) {
    throw new HttpError(400, "Player is not part of this room")
  }

  const progress = Math.max(0, Math.min(100, Number(payload.progress ?? 0)))
  const wpm = Math.max(0, Math.round(Number(payload.wpm ?? 0)))
  const accuracy = Math.max(0, Math.min(100, Math.round(Number(payload.accuracy ?? 0))))
  const mistakes = Math.max(0, Math.round(Number(payload.mistakes ?? 0)))
  const finished = Boolean(payload.finished) || progress >= 100

  return {
    ...room,
    players: room.players.map((p) =>
      p.id === playerId
        ? {
            ...p,
            progress,
            wpm,
            accuracy,
            mistakes,
            finished,
            updatedAt: Date.now(),
          }
        : p,
    ),
    status: finished && room.players.every((player) => player.id === playerId || player.finished)
      ? "finished"
      : room.status,
  }
}

function handleReset(room: StoredRoom, payload: ResetPayload): StoredRoom {
  const playerId = ensurePlayerId(payload)
  if (room.hostId !== playerId) {
    throw new HttpError(403, "Only host can reset the room")
  }

  const prompt = typeof payload.prompt === "string" && payload.prompt.length > 0 ? payload.prompt : room.prompt
  const language = payload.language ?? room.language

  return {
    ...room,
    status: "lobby",
    startsAt: undefined,
    prompt,
    language,
    players: room.players.map((player) => ({
      ...player,
      progress: 0,
      wpm: 0,
      accuracy: 0,
      mistakes: 0,
      finished: false,
      updatedAt: Date.now(),
    })),
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code: rawCode } = await params
  const code = rawCode.toUpperCase()
  const existing = await getRoom(code)
  if (!existing) {
    return json404()
  }

  await deleteRoom(code)
  return NextResponse.json(null, { status: 204 })
}
