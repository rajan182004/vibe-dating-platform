import React, { useState, useEffect } from 'react';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // If user is logged in, show dashboard
  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  // If not logged in, show auth form
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center p-4">
      <div className="text-center max-w-md w-full">
        <div className="mb-8">
          <h1 className="text-6xl font-bold mb-4 text-white">Vibe</h1>
          <p className="text-2xl mb-8 text-white/90">Game Your Way to Real Connections</p>
        </div>
        
        <AuthForm onSuccess={handleAuthSuccess} />
      </div>
    </div>
  );
}

export default App;
