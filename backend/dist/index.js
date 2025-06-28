"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*",
        methods: ['GET', 'POST'],
    }
});
io.on('connection', (socket) => {
    console.log("Client connected:", socket.id);
    socket.on('commentary', (msg) => {
        console.log(msg);
    });
    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});
app.listen(8080, () => {
    console.log('Server Listening on Port 8080');
});
