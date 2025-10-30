"use client"

import { PracticeCard } from "@/components/practice-card"
import { MultiplayerCard } from "@/components/multiplayer-card"
import { HistoryCard } from "@/components/history-card"
import { StatsCard } from "@/components/stats-card"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

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

        <section aria-labelledby="contact-heading">
          <Card className="shadow-md transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <CardTitle id="contact-heading">Contact</CardTitle>
              <CardDescription>Have a question or feedback? Send us a message.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" aria-label="Contact form">
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Email</Label>
                  <Input id="contact-email" type="email" placeholder="you@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-message">Message</Label>
                  <Textarea
                    id="contact-message"
                    placeholder="Let us know how we can help..."
                    required
                    rows={4}
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit">Send</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}
