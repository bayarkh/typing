"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users } from "lucide-react"
import { NICKNAME_STORAGE_KEY, PLAYER_ID_STORAGE_KEY } from "@/lib/storage-keys"

export function MultiplayerCard() {
  const router = useRouter()
  const [nickname, setNickname] = useState("")
  const [roomCode, setRoomCode] = useState("")
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const storedId = localStorage.getItem(PLAYER_ID_STORAGE_KEY)
    if (storedId) {
      setPlayerId(storedId)
    } else {
      const newId = crypto.randomUUID()
      localStorage.setItem(PLAYER_ID_STORAGE_KEY, newId)
      setPlayerId(newId)
    }

    const storedName = localStorage.getItem(NICKNAME_STORAGE_KEY)
    if (storedName) {
      setNickname(storedName)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    localStorage.setItem(NICKNAME_STORAGE_KEY, nickname)
  }, [nickname])

  const handleCreateRoom = () => {
    if (!playerId) return

    setIsCreating(true)

    fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playerId,
        name: nickname || "Anonymous",
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data.error || "Failed to create room")
        }

        const data = await response.json()
        router.push(`/room/${data.room.code}`)
      })
      .catch((error) => {
        console.error(error)
        alert(error.message || "Unable to create a room. Please try again.")
      })
      .finally(() => setIsCreating(false))
  }

  const handleJoinRoom = () => {
    if (!playerId || roomCode.length !== 5) return

    const code = roomCode.toUpperCase()
    setIsJoining(true)

    fetch(`/api/rooms/${code}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "join",
        playerId,
        name: nickname || "Anonymous",
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data.error || "Failed to join room")
        }

        router.push(`/room/${code}`)
      })
      .catch((error) => {
        console.error(error)
        alert(error.message || "Unable to join the room. Please check the code and try again.")
      })
      .finally(() => setIsJoining(false))
  }

  const canInteract = Boolean(playerId)

  return (
    <Card className="rounded-2xl p-6 shadow-md transition-colors duration-300 hover:shadow-lg">
      <div className="mb-4 flex items-center gap-2">
        <Users className="h-6 w-6 text-muted-foreground" />
        <h2 className="text-2xl font-semibold text-foreground">Multiplayer Rooms</h2>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="nickname" className="text-sm font-medium text-muted-foreground">
            Nickname (optional)
          </Label>
          <Input
            id="nickname"
            type="text"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            placeholder="Your name"
            className="mt-1"
            maxLength={20}
            disabled={!canInteract || isCreating || isJoining}
          />
        </div>

        <div>
          <Label htmlFor="room-code" className="text-sm font-medium text-muted-foreground">
            Room invitation code
          </Label>
          <Input
            id="room-code"
            type="text"
            value={roomCode}
            onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
            placeholder="ABCDE"
            className="mt-1 font-mono uppercase"
            maxLength={5}
            disabled={!canInteract || isCreating}
          />
        </div>

        <div className="flex gap-3">
          <Button onClick={handleCreateRoom} className="flex-1 rounded-full" disabled={!canInteract || isCreating}>
            {isCreating ? "Creating..." : "Create Room"}
          </Button>
          <Button
            onClick={handleJoinRoom}
            disabled={!canInteract || roomCode.length !== 5 || isJoining}
            variant="outline"
            className="flex-1 rounded-full bg-transparent"
          >
            {isJoining ? "Joining..." : "Join"}
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          No login required. Share the code to invite.
        </p>
      </div>
    </Card>
  )
}
