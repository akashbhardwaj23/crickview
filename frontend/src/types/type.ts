interface Match {
  _id: string
  matchId: string // 4-digit unique match ID
  team1: string
  team2: string
  status: "active" | "paused" | "completed"
  createdAt: string
}

interface Commentary {
  _id: string
  matchId: string
  over: number
  ball: number
  eventType: string // run, wicket, wide, etc. as per PDF
  description?: string
  runs?: number
  createdAt: string
}