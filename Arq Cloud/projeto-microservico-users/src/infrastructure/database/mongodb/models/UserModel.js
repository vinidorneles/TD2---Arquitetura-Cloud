/**
 * USER MONGOOSE MODEL (Infrastructure Layer)
 * Database schema definition using Mongoose
 * This is separate from the domain entity
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return this.authProvider === 'local';
    }
  },
  authProvider: {
    type: String,
    enum: ['local', 'google', 'facebook'],
    default: 'local'
  },
  profilePicture: {
    type: String,
    default: ''
  },
  location: {
    lat: {
      type: Number,
      default: null
    },
    lng: {
      type: Number,
      default: null
    }
  }
}, {
  timestamps: true
});

// Note: Password hashing is now handled by the application layer
// This keeps the model as a pure data structure

module.exports = mongoose.model('User', userSchema);
