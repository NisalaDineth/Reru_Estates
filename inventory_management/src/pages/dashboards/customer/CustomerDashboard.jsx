import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShoppingBag, FaLeaf } from 'react-icons/fa'; // Add react-icons package
import './CustomerDashboard.css';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  
  // Get customer name from localStorage (if available)
  const customerData = JSON.parse(localStorage.getItem('customer') || '{}');
  const customerName = customerData.name || 'Valued Customer';

  const dashboardCards = [
        {
      title: 'Available Crops',
      description: 'Browse available crops for order',
      icon: <FaLeaf className="card-icon" />,
      path: '/customer/inventory'
    },
    {
      title: 'My Orders',
      description: 'View and manage your orders',
      icon: <FaShoppingBag className="card-icon" />,
      path: '/customer/purchase-history'
    },

  ];

  return (
    <div className="customer-dashboard">
      <div className="dashboard-header">
        <h2>Customer Dashboard</h2>
        <p className="welcome-message">Welcome back, {customerName}!</p>
      </div>

      <div className="dashboard-cards">
        {dashboardCards.map((card, index) => (
          <div 
            key={index}
            className="dashboard-card"
            onClick={() => navigate(card.path)}
          >
            <div className="card-icon-container">
              {card.icon}
            </div>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerDashboard;
