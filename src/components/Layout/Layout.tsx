import React from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { Home, User, MessageCircle, Search, LogOut } from 'lucide-react';
import { authService } from '../../services/authService';


const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-black">
      {/* Top Navigation Bar */}
      <nav className="bg-gray-900 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link 
            to="/" 
            className="text-transparent bg-gradient-to-r from-gray-300 to-gray-500 bg-clip-text text-2xl font-bold hover:from-white hover:to-gray-300 transition-all"
          >
            NEST
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
                isActive('/') 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Home size={20} />
              <span>Home</span>
            </Link>
            
            <Link 
              to="/explore" 
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
                isActive('/explore') 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Search size={20} />
              <span>Explore</span>
            </Link>

            <Link 
              to="/messages" 
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
                isActive('/messages') 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <MessageCircle size={20} />
              <span>Messages</span>
            </Link>

            {user && (
              <Link 
                to={`/profile/${user.username}`}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
                  location.pathname.startsWith('/profile') 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <User size={20} />
                <span>Profile</span>
              </Link>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            {user && (
              <div className="text-gray-300 text-sm">
                Welcome, {user.displayName || user.username}!
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-400 hover:text-red-400 transition-colors px-3 py-2 rounded-full hover:bg-gray-800"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="max-w-6xl mx-auto">
        <Outlet />
      </main>
      
    </div>
  );
};

export default Layout;
