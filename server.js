const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// In-memory storage (in production, use a database)
const rooms = {}; // { roomId: { name, teacherCode, characters: {}, posts: [], comments: {} } }
const teachers = {}; // { teacherCode: roomId }

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Generate a unique 6-character room code
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// API: Teacher creates a room
app.post('/api/rooms', (req, res) => {
  const { teacherName, roomName } = req.body;
  const roomId = uuidv4();
  const teacherCode = generateRoomCode();
  
  rooms[roomId] = {
    id: roomId,
    name: roomName,
    teacherName,
    teacherCode,
    characters: {},
    posts: [],
    comments: {}
  };
  
  teachers[teacherCode] = roomId;
  
  res.json({ roomId, teacherCode });
});

// API: Student joins room with teacher code
app.post('/api/join', (req, res) => {
  const { teacherCode } = req.body;
  const roomId = teachers[teacherCode];
  
  if (!roomId || !rooms[roomId]) {
    return res.status(404).json({ error: 'Invalid room code' });
  }
  
  res.json({ roomId, room: rooms[roomId] });
});

// API: Get room data
app.get('/api/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  if (!rooms[roomId]) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json(rooms[roomId]);
});

// API: Create character
app.post('/api/rooms/:roomId/characters', (req, res) => {
  const { roomId } = req.params;
  const { name, personality, backstory, photoUrl } = req.body;
  
  if (!rooms[roomId]) {
    return res.status(404).json({ error: 'Room not found' });
  }
  
  const characterId = uuidv4();
  const character = {
    id: characterId,
    name,
    personality,
    backstory,
    photoUrl,
    createdAt: new Date().toISOString()
  };
  
  rooms[roomId].characters[characterId] = character;
  
  io.to(roomId).emit('character-created', character);
  res.json(character);
});

// API: Create post
app.post('/api/rooms/:roomId/posts', (req, res) => {
  const { roomId } = req.params;
  const { characterId, content, mediaType, mediaUrl } = req.body;
  
  if (!rooms[roomId]) {
    return res.status(404).json({ error: 'Room not found' });
  }
  
  const postId = uuidv4();
  const post = {
    id: postId,
    characterId,
    content,
    mediaType, // 'text', 'image', 'video', 'audio', 'art'
    mediaUrl,
    createdAt: new Date().toISOString(),
    likes: 0
  };
  
  rooms[roomId].posts.push(post);
  rooms[roomId].comments[postId] = [];
  
  io.to(roomId).emit('post-created', post);
  res.json(post);
});

// API: Add comment to post
app.post('/api/rooms/:roomId/posts/:postId/comments', (req, res) => {
  const { roomId, postId } = req.params;
  const { characterId, content } = req.body;
  
  if (!rooms[roomId]) {
    return res.status(404).json({ error: 'Room not found' });
  }
  
  const commentId = uuidv4();
  const comment = {
    id: commentId,
    postId,
    characterId,
    content,
    createdAt: new Date().toISOString()
  };
  
  rooms[roomId].comments[postId].push(comment);
  
  io.to(roomId).emit('comment-added', comment);
  res.json(comment);
});

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
