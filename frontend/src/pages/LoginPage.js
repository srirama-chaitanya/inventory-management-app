import React, { useState } from 'react';
import API from '../api'; // <--- FIX 1: Import our API helper
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // <--- FIX 2: Use simple paths. The API helper adds '/api' automatically.
    const endpoint = isRegistering ? '/register' : '/login';
    
    try {
      // <--- FIX 3: Use 'API.post' instead of 'axios.post'
      // This uses the Live Render URL defined in api.js
      const response = await API.post(endpoint, { username, password });
      
      // Save the user info (Token + ID) to LocalStorage
      localStorage.setItem('userProfile', JSON.stringify(response.data));
      
      // Redirect to Dashboard
      navigate('/');
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-indigo-600">
          {isRegistering ? 'Create Account' : 'Welcome Back'}
        </h2>
        
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input 
              type="text" 
              required 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full border p-2 rounded focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border p-2 rounded focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 font-bold">
            {isRegistering ? 'Sign Up' : 'Login'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          {isRegistering ? 'Already have an account?' : "Don't have an account?"} {' '}
          <button 
            onClick={() => setIsRegistering(!isRegistering)} 
            className="text-indigo-600 font-semibold hover:underline"
          >
            {isRegistering ? 'Login' : 'Register'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;