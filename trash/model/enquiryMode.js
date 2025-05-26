// models/enquirymodeModel.js
const mongoose = require('mongoose');

const enquirymodeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  desc: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum:['new','active','pending','blocked','converted']
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  updatedBy: {
    type: String,
  },
  isDeleted:{
    type:Boolean,
    default:false
  }
});

const Enquirymode = mongoose.model('Enquirymode', enquirymodeSchema);

module.exports = Enquirymode;