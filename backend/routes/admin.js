import express from 'express';
import authMiddleware from '../middleware/auth.js';
import {
  checkSetupStatus,
  setupAdmin,
  loginAdmin,
  getAdminProfile,
  updateAdminProfile,
  logoutAdmin
} from '../controllers/adminController.js';

const router = express.Router();

// Public routes (NO authentication required)
router.get('/setup-status', checkSetupStatus);
router.post('/setup', setupAdmin);
router.post('/login', loginAdmin);

// Protected routes (authentication required)
// Apply middleware ONLY to routes below this line
router.use(authMiddleware);

router.get('/profile', getAdminProfile);
router.put('/profile', updateAdminProfile);
router.post('/logout', logoutAdmin);

export default router;
