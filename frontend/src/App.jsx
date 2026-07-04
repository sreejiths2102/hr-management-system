import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Start from './pages/Start';
import Login from './pages/Login';
import RegisterCompany from './pages/RegisterCompany';
import EmployeeDashboard from './pages/EmployeeDashboard';
import MyProfile from './pages/MyProfile';
import Attendance from './pages/Attendance';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterCompany />} />

        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<EmployeeDashboard />} />
          <Route path="/profile" element={<MyProfile />} />
          <Route path="/attendance" element={<Attendance />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
