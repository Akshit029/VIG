const express = require('express');
const router = express.Router();
const { generateCaptions, generateVideoWithCaptions, upload } = require('../controllers/captionController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Generate captions from uploaded video
router.post('/generate', upload.single('video'), generateCaptions);

// Generate video with burned-in captions
router.post('/generate-video', upload.single('video'), generateVideoWithCaptions);

module.exports = router;
