const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    shortDesc: {
        type: String,
        required: true
    },
    fullDesc: {
        type: String
    },
    image: {
        type: String
    },

    points: [
        {
            title: { type: String},
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
 { timestamps: true });

const Service = mongoose.model('Service', serviceSchema);
module.exports = Service;
