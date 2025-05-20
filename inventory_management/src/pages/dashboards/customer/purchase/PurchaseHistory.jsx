import React, { useState, useEffect } from 'react';
import './PurchaseHistory.css';

const PurchaseHistory = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPurchaseHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        console.log('Fetching purchase history...');
        const response = await fetch('http://localhost:5001/api/payment/purchase-history', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Server returned error:', errorData);
          throw new Error(errorData.message || 'Failed to fetch purchase history');
        }

        const data = await response.json();
        console.log('Received purchase data:', data);
        
        if (!Array.isArray(data)) {
          console.error('Expected array but received:', typeof data);
          throw new Error('Invalid data format received from server');
        }

        // Group items by purchase ID
        const groupedPurchases = data.reduce((acc, item) => {
          console.log('Processing purchase item:', item);
          const purchase = acc.find(p => p.id === item.purchase_id);
          if (purchase) {
            purchase.items.push({
              cropName: item.CropName || item.crop_name || 'Unknown Product',
              quantity: Number(item.quantity) || 0,
              unitPrice: Number(item.unit_price) || 0,
              subtotal: Number(item.subtotal) || 0,
              harvestId: item.harvest_id
            });
          } else {
            acc.push({
              id: item.purchase_id,
              date: new Date(item.purchase_date),
              totalAmount: Number(item.total_amount) || 0,
              stripeSessionId: item.stripe_session_id,
              items: [{
                cropName: item.CropName || item.crop_name || 'Unknown Product',
                quantity: Number(item.quantity) || 0,
                unitPrice: Number(item.unit_price) || 0,
                subtotal: Number(item.subtotal) || 0,
                harvestId: item.harvest_id
              }]
            });
          }
          return acc;
        }, []);

        console.log('Grouped purchases:', groupedPurchases);

        // Sort purchases by date, most recent first
        groupedPurchases.sort((a, b) => b.date - a.date);
        setPurchases(groupedPurchases);
      } catch (error) {
        console.error('Error in purchase history:', error);
        setError(error.message || 'Failed to load purchase history');
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseHistory();
  }, []);

  if (loading) {
    return (
      <div className="purchase-history-container">
        <h2>Purchase History</h2>
        <div className="loading-message">Loading purchase history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="purchase-history-container">
        <h2>Purchase History</h2>
        <div className="error-message">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="purchase-history-container">
      <h2>Purchase History</h2>
      {purchases.length === 0 ? (
        <p className="no-purchases">No purchase history available.</p>
      ) : (
        <div className="purchases-list">
          {purchases.map((purchase) => (
            <div key={purchase.id} className="purchase-card">
              <div className="purchase-header">
                <div className="purchase-header-left">
                  <span className="purchase-date">
                    Order Date: {purchase.date.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <span className="order-id">Order ID: #{purchase.id}</span>
                </div>
                <span className="purchase-total">Total: Rs. {purchase.totalAmount.toFixed(2)}</span>
              </div>
              <div className="purchase-items">
                <div className="purchase-items-header">
                  <span>Item</span>
                  <span>Quantity</span>
                  <span>Unit Price</span>
                  <span>Subtotal</span>
                </div>
                {purchase.items.map((item, index) => (
                  <div key={index} className="purchase-item">
                    <span className="item-name">{item.cropName}</span>
                    <span className="item-quantity">{item.quantity}</span>
                    <span className="item-price">Rs. {item.unitPrice.toFixed(2)}</span>
                    <span className="item-subtotal">Rs. {item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
                <div className="purchase-summary">
                  <div>
                    <span>Items: {purchase.items.length}</span>
                    <span>Total Quantity: {purchase.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                  </div>
                  <div className="purchase-total-summary">
                    Order Total: Rs. {purchase.totalAmount.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PurchaseHistory;
