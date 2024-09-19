const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account', // Reference to the Account model
    // required: true,
  },
  customer:{
    name:String,
    email:String,
    phone:String,
    address:String
  },
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip', // Reference to the Trip model
    // required: true,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
});

  

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
