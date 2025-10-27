"use client"

import { Card } from "@/components/ui/card"
import { Clock } from "lucide-react"
import { useHistory } from "@/hooks/use-history"
import { formatTime, formatDate } from "@/lib/format"
import { getLanguageLabel } from "@/lib/prompts"

export function HistoryCard() {
  const { history } = useHistory()

  return (
    <Card className="rounded-2xl p-6 shadow-md transition-colors">
      <div className="mb-4 flex items-center gap-2">
        <Clock className="h-6 w-6 text-muted-foreground" />
        <h2 className="text-2xl font-semibold text-foreground">All-Time History</h2>
      </div>

      {history.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 bg-secondary/40 py-10 text-center">
          <Clock className="mx-auto mb-3 h-12 w-12 text-muted-foreground/80" />
          <p className="font-medium text-foreground">No history yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete a practice or race to see your stats here
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/60 bg-secondary/30">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60">
              <tr className="text-left text-muted-foreground">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Mode</th>
                <th className="px-4 py-3">Lang</th>
                <th className="px-4 py-3 text-right">WPM</th>
                <th className="px-4 py-3 text-right">Mistakes</th>
                <th className="px-4 py-3 text-right">Accuracy</th>
                <th className="px-4 py-3 text-right">Time</th>
                <th className="px-4 py-3 text-right">Len</th>
                <th className="px-4 py-3">Room</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-foreground">
              {history.map((row, index) => (
                <tr key={index} className="transition-colors hover:bg-secondary/80">
                  <td className="px-4 py-3">{formatDate(row.at)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        row.mode === "practice"
                          ? "bg-sky-500/10 text-sky-400"
                          : "bg-violet-500/10 text-violet-400"
                      }`}
                    >
                      {row.mode}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      {getLanguageLabel(row.language)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">{row.wpm}</td>
                  <td className="px-4 py-3 text-right font-mono">{row.mistakes}</td>
                  <td className="px-4 py-3 text-right font-mono">{row.accuracy}%</td>
                  <td className="px-4 py-3 text-right font-mono">{formatTime(row.timeMs)}</td>
                  <td className="px-4 py-3 text-right font-mono">{row.promptLen}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{row.room || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
