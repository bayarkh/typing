export type LanguageCode = "en" | "mn"

export type PracticeHUD = {
  wpm: number
  mistakes: number
  accuracy: number
  timeMs: number
}

export type HistoryRow = {
  at: number
  mode: "practice" | "room"
  language: LanguageCode
  wpm: number
  mistakes: number
  accuracy: number
  timeMs: number
  promptLen: number
  room?: string
}

export type PlayerRow = {
  id: string
  name: string
  progress: number
  wpm: number
  accuracy: number
  mistakes: number
  finished: boolean
  updatedAt?: number
}

export type RoomState = {
  code: string
  language: LanguageCode
  hostId: string
  status: "lobby" | "countdown" | "racing" | "finished"
  startsAt?: number
  players: PlayerRow[]
  prompt: string
  createdAt?: number
  updatedAt?: number
}
