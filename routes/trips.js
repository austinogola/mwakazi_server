const express = require('express');
const Trip = require('../models/Trip');
const Activity = require('../models/Activity');
const NewTrip = require('../models/NewTrip');
const Destination = require('../models/Destination');
const { verifyToken, isAdmin } = require('../middleware/auth'); // Authentication middleware
const router = express.Router();

// Get all trips
router.get('/', async (req, res) => {
  try {
  	
  	console.log(req.query)
  	let {activities,title,places_visited,destination,locations_visited,duration,inclusives,dates,description,
  	categories,price,rating,sort,size}=req.query

  	if(sort){
  		sort=JSON.parse(sort)
  	}else{
  		sort={}
  	}

  	let limit=size || 10

  	// const trips=await Trip.find({ images: { $ne: [] } }).limit(limit)
    const trips=await NewTrip.find({ catch_phrase: { $exists: true, $ne: "" } }).sort({ rating: -1, 'images.length': -1 }).limit(limit)

  	
    let tripsArr=[]
    for(const trip of trips){
      const theDest= await Destination.findById(trip.destination)
      let activities_arr=[]
      // for(const activityId of trip._doc.activities){
      //   const theAct= await Activity.findById(activityId)
      //   activities_arr.push(theAct)
      // }
      tripsArr.push({...trip._doc,destination:theDest})
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
    const trip = await NewTrip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    let activities=[]
    // for(const actId of trip.activities){
    //   let theAct= await Activity.findById(actId)
    //   activities.push(theAct)
    // }

    // trip.activities=activities
   
    res.status(200).json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trip', error });
  }
});

// Create a new trip (Admin only)
router.post('/', async (req, res) => {
  try {

  	let {activities,destination,title,duration,inclusives,dates,description,
  	categories,price,rating,images,catch_phrase,itinerary,blog_contents,places_visited,highlights}=req.body

  	if(!title || !destination || !duration || !dates ||!price  ){
  		return res.status(500).json({ message: 'Error creating trip. Missing details', });
  	}

  	let actIds=[]
  	// if(activities && activities[0]){
  	// 	activities.forEach(async obj=>{
    //     const {name,category}=obj
  	// 		let theAct=await Activity.findOneAndUpdate({name,category},{name,category},{new:true,upsert:true})
  	// 		console.log(theAct)
  	// 		actIds.push(theAct._id)
  	// 	})
  	// }
    rating=rating || 1

  	const {country,continent,locale}=destination
  	let destId=await Destination.findOneAndUpdate(
  		{country,continent,locale},
  		{country,continent,locale},
  		{new:true,upsert:true})


      let placesIds=[]
      if(places_visited && places_visited[0]){
        places_visited.forEach(async obj=>{
        const {country,continent,locale}=obj
  			let theAct=await Destination.findOneAndUpdate({country,continent,locale},{country,continent,locale},{new:true,upsert:true})
  			console.log(theAct)
  			placesIds.push(theAct._id)
  		})
  	}

    images=images || []

  	// const newTrip = new NewTrip({activities:actIds,destination:destId,
  	// 	title,duration,inclusives,dates,description,blog_contents,
  	// categories,price,rating,images,catch_phrase,itinerary,places_visited,highlights})	

    const newTrip = new NewTrip({activities,destination:destId,
  		title,duration,inclusives,dates,description,blog_contents,
  	categories,price,rating,images,catch_phrase,itinerary,places_visited:placesIds,highlights})	
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
    const updatedTrip = await NewTrip.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedTrip) return res.status(404).json({ message: 'Trip not found' });
    res.status(200).json(updatedTrip);
  } catch (error) {
    res.status(500).json({ message: 'Error updating trip', error });
  }
});

// Delete a trip (Admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    console.log(req.params.id)
    const deletedTrip = await NewTrip.findByIdAndDelete(req.params.id);
    if (!deletedTrip) return res.status(404).json({ message: 'Trip not found' });
    res.status(200).json({ message: 'Trip deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting trip', error });
  }
});

module.exports = router;
