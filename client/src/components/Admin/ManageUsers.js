// client/src/components/Admin/ManageUsers.js
import React, { useState, useEffect } from 'react';


import axios from 'axios';

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'patient',
    name: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No valid token found. Please log in again.');
      return;
    }
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddUser = async () => {
    // Client-side validation
    if (!newUser.username || !newUser.password || !newUser.name || !newUser.email) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/admin/users`, newUser, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert('User added successfully!');
      setNewUser({
        username: '',
        password: '',
        role: '',
        name: '',
        phone: '',
        email: '',
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert(`Failed to add user: ${err.response ? err.response.data.message : err.message}. Please check your permissions.`);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      alert('User deleted successfully!');
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Failed to delete user. Please check your permissions.');
    }
  };

  return (
    <div>
     

      <h2>Manage Users</h2>
      <h3>Add New User</h3>
      <input
        type="text"
        placeholder="Username"
        value={newUser.username}
        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
      />
      <input
        type="password"
        placeholder="Password"
        value={newUser.password}
        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
      />
      <select
        value={newUser.role}
        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
      >
        <option value="patient">Patient</option>
        <option value="doctor">Doctor</option>
        <option value="admin">Admin</option>
      </select>
      <input
        type="text"
        placeholder="Name"
        value={newUser.name}
        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
      />
      <input
        type="text"
        placeholder="Phone"
        value={newUser.phone}
        onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
      />
      <input
        type="email"
        placeholder="Email"
        value={newUser.email}
        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
      />
      <button onClick={handleAddUser}>Add User</button>

      <h3>Existing Users</h3>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Role</th>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.role}</td>
              <td>{user.name}</td>
              <td>{user.phone}</td>
              <td>{user.email}</td>
              <td>
                <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
                {/* You can add an Update button and functionality as needed */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ManageUsers;
