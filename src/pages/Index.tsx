import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/LoginForm';
import AppLayout from '@/components/AppLayout';
import EmailDebugPanel from '@/components/EmailDebugPanel';

const Index = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
            <div className="w-full max-w-md">
              <LoginForm />
            </div>
            <div className="w-full max-w-2xl">
              <EmailDebugPanel />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <AppLayout />;
};

export default Index;