// routes/programRoutes.js
import express from 'express';
import Program from '../models/Program.js';
import  authenticateAdmin  from '../middleware/auth.js';

const router = express.Router();

// Get all programs
router.get('/', async (req, res) => {
  try {
    const programs = await Program.find({ isActive: true })
      .populate('createdBy updatedBy', 'username')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: programs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching programs',
      error: error.message
    });
  }
});

// Get all programs for admin (including inactive)
router.get('/admin', authenticateAdmin, async (req, res) => {
  try {
    const programs = await Program.find()
      .populate('createdBy updatedBy', 'username')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: programs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching programs',
      error: error.message
    });
  }
});

// Create program (Admin only)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const {
      name,
      description,
      imageData,
      contentType,
      filename,
      size
    } = req.body;

    const program = new Program({
      name,
      description,
      image: {
        data: imageData,
        contentType,
        filename,
        size
      },
      createdBy: req.admin.id
    });

    await program.save();

    res.status(201).json({
      success: true,
      message: 'Program created successfully',
      data: program
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating program',
      error: error.message
    });
  }
});

// Update program (Admin only)
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const {
      name,
      description,
      imageData,
      contentType,
      filename,
      size,
      isActive
    } = req.body;

    const updateData = {
      name,
      description,
      isActive,
      updatedBy: req.admin.id
    };

    if (imageData) {
      updateData.image = {
        data: imageData,
        contentType,
        filename,
        size
      };
    }

    const program = await Program.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }

    res.json({
      success: true,
      message: 'Program updated successfully',
      data: program
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating program',
      error: error.message
    });
  }
});

// Delete program (Admin only)
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const program = await Program.findByIdAndDelete(req.params.id);

    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }

    res.json({
      success: true,
      message: 'Program deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting program',
      error: error.message
    });
  }
});

export default router;
