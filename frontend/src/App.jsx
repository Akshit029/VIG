import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Profile from './pages/Profile.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import AudioGenerator from './pages/Audio.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Loader from './components/Loader.jsx';
import Caption from './pages/Caption.jsx';
import Credits from './pages/Credits.jsx';


function AppContent() {
  const { loading: authLoading } = useAuth();
  const [appLoading, setAppLoading] = useState(true);
  const location = useLocation();

  // Pages where navbar should be hidden
  const hideNavbarPages = ['/login', '/register'];
  const shouldHideNavbar = hideNavbarPages.includes(location.pathname);

  useEffect(() => {
    // Simulate app initialization time
    const timer = setTimeout(() => {
      setAppLoading(false);
    }, 3000); // Show loader for 4 seconds

    return () => clearTimeout(timer);
  }, []);

  // Show loader if either app is loading OR auth is loading
  if (appLoading || authLoading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white relative overflow-hidden">
      {!shouldHideNavbar && <Navbar />}
      <main className="mx-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/audio" element={<AudioGenerator />} />
          <Route path="/caption" element={<Caption />} />
          <Route path="/credits" element={<Credits />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App; 