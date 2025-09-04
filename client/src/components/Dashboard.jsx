import React, { useState } from 'react';
import MatchingQueue from './MatchingQueue';
import GameInterface from './GameInterface';

function Dashboard({ user, onLogout }) {
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'matching', 'game'
  const [gameData, setGameData] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
  };

  const handleStartMatching = () => {
    setCurrentView('matching');
  };

  const handleMatchFound = (matchData) => {
    setGameData(matchData);
    setCurrentView('game');
  };

  const handleGameEnd = () => {
    setCurrentView('dashboard');
    setGameData(null);
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  // Show game interface
  if (currentView === 'game' && gameData) {
    return <GameInterface gameData={gameData} user={user} onGameEnd={handleGameEnd} />;
  }

  // Show matching queue
  if (currentView === 'matching') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <button
            onClick={handleBackToDashboard}
            className="mb-4 text-white/80 hover:text-white transition duration-200"
          >
            ← Back to Dashboard
          </button>
          <MatchingQueue user={user} onMatchFound={handleMatchFound} />
        </div>
      </div>
    );
  }

  // Show main dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white">Welcome, {user.username}! 👋</h1>
              <p className="text-white/80 mt-2">Ready to make some connections?</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main Dashboard */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Quick Game - UPDATED */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">🎮 Quick Match</h2>
            <p className="text-white/80 mb-6">Jump into a Truth or Dare game with a random person!</p>
            <button 
              onClick={handleStartMatching}
              className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
            >
              Find Someone to Play
            </button>
          </div>

          {/* Profile Setup */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">👤 Profile Setup</h2>
            <p className="text-white/80 mb-6">Complete your profile to get better matches!</p>
            <button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200">
              Complete Profile
            </button>
          </div>

          {/* Recent Matches */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">💬 Recent Connections</h2>
            <div className="text-white/60 text-center py-8">
              <p>No connections yet!</p>
              <p className="text-sm mt-2">Start playing to meet new people</p>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">⚙️ Settings</h2>
            <div className="space-y-3">
              <div className="text-white/80">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Age:</strong> {user.age}</p>
                <p><strong>Account:</strong> Free Plan</p>
              </div>
              <button className="w-full bg-white/20 hover:bg-white/30 text-white py-2 px-4 rounded-lg transition duration-200">
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mt-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">🚀 Coming Soon</h2>
          <div className="grid md:grid-cols-3 gap-4 text-white/80">
            <div>
              <div className="text-2xl mb-2">📹</div>
              <p>Video Chat</p>
            </div>
            <div>
              <div className="text-2xl mb-2">🎯</div>
              <p>Smart Matching</p>
            </div>
            <div>
              <div className="text-2xl mb-2">💝</div>
              <p>Premium Features</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
