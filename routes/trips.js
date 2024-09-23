const express = require('express');
const Trip = require('../models/Trip');
const Activity = require('../models/Activity');
const Destination = require('../models/Destination');
const { verifyToken, isAdmin } = require('../middleware/auth'); // Authentication middleware
const router = express.Router();

// Get all trips
router.get('/', async (req, res) => {
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

  	// const trips=await Trip.find({ images: { $ne: [] } }).limit(limit)
    const trips=await Trip.find({ catch_phrase: { $exists: true, $ne: "" } }).sort({ rating: -1, 'images.length': -1 }).limit(limit)

  	console.log(trips)


    // const trips = await Trip.find().populate('location').populate('activities');
    res.status(200).json(trips);
  } catch (error) {
    console.log(error.message)
    res.status(500).json({ message: 'Error fetching trips', error });
  }
});

// Get a specific trip by ID
router.get('/:id', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
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
    const updatedTrip = await Trip.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedTrip) return res.status(404).json({ message: 'Trip not found' });
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
