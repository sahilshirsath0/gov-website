import Gallery from '../models/Gallery.js';

export const getAllGallery = async (req, res) => {
  try {
    const gallery = await Gallery.find({ isActive: true })
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: gallery.length,
      data: gallery
    });
  } catch (error) {
    console.error('Get gallery error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching gallery'
    });
  }
};

export const createGalleryItem = async (req, res) => {
  try {
    console.log('=== CREATE GALLERY ITEM ===');
    console.log('Request body keys:', Object.keys(req.body));
    
    const { name, description, imageData, contentType, filename, size } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    if (!imageData || !contentType || !filename) {
      return res.status(400).json({
        success: false,
        message: 'Image data is required'
      });
    }

    const galleryItem = await Gallery.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      image: {
        data: imageData,
        contentType,
        filename,
        size: size || 0
      },
      createdBy: req.admin._id
    });

    const populatedItem = await Gallery.findById(galleryItem._id)
      .populate('createdBy', 'username');

    console.log('Gallery item created successfully');

    res.status(201).json({
      success: true,
      message: 'Gallery item created successfully',
      data: populatedItem
    });
  } catch (error) {
    console.error('Create gallery error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating gallery item'
    });
  }
};

export const updateGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive } = req.body;

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (isActive !== undefined) updateData.isActive = isActive;

    const galleryItem = await Gallery.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'username');

    if (!galleryItem) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    res.json({
      success: true,
      message: 'Gallery item updated successfully',
      data: galleryItem
    });
  } catch (error) {
    console.error('Update gallery error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating gallery item'
    });
  }
};

export const deleteGalleryItem = async (req, res) => {
  try {
    const { id } = req.params;

    const galleryItem = await Gallery.findByIdAndDelete(id);

    if (!galleryItem) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    res.json({
      success: true,
      message: 'Gallery item permanently deleted'
    });
  } catch (error) {
    console.error('Delete gallery error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting gallery item'
    });
  }
};
