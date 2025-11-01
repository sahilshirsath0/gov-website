import Member from '../models/Member.js';

export const getAllMembers = async (req, res) => {
  try {
    const { department, page = 1, limit = 10 } = req.query;
    
    const query = { isActive: true };
    if (department) {
      query.department = { $regex: department, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    
    const members = await Member.find(query)
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Member.countDocuments(query);

    res.json({
      success: true,
      count: members.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      data: members
    });
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching members'
    });
  }
};

export const createMember = async (req, res) => {
  try {
    console.log('=== CREATE MEMBER ===');
    console.log('Request body keys:', Object.keys(req.body));
    
    const { name, description, position, department, email, phone, imageData, contentType, filename, size } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Name and description are required'
      });
    }

    // Email validation if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
      }
    }

    // Prepare image data
    let image = null;
    if (imageData && contentType && filename) {
      image = {
        data: imageData,
        contentType,
        filename,
        size: size || 0
      };
    }

    const member = await Member.create({
      name: name.trim(),
      description: description.trim(),
      position: position?.trim(),
      department: department?.trim(),
      email: email?.trim().toLowerCase(),
      phone: phone?.trim(),
      image,
      createdBy: req.admin._id
    });

    const populatedMember = await Member.findById(member._id)
      .populate('createdBy', 'username');

    res.status(201).json({
      success: true,
      message: 'Member created successfully',
      data: populatedMember
    });
  } catch (error) {
    console.error('Create member error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating member'
    });
  }
};

export const updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, position, department, email, phone, isActive } = req.body;

    // Email validation if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
      }
    }

    const updateData = {
      name: name?.trim(),
      description: description?.trim(),
      position: position?.trim(),
      department: department?.trim(),
      email: email?.trim().toLowerCase(),
      phone: phone?.trim(),
      isActive
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    const member = await Member.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'username');

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    res.json({
      success: true,
      message: 'Member updated successfully',
      data: member
    });
  } catch (error) {
    console.error('Update member error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating member'
    });
  }
};

export const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;

    const member = await Member.findByIdAndDelete(id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    res.json({
      success: true,
      message: 'Member permanently deleted'
    });
  } catch (error) {
    console.error('Delete member error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting member'
    });
  }
};

export const getMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const member = await Member.findById(id)
      .populate('createdBy', 'username');

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    res.json({
      success: true,
      data: member
    });
  } catch (error) {
    console.error('Get member error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching member'
    });
  }
};
