import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface DashboardProps {}

const Dashboard: React.FC<DashboardProps> = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get('/api/data')  // バックエンドからデータを取得するエンドポイント
      .then(response => setData(response.data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      {data ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Dashboard;