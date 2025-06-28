import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status } = await request.json()

    if (!status || !["active", "paused", "completed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    const result = await db
      .collection("matches")
      .findOneAndUpdate(
        { matchId: params.id },
        { $set: { status, updatedAt: new Date().toISOString() } },
        { returnDocument: "after" },
      )

      if(!result){
        return NextResponse.json({error : "Not Found"}, {status : 403});
      }
    if (!result.value) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 })
    }

    return NextResponse.json(result.value)
  } catch (error) {
    console.error("Error updating match status:", error)
    return NextResponse.json({ error: "Failed to update match status" }, { status: 500 })
  }
}
