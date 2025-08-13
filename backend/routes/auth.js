const express = require('express');
const router = express.Router();
const { register, login, getProfile, forgotPassword, resetPassword, updateProfile, giveFreeCredits } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.post('/free-credits', auth, giveFreeCredits);

module.exports = router; 