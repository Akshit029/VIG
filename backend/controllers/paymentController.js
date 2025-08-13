const Stripe = require('stripe');
const User = require('../models/User');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Pricing in cents for predefined point packs
const POINT_PACKS = {
  10: 299,   // $2.99 for 10 points
  50: 999,   // $9.99 for 50 points
  200: 2999  // $29.99 for 200 points
};

const getFrontendUrl = () => process.env.FRONTEND_URL || 'https://vig-psi.vercel.app';

// Create a Stripe Checkout session for buying points
const createCheckoutSession = async (req, res) => {
  try {
    const { points } = req.body;

    if (!points || !POINT_PACKS[points]) {
      return res.status(400).json({ message: 'Invalid points pack selected' });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ message: 'Stripe is not configured' });
    }

    const amount = POINT_PACKS[points];
    const frontendUrl = getFrontendUrl();

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'VIG Credits',
              description: `${points} credits pack`
            },
            unit_amount: amount
          },
          quantity: 1
        }
      ],
      metadata: {
        userId: req.user.id.toString(),
        points: points.toString(),
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      },
      success_url: `${frontendUrl}/credits?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/credits?status=cancelled`
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout session error:', error);
    return res.status(500).json({ message: 'Failed to create checkout session' });
  }
};

// Manual credit update endpoint for frontend to call after successful payment
const updateCredits = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user.id;

    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required' });
    }

    // Verify the session with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session) {
      return res.status(404).json({ message: 'Payment session not found' });
    }

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    // Verify the session belongs to the current user
    if (session.metadata?.userId !== userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized access to payment session' });
    }

    const points = parseInt(session.metadata?.points || '0', 10);
    
    if (points <= 0) {
      return res.status(400).json({ message: 'Invalid points amount' });
    }

    // Update user credits in MongoDB
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add points to user's account
    user.points = (user.points || 0) + points;
    await user.save();

    console.log(`Manually credited ${points} points to user ${userId} via session ${sessionId}`);

    res.json({
      message: 'Credits updated successfully',
      pointsAdded: points,
      totalPoints: user.points
    });

  } catch (error) {
    console.error('Manual credit update error:', error);
    res.status(500).json({ message: 'Failed to update credits' });
  }
};

// Stripe webhook to credit points after successful payment
const webhook = async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const points = parseInt(session.metadata?.points || '0', 10);
      const sessionId = session.id;

      if (userId && points > 0) {
        try {
          const user = await User.findById(userId);
          if (user) {
            // Check if credits were already added (prevent double crediting)
            const existingSession = await stripe.checkout.sessions.retrieve(sessionId);
            if (existingSession.payment_status === 'paid') {
              user.points = (user.points || 0) + points;
              await user.save();
              console.log(`Webhook credited ${points} points to user ${userId} via session ${sessionId}`);
            }
          } else {
            console.warn('User not found for webhook credit:', userId);
          }
        } catch (dbErr) {
          console.error('Error crediting points via webhook:', dbErr);
        }
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get payment history for a user
const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all checkout sessions for this user
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      expand: ['data.payment_intent']
    });

    const userSessions = sessions.data.filter(session => 
      session.metadata?.userId === userId.toString()
    );

    const paymentHistory = userSessions.map(session => ({
      id: session.id,
      amount: session.amount_total,
      currency: session.currency,
      status: session.payment_status,
      points: parseInt(session.metadata?.points || '0', 10),
      createdAt: new Date(session.created * 1000),
      paymentMethod: session.payment_method_types?.[0] || 'card'
    }));

    res.json({
      message: 'Payment history retrieved successfully',
      payments: paymentHistory
    });

  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ message: 'Failed to retrieve payment history' });
  }
};

module.exports = {
  createCheckoutSession,
  updateCredits,
  webhook,
  getPaymentHistory
};


