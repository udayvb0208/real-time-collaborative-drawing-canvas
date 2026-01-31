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

let tool = "brush"; 
let strokeColor = "#000000";
let strokeWidth = 4;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const undoBtn = document.getElementById("undoBtn");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let drawing = false;
let lastPos = null;

function drawSegment({ from, to, color, width, mode }) {
  ctx.save(); 
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = width;

  if (mode === "eraser") {
    ctx.globalCompositeOperation = "destination-out";
    ctx.strokeStyle = "rgba(0,0,0,1)";
  } else {
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = color;
  }

  ctx.beginPath(); 
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();

  ctx.restore(); 
}

undoBtn.addEventListener("click", () => {
  socket.emit("undo");
});

canvas.addEventListener("mousedown", (e) => {
  drawing = true;
  lastPos = getCanvasCoordinates(e, canvas);

  ctx.beginPath();
});

canvas.addEventListener("mousemove", (e) => {
  if (!drawing) return;

  const currentPos = getCanvasCoordinates(e, canvas);

  const segment = {
    from: lastPos,
    to: currentPos,
    color: strokeColor,
    width: strokeWidth,
    mode: tool,
  };

  drawSegment(segment);

  socket.emit("draw", segment);

  lastPos = currentPos;
});

canvas.addEventListener("mouseup", () => {
  if (!drawing) return;

  drawing = false;
  lastPos = null;
});

canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  const touch = e.touches[0];

  drawing = true;
  lastPos = getCanvasCoordinates(touch, canvas);

  ctx.beginPath(); // 🔴 new stroke
});

canvas.addEventListener("touchmove", (e) => {
  if (!drawing) return;
  e.preventDefault();

  const touch = e.touches[0];
  const currentPos = getCanvasCoordinates(touch, canvas);

  const segment = {
    from: lastPos,
    to: currentPos,
    color: strokeColor,
    width: strokeWidth,
    mode: tool,
  };

  drawSegment(segment);
  socket.emit("draw", segment);

  lastPos = currentPos;
});

canvas.addEventListener("touchend", () => {
  if (!drawing) return;

  drawing = false;
  lastPos = null;
});

socket.on("draw", (segment) => {
  drawSegment(segment);
});

socket.on("rebuild", (strokes) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  strokes.forEach((stroke) => {
    stroke.segments.forEach((segment) => {
      drawSegment(segment);
    });
  });
});
