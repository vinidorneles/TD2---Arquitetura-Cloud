const mongoose = require('mongoose');

const friendshipSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  friendId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Create compound index to prevent duplicate friendships
friendshipSchema.index({ userId: 1, friendId: 1 }, { unique: true });

module.exports = mongoose.model('Friendship', friendshipSchema);
