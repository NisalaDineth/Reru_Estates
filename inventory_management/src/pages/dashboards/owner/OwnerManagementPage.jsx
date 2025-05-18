import React, { useEffect, useState } from 'react';

const OwnerManagementPage = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOwners = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/owner');
      if (!response.ok) {
        throw new Error('Failed to fetch owners');
      }
      const data = await response.json();
      setOwners(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  return (
    <div>
      <h2>Owner Management</h2>
      {loading && <p>Loading owners...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <table>
          <thead>
            <tr>
              <th>OwnerID</th>
              <th>Username</th>
              <th>Email</th>
              <th>PhoneNumber</th>
            </tr>
          </thead>
          <tbody>
            {owners.map((owner) => (
              <tr key={owner.OwnerID}>
                <td>{owner.OwnerID}</td>
                <td>{owner.Username}</td>
                <td>{owner.Email}</td>
                <td>{owner.PhoneNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OwnerManagementPage;
