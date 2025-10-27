"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { LanguageCode, PracticeHUD, RoomState } from "@/types"
import {
  HISTORY_STORAGE_KEY,
  NICKNAME_STORAGE_KEY,
  PLAYER_ID_STORAGE_KEY,
  STATS_STORAGE_KEY,
} from "@/lib/storage-keys"
import { DEFAULT_LANGUAGE, getRandomPrompt } from "@/lib/prompts"

type CharState = "pending" | "correct" | "wrong"

type StoredRoom = RoomState & {
  createdAt?: number
  updatedAt?: number
}

const POLL_INTERVAL_MS = 1500

function createCharStates(length: number): CharState[] {
  return Array(length).fill("pending") as CharState[]
}

function createEmptyRoom(code: string, language: LanguageCode = DEFAULT_LANGUAGE): StoredRoom {
  return {
    code,
    language,
    hostId: "",
    status: "lobby",
    players: [],
    prompt: getRandomPrompt(language),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

function computeHud(params: {
  charStates: CharState[]
  totalMistakes: number
  startTime: number | null
  endTime: number | null
  inputLength: number
  now: number
}): PracticeHUD {
  const { charStates, totalMistakes, startTime, endTime, inputLength, now } = params
  const timeMs = Math.max(0, startTime ? (endTime ?? now) - startTime : 0)

  const correctChars = charStates.filter((state) => state === "correct").length
  const timeMinutes = timeMs / 60000
  const wpm = timeMinutes > 0 ? Math.round(correctChars / 5 / timeMinutes) : 0
  const accuracy =
    inputLength > 0 ? Math.round(((inputLength - totalMistakes) / inputLength) * 100) : 0

  return { wpm, mistakes: totalMistakes, accuracy, timeMs }
}

export function useRoom(code: string) {
  const [room, setRoom] = useState<StoredRoom>(() => createEmptyRoom(code))
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [playerName, setPlayerName] = useState<string>("Anonymous")
  const [input, setInput] = useState("")
  const [charStates, setCharStates] = useState<CharState[]>([])
  const [mistakes, setMistakes] = useState(0)
  const [totalMistakes, setTotalMistakes] = useState(0)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [endTime, setEndTime] = useState<number | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const joinNameRef = useRef<string | null>(null)
  const hasLoggedCompletionRef = useRef(false)

  const isHost = room.hostId === playerId

  useEffect(() => {
    if (typeof window === "undefined") return

    let id = localStorage.getItem(PLAYER_ID_STORAGE_KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(PLAYER_ID_STORAGE_KEY, id)
    }
    setPlayerId(id)

    const storedName = localStorage.getItem(NICKNAME_STORAGE_KEY)
    if (storedName) {
      setPlayerName(storedName)
    }
  }, [])

  useEffect(() => {
    const length = room.prompt?.length ?? 0
    setCharStates(createCharStates(length))
  }, [room.prompt])

  useEffect(() => {
    if (room.status === "lobby") {
      setInput("")
      setMistakes(0)
      setTotalMistakes(0)
      setStartTime(null)
      setEndTime(null)
      setCharStates(createCharStates(room.prompt?.length ?? 0))
      hasLoggedCompletionRef.current = false
    }
  }, [room.status, room.prompt])

  const fetchRoomState = useCallback(async () => {
    try {
      const response = await fetch(`/api/rooms/${code}`, { cache: "no-store" })
      if (response.status === 404) {
        setNotFound(true)
        setIsLoading(false)
        return
      }

      if (!response.ok) {
        throw new Error(`Failed to load room: ${response.statusText}`)
      }

      const data = (await response.json()) as { room?: StoredRoom | null }
      if (!data?.room) {
        setRoom((prev) =>
          prev.code === code ? prev : createEmptyRoom(code, prev.language ?? DEFAULT_LANGUAGE),
        )
        return
      }

      const nextRoom: StoredRoom = {
        ...createEmptyRoom(code, data.room.language ?? DEFAULT_LANGUAGE),
        ...data.room,
        players: Array.isArray(data.room.players) ? data.room.players : [],
      }

      setRoom(nextRoom)
      setNotFound(false)
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [code])

  useEffect(() => {
    let cancelled = false

    const tick = async () => {
      if (cancelled) return
      await fetchRoomState()
    }

    tick()
    const interval = setInterval(tick, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [fetchRoomState])

  useEffect(() => {
    if (!playerId) return

    const name = playerName?.trim() || "Anonymous"
    if (joinNameRef.current === `${playerId}:${name}`) {
      return
    }

    joinNameRef.current = `${playerId}:${name}`

    const controller = new AbortController()
    fetch(`/api/rooms/${code}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "join", playerId, name }),
      signal: controller.signal,
    }).catch((error) => {
      if (error.name !== "AbortError") {
        console.error("Failed to join room", error)
      }
    })

    return () => controller.abort()
  }, [code, playerId, playerName])

  useEffect(() => {
    if (!playerId) return

    return () => {
      fetch(`/api/rooms/${code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "leave", playerId }),
        cache: "no-store",
      }).catch((error) => console.error("Failed to leave room", error))
    }
  }, [code, playerId])

  useEffect(() => {
    if (room.status !== "racing" || !startTime || endTime) {
      return
    }

    setNow(Date.now())
    const interval = window.setInterval(() => {
      setNow(Date.now())
    }, 100)

    return () => window.clearInterval(interval)
  }, [room.status, startTime, endTime])

  const hud = useMemo(
    () =>
      computeHud({
        charStates,
        totalMistakes,
        startTime,
        endTime,
        inputLength: input.length,
        now,
      }),
    [charStates, totalMistakes, startTime, endTime, input.length, now],
  )

  const sendProgress = useCallback(
    (payload: { progress: number; wpm: number; accuracy: number; mistakes: number; finished: boolean }) => {
      if (!playerId) return

      fetch(`/api/rooms/${code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "progress",
          playerId,
          ...payload,
        }),
        cache: "no-store",
      }).catch((error) => console.error("Failed to send room progress", error))
    },
    [code, playerId],
  )

  const handleInput = useCallback(
    (value: string) => {
      if (room.status !== "racing" || !playerId) return
      if (!room.prompt) return

      const now = Date.now()
      let nextStartTime = startTime

      if (!startTime && value.length > 0) {
        nextStartTime = now
        setStartTime(now)
        setNow(now)
      }

      if (value.length < input.length) {
        const deletedIndex = value.length
        let firstMistakeIndex = -1

        for (let i = 0; i < value.length; i++) {
          if (value[i] !== room.prompt[i]) {
            firstMistakeIndex = i
            break
          }
        }

        if (firstMistakeIndex === -1) {
          for (let i = 0; i < input.length; i++) {
            if (input[i] !== room.prompt[i]) {
              firstMistakeIndex = i
              break
            }
          }
        }

        if (firstMistakeIndex !== -1 && deletedIndex < firstMistakeIndex) {
          return
        }
      }

      setInput(value)

      const newStates = createCharStates(room.prompt.length)
      let currentMistakes = 0

      for (let i = 0; i < value.length && i < room.prompt.length; i++) {
        if (value[i] === room.prompt[i]) {
          newStates[i] = "correct"
        } else {
          newStates[i] = "wrong"
          currentMistakes++
        }
      }

      const mistakeDelta = currentMistakes - mistakes
      if (mistakeDelta > 0) {
        setTotalMistakes((prev) => prev + mistakeDelta)
      } else if (mistakeDelta < 0) {
        setTotalMistakes((prev) => Math.max(0, prev + mistakeDelta))
      }

      setCharStates(newStates)
      setMistakes(currentMistakes)

      const finished = value === room.prompt
      const effectiveTotalMistakes =
        mistakeDelta > 0 ? totalMistakes + mistakeDelta : Math.max(0, totalMistakes + mistakeDelta)

      if (finished) {
        setEndTime(now)
      }

      const hudSnapshot = computeHud({
        charStates: newStates,
        totalMistakes: effectiveTotalMistakes,
        startTime: nextStartTime,
        endTime: finished ? now : endTime,
        inputLength: value.length,
        now,
      })

      const progress = Math.min(100, Math.round((value.length / room.prompt.length) * 100))

      setRoom((prev) => {
        if (!Array.isArray(prev.players)) {
          return prev
        }

        return {
          ...prev,
          players: prev.players.map((player) =>
            player.id === playerId
              ? {
                  ...player,
                  progress,
                  wpm: hudSnapshot.wpm,
                  accuracy: hudSnapshot.accuracy,
                  mistakes: hudSnapshot.mistakes,
                  finished,
                  updatedAt: now,
                }
              : player,
          ),
        }
      })

      sendProgress({
        progress,
        wpm: hudSnapshot.wpm,
        accuracy: hudSnapshot.accuracy,
        mistakes: hudSnapshot.mistakes,
        finished,
      })

      if (finished && !hasLoggedCompletionRef.current) {
        hasLoggedCompletionRef.current = true
        saveRoomToHistory({
          at: now,
          mode: "room",
          language: room.language,
          wpm: hudSnapshot.wpm,
          mistakes: hudSnapshot.mistakes,
          accuracy: hudSnapshot.accuracy,
          timeMs: hudSnapshot.timeMs,
          promptLen: room.prompt.length,
          room: code,
        })
      }
    },
    [
      room.status,
      room.prompt,
      playerId,
      startTime,
      input,
      mistakes,
      totalMistakes,
      sendProgress,
      endTime,
      code,
    ],
  )

  const startCountdown = useCallback(() => {
    if (!playerId) return

    fetch(`/api/rooms/${code}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "start", playerId }),
      cache: "no-store",
    }).catch((error) => console.error("Failed to start countdown", error))
  }, [code, playerId])

  const reset = useCallback(
    (nextPrompt?: string, language?: LanguageCode) => {
      if (!playerId) return

      const promptToUse = nextPrompt || room.prompt

      setRoom((prev) => ({
        ...prev,
        prompt: promptToUse,
        language: language ?? prev.language,
        players: prev.players.map((player) => ({
          ...player,
          progress: 0,
          wpm: 0,
          accuracy: 0,
          mistakes: 0,
          finished: false,
        })),
        status: "lobby",
        startsAt: undefined,
      }))

      setInput("")
      setMistakes(0)
      setTotalMistakes(0)
      setStartTime(null)
      setEndTime(null)
      setNow(Date.now())
      setCharStates(createCharStates(promptToUse.length))
      hasLoggedCompletionRef.current = false

      fetch(`/api/rooms/${code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset",
          playerId,
          language: language ?? room.language,
          prompt: promptToUse,
        }),
        cache: "no-store",
      }).catch((error) => console.error("Failed to reset room", error))
    },
    [code, playerId, room.prompt, room.language],
  )

  return {
    room,
    input,
    charStates,
    hud,
    isHost,
    handleInput,
    startCountdown,
    reset,
    isLoading,
    notFound,
    playerId,
  }
}

function saveRoomToHistory(row: {
  at: number
  mode: "room"
  language: LanguageCode
  wpm: number
  mistakes: number
  accuracy: number
  timeMs: number
  promptLen: number
  room: string
}) {
  try {
    const history = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || "[]")
    history.unshift(row)
    const trimmedHistory = history.slice(0, 100)
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(trimmedHistory))

    const stats = JSON.parse(localStorage.getItem(STATS_STORAGE_KEY) || "{}")
    const today = new Date().toDateString()

    if (!stats[today]) {
      stats[today] = { sessions: 0, totalWpm: 0, totalAccuracy: 0, bestWpm: 0 }
    }

    stats[today].sessions += 1
    stats[today].totalWpm += row.wpm
    stats[today].totalAccuracy += row.accuracy
    stats[today].bestWpm = Math.max(stats[today].bestWpm, row.wpm)

    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats))
  } catch (error) {
    console.error("Failed to save room history", error)
  }
}
