import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import './ChartStyles.css';

const InventoryLevelsChart = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState('name'); // Default sort by name
  const [sortDirection, setSortDirection] = useState('asc'); // Default ascending
  const [originalData, setOriginalData] = useState([]); // Store original data

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5001/api/owner/inventory', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch inventory');
        }

        const data = await response.json();

        // Transform data for the chart, store more detailed information
        const formattedData = data.map(item => ({
          id: item.ID || item._id,
          name: item.CropName,
          date: new Date(item.HarvestingDate),
          dateStr: new Date(item.HarvestingDate).toLocaleDateString(),
          quantity: item.QuantityAvailable,
        }));

        setOriginalData(formattedData); // Store complete data
        setInventoryData(sortData(formattedData, sortField, sortDirection));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching inventory:', error);
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  // Sort data based on field and direction
  const sortData = (data, field, direction) => {
    return [...data].sort((a, b) => {
      let comparison = 0;
      
      if (field === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (field === 'date') {
        comparison = a.date - b.date;
      } else if (field === 'quantity') {
        comparison = a.quantity - b.quantity;
      }
      
      return direction === 'asc' ? comparison : -comparison;
    });
  };

  // Handle sort click
  const handleSort = (field) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    setInventoryData(sortData(originalData, field, newDirection));
  };

  // Get sort icon based on current sort state
  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort />;
    return sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };

  if (loading) return <div className="chart-loading">Loading inventory chart...</div>;

  return (
    <div className="inventory-chart-container">
      <h2 className="inventory-chart-title">Inventory Levels</h2>
      <p className="inventory-chart-description">Current stock levels of harvested crops</p>
      
      <div className="sort-controls">
        <span>Sort by: </span>
        <button 
          className={`sort-button ${sortField === 'date' ? 'active' : ''}`}
          onClick={() => handleSort('date')}
        >
          Harvest Date {getSortIcon('date')}
        </button>
        <button 
          className={`sort-button ${sortField === 'name' ? 'active' : ''}`}
          onClick={() => handleSort('name')}
        >
          Crop Name {getSortIcon('name')}
        </button>
        <button 
          className={`sort-button ${sortField === 'quantity' ? 'active' : ''}`}
          onClick={() => handleSort('quantity')}
        >
          Quantity {getSortIcon('quantity')}
        </button>
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={inventoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis 
            dataKey="name"
            height={90}
            tick={(props) => {
              const { x, y, payload, index } = props;
              const item = inventoryData[index];
              
              return (
                <g transform={`translate(${x},${y})`}>
                  <text 
                    x={0} 
                    y={0} 
                    dy={16} 
                    textAnchor="middle" 
                    fill="#d4f5d4" 
                    fontSize={12}
                  >
                    {item.name}
                  </text>
                  <text 
                    x={0} 
                    y={20} 
                    dy={16} 
                    textAnchor="middle" 
                    fill="#d4f5d4" 
                    fontSize={12}
                  >
                    ({item.dateStr})
                  </text>
                </g>
              );
            }}
          />
          <YAxis />
          <Tooltip 
            formatter={(value, name) => [`${value} units`, 'Quantity']}
            labelFormatter={(label, payload) => {
              if (payload && payload.length > 0) {
                return `${payload[0].payload.name} (${payload[0].payload.dateStr})`;
              }
              return label;
            }}
          />
          <Legend />
          <Bar dataKey="quantity" fill="#82ca9d" name="Quantity Available" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InventoryLevelsChart;
