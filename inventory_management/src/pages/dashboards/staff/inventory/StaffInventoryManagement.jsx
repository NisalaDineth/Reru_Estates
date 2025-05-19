// src/pages/dashboards/staff/inventory/StaffInventoryManagement.jsx
import React, { useEffect, useState } from 'react';
import './StaffInventoryManagement.css';
import { FaEdit, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const StaffInventoryManagement = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [updatedItem, setUpdatedItem] = useState({
        harvestID: '',
        quantityAvailable: '',
        unitPrice: '',
        quality: 'High'
    });
    const navigate = useNavigate();    const fetchInventory = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch('http://localhost:5001/api/staff/inventory', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error("Failed to fetch inventory");
            }
            
            const data = await response.json();
            setInventory(data);
            setError(null);
        } catch (err) {
            console.error("Fetch error:", err);
            setError("Failed to load inventory data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const openEditModal = (item) => {
        setCurrentItem(item);
        setUpdatedItem({
            harvestID: item.HarvestID,
            quantityAvailable: item.QuantityAvailable,
            unitPrice: item.UnitPrice,
            quality: item.Quality || 'High'
        });
        setEditMode(true);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditMode(false);
        setCurrentItem(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUpdatedItem({
            ...updatedItem,
            [name]: value
        });
    };

    const handleUpdate = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:5001/api/staff/inventory/${updatedItem.harvestID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    quantityAvailable: updatedItem.quantityAvailable,
                    unitPrice: updatedItem.unitPrice,
                    quality: updatedItem.quality
                })
            });
            
            if (!response.ok) {
                throw new Error("Failed to update inventory");
            }
            
            alert("Inventory updated successfully");
            closeModal();
            fetchInventory();
        } catch (err) {
            console.error("Update error:", err);
            alert("Failed to update inventory");
        }
    };

    if (loading) return (
        <div className="staff-inventory-container">
            <div className="back-button" onClick={() => navigate('/staff/dashboard')}>
                <FaArrowLeft /> Back to Dashboard
            </div>
            <h1>Loading inventory data...</h1>
        </div>
    );
    
    if (error) return (
        <div className="staff-inventory-container">
            <div className="back-button" onClick={() => navigate('/staff/dashboard')}>
                <FaArrowLeft /> Back to Dashboard
            </div>
            <h1>Error: {error}</h1>
        </div>
    );

    return (
        <div className="staff-inventory-container">
            <div className="back-button" onClick={() => navigate('/staff/dashboard')}>
                <FaArrowLeft /> Back to Dashboard
            </div>
            
            <h1 className="inventory-header">Staff Inventory Management</h1>
            <p className="inventory-description">Track and update current harvest inventory levels</p>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Update Inventory Item</h3>
                        
                        <div className="form-group">
                            <label>Harvest ID</label>
                            <input
                                type="text"
                                className="form-control"
                                value={updatedItem.harvestID}
                                disabled
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Quantity Available (kg)</label>
                            <input
                                type="number"
                                name="quantityAvailable"
                                className="form-control"
                                value={updatedItem.quantityAvailable}
                                onChange={handleInputChange}
                                min="0"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Unit Price (Rs.)</label>
                            <input
                                type="number"
                                name="unitPrice"
                                className="form-control"
                                value={updatedItem.unitPrice}
                                onChange={handleInputChange}
                                min="0"
                                step="0.01"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label>Quality</label>
                            <select
                                name="quality"
                                className="form-control"
                                value={updatedItem.quality}
                                onChange={handleInputChange}
                            >
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>
                        
                        <div className="modal-buttons">
                            <button className="cancel-button" onClick={closeModal}>
                                Cancel
                            </button>
                            <button className="save-button" onClick={handleUpdate}>
                                Update Inventory
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
                                <th>ID</th>
                                <th>Crop Name</th>
                                <th>Category</th>
                                <th>Quantity (kg)</th>
                                <th>Harvest Date</th>
                                <th>Unit Price (Rs.)</th>
                                <th>Quality</th>
                                <th>Action</th>
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
                                    <td>{item.Quality || 'High'}</td>
                                    <td className="action-buttons">
                                        <button 
                                            className="edit-button" 
                                            onClick={() => openEditModal(item)}
                                        >
                                            <FaEdit /> Update
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

export default StaffInventoryManagement;
