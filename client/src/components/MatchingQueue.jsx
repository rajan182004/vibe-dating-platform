import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

function MatchingQueue({ user, onMatchFound }) {
  const [isSearching, setIsSearching] = useState(false);
  const [socket, setSocket] = useState(null);
  const [queueStatus, setQueueStatus] = useState('');

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Listen for match found
    newSocket.on('match-found', (data) => {
      console.log('Match found!', data);
      setIsSearching(false);
      onMatchFound(data);
    });

    // Listen for queue status
    newSocket.on('queue-joined', (data) => {
      setQueueStatus(data.message);
    });

    return () => {
      newSocket.close();
    };
  }, [onMatchFound]);

  const startMatching = () => {
    if (!socket) return;
    
    setIsSearching(true);
    setQueueStatus('Looking for someone to play with...');
    
    // Join matching queue
    socket.emit('join-matching-queue', {
      userId: user.id,
      preferences: {
        ageRange: [18, 35],
        interests: []
      }
    });
  };

  const stopMatching = () => {
    setIsSearching(false);
    setQueueStatus('');
    // TODO: Leave queue
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-center">
      <h2 className="text-3xl font-bold text-white mb-6">🎮 Ready to Play?</h2>
      
      {!isSearching ? (
        <div>
          <p className="text-white/80 mb-8 text-lg">
            Get matched with someone random and play Truth or Dare!
          </p>
          <button
            onClick={startMatching}
            className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition duration-300 transform hover:scale-105"
          >
            🔍 Find Someone to Play
          </button>
        </div>
      ) : (
        <div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white mx-auto mb-6"></div>
          <p className="text-white text-xl mb-4">{queueStatus}</p>
          <p className="text-white/70 mb-6">This may take a moment...</p>
          <button
            onClick={stopMatching}
            className="bg-red-500/80 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
          >
            Cancel Search
          </button>
        </div>
      )}

      <div className="mt-8 text-white/60">
        <p className="text-sm">✨ You'll be matched with someone new</p>
        <p className="text-sm">🎯 Play Truth or Dare to break the ice</p>
        <p className="text-sm">💬 If you both click, you can keep chatting!</p>
      </div>
    </div>
  );
}

export default MatchingQueue;
