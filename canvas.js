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
let lastPos = null;

undoBtn.addEventListener("click", () => {
  socket.emit("undo");
});


canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let drawing = false;


canvas.addEventListener("mousemove", (e) => {
  if (!drawing) return;

  const currentPos = getCanvasCoordinates(e, canvas);

  if (lastPos) {
    socket.emit("draw", {
      from: lastPos,
      to: currentPos
    });
  }

  lastPos = currentPos;

  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.strokeStyle = "black";

  ctx.lineTo(currentPos.x, currentPos.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(currentPos.x, currentPos.y);
});

canvas.addEventListener("mousedown", (e) => {
  drawing = true;
  lastPos = getCanvasCoordinates(e, canvas);

  ctx.beginPath();
  ctx.moveTo(lastPos.x, lastPos.y);
});



canvas.addEventListener("mouseup", () => {
  drawing = false;
  lastPos = null;
  ctx.beginPath();
});

socket.on("draw", (data) => {
  const { from, to } = data;

  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.strokeStyle = "black";

  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
});



socket.on("rebuild", (strokes) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  strokes.forEach(({ from, to }) => {
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  });
});



canvas.addEventListener("touchstart", (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  drawing = true;
  lastPos = getCanvasCoordinates(touch, canvas);
  ctx.beginPath();
  ctx.moveTo(lastPos.x, lastPos.y);
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
  drawing = false;
  lastPos = null;
  ctx.beginPath();
});




