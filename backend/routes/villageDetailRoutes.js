// routes/villageDetailRoutes.js
import express from 'express';
import VillageDetail from '../models/VillageDetail.js';
import authenticateAdmin from '../middleware/auth.js';

const router = express.Router();

// Get all village details (public)
router.get('/', async (req, res) => {
  try {
    const { lang = 'en' } = req.query;
    const villageDetails = await VillageDetail.find({ isActive: true })
      .populate('createdBy updatedBy', 'username')
      .sort({ createdAt: -1 });

    if (!villageDetails || villageDetails.length === 0) {
      return res.json({
        success: true,
        data: []
      });
    }

    // Return localized content for each village detail
    const localizedData = villageDetails.map(villageDetail => ({
      ...villageDetail.toObject(),
      title: villageDetail.title[lang] || villageDetail.title.en,
      description: villageDetail.description[lang] || villageDetail.description.en
    }));

    res.json({
      success: true,
      data: localizedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching village details',
      error: error.message
    });
  }
});

// Get all village details for admin (with all languages)
router.get('/admin', authenticateAdmin, async (req, res) => {
  try {
    const villageDetails = await VillageDetail.find({ isActive: true })
      .populate('createdBy updatedBy', 'username')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: villageDetails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching village details',
      error: error.message
    });
  }
});

// Get single village detail by ID
router.get('/:id', async (req, res) => {
  try {
    const { lang = 'en' } = req.query;
    const villageDetail = await VillageDetail.findById(req.params.id)
      .populate('createdBy updatedBy', 'username');

    if (!villageDetail || !villageDetail.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Village detail not found'
      });
    }

    // Return localized content
    const localizedData = {
      ...villageDetail.toObject(),
      title: villageDetail.title[lang] || villageDetail.title.en,
      description: villageDetail.description[lang] || villageDetail.description.en
    };

    res.json({
      success: true,
      data: localizedData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching village detail',
      error: error.message
    });
  }
});

// Create new village detail (Admin only)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const {
      title,
      description,
      imageData,
      contentType,
      filename,
      size
    } = req.body;

    const villageDetail = new VillageDetail({
      title,
      description,
      image: imageData ? {
        data: imageData,
        contentType,
        filename,
        size
      } : undefined,
      createdBy: req.admin.id,
      updatedBy: req.admin.id
    });

    await villageDetail.save();

    // Populate the created village detail
    const populatedVillageDetail = await VillageDetail.findById(villageDetail._id)
      .populate('createdBy updatedBy', 'username');

    res.status(201).json({
      success: true,
      message: 'Village detail created successfully',
      data: populatedVillageDetail
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating village detail',
      error: error.message
    });
  }
});

// Update village detail (Admin only)
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const {
      title,
      description,
      imageData,
      contentType,
      filename,
      size
    } = req.body;

    const updateData = {
      title,
      description,
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

    const villageDetail = await VillageDetail.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('createdBy updatedBy', 'username');

    if (!villageDetail) {
      return res.status(404).json({
        success: false,
        message: 'Village detail not found'
      });
    }

    res.json({
      success: true,
      message: 'Village detail updated successfully',
      data: villageDetail
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating village detail',
      error: error.message
    });
  }
});

// Delete village detail (Admin only) - HARD DELETE
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const villageDetail = await VillageDetail.findByIdAndDelete(req.params.id);

    if (!villageDetail) {
      return res.status(404).json({
        success: false,
        message: 'Village detail not found'
      });
    }

    res.json({
      success: true,
      message: 'Village detail deleted permanently',
      data: {
        deletedId: req.params.id,
        deletedTitle: villageDetail.title
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting village detail',
      error: error.message
    });
  }
});

export default router;
