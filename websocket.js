const socket = io("https://real-time-collaborative-drawing-canvas-production-c72a.up.railway.app", {
  transports: ["websocket"],
});


socket.io.opts.reconnection = true;
socket.io.opts.timeout = 20000;

socket.on("connect", () => {
  console.log("Connected to server:", socket.id);
});




