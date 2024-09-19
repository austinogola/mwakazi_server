const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET; // Same secret key as used in signup/login

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');

  if (!token) return res.status(401).json({ message: 'Not authorzed',status:'fail' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach user info (id and isAdmin) to request object
    next();
  } catch (err) {
    res.status(401).json({ message: 'Session is invalid',status:'fail' });
  }
};

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Admin access required' ,status:'fail'});
  next();
};

module.exports = { verifyToken, isAdmin };
