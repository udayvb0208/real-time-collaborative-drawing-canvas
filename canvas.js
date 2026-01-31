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

function drawSegment(seg, stroke) {
  ctx.save();

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = stroke.width;

  if (stroke.tool === "eraser") {
    ctx.globalCompositeOperation = "destination-out";
    ctx.strokeStyle = "rgba(0,0,0,1)";
  } else {
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = stroke.color;
  }

  ctx.beginPath();
  ctx.moveTo(seg.from.x, seg.from.y);
  ctx.lineTo(seg.to.x, seg.to.y);
  ctx.stroke();

  ctx.restore();
}

undoBtn.addEventListener("click", () => {
  socket.emit("undo");
});

canvas.addEventListener("mousedown", (e) => {
  drawing = true;
  lastPos = getCanvasCoordinates(e, canvas);
  socket.emit("strokeStart");
});

canvas.addEventListener("mousemove", (e) => {
  if (!drawing) return;

  const currentPos = getCanvasCoordinates(e, canvas);

  const segment = { from: lastPos, to: currentPos };
  const stroke = {
    tool,
    color: strokeColor,
    width: strokeWidth,
  };

  drawSegment(segment, stroke);

  socket.emit("draw", {
    ...segment,
    ...stroke,
  });

  lastPos = currentPos;
});

canvas.addEventListener("mouseup", () => {
  if (!drawing) return;

  drawing = false;
  lastPos = null;
  socket.emit("strokeEnd");
});

canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  const touch = e.touches[0];

  drawing = true;
  lastPos = getCanvasCoordinates(touch, canvas);
  socket.emit("strokeStart");
});

canvas.addEventListener("touchmove", (e) => {
  if (!drawing) return;
  e.preventDefault();

  const touch = e.touches[0];
  const currentPos = getCanvasCoordinates(touch, canvas);

  const segment = { from: lastPos, to: currentPos };
  const stroke = {
    tool,
    color: strokeColor,
    width: strokeWidth,
  };

  drawSegment(segment, stroke);

  socket.emit("draw", {
    ...segment,
    ...stroke,
  });

  lastPos = currentPos;
});

canvas.addEventListener("touchend", () => {
  if (!drawing) return;

  drawing = false;
  lastPos = null;
  socket.emit("strokeEnd");
});

socket.on("draw", ({ from, to, color, width, tool }) => {
  drawSegment(
    { from, to },
    { color, width, tool }
  );
});

socket.on("rebuild", (allStrokes) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  allStrokes.forEach((stroke) => {
    stroke.segments.forEach((seg) => {
      drawSegment(seg, stroke);
    });
  });
});
