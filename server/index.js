const express = require("express");
require('dotenv').config();
const connectDB = require("./models/mongoConnection");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bookingController = require('./controllers/BookingRequestController');

// Connect to MongoDB
connectDB(); // ✅ Connect to MongoDB before starting the server

const app = express();

// Middleware
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});
app.use(cors({
  origin: process.env.FRONT_END_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));


// Import Routes
const routes = require('./routes'); // Import the routes

// Use routes with /api prefix
app.use('/api', routes);  // All API routes will now be prefixed with /api

bookingController.initializeBookingTasks(); // ✅ Start cron before server starts

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
