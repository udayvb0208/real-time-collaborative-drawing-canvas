const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

const strokes = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  strokes[socket.id] = [];
  let currentStroke = null;

  socket.on("strokeStart", () => {
    currentStroke = [];
  });

  socket.on("draw", (segment) => {
    if (!currentStroke) return;

    currentStroke.push(segment);
    socket.broadcast.emit("draw", segment);
  });

  socket.on("strokeEnd", () => {
    if (currentStroke && currentStroke.length > 0) {
      strokes[socket.id].push(currentStroke);
    }
    currentStroke = null;
  });

  socket.on("undo", () => {
    if (!strokes[socket.id] || strokes[socket.id].length === 0) return;

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
