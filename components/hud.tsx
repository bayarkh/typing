import { Card } from "@/components/ui/card"
import { formatTime } from "@/lib/format"

type HUDProps = {
  wpm: number
  mistakes: number
  accuracy: number
  timeMs: number
}

export function HUD({ wpm, mistakes, accuracy, timeMs }: HUDProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <StatCard label="WPM" value={wpm} />
      <StatCard label="Mistakes" value={mistakes} />
      <StatCard label="Accuracy" value={`${accuracy}%`} />
      <StatCard label="Time" value={formatTime(timeMs)} />
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="border-border bg-secondary/50 p-3 text-center shadow-sm">
      <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-mono text-xl font-semibold text-foreground">{value}</div>
    </Card>
  )
}
