const mongoose = require('mongoose');
// const locationSchema = new mongoose.Schema({
//     name: String,
//     country: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Country'
//     }
//   });
  
// const countrySchema = new mongoose.Schema({
// name: String,
// locations: [{
//   type: mongoose.Schema.Types.ObjectId,
//   ref: 'Location'
// }]
// });

// const Location = mongoose.model('Location', locationSchema);
//   const Country = mongoose.model('Country', countrySchema);
//   module.exports = { Location, Country };
  

const destinationSchema=new mongoose.Schema({
	locale:String,
	country:String,
	continent:String
})

const Destination = mongoose.model('Destination', destinationSchema);

module.exports = Destination;
  
  