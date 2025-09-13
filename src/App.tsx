import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import { authService } from './services/authService';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Public Route Component (redirect if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Public routes - redirect to home if already logged in */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
        
        {/* Protected routes with layout */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route 
            path="explore" 
            element={
              <div className="p-6 text-gray-200">
                <h2 className="text-2xl font-bold mb-4">Explore</h2>
                <p>Explore page coming soon...</p>
              </div>
            } 
          />
          <Route 
            path="messages" 
            element={
              <div className="p-6 text-gray-200">
                <h2 className="text-2xl font-bold mb-4">Messages</h2>
                <p>Messages page coming soon...</p>
              </div>
            } 
          />
          <Route 
            path="profile/:username" 
            element={
              <div className="p-6 text-gray-200">
                <h2 className="text-2xl font-bold mb-4">Profile</h2>
                <p>Profile page coming soon...</p>
              </div>
            } 
          />
        </Route>

        {/* Catch all route - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
