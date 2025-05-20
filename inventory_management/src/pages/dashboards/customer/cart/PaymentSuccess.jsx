import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from './cartcontext';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [status, setStatus] = useState({
    loading: true,
    success: false,
    message: 'Processing your payment...',
    details: '',
    attemptCount: 0,
    processing: true
  });useEffect(() => {
    const handlePaymentSuccess = async () => {
      try {
        // Get cart IDs from URL parameters and parse them
        const cartIdsParam = searchParams.get('cartIds');
        const sessionId = searchParams.get('session_id');
        const cartIds = cartIdsParam ? JSON.parse(decodeURIComponent(cartIdsParam)) : [];
        
        // If we have a session ID, verify with the server that payment was processed
        if (sessionId) {          setStatus({
            loading: true,
            success: false,
            message: 'Verifying payment and processing your order...',
            details: 'Contacting payment server...',
            attemptCount: 0,
            processing: true
          });
          
          const token = localStorage.getItem('token');
          if (!token) {
            console.error('No authentication token found');            setStatus({
              loading: false,
              success: false,
              message: 'Authentication error. Please log in again.',
              details: 'No valid authentication token found. Please try logging in again.',
              attemptCount: 0,
              processing: false
            });
            return;
          }
          
          console.log('Verifying payment with session ID:', sessionId);
          
          // Use the enhanced retry mechanism
          const verificationResult = await verifyPaymentWithRetry(sessionId, token);
          
          if (verificationResult.success) {
            console.log('Payment processed successfully, inventory updated');
            
            // Success! Clear the cart and show success message
            if (cartIds.length > 0) {
              try {
                await clearCart(cartIds);
                console.log('Cart cleared successfully');
              } catch (err) {
                console.error('Error clearing cart:', err);
                // Continue anyway, since the payment was successful
              }
            }
              setStatus({
              loading: false,
              success: true,
              message: 'Your payment was successful and your order has been confirmed!',
              details: 'Your items will be available in your purchase history.',
              attemptCount: 0,
              processing: false
            });
          } else {
            console.error('Payment verification failed after multiple attempts');            setStatus({
              loading: false,
              success: false,
              message: `Payment verification failed: ${verificationResult.error || 'Unknown error'}`,
              details: verificationResult.isNetworkError 
                ? 'There was a network issue connecting to the server. Your payment may have processed correctly, please check your purchase history.'
                : 'The system could not verify your payment. Please contact customer support with your order details.',
              attemptCount: MAX_RETRIES,
              processing: false
            });
          }
        } else {
          console.error('No session ID provided');          setStatus({
            loading: false,
            success: false,
            message: 'No payment session ID found',
            details: 'The payment process did not return a valid session ID. Please try the checkout process again.',
            attemptCount: 0,
            processing: false
          });
        }
      } catch (error) {
        console.error('Error in payment success handler:', error);        setStatus({
          loading: false,
          success: false,
          message: `There was an issue processing your order: ${error.message}`,
          details: 'An unexpected error occurred during the payment verification process. Please contact customer support.',
          attemptCount: 0,
          processing: false
        });
      }
    };
    
    handlePaymentSuccess();
  }, [clearCart, searchParams]);
  
  // Enhanced retry mechanism with progressive delay
const MAX_RETRIES = 5;
const BASE_DELAY = 1000; // Start with 1 second

const verifyPaymentWithRetry = async (sessionId, token, retryCount = 0, onStatusUpdate = null) => {
  try {
    // Progressive delay: 1s, 2s, 4s, 8s, 16s
    const delay = retryCount > 0 ? BASE_DELAY * Math.pow(2, retryCount - 1) : 0;
    
    if (retryCount > 0) {
      console.log(`Waiting ${delay}ms before retry attempt ${retryCount}...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    console.log(`Attempt ${retryCount + 1}/${MAX_RETRIES} to verify payment for session: ${sessionId}`);
    
    // Update status if callback is provided
    if (onStatusUpdate) {
      onStatusUpdate(retryCount + 1, MAX_RETRIES, `Contacting payment server (attempt ${retryCount + 1})...`);
    }
    
    const response = await fetch(`http://localhost:5001/api/payment/verify-payment?session_id=${sessionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Attempt ${retryCount + 1} response status:`, response.status);
    
    if (!response.ok) {
      // Handle HTTP errors
      let errorMessage = `Server returned ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If we can't parse the error response as JSON, use the status text
        errorMessage = response.statusText || errorMessage;
      }
      
      if (onStatusUpdate) {
        onStatusUpdate(retryCount + 1, MAX_RETRIES, `Server error: ${errorMessage}. Retrying...`);
      }
      
      throw new Error(errorMessage);
    }
    
    const result = await response.json();
    console.log(`Attempt ${retryCount + 1} result:`, result);
    
    if (result.processed) {
      if (onStatusUpdate) {
        onStatusUpdate(retryCount + 1, MAX_RETRIES, 'Payment verification successful! Processing your order...');
      }
      return { success: true, result };
    }
    
    // If result.retryAfter is provided, use that as the next delay
    const serverRequestedDelay = result.retryAfter ? parseInt(result.retryAfter, 10) : null;
    
    // If we still need to retry and haven't reached max retries
    if (retryCount < MAX_RETRIES - 1) {
      // If server specified a retry delay, log it
      if (serverRequestedDelay) {
        console.log(`Server requested retry after ${serverRequestedDelay}ms`);
        if (onStatusUpdate) {
          onStatusUpdate(retryCount + 1, MAX_RETRIES, 
            `Payment still processing. Server requested to retry in ${serverRequestedDelay/1000} seconds...`);
        }
      } else if (onStatusUpdate) {
        onStatusUpdate(retryCount + 1, MAX_RETRIES, 
          `Payment verification pending. Will retry in ${delay/1000} seconds...`);
      }
      
      return verifyPaymentWithRetry(sessionId, token, retryCount + 1, onStatusUpdate);
    }
    
    if (onStatusUpdate) {
      onStatusUpdate(retryCount + 1, MAX_RETRIES, 'Payment verification failed after multiple attempts');
    }
    
    return { 
      success: false, 
      error: result.error || result.message || 'Payment was not processed after multiple attempts',
      lastResponse: result
    };
  } catch (error) {
    console.error(`Error in attempt ${retryCount + 1}:`, error);
    
    // If we still need to retry and haven't reached max retries
    if (retryCount < MAX_RETRIES - 1) {
      console.log(`Retry ${retryCount + 1} failed with exception, continuing with exponential backoff`);
      
      if (onStatusUpdate) {
        onStatusUpdate(retryCount + 1, MAX_RETRIES, 
          `Network or server error occurred. Retrying in ${(BASE_DELAY * Math.pow(2, retryCount))/1000} seconds...`);
      }
      
      return verifyPaymentWithRetry(sessionId, token, retryCount + 1, onStatusUpdate);
    }
    
    if (onStatusUpdate) {
      onStatusUpdate(retryCount + 1, MAX_RETRIES, 'Payment verification failed due to network or server errors');
    }
    
    return { 
      success: false, 
      error: error.message,
      isNetworkError: error.name === 'TypeError' && error.message.includes('fetch')
    };
  }
};
    return (
    <div className="payment-success-container">
      <div className="success-card">
        {status.loading ? (
          <>
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p className="processing-text">{status.message}</p>
              {status.details && (
                <p className="processing-details">{status.details}</p>
              )}
              {status.attemptCount > 0 && (
                <p className="retry-count">Verification attempt {status.attemptCount}/{MAX_RETRIES}</p>
              )}
            </div>
          </>
        ) : status.success ? (
          <>
            <div className="success-icon">✓</div>
            <h1>Payment Successful!</h1>
            <p>{status.message}</p>
            {status.details && (
              <p className="status-details">{status.details}</p>
            )}
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
          </>
        ) : (
          <>
            <div className="error-icon">!</div>
            <h1>There was an issue</h1>
            <p>{status.message}</p>
            {status.details && (
              <p className="status-details">{status.details}</p>
            )}
            {status.attemptCount >= MAX_RETRIES && (
              <p className="retry-exhausted">Payment verification failed after {status.attemptCount} attempts</p>
            )}
            <div className="button-group">
              <button 
                className="primary-button"
                onClick={() => navigate('/customer/cart')}
              >
                Return to Cart
              </button>
              <button 
                className="secondary-button"
                onClick={() => navigate('/customer/purchase-history')}
              >
                Check Purchase History
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
