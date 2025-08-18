import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/LoginForm';
import AppLayout from '@/components/AppLayout';
import EmailDebugPanel from '@/components/EmailDebugPanel';
// import { AwsCredentialsAlert } from '@/components/AwsCredentialsAlert';
// import { getAwsCredentials } from '@/config/awsCredentials';
const Index = () => {
  const { isAuthenticated } = useAuth();
  // const awsCredentials = getAwsCredentials();
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* <AwsCredentialsAlert show={!awsCredentials.isValid} /> */}
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