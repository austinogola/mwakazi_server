const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account', // Reference to the Account model
    // required: true,
  },
  customer:{},
  item_details:{},
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip', // Reference to the Trip model
    // required: true,
  },
  accomodation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Accomodation', // Reference to the Trip model
    // required: true,
  },
  amount:{type:Number},
  created_at:{type:Number},
  paid_at:{type:Number},
  payment_status:{type:String},
  payment_method:{type:String},
  orderId:{type:String},
  isPaid: {
    type: Boolean,
    default: false,
  },
});

  

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
