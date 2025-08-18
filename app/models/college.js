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
    desc: {
        type: String,
    },
    country: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Country',
        required: true,
    },
    state: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'State',
    },
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
    }],
    category: {
        type: [String],
        enum: ['Graduate', 'Postgraduate', 'Diploma', 'PhD'],
        default: 'Graduate'
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
        type: String
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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
}, {
    timestamps: true
});

const College = mongoose.model('College', collegeSchema);
module.exports = College;