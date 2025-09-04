import { v4 as uuidv4 } from 'uuid';
import { truthQuestions, dareQuestions } from './questions.js';


// In-memory storage (we'll replace with database later)
let activeGames = {};
let matchingQueue = [];

export const joinMatchingQueue = (req, res) => {
  try {
    const { userId, preferences } = req.body;
    
    // Check if user is already in queue
    const existingIndex = matchingQueue.findIndex(user => user.userId === userId);
    if (existingIndex !== -1) {
      return res.status(400).json({ error: 'Already in matching queue' });
    }

    // Add user to queue
    const queueEntry = {
      userId,
      preferences: preferences || {},
      joinedAt: new Date(),
      socketId: null // Will be set when socket connects
    };

    matchingQueue.push(queueEntry);

    res.json({ 
      message: 'Joined matching queue', 
      position: matchingQueue.length,
      queueSize: matchingQueue.length 
    });
  } catch (error) {
    console.error('Queue join error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const leaveMatchingQueue = (req, res) => {
  try {
    const { userId } = req.body;
    
    matchingQueue = matchingQueue.filter(user => user.userId !== userId);
    
    res.json({ message: 'Left matching queue' });
  } catch (error) {
    console.error('Queue leave error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createGame = (player1Id, player2Id) => {
  const gameId = uuidv4();
  
  const game = {
    id: gameId,
    player1: player1Id,
    player2: player2Id,
    currentTurn: player1Id,
    questionsAsked: [],
    round: 1,
    status: 'active',
    createdAt: new Date()
  };

  activeGames[gameId] = game;
  return game;
};

export const getRandomQuestion = (type = 'truth', difficulty = 1) => {
  const questions = type === 'truth' ? truthQuestions : dareQuestions;
  const filteredQuestions = questions.filter(q => q.difficulty <= difficulty);
  
  if (filteredQuestions.length === 0) return questions[0];
  
  const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
  return filteredQuestions[randomIndex];
};

export const submitAnswer = (req, res) => {
  try {
    const { gameId, answer, userId } = req.body;
    
    const game = activeGames[gameId];
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (game.currentTurn !== userId) {
      return res.status(400).json({ error: 'Not your turn' });
    }

    // Record the answer
    game.questionsAsked.push({
      question: answer.question,
      answer: answer.response,
      playerId: userId,
      timestamp: new Date()
    });

    // Switch turns
    game.currentTurn = game.currentTurn === game.player1 ? game.player2 : game.player1;
    game.round += 1;

    res.json({ 
      message: 'Answer submitted', 
      game: {
        id: game.id,
        currentTurn: game.currentTurn,
        round: game.round
      }
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getGameStatus = (req, res) => {
  try {
    const { gameId } = req.params;
    
    const game = activeGames[gameId];
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.json({ game });
  } catch (error) {
    console.error('Get game status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Helper function to find matches
export const findMatch = (userId) => {
  if (matchingQueue.length < 2) return null;
  
  const userIndex = matchingQueue.findIndex(user => user.userId === userId);
  if (userIndex === -1) return null;
  
  // Simple matching - just pair with the next person in queue
  const otherUserIndex = userIndex === 0 ? 1 : 0;
  const matchedUser = matchingQueue[otherUserIndex];
  
  // Remove both users from queue
  matchingQueue = matchingQueue.filter(user => 
    user.userId !== userId && user.userId !== matchedUser.userId
  );
  
  return matchedUser;
};
