const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Account = require('../models/Account'); // Import the Account model
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');

const dotenv = require('dotenv');

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;; // Use a secure key in production

// Signup Route
router.post('/signup', async (req, res) => {
  const { email, username, password } = req.body;

  try {
    const existingUser = await Account.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists',status:'fail' });
    }

    const existingUser2 = await Account.findOne({ username });
    if (existingUser2) {
      return res.status(400).json({ message: 'User with this username already exists',status:'fail' });
    }

    const newAccount = new Account({ email, username, password });
    await newAccount.save();

    const token = jwt.sign({ id: newAccount._id, isAdmin: newAccount.isAdmin }, JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(201).json({ token,status:'success' });
  } catch (error) {
    res.status(500).json({ message: `Error creating user ${error.message}`,status:'fail' });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const account = await Account.findOne({ email });
    if (!account) {
      return res.status(400).json({ message: 'Invalid credentials', status:'fail' });
    }

    const isMatch = await account.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials',status:'fail' });
    }

    const token = jwt.sign({ id: account._id, isAdmin: account.isAdmin }, JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({ token ,status:'success'});
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error,status:'fail' });
  }
});

router.get('/config', verifyToken,async (req, res) => {
  console.log('config accessed')
  console.log(req.user)
  const theAccount=await Account.findById(req.user.id)
  res.status(200).json({status:"success",account:theAccount})
})

module.exports = router;
