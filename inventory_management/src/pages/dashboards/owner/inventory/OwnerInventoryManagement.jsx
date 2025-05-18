import React, { useEffect, useState } from 'react';
import './OwnerInventoryManagement.css';
import { FaPlus, FaEdit, FaTrashAlt } from 'react-icons/fa';

const OwnerInventoryManagement = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [newItem, setNewItem] = useState({
        CropName: '',
        Category: '',
        QuantityAvailable: '',
        HarvestingDate: '',
        UnitPrice: ''
    });

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch('http://localhost:5001/api/owner/inventory', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Fetch failed');
            setInventory(data);
            setError(null);
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to load inventory data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const handleAddItem = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:5001/api/owner/inventory/add", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(newItem),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert(data.message || "Inventory item added successfully");
                setShowModal(false);
                setNewItem({
                    CropName: '',
                    Category: '',
                    QuantityAvailable: '',
                    HarvestingDate: '',
                    UnitPrice: ''
                });
                fetchInventory();
            } else {
                throw new Error(data.message || "Failed to add inventory item");
            }
        } catch (err) {
            console.error("Add error:", err);
            alert(err.message || "An error occurred while adding the inventory item.");
        }
    };

    const handleUpdateItem = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:5001/api/owner/inventory/update/${currentItem.HarvestID}`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(newItem),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert(data.message || "Inventory item updated successfully");
                setShowModal(false);
                setEditMode(false);
                setCurrentItem(null);
                setNewItem({
                    CropName: '',
                    Category: '',
                    QuantityAvailable: '',
                    HarvestingDate: '',
                    UnitPrice: ''
                });
                fetchInventory();
            } else {
                throw new Error(data.message || "Failed to update inventory item");
            }
        } catch (err) {
            console.error("Update error:", err);
            alert(err.message || "An error occurred while updating the inventory item.");
        }
    };

    const handleDelete = async (harvestID) => {
        if (window.confirm("Are you sure you want to delete this inventory item?")) {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`http://localhost:5001/api/owner/inventory/delete/${harvestID}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    alert("Inventory item deleted successfully.");
                    fetchInventory();
                } else {
                    const data = await response.json();
                    alert(data.message || "Failed to delete inventory item.");
                }
            } catch (err) {
                console.error("Delete error:", err);
                alert("An error occurred while deleting the inventory item.");
            }
        }
    };

    const openEditModal = (item) => {
        setEditMode(true);
        setCurrentItem(item);
        // Format date to YYYY-MM-DD for input field
        const formattedDate = new Date(item.HarvestingDate).toISOString().split('T')[0];
        setNewItem({
            CropName: item.CropName,
            Category: item.Category,
            QuantityAvailable: item.QuantityAvailable,
            HarvestingDate: formattedDate,
            UnitPrice: item.UnitPrice
        });
        setShowModal(true);
    };

    const openAddModal = () => {
        setEditMode(false);
        setCurrentItem(null);
        setNewItem({
            CropName: '',
            Category: '',
            QuantityAvailable: '',
            HarvestingDate: '',
            UnitPrice: ''
        });
        setShowModal(true);
    };

    if (loading) return <div className="inventory-container">Loading inventory data...</div>;
    if (error) return <div className="inventory-container">Error: {error}</div>;

    return (
        <div className="inventory-container">
            <h1 className="inventory-header">Owner Inventory Management</h1>
            
            <button className="add-button" onClick={openAddModal}>
                <FaPlus /> Add Inventory Item
            </button>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>{editMode ? 'Edit Inventory Item' : 'Add New Inventory Item'}</h3>
                        
                        <div className="form-group">
                            <label>Crop Name</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Crop Name"
                                value={newItem.CropName}
                                onChange={(e) => setNewItem({ ...newItem, CropName: e.target.value })}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Category</label>
                            <select
                                className="form-control"
                                value={newItem.Category}
                                onChange={(e) => setNewItem({ ...newItem, Category: e.target.value })}
                            >
                                <option value="">Select Category</option>
                                <option value="Vegetables">Vegetables</option>
                                <option value="Fruits">Fruits</option>
                                <option value="Grains">Grains</option>
                                <option value="Dairy">Dairy</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label>Quantity Available</label>
                            <input
                                type="number"
                                className="form-control"
                                placeholder="Quantity"
                                value={newItem.QuantityAvailable}
                                onChange={(e) => setNewItem({ ...newItem, QuantityAvailable: e.target.value })}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Harvesting Date</label>
                            <input
                                type="date"
                                className="form-control"
                                value={newItem.HarvestingDate}
                                onChange={(e) => setNewItem({ ...newItem, HarvestingDate: e.target.value })}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Unit Price (Rs)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="form-control"
                                placeholder="Unit Price"
                                value={newItem.UnitPrice}
                                onChange={(e) => setNewItem({ ...newItem, UnitPrice: e.target.value })}
                            />
                        </div>
                        
                        <div className="modal-buttons">
                            <button className="cancel-button" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            <button 
                                className="save-button" 
                                onClick={editMode ? handleUpdateItem : handleAddItem}
                            >
                                {editMode ? 'Update' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {inventory.length > 0 ? (
                <div className="table-wrapper">
                    <table className="inventory-table">
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
                            {inventory.map(item => (
                                <tr key={item.HarvestID}>
                                    <td>{item.HarvestID}</td>
                                    <td>{item.CropName}</td>
                                    <td>{item.Category}</td>
                                    <td>{item.QuantityAvailable}</td>
                                    <td>{new Date(item.HarvestingDate).toLocaleDateString()}</td>
                                    <td>Rs. {parseFloat(item.UnitPrice).toFixed(2)}</td>
                                    <td className="action-buttons">
                                        <button 
                                            className="edit-button" 
                                            onClick={() => openEditModal(item)}
                                        >
                                            <FaEdit /> Edit
                                        </button>
                                        <button 
                                            className="delete-button" 
                                            onClick={() => handleDelete(item.HarvestID)}
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
                <div className="empty-inventory">
                    <p>No inventory items found.</p>
                </div>
            )}
        </div>
    );
};

export default OwnerInventoryManagement;
