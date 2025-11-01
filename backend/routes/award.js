import express from 'express';
import authMiddleware from '../middleware/auth.js';
import {
  getAllAwards,
  createAward,
  updateAward,
  deleteAward,
  getAwardById
} from '../controllers/awardController.js';

const router = express.Router();

// Public routes
router.get('/', getAllAwards);
router.get('/:id', getAwardById);

// Protected routes
router.use(authMiddleware);
router.post('/', createAward); // No multer needed - using base64
router.put('/:id', updateAward);
router.delete('/:id', deleteAward);

export default router;
