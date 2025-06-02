const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    shortDesc: {
        type: String,
        required: true
    },
    fullDesc: {
        type: String,
        required: true
    },
    image: {
        type: String
    },

    points: [
        {
            title: { type: String },
            description: { type: String }
        }
    ],

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
},
    { timestamps: true }
);

serviceSchema.index({createdAt: 1});
serviceSchema.index({ isDeleted: 1 });

const Service = mongoose.model('Service', serviceSchema);
module.exports = Service;
