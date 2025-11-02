// routes/nagrikSevaRoutes.js
import express from 'express';
import { NagrikSevaHeader, NagrikSevaApplication } from '../models/NagrikSeva.js';
import  authenticateAdmin  from '../middleware/auth.js';

const router = express.Router();

// Get header image
router.get('/header', async (req, res) => {
  try {
    const header = await NagrikSevaHeader.findOne().populate('updatedBy', 'username');
    res.json({
      success: true,
      data: header
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching header image',
      error: error.message
    });
  }
});

// Update header image (Admin only)
router.post('/header', authenticateAdmin, async (req, res) => {
  try {
    const { imageData, contentType, filename, size } = req.body;

    let header = await NagrikSevaHeader.findOne();
    
    if (header) {
      header.image = {
        data: imageData,
        contentType,
        filename,
        size
      };
      header.updatedBy = req.admin.id;
    } else {
      header = new NagrikSevaHeader({
        image: {
          data: imageData,
          contentType,
          filename,
          size
        },
        updatedBy: req.admin.id
      });
    }

    await header.save();

    res.json({
      success: true,
      message: 'Header image updated successfully',
      data: header
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating header image',
      error: error.message
    });
  }
});

// Get all applications (Admin only)
router.get('/applications', authenticateAdmin, async (req, res) => {
  try {
    const applications = await NagrikSevaApplication.find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
});

// Create application (Public route)
router.post('/apply', async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      whatsappNumber,
      aadhaarNumber,
      email,
      certificateHolderName,
      dateOfBirth,
      dateOfRegistration,
      paymentScreenshot
    } = req.body;

    const application = new NagrikSevaApplication({
      firstName,
      middleName,
      lastName,
      whatsappNumber,
      aadhaarNumber,
      email,
      certificateHolderName,
      dateOfBirth,
      dateOfRegistration,
      paymentScreenshot
    });

    await application.save();

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting application',
      error: error.message
    });
  }
});

// Update application status (Admin only)
router.patch('/applications/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const application = await NagrikSevaApplication.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      message: 'Application status updated',
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating application status',
      error: error.message
    });
  }
});

export default router;
