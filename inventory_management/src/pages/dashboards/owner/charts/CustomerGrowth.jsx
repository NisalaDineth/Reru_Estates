import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './ChartStyles.css';

const CustomerGrowthChart = () => {
  const [growthData, setGrowthData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGrowthData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5001/api/owner/customer-growth', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch customer growth');
        }

        const data = await response.json();
        const formatted = data.map(item => ({
          month: item.month,
          customerCount: item.customerCount,
        }));

        setGrowthData(formatted);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching customer growth:', error);
        setLoading(false);
      }
    };

    fetchGrowthData();
  }, []);

  if (loading) return <div className="chart-loading">Loading customer growth...</div>;

  return (
    <div className="chart-container">
      <h2 className="chart-title">Customer Growth</h2>
      <p className="chart-description">Monthly increase in active customer signups</p>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={growthData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="customerCount" stroke="#8884d8" strokeWidth={2} name="Customers" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CustomerGrowthChart;
