import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import ProviderOnboarding from "./pages/ProviderOnboarding.jsx";
import ProviderDashboard from "./pages/ProviderDashboard.jsx";
import { api } from "./api/client.js";
import { getUserProfile, onProfileChanged } from "./data/profileStore.js";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // App initialization
  useEffect(() => {
    api.setup()
      .then(() => {
        if (api.hasToken()) {
          return getUserProfile();
        }
        return null;
      })
      .then(profile => {
        if (profile) setCurrentUser(profile);
      })
      .catch(error => {
        console.error("Failed to initialize app:", error);
      })
      .finally(() => {
        setInitializing(false);
      });

    const unsubscribeProfile = onProfileChanged((profile) => {
      setCurrentUser(profile);
    });

    return () => {
      unsubscribeProfile();
    };
  }, []);

  if (initializing) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--surface)' }}>Loading funservice provider...</div>;
  }

  return (
    <Router>
      <Toaster 
        position="top-center" 
        toastOptions={{ 
          style: { 
            borderRadius: '10px', 
            background: 'var(--surface)', 
            color: 'var(--text)',
            border: '1px solid var(--border)' 
          } 
        }} 
      />
      <div className="app-container app-layout">
        <div className="page-content">
          <Routes>
            <Route path="/" element={<ProviderDashboard />} />
            <Route path="/become-a-pro" element={<ProviderOnboarding />} />
            <Route path="/provider-dashboard" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
