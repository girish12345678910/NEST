import React from 'react';
import { SignUp } from '@clerk/clerk-react';

const SignUpPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-gray-300 to-gray-500 bg-clip-text mb-4">
            Join NEST
          </h1>
          <p className="text-gray-400 text-lg">
            Create your account and start connecting
          </p>
        </div>
        
        <SignUp 
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
              headerTitle: 'text-gray-200',
              headerSubtitle: 'text-gray-400',
              socialButtonsBlockButton: 'bg-gray-800 border-gray-600 hover:bg-gray-700',
              formButtonPrimary: 'bg-gradient-to-r from-gray-300 to-gray-400 text-black hover:from-white hover:to-gray-300',
              footerActionLink: 'text-gray-300 hover:text-white',
            }
          }}
          redirectUrl="/app"
          signInUrl="/sign-in"
        />
      </div>
    </div>
  );
};

export default SignUpPage;
