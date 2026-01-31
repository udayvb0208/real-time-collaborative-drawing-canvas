const socket = io("real-time-collaborative-drawing-canvas-production-c72a.up.railway.app", {
  transports: ["websocket"],
});




socket.on("connect", () => {
  console.log("Connected to server:", socket.id);
});

