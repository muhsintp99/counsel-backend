const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    uppercase: true,
    minlength: 2,
    maxlength: 3
  },
  isoCode: {
    type: String,
    required: true,
    uppercase: true,
    minlength: 3,
    maxlength: 3
  },
  dialCode: {
    type: String,
    required: true
  },
  currency: {
    type: String,
    required: true,
    uppercase: true
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

const Country = mongoose.model('Country', countrySchema);
module.exports = Country;
