import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/other/Home';
import Dashboard from './pages/other/Dashboard';
import Login from './pages/Login/User/LoginForm';
import ProtectedRoute from './pages/other/ProtectedRoute';
import RegisterForm from './pages/Login/User/RegisterForm';
import Header from './components/Header';
import Footer from './components/Footer';
import Assets from './pages/Assets/Assets';
import Setting from './pages/Setting/Setting';
import Transaction from './pages/Transaction/Transaction';

const GetToken = () => {
  // ここで認証状態を確認するロジックを追加
  return localStorage.getItem('token') !== null;
};

const App = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/login" element={<Login />} />
        <Route path="/assets" element={<Assets />} />
        <Route path="/setting" element={<Setting />} />
        <Route path="/transaction" element={<Transaction />} />
        <Route
          path="*"
          element={GetToken() ? <Navigate to="/home" /> : <Home />}
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;