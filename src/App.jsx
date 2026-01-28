import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import StreakView from './pages/StreakView';

import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-dark-base text-white font-sans selection:bg-neon-lime selection:text-black">
          <Routes>
            <Route path="/" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/streaks" element={<StreakView />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
