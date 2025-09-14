import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import SignInPage from './pages/Auth/SignIn';
import SignUpPage from './pages/Auth/SignUp';
import UserProfilePage from './pages/Auth/UserProfile';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirect if signed in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-300"></div>
      </div>
    );
  }

  if (isSignedIn) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Public auth routes - only show when signed out */}
        <Route 
          path="/sign-in" 
          element={
            <PublicRoute>
              <SignInPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/sign-up" 
          element={
            <PublicRoute>
              <SignUpPage />
            </PublicRoute>
          } 
        />
        
        {/* Protected routes - only accessible when signed in */}
        <Route 
          path="/app" 
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
                <p>Discover what's happening around the world</p>
              </div>
            } 
          />
          <Route 
            path="messages" 
            element={
              <div className="p-6 text-gray-200">
                <h2 className="text-2xl font-bold mb-4">Messages</h2>
                <p>Your direct messages</p>
              </div>
            } 
          />
          <Route path="profile" element={<UserProfilePage />} />
        </Route>

        {/* Root redirect */}
        <Route 
          path="/" 
          element={<Navigate to="/app" replace />} 
        />
        
        {/* Catch all routes */}
        <Route 
          path="*" 
          element={<Navigate to="/app" replace />} 
        />
      </Routes>
    </div>
  );
}

export default App;
