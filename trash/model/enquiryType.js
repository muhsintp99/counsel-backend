const mongoose = require("mongoose");

const enquiryTypeSchema  = new mongoose.Schema({
   name: {
    type: String,
    required: true,
    unique:true
  },
  descp :{
  type: String,
  required: true,
 },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  createdBy:{
    type: String,
    required: true,
    default:'admin'

},
    updatedBy:{
    type: String,
    required: true,
    default:'admin'
},

isDeleted: {
  type: Boolean,
  default: false, 
},

});

const EnquiryType = mongoose.model("EnquiryType", enquiryTypeSchema);

module.exports = EnquiryType;
