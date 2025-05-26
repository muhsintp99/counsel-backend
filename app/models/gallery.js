const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
    image: {
        type: String,
        required: true // store filename or URL of uploaded image
    },
    date: {
        type: Date,
        // required: true,
        default: Date.now
    },
    title: {
        type: String,
        required: true
    },
    from: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true,
        unique: true,
        sparse: true, // allow multiple docs without link
        // validate: {
        //     validator: function (v) {
        //         if (!v) return true; // allow empty
        //         return /^(https?:\/\/)?([\w\-])+\.{1}([a-zA-Z]{2,63})([\/\w\-\.]*)*\/?$/.test(v);
        //     },
        //     message: props => `${props.value} is not a valid URL!`
        // }
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

const Gallery = mongoose.model('Gallery', gallerySchema);

module.exports = Gallery;
