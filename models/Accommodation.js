const mongoose = require('mongoose');

const accommodationSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    amenities: {
        type: [String],
        required: true
    },
    negotiable: {
        type: Boolean,
        default: false
    },
    dailyRate: {
        type: Number,
        required: true
    },
    images:[String]
});

const Accommodation = mongoose.model('Accommodation', accommodationSchema);

module.exports = Accommodation;
