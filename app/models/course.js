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
    required: true
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
  image: {
    type: String,
    default: 'public/defult/folder.png'
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
  visible: {
    type: Boolean,
    default: true // if false, course is hidden from public view
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: String,
    default: 'admin'
  },
  updatedBy: {
    type: String,
    default: 'admin'
  }
}, {
  timestamps: true
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
