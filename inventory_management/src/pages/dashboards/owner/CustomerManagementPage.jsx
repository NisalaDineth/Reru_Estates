import React, { useState, useEffect } from 'react';

const CustomerManagementPage = () => {
  const [customers, setCustomers] = useState([]);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    password: '',
    email: '',
    phoneNumber: ''
  });
  const [editCustomerId, setEditCustomerId] = useState(null);
  const [editCustomerData, setEditCustomerData] = useState({
    name: '',
    email: '',
    phoneNumber: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customer');
      const data = await response.json();
      setCustomers(data);
    } catch (err) {
      setError('Failed to fetch customers');
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleNewCustomerChange = (e) => {
    setNewCustomer({...newCustomer, [e.target.name]: e.target.value});
  };

  const handleEditCustomerChange = (e) => {
    setEditCustomerData({...editCustomerData, [e.target.name]: e.target.value});
  };

  const handleAddCustomer = async () => {
    setError('');
    setSuccess('');
    if (!newCustomer.name || !newCustomer.password || !newCustomer.email) {
      setError('Name, password, and email are required');
      return;
    }
    try {
      const response = await fetch('/api/customer/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(newCustomer)
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Customer added successfully');
        setNewCustomer({name: '', password: '', email: '', phoneNumber: ''});
        fetchCustomers();
      } else {
        setError(data.error || 'Failed to add customer');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const handleEditClick = (customer) => {
    setEditCustomerId(customer.id);
    setEditCustomerData({
      name: customer.name,
      email: customer.email,
      phoneNumber: customer.phoneNumber || ''
    });
  };

  const handleCancelEdit = () => {
    setEditCustomerId(null);
    setEditCustomerData({name: '', email: '', phoneNumber: ''});
  };

  const handleSaveEdit = async (id) => {
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`/api/customer/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(editCustomerData)
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Customer updated successfully');
        setEditCustomerId(null);
        fetchCustomers();
      } else {
        setError(data.error || 'Failed to update customer');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const handleDelete = async (id) => {
    setError('');
    setSuccess('');
    try {
      const response = await fetch(`/api/customer/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setSuccess('Customer deleted successfully');
        fetchCustomers();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete customer');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div>
      <h1>Customer Management</h1>
      {error && <div style={{color: 'red'}}>{error}</div>}
      {success && <div style={{color: 'green'}}>{success}</div>}
      <table border={1} cellPadding={5} cellSpacing={0}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone Number</th>
            <th>Password</th>
            <th>Edit</th>
            <th>Remove</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              {editCustomerId === customer.id ? (
                <>
                  <td><input name="name" value={editCustomerData.name} onChange={handleEditCustomerChange} /></td>
                  <td><input name="email" value={editCustomerData.email} onChange={handleEditCustomerChange} /></td>
                  <td><input name="phoneNumber" value={editCustomerData.phoneNumber} onChange={handleEditCustomerChange} /></td>
                  <td>******</td>
                  <td>
                    <button onClick={() => handleSaveEdit(customer.id)}>Save</button>
                    <button onClick={handleCancelEdit}>Cancel</button>
                  </td>
                  <td></td>
                </>
              ) : (
                <>
                  <td>{customer.name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phoneNumber}</td>
                  <td>******</td>
                  <td><button onClick={() => handleEditClick(customer)}>Edit</button></td>
                  <td><button onClick={() => handleDelete(customer.id)}>Remove</button></td>
                </>
              )}
            </tr>
          ))}
          <tr>
            <td><input name="name" value={newCustomer.name} onChange={handleNewCustomerChange} placeholder="Name" /></td>
            <td><input name="email" value={newCustomer.email} onChange={handleNewCustomerChange} placeholder="Email" /></td>
            <td><input name="phoneNumber" value={newCustomer.phoneNumber} onChange={handleNewCustomerChange} placeholder="Phone Number" /></td>
            <td><input name="password" type="password" value={newCustomer.password} onChange={handleNewCustomerChange} placeholder="Password" /></td>
            <td colSpan={2}><button onClick={handleAddCustomer}>Add Customer</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default CustomerManagementPage;
