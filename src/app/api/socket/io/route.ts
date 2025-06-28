import type { NextRequest } from "next/server"
import { Server as ServerIO } from "socket.io"
import type { Server as NetServer } from "http"

export const config = {
  api: {
    bodyParser: false,
  },
}

let io: ServerIO

export async function GET(req: NextRequest) {
  if (!io) {
    const httpServer: NetServer = (req as any).socket.server
    io = new ServerIO(httpServer, {
      path: "/api/socket/io",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    })

    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id)

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id)
      })
    })
  }

  return new Response("Socket.IO server initialized", { status: 200 })
}

export { io }
