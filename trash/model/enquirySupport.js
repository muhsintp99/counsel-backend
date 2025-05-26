const mongoose = require("mongoose");

const SupportSchema = new mongoose.Schema({

supportFrom:{
  type:String,
  default:'admin'
},
supportTo:{
  type: mongoose.Schema.Types.ObjectId,
    ref: 'user', 
   required:true
},
supportType:{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'SupportType', 
 required:true
},
status: {
  type: String,
  enum:['new','active','pending','blocked','converted']
  },
remarks:{
  type:String
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

const EnquirySupport = mongoose.model("EnquirySupport", SupportSchema);

module.exports = EnquirySupport;
