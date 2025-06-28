import {createServer} from "http"
import { Server } from "socket.io"
import express from "express"

const app = express()

const httpServer = createServer(app)
const io = new Server(httpServer, {
    cors : {
        origin : "*",
        methods : ['GET', 'POST'],
    }
})

io.on('connection', (socket) => {
    console.log("Client connected:", socket.id)

    socket.on('commentaryUpdate', (msg) => {
        socket.broadcast.emit('commentaryUpdate', msg)
    })

    socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id)
    })
})


httpServer.listen(8080, () => {
    console.log('Server Listening on Port 8080')
})