import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js';
import gameRoutes from './routes/game.js';
import { createGame, getRandomQuestion } from './controllers/gameController.js';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: "*",
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);

// Basic route to test server
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Vibe backend is running!', 
    timestamp: new Date().toISOString(),
    endpoints: [
      'POST /api/auth/register',
      'POST /api/auth/login',
      'POST /api/game/queue/join',
      'GET /api/test'
    ]
  });
});

// Socket.io connection handling
let waitingUsers = []; // Simple array to track waiting users

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Handle user joining matching queue
  socket.on('join-matching-queue', (data) => {
    console.log('=== MATCHING ATTEMPT ===');
    console.log('User trying to match:', data.userId);
    console.log('Current waiting users:', waitingUsers.map(u => u.userId));
    
    // Check if user is already waiting
    const existingIndex = waitingUsers.findIndex(u => u.userId === data.userId);
    if (existingIndex !== -1) {
      console.log('User already in queue, removing old entry');
      waitingUsers.splice(existingIndex, 1);
    }
    
    // If there's someone else waiting, match them
    if (waitingUsers.length > 0) {
      const otherUser = waitingUsers.pop(); // Get the first waiting user
      
      // Create a new game
      const game = createGame(data.userId, otherUser.userId);
      
      console.log('MATCH FOUND!');
      console.log('Player 1:', data.userId);
      console.log('Player 2:', otherUser.userId);
      console.log('Game ID:', game.id);
      
      // Notify current user
      socket.emit('match-found', {
        gameId: game.id,
        opponent: otherUser.userId,
        yourTurn: game.currentTurn === data.userId
      });
      
      // Notify the waiting user
      if (otherUser.socketId) {
        socket.to(otherUser.socketId).emit('match-found', {
          gameId: game.id,
          opponent: data.userId,
          yourTurn: game.currentTurn === otherUser.userId
        });
      }
      
      console.log('Match notifications sent!');
    } else {
      // Add user to waiting list
      waitingUsers.push({
        userId: data.userId,
        socketId: socket.id,
        joinedAt: new Date()
      });
      
      console.log('Added to waiting list. Total waiting:', waitingUsers.length);
      
      socket.emit('queue-joined', { message: 'Looking for a match...' });
    }
  });

  // Handle game events
  socket.on('join-game', (data) => {
    socket.join(data.gameId);
    console.log(`User ${data.userId} joined game ${data.gameId}`);
  });

  socket.on('choose-truth-or-dare', (data) => {
    const { gameId, choice, userId } = data;
    console.log(`User ${userId} chose ${choice} in game ${gameId}`);
    
    // Get a random question based on choice
    const question = getRandomQuestion(choice, 2);
    
    // Send question to both players
    io.to(gameId).emit('question-received', {
      question: question.content,
      type: choice,
      currentPlayer: userId,
      category: question.category
    });
  });

  socket.on('answer-submitted', (data) => {
    const { gameId, answer, userId } = data;
    console.log(`User ${userId} submitted answer in game ${gameId}`);
    
    // Broadcast answer to both players
    io.to(gameId).emit('answer-received', {
      answer,
      playerId: userId,
      nextTurn: true
    });
  });

  // Handle video chat signaling - THESE MUST BE INSIDE THE CONNECTION HANDLER
  socket.on('video-signal', (data) => {
    console.log(`Video signal from ${socket.id} to ${data.to} in game ${data.gameId}`);
    
    // Forward signal to the target user
    socket.to(data.gameId).emit('video-signal', {
      gameId: data.gameId,
      signal: data.signal,
      from: socket.id
    });
  });

  // Handle video chat connection status
  socket.on('video-connected', (data) => {
    console.log(`Video connected in game ${data.gameId}`);
    socket.to(data.gameId).emit('video-connected', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove from waiting list if they were waiting
    waitingUsers = waitingUsers.filter(u => u.socketId !== socket.id);
    console.log('Removed from waiting list. Total waiting:', waitingUsers.length);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Vibe server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});
