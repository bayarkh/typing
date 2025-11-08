"use client"

import { useState, useEffect } from "react"
import type { HistoryRow } from "@/types"
import { DEFAULT_LANGUAGE } from "@/lib/prompts"
import { HISTORY_STORAGE_KEY } from "@/lib/storage-keys"
import { HISTORY_UPDATED_EVENT } from "@/lib/history-events"

export function useHistory() {
  const [history, setHistory] = useState<HistoryRow[]>([])

  useEffect(() => {
    if (typeof window === "undefined") return

    const loadHistory = () => {
      try {
        const stored = localStorage.getItem(HISTORY_STORAGE_KEY)
        if (!stored) {
          setHistory([])
          return
        }

        const parsed = JSON.parse(stored) as Partial<HistoryRow>[]
        const normalised: HistoryRow[] = parsed.map((row) => ({
          ...row,
          language: row.language ?? DEFAULT_LANGUAGE,
        })) as HistoryRow[]
        setHistory(normalised)
      } catch (error) {
        console.error("Failed to load history", error)
      }
    }

    loadHistory()

    const handleStorage = (event: StorageEvent) => {
      if (event.key === HISTORY_STORAGE_KEY) {
        loadHistory()
      }
    }

    const handleHistoryUpdated = () => loadHistory()

    window.addEventListener("storage", handleStorage)
    window.addEventListener(HISTORY_UPDATED_EVENT, handleHistoryUpdated as EventListener)

    return () => {
      window.removeEventListener("storage", handleStorage)
      window.removeEventListener(HISTORY_UPDATED_EVENT, handleHistoryUpdated as EventListener)
    }
  }, [])

  return { history }
}
