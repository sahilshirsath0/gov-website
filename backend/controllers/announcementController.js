import Announcement from '../models/Announcement.js';

export const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ isActive: true })
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: announcements.length,
      data: announcements
    });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching announcements'
    });
  }
};

export const createAnnouncement = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const announcement = await Announcement.create({
      message: message.trim(),
      createdBy: req.admin._id
    });

    const populatedAnnouncement = await Announcement.findById(announcement._id)
      .populate('createdBy', 'username');

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: populatedAnnouncement
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating announcement'
    });
  }
};

export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, isActive } = req.body;

    const updateData = {};
    if (message) updateData.message = message.trim();
    if (isActive !== undefined) updateData.isActive = isActive;

    const announcement = await Announcement.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'username');

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    res.json({
      success: true,
      message: 'Announcement updated successfully',
      data: announcement
    });
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating announcement'
    });
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findByIdAndDelete(id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    res.json({
      success: true,
      message: 'Announcement permanently deleted'
    });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting announcement'
    });
  }
};

export const getAnnouncementById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const announcement = await Announcement.findById(id)
      .populate('createdBy', 'username');

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    res.json({
      success: true,
      data: announcement
    });
  } catch (error) {
    console.error('Get announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching announcement'
    });
  }
};
