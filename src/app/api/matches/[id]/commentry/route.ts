import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getRedisClient } from "@/lib/redis"
import { io } from "../../../socket/route"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { db } = await connectToDatabase()
    const commentary = await db.collection("commentary").find({ matchId: params.id }).sort({ createdAt: -1 }).toArray()

    return NextResponse.json(commentary)
  } catch (error) {
    console.error("Error fetching commentary:", error)
    return NextResponse.json({ error: "Failed to fetch commentary" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { over, ball, eventType, description, runs } = await request.json()

    if (!over || !ball || !eventType) {
      return NextResponse.json({ error: "over, ball, and eventType are required fields" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    const commentary = {
      matchId: params.id,
      over: Number(over),
      ball: Number(ball),
      eventType,
      description: description || "",
      runs: runs !== undefined ? Number(runs) : undefined,
      createdAt: new Date().toISOString(),
    }

    const result = await db.collection("commentary").insertOne(commentary)
    const createdCommentary = { ...commentary, _id: result.insertedId }

    // store the commentry cache 
    try {
      const redis = await getRedisClient()
      const cacheKey = `commentary:${params.id}`
   // lpush make sures that data is pushed to left side of the queue
      await redis.lpush(cacheKey, JSON.stringify(createdCommentary))

      await redis.ltrim(cacheKey, 0, 9)

      await redis.expire(cacheKey, 86400)
    } catch (redisError) {
      console.error("Redis caching error:", redisError)
    }

    if (io) {
      io.emit("commentaryUpdate", createdCommentary)
    }

    return NextResponse.json(createdCommentary)
  } catch (error) {
    console.error("Error adding commentary:", error)
    return NextResponse.json({ error: "Failed to add commentary" }, { status: 500 })
  }
}
