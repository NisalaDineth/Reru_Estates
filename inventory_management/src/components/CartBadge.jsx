import React, { useEffect } from 'react';
import { useCart } from '../pages/dashboards/customer/cart/cartcontext';
import './CartBadge.css';

const CartBadge = () => {
  const { cartCount, updateCartCount } = useCart();
  
  useEffect(() => {
    updateCartCount();
  }, [updateCartCount]);
  
  return (
    <div className="cart-badge-container">
      {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
    </div>
  );
};

export default CartBadge;
