import { connectToDatabase } from "./mongodb"

export async function getNextMatchId(): Promise<number> {
  const { db } = await connectToDatabase()

  const result = await db.collection("counters").findOneAndUpdate(
    { name: "matchId" },
    { $inc: { sequence: 1 } },
    {
      upsert: true,
      returnDocument: "after",
    },
  )

  return result?.value?.sequence || 1
}
