import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';

import Overview from './pages/Overview';
import LiveWeather from './pages/LiveWeather';
import Analytics from './pages/Analytics';
import PowerBIDashboard from './pages/PowerBIDashboard';
import WeatherRecords from './pages/WeatherRecords';
import AdminPanel from './pages/AdminPanel';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Overview />} />
            <Route path="live" element={<LiveWeather />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="powerbi" element={<PowerBIDashboard />} />
            <Route path="records" element={<WeatherRecords />} />
            <Route path="admin" element={<AdminPanel />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
