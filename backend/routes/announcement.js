import express from 'express';
import authMiddleware from '../middleware/auth.js';
import {
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getAnnouncementById
} from '../controllers/announcementController.js';

const router = express.Router();

// Public routes
router.get('/', getAllAnnouncements);
router.get('/:id', getAnnouncementById);

// Protected routes
router.use(authMiddleware);
router.post('/', createAnnouncement); // No multer needed - just text
router.put('/:id', updateAnnouncement);
router.delete('/:id', deleteAnnouncement);

export default router;
