const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {  // Changed from is_active to isActive
    type: Boolean,
    default: true
  },
  createdAt: {  // Changed from created_at to createdAt
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);