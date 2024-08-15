import React, { useEffect, useState } from 'react';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => { }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Welcome to the dashboard!</p>
    </div>
  );
};

export default Dashboard;
