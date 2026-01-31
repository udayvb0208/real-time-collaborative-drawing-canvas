let tool = "brush";
let strokeColor = "#000000";
let strokeWidth = 4;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const undoBtn = document.getElementById("undoBtn");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let drawing = false;
let currentStroke = null;

function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  const y = (e.clientY - rect.top) * (canvas.height / rect.height);
  return { x, y };
}

/* ================= DRAW ================= */

canvas.addEventListener("mousedown", (e) => {
  drawing = true;

  const pos = getPos(e);

  currentStroke = {
    id: crypto.randomUUID(),
    tool,
    color: strokeColor,
    width: strokeWidth,
    segments: [],
  };

  socket.emit("strokeStart", currentStroke);

  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
});

canvas.addEventListener("mousemove", (e) => {
  if (!drawing) return;

  const pos = getPos(e);
  const last = currentStroke.segments.at(-1)?.to || pos;

  const segment = { from: last, to: pos };
  currentStroke.segments.push(segment);

  drawSegment(segment, currentStroke);
  socket.emit("strokeMove", segment);
});

canvas.addEventListener("mouseup", () => {
  drawing = false;
  socket.emit("strokeEnd");
  currentStroke = null;
});

/* ================= UNDO ================= */

undoBtn.onclick = () => socket.emit("undo");

/* ================= SOCKET ================= */

socket.on("drawSegment", ({ segment, stroke }) => {
  drawSegment(segment, stroke);
});

socket.on("rebuild", (strokes) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  strokes.forEach(stroke => {
    stroke.segments.forEach(seg => drawSegment(seg, stroke));
  });
});

/* ================= RENDER ================= */

function drawSegment(seg, stroke) {
  ctx.lineWidth = stroke.width;
  ctx.lineCap = "round";
  ctx.strokeStyle = stroke.tool === "eraser" ? "#ffffff" : stroke.color;

  ctx.beginPath();
  ctx.moveTo(seg.from.x, seg.from.y);
  ctx.lineTo(seg.to.x, seg.to.y);
  ctx.stroke();
}
