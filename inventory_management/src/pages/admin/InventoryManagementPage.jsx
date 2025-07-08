import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaLeaf } from 'react-icons/fa';
import './InventoryManagementPage.css';

// InventoryManagementPage component for managing inventory
// Allows owners to add, edit, and delete harvest items
const InventoryManagementPage = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({ 
    cropName: '', 
    category: '', 
    quantityAvailable: 0, 
    harvestingDate: new Date().toISOString().split('T')[0], 
    unitPrice: 0 
  });
  const [editingItem, setEditingItem] = useState(null);
  const [error, setError] = useState(null);

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/admin/inventory', {
        headers: { 'x-role': 'owner' }
      });
      if (!response.ok) throw new Error('Failed to fetch inventory');
      const data = await response.json();
      setInventory(data);
      setLoading(false);
    } catch (err) {
      setError('Error fetching inventory');
      setLoading(false);
    }
  };

  // Fetch inventory on component mount
  // This will load the inventory data when the page is first rendered
  useEffect(() => {
    fetchInventory();
  }, []);

  // Handle input changes for new item form
  // Updates the newItem state with the input values
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({
      ...prev,
      [name]: ['cropName', 'category', 'harvestingDate'].includes(name) ? value : Number(value)
    }));
  };

  // Add a new harvest item to the inventory
  // Validates input and sends a POST request to the server
  const addItem = async () => {
    if (!newItem.cropName || !newItem.category || newItem.quantityAvailable < 0 || newItem.unitPrice < 0) {
      alert('Please enter valid item details');
      return;
    }
    try {
      const response = await fetch('/api/staff/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-role': 'staff'
        },
        body: JSON.stringify(newItem)
      });
      if (!response.ok) throw new Error('Failed to add item');
      setNewItem({ 
        cropName: '', 
        category: '', 
        quantityAvailable: 0, 
        harvestingDate: new Date().toISOString().split('T')[0], 
        unitPrice: 0 
      });
      fetchInventory();
    } catch (err) {
      alert('Error adding item');
    }
  };

  // Start editing an existing inventory item
  // Sets the editingItem state with the item details
  const startEdit = (item) => {
    setEditingItem({
      ...item,
      harvestingDate: item.harvestingDate ? new Date(item.harvestingDate).toISOString().split('T')[0] : ''
    });
  };

  // Handle changes in the edit form
  // Updates the editingItem state with the input values
  const handleEditChange = (e) => {
    if (!editingItem) return;
    const { name, value } = e.target;
    setEditingItem({
      ...editingItem,
      [name]: ['cropName', 'category', 'harvestingDate'].includes(name) ? value : Number(value)
    });
  };

  // Update an existing inventory item
  // Validates input and sends a PUT request to the server
  const updateItem = async () => {
    if (!editingItem) return;
    if (!editingItem.cropName || !editingItem.category || editingItem.quantityAvailable < 0 || editingItem.unitPrice < 0) {
      alert('Please enter valid item details');
      return;
    }
    try {
      const response = await fetch(`/api/staff/inventory/${editingItem.harvestID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-role': 'staff'
        },
        body: JSON.stringify(editingItem)
      });
      if (!response.ok) throw new Error('Failed to update item');
      setEditingItem(null);
      fetchInventory();
    } catch (err) {
      alert('Error updating item');
    }
  };

  // Delete an inventory item
  // Confirms deletion and sends a DELETE request to the server
  const deleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      const response = await fetch(`/api/staff/inventory/${id}`, {
        method: 'DELETE',
        headers: { 'x-role': 'staff' }
      });
      if (!response.ok) throw new Error('Failed to delete item');
      fetchInventory();
    } catch (err) {
      alert('Error deleting item');
    }
  };

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading inventory...</p>
    </div>
  );
  
  if (error) return (
    <div className="error-container">
      <p>{error}</p>
      <button onClick={fetchInventory}>Try Again</button>
    </div>
  );

  // Render the inventory management page
  // Displays the form to add new harvest items and the current inventory list
  return (
    <div className="inventory-management-page">
      <div className="page-header">
        <h2>Inventory Management</h2>
        <FaLeaf className="header-icon" />
      </div>

      <div className="form-container">
        <div className="form-header">
          <h3>Add New Harvest Item</h3>
          <FaPlus className="form-icon" />
        </div>
        
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="cropName">Crop Name</label>
            <input
              id="cropName"
              type="text"
              name="cropName"
              placeholder="Enter crop name"
              value={newItem.cropName}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <input
              id="category"
              type="text"
              name="category"
              placeholder="Enter category"
              value={newItem.category}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="quantityAvailable">Quantity Available</label>
            <input
              id="quantityAvailable"
              type="number"
              name="quantityAvailable"
              placeholder="Enter quantity"
              value={newItem.quantityAvailable}
              onChange={handleInputChange}
              min={0}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="harvestingDate">Harvesting Date</label>
            <input
              id="harvestingDate"
              type="date"
              name="harvestingDate"
              value={newItem.harvestingDate}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="unitPrice">Unit Price</label>
            <input
              id="unitPrice"
              type="number"
              name="unitPrice"
              placeholder="Enter price"
              value={newItem.unitPrice}
              onChange={handleInputChange}
              min={0}
              step="0.01"
            />
          </div>
        </div>
        
        <button className="add-button" onClick={addItem}>
          <FaPlus /> Add Harvest Item
        </button>
      </div>

      <div className="inventory-list">
        <div className="list-header">
          <h3>Current Inventory</h3>
        </div>
        
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Harvest ID</th>
                <th>Crop Name</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Harvesting Date</th>
                <th>Unit Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-message">
                    No harvest items in inventory.
                  </td>
                </tr>
              ) : (
                inventory.map(item => (
                  <tr key={item.harvestID}>
                    <td>{item.harvestID}</td>
                    <td>
                      {editingItem && editingItem.harvestID === item.harvestID ? (
                        <input
                          type="text"
                          name="cropName"
                          value={editingItem.cropName}
                          onChange={handleEditChange}
                        />
                      ) : (
                        item.cropName
                      )}
                    </td>
                    <td>
                      {editingItem && editingItem.harvestID === item.harvestID ? (
                        <input
                          type="text"
                          name="category"
                          value={editingItem.category}
                          onChange={handleEditChange}
                        />
                      ) : (
                        item.category
                      )}
                    </td>
                    <td>
                      {editingItem && editingItem.harvestID === item.harvestID ? (
                        <input
                          type="number"
                          name="quantityAvailable"
                          value={editingItem.quantityAvailable}
                          onChange={handleEditChange}
                          min={0}
                        />
                      ) : (
                        item.quantityAvailable
                      )}
                    </td>
                    <td>
                      {editingItem && editingItem.harvestID === item.harvestID ? (
                        <input
                          type="date"
                          name="harvestingDate"
                          value={editingItem.harvestingDate}
                          onChange={handleEditChange}
                        />
                      ) : (
                        new Date(item.harvestingDate).toLocaleDateString()
                      )}
                    </td>
                    <td>
                      {editingItem && editingItem.harvestID === item.harvestID ? (
                        <input
                          type="number"
                          name="unitPrice"
                          value={editingItem.unitPrice}
                          onChange={handleEditChange}
                          min={0}
                          step="0.01"
                        />
                      ) : (
                        `$${item.unitPrice.toFixed(2)}`
                      )}
                    </td>
                    <td className="action-buttons">
                      {editingItem && editingItem.harvestID === item.harvestID ? (
                        <>
                          <button className="save-button" onClick={updateItem}>
                            <FaSave /> Save
                          </button>
                          <button className="cancel-button" onClick={() => setEditingItem(null)}>
                            <FaTimes /> Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="edit-button" onClick={() => startEdit(item)}>
                            <FaEdit /> Edit
                          </button>
                          <button className="delete-button" onClick={() => deleteItem(item.harvestID)}>
                            <FaTrash /> Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagementPage;
