import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrashAlt } from 'react-icons/fa';
import './FinancialManagement.css';

const FinancialManagement = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: '',
    date: '',
    notes: ''
  });

  const expenseCategories = [
    'Equipment',
    'Seeds',
    'Fertilizer',
    'Labor',
    'Utilities',
    'Maintenance',
    'Transportation',
    'Marketing',
    'Other'
  ];
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      // Using the implemented API endpoint
      const response = await fetch('http://localhost:5001/api/owner/expenses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch expenses');
      }

      const data = await response.json();
      setExpenses(data);
      setError(null);
    } catch (err) {
      setError('Failed to load expenses');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleAddExpense = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch('http://localhost:5001/api/owner/expenses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newExpense)
      });

      if (!response.ok) {
        throw new Error('Failed to add expense');
      }

      setShowModal(false);
      setNewExpense({
        description: '',
        amount: '',
        category: '',
        date: '',
        notes: ''
      });
      fetchExpenses();
    } catch (err) {
      setError('Failed to add expense');
      console.error('Add error:', err);
    }
  };

  const handleUpdateExpense = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5001/api/owner/expenses/${currentItem.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newExpense)
      });

      if (!response.ok) {
        throw new Error('Failed to update expense');
      }

      setShowModal(false);
      setEditMode(false);
      setCurrentItem(null);
      fetchExpenses();
    } catch (err) {
      setError('Failed to update expense');
      console.error('Update error:', err);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5001/api/owner/expenses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete expense');
      }

      fetchExpenses();
    } catch (err) {
      setError('Failed to delete expense');
      console.error('Delete error:', err);
    }
  };

  const openAddModal = () => {
    setEditMode(false);
    setCurrentItem(null);
    setNewExpense({
      description: '',
      amount: '',
      category: '',
      date: '',
      notes: ''
    });
    setShowModal(true);
  };

  const openEditModal = (expense) => {
    setEditMode(true);
    setCurrentItem(expense);
    setNewExpense({
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      date: expense.date,
      notes: expense.notes || ''
    });
    setShowModal(true);
  };

  if (loading) return <div className="finance-container">Loading financial data...</div>;
  if (error) return <div className="finance-container">Error: {error}</div>;

  return (
    <div className="finance-container">
      <h1 className="finance-header">Financial Management</h1>
      
      <button className="add-button" onClick={openAddModal}>
        <FaPlus /> Add Expense
      </button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editMode ? 'Edit Expense' : 'Add New Expense'}</h3>
            
            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                className="form-control"
                placeholder="Expense description"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              />
            </div>
            
            <div className="form-group">
              <label>Category</label>
              <select
                className="form-control"
                value={newExpense.category}
                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
              >
                <option value="">Select Category</option>
                {expenseCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Amount (Rs)</label>
              <input
                type="number"
                className="form-control"
                placeholder="Amount"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              />
            </div>
            
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                className="form-control"
                value={newExpense.date}
                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                className="form-control"
                placeholder="Additional notes"
                value={newExpense.notes}
                onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
              />
            </div>
            
            <div className="modal-buttons">
              <button className="cancel-button" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button 
                className="save-button" 
                onClick={editMode ? handleUpdateExpense : handleAddExpense}
              >
                {editMode ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {expenses.length > 0 ? (
        <div className="table-wrapper">
          <table className="finance-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(expense => (
                <tr key={expense.id}>
                  <td>{new Date(expense.date).toLocaleDateString()}</td>
                  <td>{expense.description}</td>
                  <td>{expense.category}</td>
                  <td>Rs. {parseFloat(expense.amount).toFixed(2)}</td>
                  <td>{expense.notes}</td>
                  <td className="action-buttons">
                    <button 
                      className="edit-button" 
                      onClick={() => openEditModal(expense)}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button 
                      className="delete-button" 
                      onClick={() => handleDeleteExpense(expense.id)}
                    >
                      <FaTrashAlt /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-finance">
          <p>No expenses recorded yet.</p>
        </div>
      )}
    </div>
  );
};

export default FinancialManagement;
