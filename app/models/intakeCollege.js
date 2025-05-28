import mongoose from 'mongoose';

const intakeSchema = new mongoose.Schema({
  college: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true
  },
  intakeMonth: {
    type: String,
    required: true
  },
  intakeYear: {
    type: Number,
    required: true
  },
  deadlineDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  },
  visible: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deletedAt: {
    type: Date,
    default: null
  }
},
  {
    timestamps: true
  }
);

export default mongoose.model('IntakeCollege', intakeSchema);
