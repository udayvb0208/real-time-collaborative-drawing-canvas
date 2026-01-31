Real-Time Collaborative Drawing Canvas – Architecture


1. Overview
-----------
This project is a real-time collaborative drawing application where multiple users can draw simultaneously on a shared canvas. The system is built using the HTML5 Canvas API on the client side and a Node.js + Socket.io server for real-time communication.

The architecture follows a client–server model where:

The client handles rendering and user interaction.

The server acts as the central authority for synchronization and state management.

2. High-Level Architecture
--------------------------
Browser (Client A)  ──┐
                      │
Browser (Client B)  ──┼── WebSocket (Socket.io) ── Node.js Server
                      │
Browser (Client C)  ──┘


All clients connect to a single Socket.io server.

Drawing events are sent to the server.

The server broadcasts these events to other connected clients.

The canvas state remains consistent across all users.

3. Client-Side Architecture
---------------------------

The client is implemented using Vanilla JavaScript and the Canvas API.

Responsibilities:

Capture mouse events (mousedown, mousemove, mouseup)

Convert mouse coordinates into canvas coordinates

Render strokes locally for instant feedback

Send drawing data to the server via WebSockets

Receive drawing updates from other users and render them

Key Files:

index.html
Defines the canvas and UI elements (Undo button).

canvas.js
Contains all drawing logic, coordinate normalization, and canvas rendering.

websocket.js
Initializes the Socket.io client and manages socket connection events.

4. Coordinate Normalization
---------------------------

Since canvas size can differ from CSS size or screen resolution, raw mouse coordinates cannot be used directly.

To solve this, mouse positions are converted into canvas coordinates using scaling logic based on the canvas bounding rectangle. This ensures:

Accurate drawing positions

Consistent rendering across different screen sizes and browsers

5. Server-Side Architecture
---------------------------

The server is built using Node.js, Express, and Socket.io.

Responsibilities:

Accept WebSocket connections from multiple clients

Receive drawing events from clients

Broadcast drawing events to other connected users

Maintain a global drawing history

Handle per-user undo functionality

Key Files:

server.js
Initializes the HTTP server, Socket.io, and manages all real-time events.

6. Real-Time Communication Flow
-------------------------------
Drawing Flow:

User draws on the canvas.

Client emits a draw event with stroke segment data.

Server receives the event.

Server broadcasts the stroke data to all other connected clients.

Other clients render the stroke on their canvas.

This event-driven model ensures low latency and smooth real-time collaboration.

7. Stroke Management Strategy
-----------------------------

Instead of sending individual pixels, the application sends stroke segments defined by:

Start coordinate

End coordinate

These segments are grouped into strokes, where:

Each stroke belongs to a specific user (identified by socket ID).

A stroke contains multiple segments.

This approach improves performance and enables advanced features like Undo.

8. Undo Functionality (Global History)
--------------------------------------

Undo is implemented on the server side to ensure consistency.

Logic:

The server maintains a global list of strokes.

Each stroke is associated with the user who created it.

When a user clicks Undo:

The server removes only the last stroke created by that user.

The updated stroke history is sent to all clients.

Each client clears the canvas and redraws the entire history.

This guarantees:

Undo affects only the requesting user

Other users’ drawings remain intact

All clients stay synchronized

9. Canvas State Rebuilding
--------------------------

Whenever an Undo occurs:

The server emits a rebuild event containing the full stroke history.

Clients clear their canvas.

The entire canvas is redrawn stroke by stroke.

This avoids partial state inconsistencies and visual glitches.

10. Design Decisions & Trade-offs
---------------------------------

Socket.io was chosen for reliable WebSocket communication and automatic reconnection.

Vanilla JavaScript was used instead of frameworks to keep the canvas logic simple and DOM-independent.

Server-side stroke history ensures correct synchronization but may require optimization for very large drawings.

Priority was given to smooth real-time experience over adding many UI features.

11. Conclusion
--------------

This architecture ensures:

Smooth real-time collaboration

Clear separation of concerns between client and server

Scalable and maintainable design

Correct handling of complex cases like multi-user undo

The system can be extended further with features like ghost cursors, rooms, and persistent storage if required.