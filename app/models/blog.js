const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
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
        type: String,
        required: true,
        default: '/public/default/picture.png'
    },
    link: {
        type: String,
        unique: true,
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

blogSchema.index({ createdAt: 1 });
// blogSchema.index({ isDeleted: 1 });


module.exports = mongoose.model('Blog', blogSchema);
