import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './components/Layout/MainLayout';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Cashiers from './pages/Cashiers';
import Sales from './pages/Sales';
import POS from './pages/POS';
import Discounts from './pages/Discounts';
import Locations from './pages/Locations';
import Users from './pages/Users';
import Reports from './pages/Reports';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return isAuthenticated ? <MainLayout>{children}</MainLayout> : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  const isAdminOrManager = user && (user.role === 'admin' || user.role === 'manager');
  return isAuthenticated && isAdminOrManager ? <MainLayout>{children}</MainLayout> : <Navigate to="/dashboard" />;
};

const App = () => {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/products" element={<PrivateRoute><Products /></PrivateRoute>} />
        <Route path="/customers" element={<PrivateRoute><Customers /></PrivateRoute>} />
        <Route path="/cashiers" element={<AdminRoute><Cashiers /></AdminRoute>} />
        <Route path="/sales" element={<PrivateRoute><Sales /></PrivateRoute>} />
        <Route path="/pos" element={<PrivateRoute><POS /></PrivateRoute>} />
        <Route path="/discounts" element={<AdminRoute><Discounts /></AdminRoute>} />
        <Route path="/locations" element={<AdminRoute><Locations /></AdminRoute>} />
        <Route path="/users" element={<AdminRoute><Users /></AdminRoute>} />
        <Route path="/reports" element={<AdminRoute><Reports /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
