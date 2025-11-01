import express from 'express';
import authMiddleware from '../middleware/auth.js';
import {
  getAllGallery,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem
} from '../controllers/galleryController.js';

const router = express.Router();

// Public routes
router.get('/', getAllGallery);

// Protected routes
router.use(authMiddleware);
router.post('/', createGalleryItem); // No multer needed anymore
router.put('/:id', updateGalleryItem);
router.delete('/:id', deleteGalleryItem);

export default router;
