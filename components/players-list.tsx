"use client"

import { Card } from "@/components/ui/card"
import { Users } from "lucide-react"
import type { PlayerRow } from "@/types"

type PlayersListProps = {
  players: PlayerRow[]
}

export function PlayersList({ players }: PlayersListProps) {
  return (
    <Card className="rounded-2xl p-6 shadow-md transition-colors">
      <div className="mb-4 flex items-center gap-2">
        <Users className="h-6 w-6 text-muted-foreground" />
        <h2 className="text-xl font-semibold text-foreground">Players</h2>
        <span className="text-sm text-muted-foreground">({players.length})</span>
      </div>

      <div className="space-y-3">
        {players.map((player) => (
          <div
            key={player.id}
            className="rounded-xl border border-border/60 bg-secondary/40 p-4 transition-all duration-200 hover:border-border"
          >
            <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
              <div className="font-medium text-foreground">{player.name}</div>
              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                <Metric label="Progress" value={`${player.progress}%`} />
                <Metric label="WPM" value={player.wpm} />
                <Metric label="Accuracy" value={`${player.accuracy}%`} />
                <Metric label="Mistakes" value={player.mistakes} />
              </div>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  player.finished ? "bg-emerald-500" : "bg-primary"
                }`}
                style={{ width: `${player.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <span className="flex items-center gap-1 whitespace-nowrap">
      <span>{label}:</span>
      <span className="font-mono text-foreground">{value}</span>
    </span>
  )
}
