"use client"

import { PracticeCard } from "@/components/practice-card"
import { MultiplayerCard } from "@/components/multiplayer-card"
import { HistoryCard } from "@/components/history-card"
import { StatsCard } from "@/components/stats-card"
import { ThemeToggle } from "@/components/theme-toggle"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background px-4 py-8 transition-colors">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="mb-4 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center sm:text-left">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Typeracing</h1>
            <p className="mt-2 text-base text-muted-foreground">
              Practice your typing speed or race with friends
            </p>
          </div>
          <div className="flex justify-center sm:justify-end">
            <ThemeToggle />
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <PracticeCard />
          <MultiplayerCard />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <StatsCard />
          <HistoryCard />
        </div>
      </div>
    </main>
  )
}
