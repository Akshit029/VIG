const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const expressLib = require('express');
const { createCheckoutSession, webhook, updateCredits } = require('../controllers/paymentController');

// Webhook must use raw body parser for Stripe signature verification
router.post('/webhook', express.raw({ type: 'application/json' }), webhook);

// All other payment routes require auth and JSON parsing
router.use(expressLib.json());
router.use(auth);

router.post('/create-checkout-session', createCheckoutSession);
router.post('/update-credits', updateCredits);

module.exports = router;


