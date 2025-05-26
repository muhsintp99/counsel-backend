const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
    image: {
        type: String,
    },
    name: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
    },
    phone: {
        type: String,
    },
    address: {
        type: String,
    },
    website: {
        type: String,
    },
    country: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Country',
        required: true,
    },
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
    }],
    category: {
        type: String,
        enum: ['undergraduate', 'graduate', 'diploma'],
        default: 'undergraduate'
    },
    status: {
        type: String,
        enum: ['new', 'recommended', 'popular', 'regular'],
        default: 'new'
    },
    facilities: [{
        type: String
    }],
    services: [{
        type: String
    }],
    map: {
        type: String // store Google Maps embed link or coordinates string
    },
    visible: {
        type: Boolean,
        default: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
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

const College = mongoose.model('College', collegeSchema);
module.exports = College;
