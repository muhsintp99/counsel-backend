// course.js
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  shortDescription: {
    type: String,
    required: true,
    maxlength: 300
  },
  fullDescription: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        const allowed = ['Graduate', 'Postgraduate', 'Diploma', 'PhD', 'Other'];
        const trimmed = value.trim();
        return allowed.includes(trimmed) || trimmed !== '';
      },
      message: 'Invalid category'
    }
  },
  mode: {
    type: String,
    enum: ['online', 'offline', 'hybrid'],
    required: true
  },
  fees: {
    type: Number,
    required: true
  },
  syllabus: {
    type: [String],
    default: []
  },
  prerequisites: {
    type: [String],
    default: []
  },
  tags: {
    type: [String],
    default: []
  },
  isDomestic: {
    type: Boolean,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;