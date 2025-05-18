import React from 'react';
import { useNavigate } from 'react-router-dom';
import './StaffDashboard.css';

const StaffDashboard = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h2>Staff Dashboard</h2>
      <p>Welcome to the Staff Dashboard!</p>

      <div className="dashboard-cards" style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div
          className="dashboard-card"
          onClick={() => navigate('/admin/inventory-management')}
          style={{
            cursor: 'pointer',
            border: '1px solid #ccc',
            padding: '20px',
            borderRadius: '8px',
            width: '200px',
            textAlign: 'center'
          }}
        >
          <h3>Inventory Management</h3>
          <p>Add, update, and remove inventory items</p>
        </div>
        <div
          className="dashboard-card"
          onClick={() => navigate('/staff/harvest-logging')}
          style={{
            cursor: 'pointer',
            border: '1px solid #ccc',
            padding: '20px',
            borderRadius: '8px',
            width: '200px',
            textAlign: 'center'
          }}
        >
          <h3>Harvest Logging</h3>
          <p>Log new harvest details</p>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
