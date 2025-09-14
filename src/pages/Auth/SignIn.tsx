import React from 'react';
import { SignIn } from '@clerk/clerk-react';

const SignInPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-gradient-to-r from-gray-300 to-gray-500 bg-clip-text mb-4">
            Welcome back to NEST
          </h1>
          <p className="text-gray-400 text-lg">
            Sign in to continue your journey
          </p>
        </div>
        
        <SignIn 
          appearance={{
            
            variables: {
              colorPrimary: '#374151', // Gray-700
              colorBackground: '#111827', // Gray-900
              colorInputBackground: '#1F2937', // Gray-800
              colorInputText: '#F9FAFB', // Gray-50
              colorText: '#F9FAFB', // Gray-50
              colorTextSecondary: '#9CA3AF', // Gray-400
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
          signUpUrl="/sign-up"
        />
      </div>
    </div>
  );
};

export default SignInPage;
