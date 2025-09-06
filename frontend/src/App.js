import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Eligibility from './pages/Eligibility';
import PriorAuth from './pages/PriorAuth';
import Claims from './pages/Claims';
import ClinicalDocs from './pages/ClinicalDocs';
import MedicalCoding from './pages/MedicalCoding';
import Remittance from './pages/Remittance';
import { apiEndpoints } from './services/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          // Verify token with backend
          await apiEndpoints.healthCheck();
          setIsAuthenticated(true);
        } catch (error) {
          localStorage.removeItem('authToken');
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleRegister = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setShowRegister(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {!isAuthenticated ? (
          showRegister ? (
            <Register 
              onRegister={handleRegister} 
              onSwitchToLogin={() => setShowRegister(false)} 
            />
          ) : (
            <Login 
              onLogin={handleLogin} 
              onSwitchToRegister={() => setShowRegister(true)} 
            />
          )
        ) : (
          <Layout onLogout={handleLogout}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/eligibility" element={<Eligibility />} />
              <Route path="/prior-auth" element={<PriorAuth />} />
              <Route path="/clinical-docs" element={<ClinicalDocs />} />
              <Route path="/medical-coding" element={<MedicalCoding />} />
              <Route path="/claims" element={<Claims />} />
              <Route path="/remittance" element={<Remittance />} />
              <Route path="/settings" element={<div className="p-8 text-center text-gray-500">Settings - Coming Soon</div>} />
              <Route path="/logout" element={<Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        )}
      </div>
    </Router>
  );
}

export default App;
