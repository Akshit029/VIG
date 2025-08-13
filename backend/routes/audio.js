const express = require('express');
const router = express.Router();
const { generateAudio, getAudioHistory, downloadAudio, streamAudio, getVoices } = require('../controllers/audioController');
const { auth } = require('../middleware/auth');

// Get available voices (public endpoint - no auth required)
router.get('/voices', getVoices);

// All other routes require authentication
router.use(auth);

// Generate text-to-speech audio
router.post('/generate', generateAudio);

// Get user's audio generation history
router.get('/history', getAudioHistory);

// Stream audio file for preview
router.get('/stream/:fileName', streamAudio);

// Download generated audio file
router.get('/download/:fileName', downloadAudio);

module.exports = router; 