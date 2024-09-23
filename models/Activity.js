const mongoose = require('mongoose');
const activitySchema = new mongoose.Schema({
    name: String,
    rank:{type:Number,default:1},
    images: [String],
    category:String
  });
  
const Activity = mongoose.model('Activity', activitySchema);
module.exports = Activity;
  