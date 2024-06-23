import React, { useEffect, useState } from 'react';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => { }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      await fetch('/api/logout', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Welcome to the dashboard!</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
