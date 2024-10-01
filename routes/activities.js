const express = require('express');
const Trip = require('../models/Trip');
const Activity = require('../models/Activity');
const Destination = require('../models/Destination');
const { verifyToken, isAdmin } = require('../middleware/auth'); // Authentication middleware
const router = express.Router();

// Get all activities
router.get('/', async (req, res) => {
  try {
      const { name, category, limit } = req.query;
      let query = {};

      // Filtering by name if provided
      if (name) {
          query.name = { $regex: new RegExp(name, 'i') }; // Case-insensitive search
      }

      // Filtering by category if provided
      if (category) {
          query.category = { $regex: new RegExp(category, 'i') }; // Case-insensitive search
      }

      // Limit the results if a limit is provided, default to 10
      const activities = await Activity.find(query).limit(parseInt(limit) || 10);

      res.status(200).json(activities);
  } catch (error) {
      res.status(500).json({ message: 'Error fetching activities', error });
  }
});
router.get('/activities-by-category', async (req, res) => {
  try {
    const activities = await Activity.aggregate([
      {
        $lookup: {
          from: 'trips', // collection name for Trip model
          localField: '_id', // activity _id in the Activity model
          foreignField: 'activities', // activities array in the Trip model
          as: 'trips' // store the matched trips in an array named 'trips'
        }
      },
      // Add a field to count the number of trips for each activity
      {
        $addFields: {
          tripCount: { $size: '$trips' } // count the size of the trips array
        }
      },
      // Group activities by category and sort by number of trips in descending order
      {
        $group: {
          _id: '$category', // group by the category field
          activities: {
            $push: {
              _id: '$_id',
              name: '$name',
              category: '$category',
              tripCount: '$tripCount'
            }
          }
        }
      },
      // Sort each category's activities by trip count in descending order
      {
        $project: {
          activities: { $sortArray: { input: '$activities', sortBy: { tripCount: -1 } } }
        }
      }
    ])

    res.status(200).json(activities);
  }
  catch (error) {
    res.status(500).json({ message: 'Error fetching activities', status:"fail" });
  }
})
router.get('/aff', async (req, res) => {
  try {
  	
  	console.log(req.query)
  	let {activities,destination,title,duration,inclusives,dates,description,
  	categories,price,rating,sort,size}=req.query

  	if(sort){
  		sort=JSON.parse(sort)
  	}else{
  		sort={}
  	}

  	let limit=size || 10

  	const activites=Activity.find({ images: { $ne: [] } }).limit(limit)
    const trips=await Trip.find({ catch_phrase: { $exists: true, $ne: "" } }).sort({ rating: -1, 'images.length': -1 }).limit(limit)

  	
    let tripsArr=[]
    for(const trip of trips){
      const theDest= await Destination.findById(trip.destination)
      let activities_arr=[]
      for(const activityId of trip._doc.activities){
        const theAct= await Activity.findById(activityId)
        activities_arr.push(theAct)
      }
      tripsArr.push({...trip._doc,destination:theDest,activities:activities_arr})
      // console.log(tripsArr.length)
    }
   
    
    // console.log(tripsArr)

    // const trips = await Trip.find().populate('location').populate('activities');
    res.status(200).json({trips:tripsArr,status:'success'});
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ message: 'Error fetching trips',status:'fail', error });
  }
});

// Get a specific trip by ID
router.get('/:id', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    let activities=[]
    for(const actId of trip.activities){
      let theAct= await Activity.findById(actId)
      activities.push(theAct)
    }

    trip.activities=activities
   
    res.status(200).json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trip', error });
  }
});

// Create a new trip (Admin only)
router.post('/', async (req, res) => {
  try {

  	let {activities,destination,title,duration,inclusives,dates,description,
  	categories,price,rating,images,catch_phrase,itinerary,blog_contents}=req.body

  	if(!title || !destination || !duration || !dates ||!price  ){
  		return res.status(500).json({ message: 'Error creating trip. Missing details', });
  	}

  	let actIds=[]
  	if(activities && activities[0]){
  		activities.forEach(async obj=>{
        const {name,category}=obj
  			let theAct=await Activity.findOneAndUpdate({name,category},{name,category},{new:true,upsert:true})
  			console.log(theAct)
  			actIds.push(theAct._id)
  		})
  	}
    rating=rating || 1

  	const {country,continent,locale}=destination
  	let destId=await Destination.findOneAndUpdate(
  		{country,continent,locale},
  		{country,continent,locale},
  		{new:true,upsert:true})

    images=images || []

  	const newTrip = new Trip({activities:actIds,destination:destId,
  		title,duration,inclusives,dates,description,blog_contents,
  	categories,price,rating,images,catch_phrase,itinerary})	

  	await newTrip.save()

  	console.log(newTrip)

   
    res.status(201).json({newTrip,status:'added successfully'});
  } catch (error) {
    res.status(500).json({ message: 'Error creating trip', error });
  }
});

// Update a trip (Admin only)
router.put('/:id', async (req, res) => {
  try {
    console.log(req.body)
    console.log(req.params)
    const updatedTrip = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedTrip) return res.status(404).json({ message: 'Activity not found' });
    res.status(200).json(updatedTrip);
  } catch (error) {
    res.status(500).json({ message: 'Error updating trip', error });
  }
});

// Delete a trip (Admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const deletedTrip = await Trip.findByIdAndDelete(req.params.id);
    if (!deletedTrip) return res.status(404).json({ message: 'Trip not found' });
    res.status(200).json({ message: 'Trip deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting trip', error });
  }
});

module.exports = router;
