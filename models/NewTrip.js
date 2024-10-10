const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  title: { type: String, required: true },
  destination: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination'
  },
  places_visited:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination'
  }],
  duration: {
    number: { type: Number, required: true },
    period: { type: String, required: true }, // e.g., 'days', 'weeks'
  },
  highlights:[String],
  inclusives:[String],
  exclusives:[String],
  images: [{ type: String }],
  dates: [Date],
  description: {type:String},
  catch_phrase:{type:String},
  itinerary:[
    {
      title: String,          // Example fields inside the object
      points: [String]  // This is an array of strings
    }
  ],
  categories: [String],
  blog_contents:[{
      type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog'
  }],
  activities: [String],
  price: { type: Number, required: true },
  rating:{type:Number,default:1}
});

const NewTrip = mongoose.model('NewTrip', tripSchema);
module.exports = NewTrip;
