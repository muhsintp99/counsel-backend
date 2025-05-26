const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  enqNo: {
    type: String,
    unique: true
  },
  followUpData: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FollowUp"
  },
  fName: {
    type: String,
    required: true
  },
  lName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  mobile: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  course: {
    type: String,
    required: true
  },
  school: {
    type: String,
    required: true
  },
  leadQuality: {
    type: String,
    enum: ["High", "Medium", "Low"]
  },
  status: {
    type: String,
    enum: ['new', 'active', 'pending', 'blocked', 'converted']
  },
  referenceId: {
    type: String
  },
  remarks: {
    type: String
  },
  enqDescp: {
    type: String
  },
  createdBy: {
    type: String,
    default: 'admin'
  },
  updatedBy: {
    type: String,
    default: 'Admin'
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // Handles createdAt and updatedAt automatically
});

const Enquiry = mongoose.model('Enquiry', enquirySchema);
module.exports = Enquiry;
