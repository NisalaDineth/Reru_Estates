import React, { useEffect, useState } from 'react';
import { FaBoxOpen, FaUsers, FaUserTie, FaClipboardList } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';

import InventoryLevelsChart from './charts/InventoryLevels';
import CustomerGrowthChart from './charts/CustomerGrowth'; // New chart import
import './OwnerDashboard.css';

function OwnerDashboard() {
  const [ownerData, setOwnerData] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      const path = location.pathname;
      if (path.includes('/owner/inventory')) {
        setActiveSection('inventory');
      } else if (path.includes('/owner/customer')) {
        setActiveSection('customers');
      } else if (path.includes('/owner/staff')) {
        setActiveSection('staff');
      } else {
        setActiveSection(null);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [location.pathname]);

  const dashboardCards = [
    {
      id: 'inventory',
      title: 'Inventory Management',
      description: 'Manage inventory items',
      icon: <FaBoxOpen className="card-icon" />
    },
    {
      id: 'customers',
      title: 'Customer Management',
      description: 'Manage customer accounts',
      icon: <FaUsers className="card-icon" />
    },
    {
      id: 'staff',
      title: 'Staff Management',
      description: 'Manage staff accounts',
      icon: <FaUserTie className="card-icon" />
    },
    {
      id: 'orders',
      title: 'Order Management',
      description: 'Manage customer orders',
      icon: <FaClipboardList className="card-icon" />
    }
  ];

  const handleCardClick = (id) => {
    setActiveSection(id);
    if (id === 'inventory') {
      navigate('/owner/inventory');
    } else if (id === 'customers') {
      navigate('/owner/customer');
    } else if (id === 'staff') {
      navigate('/owner/staff');
    }
  };

  return (
    <div className="owner-dashboard">
      <div className="dashboard-header">
        <h2>Owner Dashboard</h2>
        <p className="welcome-message">
          Welcome back, {ownerData ? ownerData.name : 'Owner'}!
        </p>
      </div>

      <div className="dashboard-cards">
        {dashboardCards.map((card) => (
          <div 
            key={card.id}
            className={`dashboard-card ${activeSection === card.id ? 'active' : ''}`}
            onClick={() => handleCardClick(card.id)}
          >
            <div className="card-icon-container">
              {card.icon}
            </div>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
          </div>
        ))}
      </div>

      {/* Dashboard charts section */}
      <div className="dashboard-charts-section">
        <div className="section-header">
          <h2>Plantation Analytics</h2>
          <p>Real-time overview of your plantation's inventory and performance</p>
        </div>
        <div className="charts-container1">
          <div className="inventory-chart-container">
            <InventoryLevelsChart />
          </div>
          <div className="customer-chart-container">
            <CustomerGrowthChart />
          </div>
        </div>
      </div>
    </div>
  );
}

export default OwnerDashboard;
