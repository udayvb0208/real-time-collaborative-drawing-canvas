# Real-Time Collaborative Drawing Canvas

A real-time multi-user drawing application where multiple users can draw simultaneously on a shared canvas. The application uses HTML5 Canvas for rendering and Socket.io for real-time communication.

---

# Features
- Real-time collaborative drawing
- Smooth canvas rendering
- Multi-user synchronization
- Per-user Undo functionality
- Normalized coordinates for accurate drawing across devices

---

# Tech Stack
- Frontend: HTML, CSS, Vanilla JavaScript (Canvas API)
- Backend: Node.js, Express
- Real-Time Communication: Socket.io

---

# Project Structure
collaborative-canvas/
├── client/
│ ├── index.html
│ ├── style.css
│ ├── canvas.js
│ └── websocket.js
├── server/
│ ├── server.js
│ ├── package.json
│ └── node_modules/
├── README.md
└── ARCHITECTURE.md


---

## How to Run the Project Locally

1️. Start the Backend Server
---------------------------

```bash

cd server
npm install
node server.js

Server will run at:

http://localhost:3000

2️. Start the Frontend
----------------------

Open client/index.html

Right-click → Open with Live Server

Frontend will open at:

http://127.0.0.1:5500/client/index.html


3️. Test Collaboration
----------------------

Open the same frontend URL in two different browsers or windows

Draw on one canvas and see it update in real-time on the other

Use the Undo button to remove your last stroke only

Notes
-----

No external drawing libraries are used

All drawing logic is implemented using native Canvas API

Real-time synchronization is handled entirely via WebSockets