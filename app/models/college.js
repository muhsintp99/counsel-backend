const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'College name is required'],
    unique: true,
    trim: true,
  },
  image: { type: String },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  website: { type: String },
  desc: { type: String },
  country: { type: mongoose.Schema.Types.ObjectId, ref: 'Country' },
  state: { type: mongoose.Schema.Types.ObjectId, ref: 'State' },
  courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  category: [{
    type: String,
    enum: ['Graduate', 'Postgraduate', 'Diploma', 'PhD']
  }],
  status: {
    type: String,
    enum: ['new', 'recommended', 'popular', 'regular'],
    default: 'new',
  },
  isDomestic: { type: Boolean, default: true },
  visible: { type: Boolean, default: true },
}, { timestamps: true });

collegeSchema.index({ country: 1 });
collegeSchema.index({ state: 1 });

module.exports = mongoose.model('College', collegeSchema);
