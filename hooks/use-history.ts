"use client"

import { useState, useEffect } from "react"
import type { HistoryRow } from "@/types"
import { DEFAULT_LANGUAGE } from "@/lib/prompts"
import { HISTORY_STORAGE_KEY } from "@/lib/storage-keys"

export function useHistory() {
  const [history, setHistory] = useState<HistoryRow[]>([])

  useEffect(() => {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<HistoryRow>[]
      const normalised: HistoryRow[] = parsed.map((row) => ({
        ...row,
        language: row.language ?? DEFAULT_LANGUAGE,
      })) as HistoryRow[]
      setHistory(normalised)
    }
  }, [])

  return { history }
}
