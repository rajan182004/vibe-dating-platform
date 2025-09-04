import express from 'express';
import { 
  joinMatchingQueue, 
  leaveMatchingQueue, 
  submitAnswer, 
  getGameStatus 
} from '../controllers/gameController.js';

const router = express.Router();

// POST /api/game/queue/join
router.post('/queue/join', joinMatchingQueue);

// POST /api/game/queue/leave
router.post('/queue/leave', leaveMatchingQueue);

// POST /api/game/answer
router.post('/answer', submitAnswer);

// GET /api/game/:gameId
router.get('/:gameId', getGameStatus);

export default router;
