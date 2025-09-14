import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, User, MessageCircle, Search, LogOut } from 'lucide-react';
import { UserButton, useUser } from '@clerk/clerk-react';

const Layout: React.FC = () => {
  const location = useLocation();
  const { user } = useUser();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-black">
      {/* Top Navigation Bar */}
      <nav className="bg-gray-900 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link 
            to="/app" 
            className="text-transparent bg-gradient-to-r from-gray-300 to-gray-500 bg-clip-text text-2xl font-bold hover:from-white hover:to-gray-300 transition-all"
          >
            NEST
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/app" 
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
                isActive('/app') 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Home size={20} />
              <span>Home</span>
            </Link>
            
            <Link 
              to="/app/explore" 
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
                isActive('/app/explore') 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Search size={20} />
              <span>Explore</span>
            </Link>

            <Link 
              to="/app/messages" 
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
                isActive('/app/messages') 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <MessageCircle size={20} />
              <span>Messages</span>
            </Link>

            <Link 
              to="/app/profile"
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
                location.pathname.startsWith('/app/profile') 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <User size={20} />
              <span>Profile</span>
            </Link>
          </div>

          {/* User Menu with Clerk */}
          <div className="flex items-center space-x-3">
            <div className="text-gray-300 text-sm hidden sm:block">
              Welcome, {user?.firstName || user?.username}!
            </div>
            <UserButton 
              appearance={{
                
                elements: {
                  avatarBox: 'w-8 h-8',
                  userButtonPopoverCard: 'bg-gray-900 border border-gray-700',
                  userButtonPopoverActions: 'bg-gray-900',
                  userButtonPopoverActionButton: 'text-gray-300 hover:text-white hover:bg-gray-800',
                  userButtonPopoverActionButtonText: 'text-gray-300',
                  userButtonPopoverFooter: 'bg-gray-800 border-t border-gray-700',
                }
              }}
              userProfileMode="navigation"
              userProfileUrl="/app/profile"
            />
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
