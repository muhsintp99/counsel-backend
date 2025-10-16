// const mongoose = require('mongoose');

// const collegeSchema = new mongoose.Schema({
//   image: {
//     type: String,
//   },
//   name: {
//     type: String,
//     required: [true, 'College name is required'],
//     unique: true
//   },
//   email: {
//     type: String, // removed lowercase
//   },
//   phone: {
//     type: String, // removed trim
//   },
//   address: {
//     type: String, // removed trim
//   },
//   website: {
//     type: String, // removed trim
//   },
//   desc: {
//     type: String,
//   },
//   country: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Country',
//     required: [true, 'Country is required'],
//   },
//   state: { 
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'State',
//   },
//   courses: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Course',
//   }],
//   category: [{
//     type: String,
//     enum: {
//       values: ['Graduate', 'Postgraduate', 'Diploma', 'PhD'],
//       message: 'Invalid category value'
//     }
//   }],
//   status: {
//     type: String,
//     enum: {
//       values: ['new', 'recommended', 'popular', 'regular'],
//       message: 'Invalid status value'
//     },
//     default: 'new'
//   },
//   isDomestic: {
//     type: Boolean,
//   },
//   visible: {
//     type: Boolean,
//     default: true,
//   },
//   createdBy: {
//     type: String,
//     default: 'admin'
//   },
//   updatedBy: {
//     type: String,
//     default: 'admin'
//   }
// }, {
//   timestamps: true
// });

// collegeSchema.index({ country: 1 });
// collegeSchema.index({ state: 1 });
// collegeSchema.index({ email: 1 }, { unique: true });

// const College = mongoose.model('College', collegeSchema);
// module.exports = College;


const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
  image: { type: String },
  name: { type: String, required: [true, 'College name is required'], unique: true },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  website: { type: String },
  desc: { type: String },
  country: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Country',
    required: [true, 'Country is required'],
  },
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
  isDomestic: {
    type: Boolean,
    default: true,
  },
  visible: { type: Boolean, default: true },
}, { timestamps: true });

collegeSchema.index({ country: 1 });
collegeSchema.index({ state: 1 });
collegeSchema.index({ email: 1 }, { unique: true });

const College = mongoose.model('College', collegeSchema);
module.exports = College;
