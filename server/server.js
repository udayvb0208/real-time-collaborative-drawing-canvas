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

let strokes = []; 


io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  socket.on("undo", () => {
  for (let i = strokes.length - 1; i >= 0; i--) {
    if (strokes[i].userId === socket.id) {
      strokes.splice(i, 1);
      break;
    }
  }

  io.emit("rebuild", strokes);
  });


  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
  socket.on("draw", (data) => {
  let lastStroke = strokes[strokes.length - 1];

  if (lastStroke && lastStroke.userId === socket.id) {
    lastStroke.segments.push(data);
  } else {
    strokes.push({
      userId: socket.id,
      segments: [data]
    });
  }

  socket.broadcast.emit("draw", data);
  });



});
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

