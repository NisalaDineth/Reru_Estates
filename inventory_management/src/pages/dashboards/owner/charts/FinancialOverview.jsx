import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Charts.css';

const FinancialOverview = () => {
  const [financialData, setFinancialData] = useState([]);

  useEffect(() => {
    // TODO: Replace with actual API call
    const dummyData = [
      { month: 'Jan', income: 25000, expenses: 18000, profit: 7000 },
      { month: 'Feb', income: 28000, expenses: 19000, profit: 9000 },
      { month: 'Mar', income: 32000, expenses: 22000, profit: 10000 },
      { month: 'Apr', income: 30000, expenses: 20000, profit: 10000 },
      { month: 'May', income: 35000, expenses: 23000, profit: 12000 }
    ];
    setFinancialData(dummyData);
  }, []);

  return (
    <div className="chart-wrapper">
      <h3 className="chart-title">Financial Overview</h3>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={financialData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2c5a2c" />
            <XAxis dataKey="month" stroke="#d4f5d4" />
            <YAxis stroke="#d4f5d4" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f3f1f',
                border: '1px solid #2c5a2c',
                color: '#d4f5d4'
              }}
            />
            <Bar dataKey="income" name="Income" fill="#4CAF50" />
            <Bar dataKey="expenses" name="Expenses" fill="#FF5252" />
            <Bar dataKey="profit" name="Profit" fill="#2196F3" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="financial-summary">
        <div className="summary-item">
          <span className="label">Total Income:</span>
          <span className="value income">Rs. {financialData.reduce((sum, item) => sum + item.income, 0)}</span>
        </div>
        <div className="summary-item">
          <span className="label">Total Expenses:</span>
          <span className="value expenses">Rs. {financialData.reduce((sum, item) => sum + item.expenses, 0)}</span>
        </div>
        <div className="summary-item">
          <span className="label">Net Profit:</span>
          <span className="value profit">Rs. {financialData.reduce((sum, item) => sum + item.profit, 0)}</span>
        </div>
      </div>
    </div>
  );
};

export default FinancialOverview;
