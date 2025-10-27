"use client"

import { useState, useCallback, useEffect } from "react"
import type { LanguageCode, PracticeHUD } from "@/types"
import { HISTORY_STORAGE_KEY, STATS_STORAGE_KEY } from "@/lib/storage-keys"

type CharState = "pending" | "correct" | "wrong"

export function usePractice(initialPrompt: string, language: LanguageCode) {
  const [prompt, setPrompt] = useState(initialPrompt)
  const [input, setInput] = useState("")
  const [charStates, setCharStates] = useState<CharState[]>(Array(initialPrompt.length).fill("pending"))
  const [mistakes, setMistakes] = useState(0)
  const [totalMistakes, setTotalMistakes] = useState(0) // Track total mistakes made
  const [startTime, setStartTime] = useState<number | null>(null)
  const [endTime, setEndTime] = useState<number | null>(null)
  const [status, setStatus] = useState<"idle" | "typing" | "completed">("idle")
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    setPrompt(initialPrompt)
    setInput("")
    setCharStates(Array(initialPrompt.length).fill("pending"))
    setMistakes(0)
    setTotalMistakes(0)
    setStartTime(null)
    setEndTime(null)
    setStatus("idle")
  }, [initialPrompt, language])

  const calculateHUD = useCallback((): PracticeHUD => {
    const timeMsRaw = endTime ? endTime - (startTime || 0) : startTime ? now - startTime : 0
    const timeMs = Math.max(0, timeMsRaw)

    const correctChars = charStates.filter((s) => s === "correct").length
    const timeMin = timeMs / 60000
    const wpm = timeMin > 0 ? Math.round(correctChars / 5 / timeMin) : 0
    // Calculate accuracy based on total characters typed vs total mistakes
    const totalCharsTyped = input.length
    const accuracy = totalCharsTyped > 0 ? Math.round(((totalCharsTyped - totalMistakes) / totalCharsTyped) * 100) : 0

    return { wpm, mistakes: totalMistakes, accuracy, timeMs }
  }, [charStates, totalMistakes, startTime, endTime, input.length, now])

  const handleInput = useCallback(
    (value: string) => {
      if (status === "completed" || endTime) return

      // Smart backspace logic: protect correct text until first mistake
      if (value.length < input.length) {
        const deletedIndex = value.length
        
        // Find the first mistake in the current input
        let firstMistakeIndex = -1
        for (let i = 0; i < value.length; i++) {
          if (value[i] !== prompt[i]) {
            firstMistakeIndex = i
            break
          }
        }
        
        // If no mistakes found, find first mistake in the original input
        if (firstMistakeIndex === -1) {
          for (let i = 0; i < input.length; i++) {
            if (input[i] !== prompt[i]) {
              firstMistakeIndex = i
              break
            }
          }
        }
        
        // Allow backspace only from the first mistake onwards
        if (firstMistakeIndex !== -1 && deletedIndex < firstMistakeIndex) {
          return // Don't allow deletion of correct characters before first mistake
        }
        
        // Allow backspace on spaces between words
        if (deletedIndex < prompt.length && prompt[deletedIndex] === ' ') {
          // Allow deletion of spaces
        }
      }

      // Start timer on first keystroke
      if (status === "idle" && value.length > 0) {
        const startedAt = Date.now()
        setStartTime(startedAt)
        setNow(startedAt)
        setStatus("typing")
      }

      setInput(value)

      const newStates: CharState[] = Array(prompt.length).fill("pending")
      let currentMistakes = 0

      for (let i = 0; i < value.length && i < prompt.length; i++) {
        if (value[i] === prompt[i]) {
          newStates[i] = "correct"
        } else {
          newStates[i] = "wrong"
          currentMistakes++
        }
      }

      // Update total mistakes - only count new mistakes, don't reset
      const newMistakes = currentMistakes - mistakes
      if (newMistakes > 0) {
        setTotalMistakes(prev => prev + newMistakes)
      }

      setCharStates(newStates)
      setMistakes(currentMistakes)

      // Check completion
      if (value === prompt) {
        const finishedAt = Date.now()
        setEndTime(finishedAt)
        setNow(finishedAt)
        setStatus("completed")

        // Save to history
        const hud = calculateHUD()
        saveToHistory({
          at: Date.now(),
          mode: "practice",
          language,
          wpm: hud.wpm,
          mistakes: totalMistakes,
          accuracy: hud.accuracy,
          timeMs: hud.timeMs,
          promptLen: prompt.length,
        })
      }
    },
    [status, prompt, calculateHUD, input.length, charStates, mistakes, totalMistakes, language],
  )

  const reset = useCallback((nextPrompt?: string) => {
    const now = Date.now()
    setNow(now)
    setPrompt((prevPrompt) => {
      const updatedPrompt = nextPrompt && nextPrompt.length > 0 ? nextPrompt : prevPrompt
      setCharStates(Array(updatedPrompt.length).fill("pending"))
      setInput("")
      setMistakes(0)
      setTotalMistakes(0)
      setStartTime(null)
      setEndTime(null)
      setStatus("idle")
      return updatedPrompt
    })
  }, [])

  useEffect(() => {
    if (status !== "typing" || !startTime || endTime) {
      return
    }

    const interval = window.setInterval(() => {
      setNow(Date.now())
    }, 100)

    return () => window.clearInterval(interval)
  }, [status, startTime, endTime])

  return {
    prompt,
    input,
    charStates,
    hud: calculateHUD(),
    status,
    handleInput,
    reset,
  }
}

function saveToHistory(row: {
  at: number
  mode: "practice"
  language: LanguageCode
  wpm: number
  mistakes: number
  accuracy: number
  timeMs: number
  promptLen: number
}) {
  try {
    const history = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) || "[]")
    history.unshift(row)
    // Keep only last 100 entries to prevent localStorage from getting too large
    const trimmedHistory = history.slice(0, 100)
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(trimmedHistory))
    
    // Also save to a separate stats file for better organization
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
    console.error("Failed to save history:", error)
  }
}
