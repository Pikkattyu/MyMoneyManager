import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/MoneyManage/other/Home';
//import Dashboard from './pages/other/Dashboard';
import Login from './pages/MoneyManage/Login/User/LoginForm';
//import ProtectedRoute from './pages/other/ProtectedRoute';
import RegisterForm from './pages/MoneyManage/Login/User/RegisterForm';
import Header from './components/Header';
import Footer from './components/Footer';
import Assets from './pages/MoneyManage/Assets/Assets';
import Setting from './pages/MoneyManage/Setting/Setting';
import Transaction from './pages/MoneyManage/Transaction/Transaction';
import Statistics from './pages/MoneyManage/Statistics/Statistics';

import Notice from './pages/Schedule/Notice/Notice';
import ScheduleSetting from './pages/Schedule/Setting/Setting';
import Calendar from './pages/Schedule/Calendar/Calendar';
import ScheduleStatistics from './pages/Schedule/Statistics/Statistics';

const GetToken = () => {
  // ここで認証状態を確認するロジックを追加
  if (localStorage.getItem('token') === null){
    return false
  }else{
    return true
  }
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
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/setting" element={<Setting />} />
        <Route path="/transaction" element={<Transaction />} />

        <Route path="/schedule/notice" element={<Notice />} />
        <Route path="/schedule/setting" element={<ScheduleSetting/>} />
        <Route path="/schedule/calendar" element={<Calendar />} />
        <Route path="/schedule/statistics" element={<ScheduleStatistics />} />
        <Route
          path="*"
          element={GetToken() ? <Navigate to="/transaction" /> : <Navigate to="/login" />}
        />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;