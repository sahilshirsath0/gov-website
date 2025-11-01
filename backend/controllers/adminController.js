import Admin from '../models/Admin.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

export const checkSetupStatus = async (req, res) => {
  try {
    const adminCount = await Admin.countDocuments();
    const isSetupRequired = adminCount === 0;
    
    res.json({
      success: true,
      data: {
        setupRequired: isSetupRequired,
        hasAdmin: adminCount > 0
      }
    });
  } catch (error) {
    console.error('Setup status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error checking setup status'
    });
  }
};

export const setupAdmin = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    const existingAdmin = await Admin.findOne();
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin already exists. Use login instead.'
      });
    }

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const admin = await Admin.create({
      username: username.trim(),
      password,
      email: email?.trim(),
      isSetup: true
    });

    const token = generateToken(admin._id);

    res.status(201).json({
      success: true,
      message: 'Admin setup completed successfully',
      data: {
        admin: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          isSetup: admin.isSetup
        },
        token
      }
    });
  } catch (error) {
    console.error('Admin setup error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error during admin setup'
    });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password'
      });
    }

    const admin = await Admin.findOne({ username: username.trim() });

    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    admin.lastLogin = new Date();
    await admin.save();

    const token = generateToken(admin._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        admin: {
          id: admin._id,
          username: admin.username,
          email: admin.email,
          lastLogin: admin.lastLogin,
          isSetup: admin.isSetup
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select('-password');
    res.json({
      success: true,
      data: admin
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const updateAdminProfile = async (req, res) => {
  try {
    const { username, email, currentPassword, newPassword } = req.body;

    const admin = await Admin.findById(req.admin._id);

    if (currentPassword && newPassword) {
      const isMatch = await admin.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long'
        });
      }

      admin.password = newPassword;
    }

    if (username) admin.username = username.trim();
    if (email !== undefined) admin.email = email?.trim();

    await admin.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        isSetup: admin.isSetup
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
};

export const logoutAdmin = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};
