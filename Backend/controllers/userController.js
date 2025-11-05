const User = require('../models/User');

// @desc    Create a new user
// @route   POST /api/users
// @access  Public
const createUser = async (req, res) => {
  try {
    const { id, email, name, isActive, createdAt } = req.body;

    // Validate required fields
    if (!id || !email || !name) {
      return res.status(400).json({
        success: false,
        message: 'ID, email, and name are required fields'
      });
    }

    // Validate ID is a number
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID must be a number'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Validate name is not empty
    if (name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User name cannot be empty'
      });
    }

    // Check if user already exists by ID
    const existingUserById = await User.findOne({ id: id });
    if (existingUserById) {
      return res.status(400).json({
        success: false,
        message: `User with ID ${id} already exists`
      });
    }

    // Check if user already exists by email
    const existingUserByEmail = await User.findOne({ 
      email: email.toLowerCase().trim()
    });
    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        message: `User with email ${email} already exists`
      });
    }

    // Create user with createdAt timestamp
    const user = new User({
      id: parseInt(id),
      email: email.toLowerCase().trim(),
      name: name.trim(),
      isActive: isActive !== undefined ? isActive : true,
      createdAt: createdAt ? new Date(createdAt) : new Date()
    });

    const savedUser = await user.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: savedUser
    });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `User with this ${field} already exists`
      });
    }

    // Handle invalid date format
    if (error.name === 'TypeError' && error.message.includes('Invalid time value')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format for createdAt. Use ISO format (e.g., 2024-01-15T10:30:00.000Z)'
      });
    }

    // Generic server error
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Public
const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users: ' + error.message
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public
const getUserById = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID. Must be a number.'
      });
    }

    const user = await User.findOne({ id: userId });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${userId} not found`
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user: ' + error.message
    });
  }
};

// @desc    Get users by status (active/inactive)
// @route   GET /api/users/status/:isActive
// @access  Public
const getUsersByStatus = async (req, res) => {
  try {
    const { isActive } = req.params;
    
    if (isActive !== 'true' && isActive !== 'false') {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "true" or "false"'
      });
    }

    const activeStatus = isActive === 'true';
    const users = await User.find({ isActive: activeStatus }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users: ' + error.message
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Public
const updateUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID. Must be a number.'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ id: userId });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${userId} not found`
      });
    }

    // Prepare update data
    const updateData = { ...req.body };

    // If updating email, check if it's already taken by another user
    if (updateData.email) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.email)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
      }

      updateData.email = updateData.email.toLowerCase().trim();
      
      const emailExists = await User.findOne({
        email: updateData.email,
        id: { $ne: userId } // Exclude current user
      });
      
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: `Email '${updateData.email}' is already taken by another user`
        });
      }
    }

    // If updating name, trim it
    if (updateData.name) {
      if (updateData.name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'User name cannot be empty'
        });
      }
      updateData.name = updateData.name.trim();
    }

    // Update the user
    const user = await User.findOneAndUpdate(
      { id: userId },
      updateData,
      { 
        new: true, 
        runValidators: true,
        context: 'query'
      }
    );

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `User with this ${field} already exists`
      });
    }

    res.status(400).json({
      success: false,
      message: 'Error updating user: ' + error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Public
const deleteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID. Must be a number.'
      });
    }

    const user = await User.findOneAndDelete({ id: userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `User with ID ${userId} not found`
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully',
      deletedUser: {
        id: user.id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user: ' + error.message
    });
  }
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  getUsersByStatus,
  updateUser,
  deleteUser
};