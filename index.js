const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

const tripRoutes = require('./routes/trips');
const authRoutes = require('./routes/auth'); 
const bookingRoutes = require('./routes/bookings');
const activitiesRoutes = require('./routes/activities');

const dotenv = require('dotenv');

dotenv.config();
const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'http://example.com',
  'https://anotherdomain.com',
  "https://www.mwakaziadventures.com",
  "https://mwakaziadventures.com"
];            
app.use(cors({
	origin:allowedOrigins,
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
	credentials: true
}));

app.use(express.json());  
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
            
app.use(cookieParser()); 


app.use('/api/v1/trips', tripRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/activities', activitiesRoutes);

app.use('/auth', authRoutes);

const dbURI = process.env.MONGODB_URI;
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB:', err));

const PORT = process.env.PORT || 5010;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});