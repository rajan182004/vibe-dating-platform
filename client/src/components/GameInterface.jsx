import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import VideoChat from './VideoChat';

function GameInterface({ gameData, user, onGameEnd }) {
  const [socket, setSocket] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [gamePhase, setGamePhase] = useState('choose'); // 'choose', 'question', 'answer'
  const [answer, setAnswer] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [showVideoChat, setShowVideoChat] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('https://vibe-dating-platform-production.up.railway.app');
    setSocket(newSocket);

    // Join the game room
    newSocket.emit('join-game', {
      gameId: gameData.gameId,
      userId: user.id
    });

    // Listen for questions
    newSocket.on('question-received', (data) => {
      setCurrentQuestion(data);
      setGamePhase('question');
      setIsMyTurn(data.currentPlayer === user.id);
    });

    // Listen for answers
    newSocket.on('answer-received', (data) => {
      setChatMessages(prev => [...prev, {
        type: 'answer',
        content: data.answer,
        playerId: data.playerId,
        timestamp: new Date()
      }]);
      
      // Reset for next round
      setGamePhase('choose');
      setCurrentQuestion(null);
      setAnswer('');
    });

    // Set initial turn
    setIsMyTurn(gameData.yourTurn);

    return () => {
      newSocket.close();
    };
  }, [gameData, user.id]);

  const chooseTruthOrDare = (choice) => {
    if (!socket || !isMyTurn) return;
    
    socket.emit('choose-truth-or-dare', {
      gameId: gameData.gameId,
      choice,
      userId: user.id
    });
  };

  const submitAnswer = () => {
    if (!socket || !answer.trim()) return;
    
    socket.emit('answer-submitted', {
      gameId: gameData.gameId,
      answer: answer.trim(),
      userId: user.id
    });
    
    setAnswer('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with Video Chat Toggle */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6 text-center">
          <div className="flex justify-between items-center mb-4">
            <div></div>
            <h1 className="text-3xl font-bold text-white">🎮 Truth or Dare</h1>
            <button 
              onClick={() => setShowVideoChat(!showVideoChat)}
              className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 transform hover:scale-105"
            >
              {showVideoChat ? '📱 Hide Video' : '🎥 Start Video Chat'}
            </button>
          </div>
          
          <p className="text-white/80">Playing with: {gameData.opponent}</p>
          <div className="mt-4">
            {isMyTurn ? (
              <span className="bg-green-500/80 text-white px-4 py-2 rounded-full">
                🎯 Your Turn
              </span>
            ) : (
              <span className="bg-blue-500/80 text-white px-4 py-2 rounded-full">
                ⏳ Waiting for opponent
              </span>
            )}
          </div>
        </div>

        {/* Video Chat Section */}
        {showVideoChat && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-4 text-center">📹 Video Chat</h2>
            <VideoChat 
              socket={socket}
              user={user}
              gameId={gameData.gameId}
              opponentId={gameData.opponent}
            />
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Game Area */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            {gamePhase === 'choose' && isMyTurn && (
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-6">Choose Your Challenge</h2>
                <div className="space-y-4">
                  <button
                    onClick={() => chooseTruthOrDare('truth')}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-lg text-xl transition duration-300 transform hover:scale-105"
                  >
                    💭 Truth
                  </button>
                  <button
                    onClick={() => chooseTruthOrDare('dare')}
                    className="w-full bg-gradient-to-r from-pink-500 to-red-600 hover:from-pink-600 hover:to-red-700 text-white font-bold py-4 px-6 rounded-lg text-xl transition duration-300 transform hover:scale-105"
                  >
                    🔥 Dare
                  </button>
                </div>
              </div>
            )}

            {gamePhase === 'choose' && !isMyTurn && (
              <div className="text-center">
                <div className="animate-pulse mb-4">
                  <div className="text-6xl mb-4">⏳</div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Waiting...</h2>
                <p className="text-white/80">Your opponent is choosing Truth or Dare</p>
              </div>
            )}

            {gamePhase === 'question' && currentQuestion && (
              <div className="text-center">
                <div className="text-4xl mb-4">
                  {currentQuestion.type === 'truth' ? '💭' : '🔥'}
                </div>
                <h2 className="text-xl font-bold text-white mb-6">
                  {currentQuestion.type === 'truth' ? 'Truth Question' : 'Dare Challenge'}
                </h2>
                <div className="bg-white/20 rounded-lg p-6 mb-6">
                  <p className="text-white text-lg">{currentQuestion.question}</p>
                </div>
                
                {isMyTurn ? (
                  <div>
                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Type your answer here..."
                      className="w-full p-4 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-pink-400 mb-4"
                      rows="3"
                    />
                    <button
                      onClick={submitAnswer}
                      disabled={!answer.trim()}
                      className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50"
                    >
                      Submit Answer
                    </button>
                  </div>
                ) : (
                  <div className="text-white/80">
                    <p>Waiting for opponent's answer...</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Chat/Activity Feed */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">💬 Game Activity</h3>
            <div className="space-y-3 h-96 overflow-y-auto">
              {chatMessages.length === 0 ? (
                <div className="text-center text-white/60 py-8">
                  <p>Game just started!</p>
                  <p className="text-sm mt-2">Answers will appear here</p>
                </div>
              ) : (
                chatMessages.map((message, index) => (
                  <div key={index} className="bg-white/20 rounded-lg p-3">
                    <div className="text-white/80 text-sm mb-1">
                      {message.playerId === user.id ? 'You' : 'Opponent'}
                    </div>
                    <div className="text-white">{message.content}</div>
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-4">
              <button
                onClick={onGameEnd}
                className="w-full bg-red-500/80 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
              >
                End Game
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameInterface;
