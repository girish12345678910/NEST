import React from 'react';
import { UserProfile } from '@clerk/clerk-react';

const UserProfilePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-gray-300 to-gray-500 bg-clip-text mb-2">
            Profile Settings
          </h1>
          <p className="text-gray-400">
            Manage your account and preferences
          </p>
        </div>
        
        <UserProfile 
          appearance={{
            
            variables: {
              colorPrimary: '#374151',
              colorBackground: '#111827',
              colorInputBackground: '#1F2937',
              colorInputText: '#F9FAFB',
              colorText: '#F9FAFB',
              colorTextSecondary: '#9CA3AF',
              borderRadius: '0.75rem',
            },
            elements: {
              card: 'bg-gray-900 border border-gray-700',
              navbar: 'bg-gray-800',
              navbarButton: 'text-gray-300 hover:text-white hover:bg-gray-700',
              navbarButtonActive: 'text-white bg-gray-700',
              pageScrollBox: 'bg-gray-900',
              formButtonPrimary: 'bg-gradient-to-r from-gray-300 to-gray-400 text-black hover:from-white hover:to-gray-300',
            }
          }}
        />
      </div>
    </div>
  );
};

export default UserProfilePage;
