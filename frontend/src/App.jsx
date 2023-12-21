import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminPage from './pages/AdminPage';
import Profile from './pages/Profile';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import NotFound from './pages/error404';

const ProtectedRoute = ({ element, allowedRoles, ...props }) => {
  // Replace the following line with your actual authentication and role-checking logic
  const userRole = 'admin'; // Example role, replace it with your actual logic
  const isAuthenticated = !!document.cookie; // Check if the user is authenticated

  // Check if the user has the required role to access the route
  const hasAccess = isAuthenticated && allowedRoles.includes(userRole);

  return hasAccess ? (
    React.cloneElement(element, props)
  ) : (
    <Navigate to="/login" replace />
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/forbiddenpage" element={<ProtectedRoute element={<AdminPage />} allowedRoles={['admin']} />} />
        
        {/* Add the catch-all route for unmatched routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
