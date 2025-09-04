import React, { useState } from 'react';
import { authAPI } from '../services/api';

function AuthForm({ onSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    age: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      
      if (isLogin) {
        response = await authAPI.login({
          email: formData.email,
          password: formData.password
        });
      } else {
        response = await authAPI.register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          age: parseInt(formData.age)
        });
      }

      // Save token to localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Call success callback
      onSuccess(response.data.user);
      
    } catch (error) {
      console.error('Auth error:', error);
      setError(error.response?.data?.error || 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 w-full max-w-md">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">
        {isLogin ? 'Welcome Back!' : 'Join Vibe!'}
      </h2>
      
      {error && (
        <div className="bg-red-500/20 border border-red-400 text-red-100 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required={!isLogin}
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>
        )}
        
        <div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>
        
        <div>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>
        
        {!isLogin && (
          <div>
            <input
              type="number"
              name="age"
              placeholder="Age (18+)"
              value={formData.age}
              onChange={handleChange}
              min="18"
              required={!isLogin}
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50"
        >
          {loading ? 'Processing...' : (isLogin ? 'Login' : 'Create Account')}
        </button>
      </form>
      
      <p className="text-center text-white/80 mt-6">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="text-pink-300 hover:text-pink-200 font-semibold"
        >
          {isLogin ? 'Sign Up' : 'Login'}
        </button>
      </p>
    </div>
  );
}

export default AuthForm;
