import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import './CustomerCheckout.css'; // Import the CSS file

const stripePromise = loadStripe('pk_test_51RP7LrQhVN6fGceWfR8Qhj1f6uQGFNQdml4pzNGG8lve1YHDmUV2nqc1TUezGQQuTEzlRENbChRIzupXYlxg4JTm00TayGLaOc'); // Replace with your key

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { products, total } = location.state || { products: [], total: 0 };

const handleConfirmOrder = async () => {
  const stripe = await stripePromise;
  const token = localStorage.getItem('token');

  try {
    console.log("Sending products to checkout:", products);
    
    const response = await fetch('http://localhost:5001/api/payment/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ products })
    });    console.log("Response status:", response.status);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error("Error response:", errorData);
      throw new Error(`Payment session creation failed: ${response.status} - ${errorData}`);
    }

    const session = await response.json();
    console.log("Session data:", session);
    
    if (!session.id) {
      throw new Error("Invalid session data returned from server");
    }

    const { error } = await stripe.redirectToCheckout({ sessionId: session.id });
    
    if (error) {
      console.error("Stripe redirect error:", error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Stripe checkout error:', error);
    alert(`Payment error: ${error.message}`);
  }
};


  return (
    <div className="checkout-container">
      <h2 className="checkout-header">Order Summary</h2>
      {products.length === 0 ? (
        <p className="checkout-empty">No items selected for checkout.</p>
      ) : (
        <>
          <ul className="checkout-items">
            {products.map((item, index) => (
              <li key={index} className="checkout-item">
                <div className="item-name">{item.CropName}</div>
                <div className="item-detail">Unit Price: Rs. {item.UnitPrice}</div>
                <div className="item-detail">Quantity: {item.required_quantity}</div>
                <div className="item-detail">Subtotal: Rs. {item.sub_total}</div>
              </li>
            ))}
          </ul>
          <h3 className="checkout-total">Total Amount: Rs. {total}</h3>
          <button className="checkout-button" onClick={handleConfirmOrder}>Confirm Order</button>
        </>
      )}
    </div>
  );
};

export default Checkout;
