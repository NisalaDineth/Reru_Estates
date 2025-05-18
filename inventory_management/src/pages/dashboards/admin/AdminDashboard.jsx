import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <p>Welcome to the Admin Dashboard!</p>

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
          onClick={() => navigate('/admin/financial-reports')}
          style={{
            cursor: 'pointer',
            border: '1px solid #ccc',
            padding: '20px',
            borderRadius: '8px',
            width: '200px',
            textAlign: 'center'
          }}
        >
          <h3>Financial Reports</h3>
          <p>View and generate financial reports</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
