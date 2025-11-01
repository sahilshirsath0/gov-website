import express from 'express';
import authMiddleware from '../middleware/auth.js';
import {
  getAllFeedback,
  submitFeedback,
  updateFeedbackStatus,
  getFeedbackById,
  deleteFeedback
} from '../controllers/feedbackController.js';

const router = express.Router();

// Public routes
router.post('/', submitFeedback);

// Protected routes (Admin only)
router.use(authMiddleware);
router.get('/', getAllFeedback);
router.get('/:id', getFeedbackById);
router.put('/:id/status', updateFeedbackStatus);
router.delete('/:id', deleteFeedback);

export default router;
