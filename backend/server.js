const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Check for required environment variables
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is required in environment variables');
  process.exit(1);
}

const app = express();

// Middleware
app.use(cors());
// Important: Stripe webhook needs raw body. Mount that route before JSON parser in payments router.
app.use('/api/payments', require('./routes/payments'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware for development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, req.body);
    next();
  });
}

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vig')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/audio', require('./routes/audio'));
app.use('/api/caption', require('./routes/caption'));
// app.use('/api/image', require('./routes/image')); // Removed - no API key available

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to VIG API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 