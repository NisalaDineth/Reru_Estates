import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from './cartcontext';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      try {
        // Get cart IDs from URL parameters and parse them
        const cartIdsParam = searchParams.get('cartIds');
        const cartIds = cartIdsParam ? JSON.parse(decodeURIComponent(cartIdsParam)) : [];
        
        if (cartIds.length > 0) {
          await clearCart(cartIds);
        }
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    };
    
    handlePaymentSuccess();
  }, [clearCart, searchParams]);

  return (
    <div className="payment-success-container">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h1>Payment Successful!</h1>
        <p>Your order has been confirmed and will be processed shortly.</p>
        <div className="button-group">
          <button 
            className="primary-button"
            onClick={() => navigate('/customer/purchase-history')}
          >
            View Purchase History
          </button>
          <button 
            className="secondary-button"
            onClick={() => navigate('/customer/inventory')}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
