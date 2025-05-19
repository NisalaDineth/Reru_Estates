import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './PurchaseSuccess.css';

const PurchaseSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/customer/purchase-history');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

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
