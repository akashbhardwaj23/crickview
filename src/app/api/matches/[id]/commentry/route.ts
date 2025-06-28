import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getRedisClient } from "@/lib/redis"
import { io } from "../../../socket/io/route"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id
    console.log("above db")
    const { db } = await connectToDatabase()
    console.log("below db")
    const commentary = await db.collection("commentary").find({ matchId: id }).sort({ createdAt: -1 }).toArray()

    console.log("commentary ", commentary)
    return NextResponse.json(commentary)
  } catch (error) {
    console.error("Error fetching commentary:", error)
    return NextResponse.json({ error: "Failed to fetch commentary" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id
    const { over, ball, eventType, description, runs } = await request.json()
    // Validate required fields
    if (!over || !ball || !eventType) {
      return NextResponse.json({ error: "over, ball, and eventType are required fields" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    const commentary = {
      matchId: id,
      over: Number(over),
      ball: Number(ball),
      eventType,
      description: description || "",
      runs: runs !== undefined ? Number(runs) : undefined,
      createdAt: new Date().toISOString(),
    }

    const result = await db.collection("commentary").insertOne(commentary)
    const createdCommentary = { ...commentary, _id: result.insertedId }

    // Cache the commentary in Redis
    try {
      const redis = await getRedisClient()
      const cacheKey = `commentary:${id}`

      await redis.lpush(cacheKey, JSON.stringify(createdCommentary))

      await redis.ltrim(cacheKey, 0, 9)

      await redis.expire(cacheKey, 86400)
    } catch (redisError) {
      console.log("Redis caching error")
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
