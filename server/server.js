const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const strokes = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  strokes[socket.id] = [];

  socket.on("draw", (data) => {
    strokes[socket.id].push(data);
    socket.broadcast.emit("draw", data);
  });

  socket.on("undo", () => {
    if (strokes[socket.id].length === 0) return;

    strokes[socket.id].pop();

    const allStrokes = Object.values(strokes).flat();
    io.emit("rebuild", allStrokes);
  });

  socket.on("disconnect", () => {
    delete strokes[socket.id];
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
