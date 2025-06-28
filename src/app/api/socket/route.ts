import { Server } from "socket.io"
import { createServer } from "http"

const httpServer = createServer()
const io = new Server(httpServer, {
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

export { io }
