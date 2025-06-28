import {createServer} from "http"
import { Server } from "socket.io"
import dotenv from  "dotenv"
import express from "express"

const app = express()

dotenv.config()


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


    socket.on('matchUpdate', (msg) => {
        socket.broadcast.emit('matchUpdate', msg)
    })

    socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id)
    })
})


const port = process.env.PORT || 8080


httpServer.listen(port, () => {
    console.log(`Server Listening on Port ${port}`)
})