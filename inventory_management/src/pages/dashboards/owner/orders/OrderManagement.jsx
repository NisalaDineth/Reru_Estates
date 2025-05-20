import React, { useState, useEffect } from 'react';
import { FaCheck, FaClock } from 'react-icons/fa';
import './OrderManagement.css';

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError('Authentication required. Please log in.');
                setLoading(false);
                return;
            }

            console.log('Fetching orders...');
            const response = await fetch('http://localhost:5001/api/owner/orders', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });            const data = await response.json();
            console.log('Server response:', data);

            if (!response.ok) {
                const errorMessage = data.error || data.message || 'Failed to fetch orders';
                console.error('Server error:', errorMessage, data);
                throw new Error(errorMessage);
            }
            
            if (!isValidResponse(data)) {
                console.error('Invalid data format:', data);
                throw new Error('Invalid data format received from server');
            }
            
            setOrders(data);
            setError(null);
        } catch (err) {
            console.error("Fetch error:", err);
            setError(err.message || "Failed to load orders. Please try again later.");
        } finally {
            setLoading(false);
        }
    };    useEffect(() => {
        fetchOrders();
    }, []);

    // Add error boundary for order status changes
    const isValidResponse = (data) => {
        return data && Array.isArray(data) && data.every(order => 
            order.id && 
            order.customer_name && 
            order.purchase_date && 
            order.total_amount && 
            Array.isArray(order.items)
        );
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:5001/api/owner/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                throw new Error('Failed to update order status');
            }

            // Update local state
            setOrders(orders.map(order => 
                order.id === orderId ? { ...order, status: newStatus } : order
            ));

            alert(`Order ${orderId} marked as ${newStatus}`);
        } catch (err) {
            console.error("Update error:", err);
            alert("Failed to update order status");
        }
    };

    if (loading) return <div className="order-management-container">Loading orders...</div>;
    if (error) return <div className="order-management-container">Error: {error}</div>;

    return (
        <div className="order-management-container">
            <h1 className="order-header">Order Management</h1>
            <p className="order-description">Manage and track all customer orders</p>

            {orders.length > 0 ? (
                <div className="table-wrapper">
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Order Date</th>
                                <th>Items</th>
                                <th>Total Amount</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id} className={order.status === 'completed' ? 'completed-row' : ''}>
                                    <td>#{order.id}</td>
                                    <td>{order.customer_name}</td>
                                    <td>{new Date(order.purchase_date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}</td>
                                    <td>
                                        <div className="order-items">
                                            {order.items.map((item, index) => (
                                                <div key={index} className="order-item">
                                                    {item.cropName} x {item.quantity}
                                                </div>
                                            ))}
                                        </div>                                    </td>
                                    <td>Rs. {Number(order.total_amount).toFixed(2)}</td>
                                    <td>
                                        <span className={`status-badge ${order.status}`}>
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </span>
                                    </td>
                                    <td>
                                        {order.status === 'pending' ? (
                                            <button 
                                                className="complete-button"
                                                onClick={() => handleStatusChange(order.id, 'completed')}
                                                title="Mark as completed"
                                            >
                                                <FaCheck /> Complete
                                            </button>
                                        ) : (
                                            <button 
                                                className="pending-button"
                                                onClick={() => handleStatusChange(order.id, 'pending')}
                                                title="Mark as pending"
                                            >
                                                <FaClock /> Mark Pending
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="empty-orders">
                    <p>No orders found.</p>
                </div>
            )}
        </div>
    );
};

export default OrderManagement;
