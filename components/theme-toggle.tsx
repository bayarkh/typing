"use client"

import { useEffect, useState } from "react"
import { MoonStar, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        aria-label="Toggle theme"
        variant="outline"
        size="icon"
        className="rounded-full"
        disabled
      >
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  const currentTheme = theme === "system" ? systemTheme ?? "light" : theme
  const isDark = currentTheme === "dark"

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <Button
      aria-label={`Activate ${isDark ? "light" : "dark"} mode`}
      variant="outline"
      size="icon"
      className="rounded-full"
      onClick={handleToggle}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
    </Button>
  )
}
