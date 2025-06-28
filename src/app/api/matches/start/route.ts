import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getNextMatchId } from "@/lib/idcounter"

export async function POST(request: NextRequest) {
  try {
    const { team1, team2, ...matchInfo } = await request.json()

    if (!team1 || !team2) {
      return NextResponse.json({ error: "Team names are required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const matchId = await getNextMatchId()

    const match = {
      matchId: matchId.toString().padStart(4, "0"), // Ensure matchId is a 4-digit string
      team1,
      team2,
      status: "active",
      createdAt: new Date().toISOString(),
      ...matchInfo,
    }

    const result = await db.collection("matches").insertOne(match)
    const createdMatch = { ...match, _id: result.insertedId }

    return NextResponse.json(createdMatch)
  } catch (error) {
    console.error("Error creating match:", error)
    return NextResponse.json({ error: "Failed to create match" }, { status: 500 })
  }
}
