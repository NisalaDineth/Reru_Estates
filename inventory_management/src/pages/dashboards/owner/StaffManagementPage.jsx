import React, { useEffect, useState } from 'react';

const StaffManagementPage = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newStaff, setNewStaff] = useState({ username: '', email: '', phoneNumber: '' });
  const [editingStaff, setEditingStaff] = useState(null);

  const fetchStaff = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/staff');
      if (!response.ok) {
        throw new Error('Failed to fetch staff');
      }
      const data = await response.json();
      setStaff(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStaff(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addStaff = async () => {
    if (!newStaff.username || !newStaff.email || !newStaff.phoneNumber) {
      alert('Please fill all fields');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStaff)
      });
      if (!response.ok) throw new Error('Failed to add staff');
      setNewStaff({ username: '', email: '', phoneNumber: '' });
      fetchStaff();
    } catch (err) {
      alert('Error adding staff');
    }
  };

  const startEdit = (staffMember) => {
    setEditingStaff(staffMember);
  };

  const handleEditChange = (e) => {
    if (!editingStaff) return;
    const { name, value } = e.target;
    setEditingStaff({
      ...editingStaff,
      [name]: value
    });
  };

  const updateStaff = async () => {
    if (!editingStaff) return;
    if (!editingStaff.username || !editingStaff.email || !editingStaff.phoneNumber) {
      alert('Please fill all fields');
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/staff/${editingStaff.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingStaff)
      });
      if (!response.ok) throw new Error('Failed to update staff');
      setEditingStaff(null);
      fetchStaff();
    } catch (err) {
      alert('Error updating staff');
    }
  };

  const deleteStaff = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/staff/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete staff');
      fetchStaff();
    } catch (err) {
      alert('Error deleting staff');
    }
  };

  if (loading) return <p>Loading staff...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>Staff Management</h2>

      <div className="add-staff-form">
        <h3>Add New Staff</h3>
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={newStaff.username}
          onChange={handleInputChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={newStaff.email}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="phoneNumber"
          placeholder="Phone Number"
          value={newStaff.phoneNumber}
          onChange={handleInputChange}
        />
        <button onClick={addStaff}>Add Staff</button>
      </div>

      <div className="staff-list">
        <h3>Current Staff</h3>
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Phone Number</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center' }}>
                  No staff members found.
                </td>
              </tr>
            ) : (
              staff.map(member => (
                <tr key={member.id}>
                  <td>
                    {editingStaff && editingStaff.id === member.id ? (
                      <input
                        type="text"
                        name="username"
                        value={editingStaff.username}
                        onChange={handleEditChange}
                      />
                    ) : (
                      member.username
                    )}
                  </td>
                  <td>
                    {editingStaff && editingStaff.id === member.id ? (
                      <input
                        type="email"
                        name="email"
                        value={editingStaff.email}
                        onChange={handleEditChange}
                      />
                    ) : (
                      member.email
                    )}
                  </td>
                  <td>
                    {editingStaff && editingStaff.id === member.id ? (
                      <input
                        type="text"
                        name="phoneNumber"
                        value={editingStaff.phoneNumber}
                        onChange={handleEditChange}
                      />
                    ) : (
                      member.phoneNumber
                    )}
                  </td>
                  <td>
                    {editingStaff && editingStaff.id === member.id ? (
                      <>
                        <button onClick={updateStaff}>Save</button>
                        <button onClick={() => setEditingStaff(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(member)}>Edit</button>
                        <button onClick={() => deleteStaff(member.id)}>Delete</button>
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
  );
};

export default StaffManagementPage;
