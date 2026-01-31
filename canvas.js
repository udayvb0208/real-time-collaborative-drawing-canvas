function getCanvasCoordinates(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const clientX = event.clientX ?? event.pageX;
  const clientY = event.clientY ?? event.pageY;

  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
}

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const undoBtn = document.getElementById("undoBtn");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let drawing = false;
let lastPos = null;

undoBtn.addEventListener("click", () => {
  socket.emit("undo");
});

canvas.addEventListener("mousedown", (e) => {
  drawing = true;
  lastPos = getCanvasCoordinates(e, canvas);

  ctx.beginPath();
  ctx.moveTo(lastPos.x, lastPos.y);

  socket.emit("strokeStart");
});

canvas.addEventListener("mousemove", (e) => {
  if (!drawing) return;

  const currentPos = getCanvasCoordinates(e, canvas);

  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.strokeStyle = "black";
  ctx.lineTo(currentPos.x, currentPos.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(currentPos.x, currentPos.y);

  socket.emit("draw", {
    from: lastPos,
    to: currentPos,
  });

  lastPos = currentPos;
});

canvas.addEventListener("mouseup", () => {
  if (!drawing) return;

  drawing = false;
  lastPos = null;
  ctx.beginPath();

  socket.emit("strokeEnd");
});

canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  const touch = e.touches[0];

  drawing = true;
  lastPos = getCanvasCoordinates(touch, canvas);

  ctx.beginPath();
  ctx.moveTo(lastPos.x, lastPos.y);

  socket.emit("strokeStart");
});

canvas.addEventListener("touchmove", (e) => {
  if (!drawing) return;
  e.preventDefault();

  const touch = e.touches[0];
  const currentPos = getCanvasCoordinates(touch, canvas);

  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.strokeStyle = "black";
  ctx.lineTo(currentPos.x, currentPos.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(currentPos.x, currentPos.y);

  socket.emit("draw", {
    from: lastPos,
    to: currentPos,
  });

  lastPos = currentPos;
});

canvas.addEventListener("touchend", () => {
  if (!drawing) return;

  drawing = false;
  lastPos = null;
  ctx.beginPath();

  socket.emit("strokeEnd");
});

socket.on("draw", ({ from, to }) => {
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.strokeStyle = "black";

  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
});

socket.on("rebuild", (allStrokes) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  allStrokes.forEach((stroke) => {
    stroke.forEach(({ from, to }) => {
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    });
  });
});

