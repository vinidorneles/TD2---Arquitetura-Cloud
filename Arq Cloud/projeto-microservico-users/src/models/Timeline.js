const mongoose = require('mongoose');

const timelineSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['post', 'event', 'review'],
    required: true
  }
}, {
  timestamps: true
});

timelineSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Timeline', timelineSchema);
