"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { RotateCcw } from "lucide-react"
import { usePractice } from "@/hooks/use-practice"
import { HUD } from "@/components/hud"
import { DEFAULT_LANGUAGE, LANGUAGE_OPTIONS, getRandomPrompt, getLanguageLabel, getDefaultPrompt } from "@/lib/prompts"
import type { LanguageCode } from "@/types"

export function PracticeCard() {
  const [language, setLanguage] = useState<LanguageCode>(DEFAULT_LANGUAGE)
  const [selectedPrompt, setSelectedPrompt] = useState<string>(() => getDefaultPrompt(DEFAULT_LANGUAGE))

  const {
    prompt,
    input,
    charStates,
    hud,
    status,
    handleInput,
    reset: resetPractice,
  } = usePractice(selectedPrompt, language)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const nextPrompt = getRandomPrompt(language)
    setSelectedPrompt(nextPrompt)
    resetPractice(nextPrompt)
  }, [language, resetPractice])

  const handleLanguageChange = (value: string) => {
    if (!value) return
    const nextLang = value as LanguageCode
    if (nextLang === language) return
    setLanguage(nextLang)
  }

  const handleReset = () => {
    const nextPrompt = getRandomPrompt(language)
    setSelectedPrompt(nextPrompt)
    resetPractice(nextPrompt)
  }

  return (
    <Card className="rounded-2xl p-6 shadow-md transition-all duration-300 hover:shadow-lg">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Practice</h2>
          <p className="text-sm text-muted-foreground">Typing language: {getLanguageLabel(language)}</p>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <ToggleGroup
            type="single"
            value={language}
            onValueChange={handleLanguageChange}
            variant="outline"
            size="sm"
            aria-label="Select typing language"
          >
            {LANGUAGE_OPTIONS.map(({ value, label }) => (
              <ToggleGroupItem key={value} value={value} aria-label={label}>
                {label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="rounded-full bg-transparent"
            aria-label="Reset practice"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div
          className="min-h-[80px] rounded-xl bg-secondary/60 p-4 font-mono text-lg leading-relaxed transition-colors"
          aria-label="Typing prompt"
        >
          {prompt.split("").map((char, index) => {
            const state = charStates[index]
            return (
              <span
                key={index}
                className={
                  state === "correct"
                    ? "text-emerald-500"
                    : state === "wrong"
                      ? "rounded px-0.5 bg-destructive/20 text-destructive"
                      : "text-muted-foreground"
                }
              >
                {char}
              </span>
            )
          })}
        </div>

        <Input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(event) => handleInput(event.target.value)}
          disabled={status === "completed"}
          placeholder="Start typing..."
          className="font-mono text-lg"
          maxLength={prompt.length}
          aria-describedby="practice-help"
        />

        <HUD {...hud} />

        <p id="practice-help" className="text-center text-sm text-muted-foreground">
          Exact match only. Errors increase mistakes.
        </p>
      </div>
    </Card>
  )
}
