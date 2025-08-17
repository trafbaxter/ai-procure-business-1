import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X, ExternalLink } from 'lucide-react';
import { getAwsCredentials } from '@/config/awsCredentials';

export const AwsCredentialsAlert: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);
  const credentials = getAwsCredentials();

  // Don't show if credentials are valid or alert was dismissed
  if (credentials.isValid || dismissed) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-2xl w-full mx-4">
      <Alert variant="destructive" className="border-red-300 bg-red-50 shadow-lg">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <div className="flex-1 pr-4">
            <strong className="block">AWS Credentials Required</strong>
            <p className="text-sm mt-1">
              {credentials.error || 'Missing AWS credentials. The app needs valid AWS credentials to connect to DynamoDB.'}
            </p>
            <div className="flex gap-2 mt-3">
              <Button 
                size="sm" 
                variant="outline" 
                className="bg-white hover:bg-gray-50"
                onClick={() => window.open('/fix/credentials', '_self')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Fix Credentials
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="bg-white hover:bg-gray-50"
                onClick={() => window.open('/api-settings', '_self')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Setup Credentials
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setDismissed(true)}
                className="text-red-700 hover:bg-red-100"
              >
                Dismiss
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
            className="text-red-700 hover:bg-red-100 p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
};