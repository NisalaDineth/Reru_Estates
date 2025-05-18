import React, { useEffect, useState } from "react";
import "./OwnerStaffManagement.css";
import { FaUserPlus, FaTrashAlt } from "react-icons/fa";

const OwnerStaffManagement = () => {
    const [staff, setStaff] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newStaff, setNewStaff] = useState({ Name: '', Email: '', PhoneNumber: '', Password: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:5001/api/owner/staff");
            const data = await response.json();
            if (!response.ok) throw new Error("Failed to fetch staff");
            setStaff(data);
            setError(null);
        } catch (err) {
            console.error("Fetch error:", err);
            setError("Failed to load staff data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const handleDelete = async (staffID) => {
        if (window.confirm("Are you sure you want to delete this staff member?")) {
            try {
                const response = await fetch(`http://localhost:5001/api/owner/staff/${staffID}`, {
                    method: 'DELETE',
                });
                
                if (response.ok) {
                    alert("Staff member deleted successfully.");
                    fetchStaff();
                } else {
                    alert("Failed to delete staff member.");
                }
            } catch (err) {
                console.error("Delete error:", err);
                alert("An error occurred while deleting the staff member.");
            }
        }
    };

    const handleAddStaff = async () => {
        try {
            const response = await fetch("http://localhost:5001/api/owner/staff", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newStaff),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert(data.message);
                setShowModal(false);
                setNewStaff({ Name: '', Email: '', PhoneNumber: '', Password: '' });
                fetchStaff();
            } else {
                throw new Error(data.message || "Failed to add staff member");
            }
        } catch (err) {
            console.error("Add error:", err);
            alert(err.message || "An error occurred while adding the staff member.");
        }
    };

    if (loading) return <div className="staff-container">Loading staff data...</div>;
    if (error) return <div className="staff-container">Error: {error}</div>;

    return (
        <div className="staff-container">
            <h1 className="staff-header">Owner Staff Management</h1>
            
            <button className="add-button" onClick={() => setShowModal(true)}>
                <FaUserPlus /> Add Staff Member
            </button>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Add New Staff Member</h3>
                        
                        <div className="form-group">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Name"
                                value={newStaff.Name}
                                onChange={(e) => setNewStaff({ ...newStaff, Name: e.target.value })}
                            />
                        </div>
                        
                        <div className="form-group">
                            <input
                                type="email"
                                className="form-control"
                                placeholder="Email"
                                value={newStaff.Email}
                                onChange={(e) => setNewStaff({ ...newStaff, Email: e.target.value })}
                            />
                        </div>
                        
                        <div className="form-group">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Phone Number"
                                value={newStaff.PhoneNumber}
                                onChange={(e) => setNewStaff({ ...newStaff, PhoneNumber: e.target.value })}
                            />
                        </div>
                        
                        <div className="form-group">
                            <input
                                type="password"
                                className="form-control"
                                placeholder="Password"
                                value={newStaff.Password}
                                onChange={(e) => setNewStaff({ ...newStaff, Password: e.target.value })}
                            />
                        </div>
                        
                        <div className="modal-buttons">
                            <button className="cancel-button" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            <button className="save-button" onClick={handleAddStaff}>
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {staff.length > 0 ? (
                <div className="table-wrapper">
                    <table className="staff-table">
                        <thead>
                            <tr>
                                <th>Staff ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staff.map((member) => (
                                <tr key={member.id}>
                                    <td>{member.id}</td>
                                    <td>{member.Name || member.name}</td>
                                    <td>{member.Email}</td>
                                    <td>{member.PhoneNumber}</td>
                                    <td>
                                        <button 
                                            className="delete-button" 
                                            onClick={() => handleDelete(member.id)}
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
                <div className="empty-staff">
                    <p>No staff members found.</p>
                </div>
            )}
        </div>
    );
};

export default OwnerStaffManagement;
