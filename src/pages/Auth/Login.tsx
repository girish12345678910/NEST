import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authService.login(formData.email, formData.password);
      console.log('Login successful:', response);
      
      // Redirect to home after successful login
      navigate('/');
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="bg-gray-900 rounded-xl p-8 w-full max-w-md border border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-gray-300 to-gray-500 bg-clip-text mb-2">
            Welcome back to NEST
          </h1>
          <p className="text-gray-400">
            Sign in to your account
          </p>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-gray-300 text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-gray-800 border border-gray-700 text-gray-200 px-4 py-3 rounded-lg focus:border-gray-300 focus:outline-none transition-colors duration-200"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-300 text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full bg-gray-800 border border-gray-700 text-gray-200 px-4 py-3 rounded-lg focus:border-gray-300 focus:outline-none transition-colors duration-200"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-gray-300 to-gray-400 text-black font-semibold py-3 px-6 rounded-full hover:from-white hover:to-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-gray-300 hover:text-white transition-colors">
              Sign up
            </Link>
          </p>
        </div>

        {/* Test Credentials */}
        <div className="mt-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <h3 className="text-gray-300 text-sm font-medium mb-2">Test Credentials:</h3>
          <div className="space-y-1 text-sm text-gray-400">
            <div>Email: test@nest.com</div>
            <div>Password: password123</div>
          </div>
          <button
            type="button"
            onClick={() => setFormData({ email: 'test@nest.com', password: 'password123' })}
            className="mt-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Click to auto-fill
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
