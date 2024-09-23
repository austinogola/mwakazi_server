const express = require('express');
const Trip = require('../models/Trip');
const Booking = require('../models/Booking'); // Import the Booking model
const { verifyToken, isAdmin } = require('../middleware/auth'); // Authentication middleware
const router = express.Router();
const {registerIPN,getAuthToken,startPaymentFlow,getOrderStatus}=require('../modules/pesapal')

// Get all bookings (Admin only)
router.get('/', verifyToken, isAdmin, async (req, res) => {
  console.log('Initiated',req)
  try {
    const bookings = await Booking.find().populate('account').populate('trip');
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error });
  }
});

// Get a specific booking by ID (Admin only)
router.get('/:id', verifyToken, isAdmin, async (req, res) => {
  console.log('Initiated',req)
  try {
    const booking = await Booking.findById(req.params.id)
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking', error });
  }
});

// Create a new booking (Authenticated users)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { trip, price, isPaid,credentials } = req.body;
    const theTrip = Trips.findById(trip)
    const newBooking = new Booking({
      account: req.user.id, // Use the authenticated user's account ID
      trip,
      price,
      isPaid,
      amount:theTrip.price
    });

    await newBooking.save();
    startPaymentFlow(newBooking)
    res.status(201).json(newBooking);
  } catch (error) {
    res.status(500).json({ message: 'Error creating booking', error });
  }
});

router.post('/init', verifyToken,async (req, res) => {
  try {
    const { trip, isPaid ,customer} = req.body;
    console.log('Inited')
    const theTrip=await Trip.findById(trip)
    console.log(theTrip)
    const newBooking = new Booking({
      account: req.user.id, // Use the authenticated user's account ID
      trip,
      customer,
      amount:theTrip.price,
      currency:"USD",
      created_at:new Date().getTime(),
      isPaid,
    });

    let pesaPalFdBack=await startPaymentFlow(newBooking)
    if(!pesaPalFdBack.error){
        console.log(newBooking)
        newBooking["orderId"] =pesaPalFdBack.order_tracking_id
        await newBooking.save();
        console.log(newBooking)
        res.status(200).json({message:'Booking made',status:'success',newBooking,payment_obj:pesaPalFdBack});

        
    }else{
        res.status(500).json({message:'Order could not be made',status:'fail'});
    }

    
   
    // res.status(201).json(newBooking);
  } catch (error) {
    res.status(500).json({ message: 'Error creating booking', error ,status:'fail'});
  }
});

router.get('/status/:id',async(req,res)=>{
    const {id}=req.params
    const theBooking = await Booking.findById(id)
    const theTrip=await Trip.findById(theBooking.trip)
    // let status=await getOrderStatus(theBooking.orderId)
    // console.log(status)
    console.log(theTrip);
    
    // theBooking.amount=theTrip.price
    
    res.status(200).json({theBooking,status:"success"})
})

router.post('/status/:id', async (req, res) => {
    const {OrderTrackingId,OrderMerchantReference}=req.body
    let status=await getOrderStatus(OrderTrackingId)
    console.log(status)
    let { payment_method,payment_status_description,error}=status


    let isPaid=false
    let updatedBooking
    console.log(payment_method,payment_status_description,error)
    if(!error){
        isPaid=true
         updatedBooking = await Booking.findByIdAndUpdate(OrderMerchantReference, 
            { isPaid, payment_method,payment_status:payment_status_description}, { new: true });
        
    }else{
        let payment_status=error.message
        updatedBooking = await Booking.findByIdAndUpdate(OrderMerchantReference, 
            { isPaid, payment_method,payment_status}, { new: true });
    }
    updatedBooking.save()
    // console.log(OrderTrackingId,OrderMerchantReference,payment_method,payment_status_description)

    
    

    console.log(updatedBooking)

    res.status(200).json({theBooking:updatedBooking})

})

// Update booking payment status (Admin only)
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  console.log('Initiated',req)
  try {
    const { isPaid } = req.body;
    const updatedBooking = await Booking.findByIdAndUpdate(req.params.id, { isPaid }, { new: true });
    if (!updatedBooking) return res.status(404).json({ message: 'Booking not found' });
    res.status(200).json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: 'Error updating booking', error });
  }
});

// Delete a booking (Admin only)
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const deletedBooking = await Booking.findByIdAndDelete(req.params.id);
    if (!deletedBooking) return res.status(404).json({ message: 'Booking not found' });
    res.status(200).json({ message: 'Booking deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting booking', error });
  }
});

module.exports = router;
