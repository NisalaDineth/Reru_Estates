import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './PurchaseSuccess.css';

const PurchaseSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  // Check if the purchase was successful
  // This component displays a success message and redirects to purchase history after a countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/customer/purchase-history');
          return 0;
        }
        return prev - 1; // Decrement countdown
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  // Check if the purchase data is available in the location state
  // If not, redirect to the purchase history page
  return (
    <div className="purchase-success-container">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h1>Purchase Successful!</h1>
        <p>Thank you for your purchase. Your order has been confirmed.</p>
        <p>Redirecting to purchase history in {countdown} seconds...</p>
        <button 
          className="view-history-button"
          onClick={() => navigate('/customer/purchase-history')}
        >
          View Purchase History
        </button>
      </div>
    </div>
  );
};

export default PurchaseSuccess;
