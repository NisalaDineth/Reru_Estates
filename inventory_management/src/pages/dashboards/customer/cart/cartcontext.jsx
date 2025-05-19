import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const [refreshCart, setRefreshCart] = useState(false);

  const updateCartCount = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:5001/api/cart/get', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCartCount(data.length);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  const clearCart = async (cartIds) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:5001/api/cart/clear', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cartIds })
      });

      if (response.ok) {
        await updateCartCount();
      } else {
        throw new Error('Failed to clear cart');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  // Function to trigger cart refresh
  const refreshCartItems = () => {
    setRefreshCart(prev => !prev);
  };

  // Update cart count whenever refresh is triggered
  useEffect(() => {
    updateCartCount();
  }, [refreshCart]);

  return (
    <CartContext.Provider value={{ cartCount, refreshCartItems, updateCartCount, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
