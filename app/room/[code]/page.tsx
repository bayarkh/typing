"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { RotateCcw, Play, LogOut } from "lucide-react"
import { useRoom } from "@/hooks/use-room"
import { HUD } from "@/components/hud"
import { PlayersList } from "@/components/players-list"
import { ThemeToggle } from "@/components/theme-toggle"
import type { LanguageCode, RoomState } from "@/types"
import { DEFAULT_LANGUAGE, LANGUAGE_OPTIONS, getLanguageLabel, getRandomPrompt } from "@/lib/prompts"
import { useToast } from "@/hooks/use-toast"

const STATUS_STYLES: Record<RoomState["status"], string> = {
  lobby: "bg-muted text-muted-foreground",
  countdown: "bg-amber-500/10 text-amber-400",
  racing: "bg-emerald-500/10 text-emerald-400",
  finished: "bg-sky-500/10 text-sky-400",
}

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string
  const { room, input, charStates, hud, isHost, handleInput, startCountdown, reset, isLoading, notFound } = useRoom(code)
  const [chosenLanguage, setChosenLanguage] = useState<LanguageCode | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [isWaitingDialogOpen, setIsWaitingDialogOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const [copyMessage, setCopyMessage] = useState<string | null>(null)

  useEffect(() => {
    if (room.status === "countdown" && room.startsAt) {
      const interval = setInterval(() => {
        const secondsLeft = Math.ceil((room.startsAt! - Date.now()) / 1000)
        setCountdown(secondsLeft)

        if (secondsLeft <= 0) {
          clearInterval(interval)
          setTimeout(() => setCountdown(null), 800)
        }
      }, 50)

      return () => clearInterval(interval)
    }

    setCountdown(null)
  }, [room.status, room.startsAt])

  useEffect(() => {
    if (room.status === "racing") {
      const timeout = setTimeout(() => inputRef.current?.focus(), 100)
      return () => clearTimeout(timeout)
    }
  }, [room.status])

  const getPlaceholder = () => {
    if (room.status === "lobby") return "Wait for host to start the race..."
    if (room.status === "countdown") {
      const secondsLeft = Math.ceil((room.startsAt! - Date.now()) / 1000)
      return `Starting in ${secondsLeft}... Get ready!`
    }
    if (room.status === "racing") return "Type the text above as fast as you can!"
    return "Race finished! Great job!"
  }

  const statusBadgeClass = STATUS_STYLES[room.status] ?? "bg-muted text-muted-foreground"
  const effectiveLanguage = chosenLanguage ?? room.language
  const canEditSettings = room.status === "lobby" || room.status === "finished"

  const handleStart = () => {
    const playersReady = Array.isArray(room.players) ? room.players.length >= 2 : false
    if (!playersReady) {
      setIsWaitingDialogOpen(true)
      return
    }

    startCountdown()
  }

  const handleCopyRoomCode = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
      toast({
        title: "Unable to copy room code",
        description: "Copying is not supported in this browser.",
        variant: "destructive",
      })
      return
    }

    try {
      await navigator.clipboard.writeText(code)
      setCopyMessage("Room code copied to clipboard")
      toast({
        title: "Room code copied",
        description: "Share it with a friend to start racing together.",
      })
    } catch (error) {
      console.error("Failed to copy room code", error)
      toast({
        title: "Unable to copy room code",
        description: "Please copy it manually.",
        variant: "destructive",
      })
    }
  }, [code, toast])

  useEffect(() => {
    if (!copyMessage) return
    const timeout = setTimeout(() => setCopyMessage(null), 2000)
    return () => clearTimeout(timeout)
  }, [copyMessage])

  const handleRematch = useCallback(() => {
    if (!isHost) return
    setChosenLanguage(null)
    reset(getRandomPrompt(DEFAULT_LANGUAGE), DEFAULT_LANGUAGE)
  }, [isHost, reset])

  if (notFound) {
    return (
      <main className="min-h-screen bg-background px-4 py-8">
        <div className="mx-auto max-w-lg space-y-4 text-center">
          <h1 className="text-3xl font-bold text-foreground">Room Not Found</h1>
          <p className="text-muted-foreground">
            We couldn&apos;t locate room {code}. It might have expired or the host has closed it.
          </p>
          <Button onClick={() => router.push("/")} className="rounded-full">
            <LogOut className="mr-2 h-4 w-4" />
            Return Home
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground">Room</h1>
            <Badge
              variant="outline"
              className="font-mono text-lg cursor-pointer select-none"
              role="button"
              tabIndex={0}
              title="Click to copy room code"
              aria-label="Copy room code"
              onClick={handleCopyRoomCode}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  handleCopyRoomCode()
                }
              }}
            >
              {code}
            </Badge>
            {copyMessage && <span className="text-sm text-emerald-500">{copyMessage}</span>}
            <Badge className={`capitalize ${statusBadgeClass}`}>{room.status}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="rounded-full"
              aria-label="Leave room"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Leave
            </Button>
          </div>
        </header>

        {room.status === "countdown" && countdown !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/20 backdrop-blur-sm">
            <div className="rounded-3xl bg-card p-16 text-center shadow-2xl">
              <div
                className={`mb-6 text-9xl font-bold transition-all duration-300 ${
                  countdown > 0 ? "animate-bounce text-primary" : "animate-pulse text-emerald-400"
                }`}
              >
                {countdown > 0 ? countdown : "GO!"}
              </div>
              <div className="mb-3 text-3xl font-semibold text-foreground">
                {countdown > 0 ? "Get ready to type!" : "Start typing now!"}
              </div>
              <div className="text-xl text-muted-foreground">
                {countdown > 0 ? "The race will start in a moment..." : "The race has begun!"}
              </div>
            </div>
          </div>
        )}

        <Card className="rounded-2xl p-6 shadow-md transition-colors">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <span>Prompt language: {getLanguageLabel(effectiveLanguage)}</span>
                <ToggleGroup
                  type="single"
                  value={effectiveLanguage}
                  onValueChange={(value) => {
                    if (!isHost || room.status !== "lobby" || !value) return
                    const language = value as LanguageCode
                    setChosenLanguage(language)
                    const nextPrompt = getRandomPrompt(language)
                    reset(nextPrompt, language)
                  }}
                  variant="outline"
                  size="sm"
                  className="w-fit"
                  aria-label="Select room prompt language"
                  disabled={!isHost || !canEditSettings}
                >
                  {LANGUAGE_OPTIONS.map(({ value, label }) => (
                    <ToggleGroupItem key={value} value={value} aria-label={label}>
                      {label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
              <span>Status: <span className="font-semibold capitalize text-foreground">{room.status}</span></span>
            </div>
            <div
              className="min-h-[80px] rounded-xl bg-secondary/60 p-4 font-mono text-lg leading-relaxed transition-colors"
              aria-label="Typing prompt"
              suppressHydrationWarning
            >
              {(isLoading && !room.prompt ? "Loading prompt…" : room.prompt).split("").map((char, index) => {
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
              disabled={room.status !== "racing"}
              placeholder={getPlaceholder()}
              className="font-mono text-lg"
              maxLength={room.prompt.length}
            />

            <HUD {...hud} />

            <div className="flex flex-wrap gap-3">
              {isHost && room.status === "lobby" && (
                <Button onClick={handleStart} className="rounded-full" disabled={isLoading}>
                  <Play className="mr-2 h-4 w-4" />
                  Start Countdown
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => reset(getRandomPrompt(effectiveLanguage), effectiveLanguage)}
                className="rounded-full bg-transparent"
                disabled={isLoading || !isHost || !canEditSettings}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
              {isHost && (
                <Button
                  variant="secondary"
                  onClick={handleRematch}
                  className="rounded-full"
                  disabled={isLoading}
                >
                  Rematch (Default)
                </Button>
              )}
            </div>
          </div>
        </Card>

        <PlayersList players={room.players} />
      </div>

      <AlertDialog open={isWaitingDialogOpen} onOpenChange={setIsWaitingDialogOpen}>
        <AlertDialogContent className="text-center">
          <AlertDialogHeader>
            <AlertDialogTitle>Waiting for your friend</AlertDialogTitle>
            <AlertDialogDescription>
              Invite a friend to join the room before starting the countdown.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsWaitingDialogOpen(false)}>Got it</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
