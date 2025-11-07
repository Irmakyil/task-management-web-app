import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Sayfaları import et
import AuthPage from './pages/AuthPage'; 
import DashboardPage from './pages/DashboardPage';
import StatisticsPage from './pages/StatisticsPage';
import ProfilePage from './pages/ProfilePage';
import MainLayout from './components/MainLayout';

function App() {
  return (
    <Routes>
      {/* Public (Navbar'sız) Rotalar */}
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage />} />
      <Route path="/" element={<AuthPage />} />

      {/* Protected (Navbar'lı) Rotalar */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/analysis" element={<StatisticsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}

export default App;