import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const { status } = await request.json()

    if (!status || !["active", "paused", "completed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    const result = await db
      .collection("matches")
      .findOneAndUpdate(
        { matchId: id },
        { $set: { status, updatedAt: new Date().toISOString() } },
        { returnDocument: "after" },
      )

      if(!result){
        return NextResponse.json({ error: "Result not found" }, { status: 404 })
      }

      console.log("result is ", result)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating match status:", error)
    return NextResponse.json({ error: "Failed to update match status" }, { status: 500 })
  }
}
