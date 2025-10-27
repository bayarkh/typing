import Redis from "ioredis"
import type { PlayerRow, RoomState } from "@/types"

const ROOM_PREFIX = "typeracing:rooms:"
const ROOM_TTL_SECONDS = 60 * 60 // 1 hour

type StoredRoom = RoomState & {
  createdAt: number
  updatedAt: number
}

declare global {
  // eslint-disable-next-line no-var
  var __typeracingRedis: Redis | null | undefined
  // eslint-disable-next-line no-var
  var __typeracingRoomCache: Map<string, StoredRoom> | undefined
}

function createRedisClient(): Redis | null {
  const url = process.env.REDIS_URL
  if (!url) return null

  if (global.__typeracingRedis) {
    return global.__typeracingRedis
  }

  const options = process.env.REDIS_TOKEN
    ? { password: process.env.REDIS_TOKEN }
    : undefined

  const client = new Redis(url, options)
  global.__typeracingRedis = client
  return client
}

const redis = createRedisClient()

function getMemoryStore(): Map<string, StoredRoom> {
  if (!global.__typeracingRoomCache) {
    global.__typeracingRoomCache = new Map()
  }
  return global.__typeracingRoomCache
}

function roomKey(code: string) {
  return `${ROOM_PREFIX}${code}`
}

export async function getRoom(code: string): Promise<StoredRoom | null> {
  if (redis) {
    const payload = await redis.get(roomKey(code))
    if (!payload) return null
    try {
      return JSON.parse(payload) as StoredRoom
    } catch (error) {
      console.error("Failed to parse room payload", error)
      return null
    }
  }

  return getMemoryStore().get(code) ?? null
}

async function saveRoom(room: StoredRoom): Promise<void> {
  const payload = JSON.stringify(room)
  if (redis) {
    await redis.set(roomKey(room.code), payload, "EX", ROOM_TTL_SECONDS)
  } else {
    getMemoryStore().set(room.code, room)
  }
}

export async function setRoom(room: StoredRoom): Promise<void> {
  const next: StoredRoom = {
    ...room,
    updatedAt: Date.now(),
  }
  await saveRoom(next)
}

export async function deleteRoom(code: string): Promise<void> {
  if (redis) {
    await redis.del(roomKey(code))
  } else {
    getMemoryStore().delete(code)
  }
}

export async function roomExists(code: string): Promise<boolean> {
  if (redis) {
    return Boolean(await redis.exists(roomKey(code)))
  }
  return getMemoryStore().has(code)
}

export async function generateRoomCode(): Promise<string> {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const length = 5

  for (let attempt = 0; attempt < 500; attempt++) {
    const code = Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
    if (!(await roomExists(code))) {
      return code
    }
  }

  // Fallback: timestamped code
  const timestamp = Date.now().toString(36).toUpperCase().slice(-3)
  const prefix = Array.from({ length: 2 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
  return `${prefix}${timestamp}`
}

export function findPlayer(room: StoredRoom, playerId: string): PlayerRow | undefined {
  return room.players.find((player) => player.id === playerId)
}

export async function upsertRoom(room: StoredRoom): Promise<StoredRoom> {
  await setRoom(room)
  return (await getRoom(room.code))!
}

export async function mutateRoom(
  code: string,
  mutator: (room: StoredRoom) => StoredRoom | null | Promise<StoredRoom | null>,
): Promise<StoredRoom | null> {
  const current = await getRoom(code)
  if (!current) {
    return null
  }

  const cloned = JSON.parse(JSON.stringify(current)) as StoredRoom
  const result = await mutator(cloned)

  if (!result) {
    await deleteRoom(code)
    return null
  }

  await setRoom({
    ...result,
    updatedAt: Date.now(),
  })

  return (await getRoom(code))!
}

export function createInitialRoom(params: {
  code: string
  prompt: string
  hostId: string
  hostName: string
  language: RoomState["language"]
}): StoredRoom {
  const now = Date.now()
  const host: PlayerRow = {
    id: params.hostId,
    name: params.hostName,
    progress: 0,
    wpm: 0,
    accuracy: 0,
    mistakes: 0,
    finished: false,
    updatedAt: now,
  }

  return {
    code: params.code,
    language: params.language,
    hostId: params.hostId,
    prompt: params.prompt,
    status: "lobby",
    players: [host],
    createdAt: now,
    updatedAt: now,
  }
}

export function normaliseRoomState(room: StoredRoom): StoredRoom {
  const now = Date.now()
  let next: StoredRoom = { ...room }

  if (next.status === "countdown" && next.startsAt && now >= next.startsAt) {
    next = { ...next, status: "racing" }
  }

  if (next.status === "racing") {
    const everyoneFinished = next.players.length > 0 && next.players.every((player) => player.finished)
    if (everyoneFinished) {
      next = { ...next, status: "finished" }
    }
  }

  return next
}
