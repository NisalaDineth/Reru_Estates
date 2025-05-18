import React, { useEffect, useState } from "react";
import "./OwnerCustomerManagement.css";
import { FaUserPlus, FaToggleOn, FaToggleOff } from "react-icons/fa";

const OwnerCustomerManagement = () => {
    const [customers, setCustomers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newCustomer, setNewCustomer] = useState({ Name: '', Email: '', PhoneNumber: '', Password: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:5001/api/owner/customers");
            const data = await response.json();
            if (!response.ok) throw new Error("Failed to fetch customers");
            setCustomers(data);
            setError(null);
        } catch (err) {
            console.error("Fetch error:", err);
            setError("Failed to load customer data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleStatusToggle = async (customerID, currentStatus) => {
        const newStatus = !currentStatus;
        const actionText = newStatus ? "activate" : "deactivate";
        
        if (window.confirm(`Are you sure you want to ${actionText} this customer?`)) {
            try {
                const response = await fetch(`http://localhost:5001/api/owner/customers/${customerID}/status`, {
                    method: 'PATCH',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ isActive: newStatus }),
                });
                
                if (response.ok) {
                    alert(`Customer ${actionText}d successfully.`);
                    fetchCustomers();
                } else {
                    const errorData = await response.json().catch(() => null);
                    alert(errorData?.message || `Failed to ${actionText} customer.`);
                }
            } catch (err) {
                console.error("Status update error:", err);
                alert(`An error occurred while ${actionText}ing the customer.`);
            }
        }
    };

    const handleAddCustomer = async () => {
        try {
            const response = await fetch("http://localhost:5001/api/owner/customers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newCustomer),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert(data.message);
                setShowModal(false);
                setNewCustomer({ Name: '', Email: '', PhoneNumber: '', Password: '' });
                fetchCustomers();
            } else {
                throw new Error(data.message || "Failed to add customer");
            }
        } catch (err) {
            console.error("Add error:", err);
            alert(err.message || "An error occurred while adding the customer.");
        }
    };

    if (loading) return <div className="customer-container">Loading customer data...</div>;
    if (error) return <div className="customer-container">Error: {error}</div>;

    return (
        <div className="customer-container">
            <h1 className="customer-header">Owner Customer Management</h1>
            
            <button className="add-button" onClick={() => setShowModal(true)}>
                <FaUserPlus /> Add Customer
            </button>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Add New Customer</h3>
                        
                        <div className="form-group">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Name"
                                value={newCustomer.Name}
                                onChange={(e) => setNewCustomer({ ...newCustomer, Name: e.target.value })}
                            />
                        </div>
                        
                        <div className="form-group">
                            <input
                                type="email"
                                className="form-control"
                                placeholder="Email"
                                value={newCustomer.Email}
                                onChange={(e) => setNewCustomer({ ...newCustomer, Email: e.target.value })}
                            />
                        </div>
                        
                        <div className="form-group">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Phone Number"
                                value={newCustomer.PhoneNumber}
                                onChange={(e) => setNewCustomer({ ...newCustomer, PhoneNumber: e.target.value })}
                            />
                        </div>
                        
                        <div className="form-group">
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Password"
                                value={newCustomer.Password}
                                onChange={(e) => setNewCustomer({ ...newCustomer, Password: e.target.value })}
                            />
                        </div>
                        
                        <div className="modal-buttons">
                            <button className="cancel-button" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            <button className="save-button" onClick={handleAddCustomer}>
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {customers.length > 0 ? (
                <div className="table-wrapper">
                    <table className="customer-table">
                        <thead>
                            <tr>
                                <th>Customer ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map((cust) => (
                                <tr key={cust.id} className={!cust.isActive ? "inactive-row" : ""}>
                                    <td>{cust.id}</td>
                                    <td>{cust.Name}</td>
                                    <td>{cust.Email}</td>
                                    <td>{cust.PhoneNumber}</td>
                                    <td>
                                        <span className={`status-badge ${cust.isActive ? "active-badge" : "inactive-badge"}`}>
                                            {cust.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            className={`status-button ${cust.isActive ? "deactivate-button" : "activate-button"}`}
                                            onClick={() => handleStatusToggle(cust.id, cust.isActive)}
                                        >
                                            {cust.isActive ? (
                                                <>
                                                    <FaToggleOn /> Deactivate
                                                </>
                                            ) : (
                                                <>
                                                    <FaToggleOff /> Activate
                                                </>
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="empty-customers">
                    <p>No customers found.</p>
                </div>
            )}
        </div>
    );
};

export default OwnerCustomerManagement;
