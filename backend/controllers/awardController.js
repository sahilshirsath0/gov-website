import Award from '../models/Award.js';

export const getAllAwards = async (req, res) => {
  try {
    const awards = await Award.find({ isActive: true })
      .populate('createdBy', 'username')
      .sort({ awardDate: -1 });
    
    res.json({
      success: true,
      count: awards.length,
      data: awards
    });
  } catch (error) {
    console.error('Get awards error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching awards'
    });
  }
};

export const createAward = async (req, res) => {
  try {
    console.log('=== CREATE AWARD ===');
    console.log('Request body keys:', Object.keys(req.body));
    
    const { name, description, awardDate, imageData, contentType, filename, size } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Award name is required'
      });
    }

    if (!imageData || !contentType || !filename) {
      return res.status(400).json({
        success: false,
        message: 'Award image is required'
      });
    }

    // Prepare image data
    const image = {
      data: imageData,
      contentType,
      filename,
      size: size || 0
    };

    const award = await Award.create({
      name: name.trim(),
      description: description?.trim() || '',
      image,
      awardDate: awardDate ? new Date(awardDate) : new Date(),
      createdBy: req.admin._id
    });

    const populatedAward = await Award.findById(award._id)
      .populate('createdBy', 'username');

    console.log('Award created successfully');

    res.status(201).json({
      success: true,
      message: 'Award created successfully',
      data: populatedAward
    });
  } catch (error) {
    console.error('Create award error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating award'
    });
  }
};

export const updateAward = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, awardDate, isActive } = req.body;

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (isActive !== undefined) updateData.isActive = isActive;
    if (awardDate) updateData.awardDate = new Date(awardDate);

    const award = await Award.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'username');

    if (!award) {
      return res.status(404).json({
        success: false,
        message: 'Award not found'
      });
    }

    res.json({
      success: true,
      message: 'Award updated successfully',
      data: award
    });
  } catch (error) {
    console.error('Update award error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating award'
    });
  }
};

export const deleteAward = async (req, res) => {
  try {
    const { id } = req.params;

    const award = await Award.findByIdAndDelete(id);

    if (!award) {
      return res.status(404).json({
        success: false,
        message: 'Award not found'
      });
    }

    res.json({
      success: true,
      message: 'Award permanently deleted'
    });
  } catch (error) {
    console.error('Delete award error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting award'
    });
  }
};

export const getAwardById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const award = await Award.findById(id)
      .populate('createdBy', 'username');

    if (!award) {
      return res.status(404).json({
        success: false,
        message: 'Award not found'
      });
    }

    res.json({
      success: true,
      data: award
    });
  } catch (error) {
    console.error('Get award error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching award'
    });
  }
};
