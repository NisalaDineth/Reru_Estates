const express = require('express');
const router = express.Router();
const stripe = require('stripe')('sk_test_51RP7LrQhVN6fGceWvctZEJkI43WFYCpeEitVuENlxfzLilks8f8fu1zLGJ3FN1CztCQsnJe3EpgD9F33TmEqxPHF00KHYFMlSK');
const db = require('../config/db');

const endpointSecret = 'whsec_1638e6467380b9b360c63c36f13e02a1402e02cef0a35e4b54f3120ecbc17bfd'; // Replace with your webhook secret

router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const products = JSON.parse(session.metadata.products || '[]');

    for (const product of products) {
      const { HarvestID, required_quantity } = product;

      try {
        await db.query(
          'UPDATE harvestinventory SET QuantityAvailable = QuantityAvailable - ? WHERE HarvestID = ? AND QuantityAvailable >= ?',
          [required_quantity, HarvestID, required_quantity]
        );
        console.log(`Updated inventory for HarvestID ${HarvestID}`);
      } catch (err) {
        console.error(`Error updating inventory for HarvestID ${HarvestID}:`, err);
      }
    }
  }

  res.status(200).send('Received');
});

module.exports = router;
