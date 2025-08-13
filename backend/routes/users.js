const express = require('express');
const router = express.Router();
const { 
  getAllUsers, 
  getUserById, 
  updateUser, 
  deleteUser 
} = require('../controllers/userController');
const { auth, adminAuth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get all users (admin only)
router.get('/', adminAuth, getAllUsers);

// Get user by ID
router.get('/:id', getUserById);

// Update user
router.put('/:id', updateUser);

// Delete user (admin only)
router.delete('/:id', adminAuth, deleteUser);

module.exports = router; 