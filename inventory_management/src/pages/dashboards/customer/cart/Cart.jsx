import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Cart.css';
import { useCart } from './cartcontext';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { updateCartCount } = useCart();

  useEffect(() => {
    const fetchCartItems = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:5001/api/cart/get', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch cart items');
        }

        const data = await response.json();
        setCartItems(data);
        updateCartCount(); // Update cart count when items are fetched
      } catch (error) {
        console.error('Error fetching cart items:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [updateCartCount]);

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => {
      const updated = prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId];

      if (!prev.includes(itemId)) {
        setQuantities(q => ({ ...q, [itemId]: 1 }));
      }

      return updated;
    });
  };

  const handleQuantityChange = (itemId, value, max) => {
    const qty = parseInt(value, 10);
    if (!isNaN(qty) && qty >= 1 && qty <= max) {
      setQuantities(q => ({ ...q, [itemId]: qty }));
    }
  };

  const handleRemoveItem = async (cartId) => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`http://localhost:5001/api/cart/remove/${cartId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to remove item');
      }

      setCartItems(prev => prev.filter(item => item.CartID !== cartId));
      setSelectedItems(prev => prev.filter(id => id !== cartId));
      const updatedQuantities = { ...quantities };
      delete updatedQuantities[cartId];
      setQuantities(updatedQuantities);
      updateCartCount(); // Update cart count when an item is removed
    } catch (err) {
      alert(`Error: ${err.message}`);
      console.error(err);
    }
  };

  useEffect(() => {
    const total = cartItems
      .filter(item => selectedItems.includes(item.CartID))
      .reduce((sum, item) => {
        const qty = quantities[item.CartID] || 1;
        return sum + (item.UnitPrice * qty);
      }, 0);
    setTotalAmount(total);
  }, [selectedItems, cartItems, quantities]);

  const handleCheckout = () => {
    const selectedProducts = cartItems
      .filter(item => selectedItems.includes(item.CartID))
      .map(item => ({
        ...item,
        required_quantity: quantities[item.CartID] || 1,
        sub_total: item.UnitPrice * (quantities[item.CartID] || 1)
      }));

    navigate('/checkout', {
      state: {
        products: selectedProducts,
        total: totalAmount
      }
    });
  };

  if (loading) return <div className="loading-message">Loading cart items...</div>;

  if (error) {
    return (
      <div className="cart-container">
        <h2>Your Cart</h2>
        <div className="error-message">Error: {error}</div>
        {error.includes('token') && (
          <button onClick={() => navigate('/login')}>Please login again</button>
        )}
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          <ul>
            {cartItems.map(item => (
              <li key={item.CartID} className="cart-item">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.CartID)}
                  onChange={() => handleSelectItem(item.CartID)}
                />
                <span className="crop-name">{item.CropName}</span> - <span className="price">Rs. {item.UnitPrice}</span>
                <button 
                  onClick={() => handleRemoveItem(item.CartID)} 
                  className="remove-button"
                >
                  Remove
                </button>
                <br />
                {selectedItems.includes(item.CartID) && (
                  <div className="quantity-selector">
                    <label>
                      Required Quantity:
                      <input
                        type="number"
                        min="1"
                        max={item.QuantityAvailable}
                        value={quantities[item.CartID] || 1}
                        onChange={(e) => handleQuantityChange(item.CartID, e.target.value, item.QuantityAvailable)}
                      />
                      <span className="available">(Available: {item.QuantityAvailable})</span>
                    </label>
                  </div>
                )}
              </li>
            ))}
          </ul>
          <p className="total-amount">Total Amount: Rs. {totalAmount}</p>
          <button 
            onClick={handleCheckout} 
            disabled={selectedItems.length === 0}
            className="checkout-button"
          >
            Proceed to Checkout
          </button>
        </>
      )}
    </div>
  );
};

export default Cart;
