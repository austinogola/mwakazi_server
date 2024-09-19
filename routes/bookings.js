const express = require('express');
const Booking = require('../models/Booking'); // Import the Booking model
const { verifyToken, isAdmin } = require('../middleware/auth'); // Authentication middleware
const router = express.Router();
const {registerIPN,getAuthToken,startPaymentFlow}=require('../modules/pesapal')

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
    const booking = await Booking.findById(req.params.id).populate('account').populate('trip');
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
    const newBooking = new Booking({
      account: req.user.id, // Use the authenticated user's account ID
      trip,
      price,
      isPaid,
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
    // console.log(trip, isPaid,customer)
    // const { trip, price, isPaid } = req.body;
    const newBooking = new Booking({
      account: req.user.id, // Use the authenticated user's account ID
      trip,
      customer,
      isPaid,
    });

    await newBooking.save();

    let pesaPalFdBack=await startPaymentFlow(newBooking)
    console.log(pesaPalFdBack)
    // res.status(201).json(newBooking);
     res.status(200).json({message:'Booking made',status:'success',newBooking,payment_obj:pesaPalFdBack});
  } catch (error) {
    res.status(500).json({ message: 'Error creating booking', error ,status:'fail'});
  }
});

router.post('/status/:id', async (req, res) => {
    console.log(req.body)
    console.log(req.params)
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
