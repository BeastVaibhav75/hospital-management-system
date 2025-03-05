// client/src/components/Admin/AdminDashboard.js
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';


import ViewStatistics from './ViewStatistics';
import ManageUsers from './ManageUsers';

function AdminDashboard() {
  return (
    <div>
      

      <h1>Admin Dashboard</h1>
      <nav>
        <ul>
          <li>
            <Link to="/admin/statistics">View Statistics</Link>
          </li>
          <li>
            <Link to="/admin/manage-users">Manage Users</Link>
          </li>
        </ul>
      </nav>
      <Routes>
        <Route path="statistics" element={<ViewStatistics />} />
        <Route path="manage-users" element={<ManageUsers />} />
      </Routes>
    </div>
  );
}

export default AdminDashboard;
