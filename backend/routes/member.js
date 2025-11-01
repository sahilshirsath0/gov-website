import express from 'express';
import authMiddleware from '../middleware/auth.js';
import {
  getAllMembers,
  createMember,
  updateMember,
  deleteMember,
  getMemberById
} from '../controllers/memberController.js';

const router = express.Router();

// Public routes
router.get('/', getAllMembers);
router.get('/:id', getMemberById);

// Protected routes
router.use(authMiddleware);
router.post('/', createMember); // No multer needed - using base64
router.put('/:id', updateMember);
router.delete('/:id', deleteMember);

export default router;
