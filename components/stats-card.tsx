"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { BarChart3, Trophy } from "lucide-react"
import { STATS_STORAGE_KEY } from "@/lib/storage-keys"

interface DailyStats {
  sessions: number
  totalWpm: number
  totalAccuracy: number
  bestWpm: number
}

interface StatsData {
  [date: string]: DailyStats
}

export function StatsCard() {
  const [stats, setStats] = useState<StatsData>({})

  const overallStats = useMemo(() => {
    const dates = Object.keys(stats)
    if (dates.length === 0) {
      return {
        totalSessions: 0,
        averageWpm: 0,
        bestWpm: 0,
        averageAccuracy: 0,
      }
    }

    let totalSessions = 0
    let totalWpm = 0
    let totalAccuracy = 0
    let bestWpm = 0

    dates.forEach((date) => {
      const dayStats = stats[date]
      totalSessions += dayStats.sessions
      totalWpm += dayStats.totalWpm
      totalAccuracy += dayStats.totalAccuracy
      bestWpm = Math.max(bestWpm, dayStats.bestWpm)
    })

    return {
      totalSessions,
      averageWpm: totalSessions > 0 ? Math.round(totalWpm / totalSessions) : 0,
      bestWpm,
      averageAccuracy: totalSessions > 0 ? Math.round(totalAccuracy / totalSessions) : 0,
    }
  }, [stats])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STATS_STORAGE_KEY)
      if (stored) {
        setStats(JSON.parse(stored))
      }
    } catch (error) {
      console.error("Failed to load stats:", error)
    }
  }, [])

  const recentDays = Object.keys(stats)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .slice(0, 7)

  return (
    <Card className="rounded-2xl p-6 shadow-md transition-colors">
      <div className="mb-6 flex items-center gap-2">
        <BarChart3 className="h-6 w-6 text-muted-foreground" />
        <h2 className="text-2xl font-semibold text-foreground">Your Statistics</h2>
      </div>

      {overallStats.totalSessions === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 bg-secondary/40 py-8 text-center">
          <Trophy className="mx-auto mb-3 h-12 w-12 text-muted-foreground/80" />
          <p className="font-medium text-foreground">No statistics yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete some practice sessions to see your stats
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <SummaryStat label="Sessions" value={overallStats.totalSessions} tone="text-primary" />
            <SummaryStat label="Avg WPM" value={overallStats.averageWpm} tone="text-emerald-400" />
            <SummaryStat label="Best WPM" value={overallStats.bestWpm} tone="text-indigo-400" />
            <SummaryStat label="Accuracy" value={`${overallStats.averageAccuracy}%`} tone="text-amber-400" />
          </div>

          {recentDays.length > 0 && (
            <div>
              <h3 className="mb-3 text-lg font-semibold text-foreground">Recent Activity</h3>
              <div className="space-y-2">
                {recentDays.map((date) => {
                  const dayStats = stats[date]
                  const avgWpm = dayStats.sessions > 0 ? Math.round(dayStats.totalWpm / dayStats.sessions) : 0
                  const avgAccuracy =
                    dayStats.sessions > 0 ? Math.round(dayStats.totalAccuracy / dayStats.sessions) : 0

                  return (
                    <div
                      key={date}
                      className="flex items-center justify-between rounded-xl border border-border/60 bg-secondary/40 p-3"
                    >
                      <div>
                        <div className="font-medium text-foreground">
                          {new Date(date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="text-sm text-muted-foreground">{dayStats.sessions} sessions</div>
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <Metric label="WPM" value={avgWpm} tone="text-emerald-400" />
                        <Metric label="Acc" value={`${avgAccuracy}%`} tone="text-sky-400" />
                        <Metric label="Best" value={dayStats.bestWpm} tone="text-indigo-400" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

function SummaryStat({ label, value, tone }: { label: string; value: number | string; tone: string }) {
  return (
    <div className="rounded-xl border border-border/60 p-4 text-center shadow-sm">
      <div className={`text-2xl font-bold ${tone}`}>{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  )
}

function Metric({ label, value, tone }: { label: string; value: number | string; tone: string }) {
  return (
    <div className="text-center">
      <div className={`font-mono text-base font-semibold ${tone}`}>{value}</div>
      <div className="text-xs text-muted-foreground/80">{label}</div>
    </div>
  )
}
