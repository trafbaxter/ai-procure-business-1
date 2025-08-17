import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Settings, RefreshCw } from 'lucide-react';
import { getAwsCredentials } from '@/config/awsCredentials';

interface CredentialStatusProps {
  onOpenSettings?: () => void;
  showRefresh?: boolean;
  onRefresh?: () => void;
}

export const CredentialStatus: React.FC<CredentialStatusProps> = ({
  onOpenSettings,
  showRefresh = false,
  onRefresh
}) => {
  const credentials = getAwsCredentials();
  
  if (credentials.isValid) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="flex items-center justify-between">
          <div>
            <strong>AWS Connected</strong>
            <div className="text-sm text-green-600 mt-1">
              Region: {credentials.region} • Access Key: {credentials.accessKeyId.substring(0, 8)}...
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Connected
            </Badge>
            {showRefresh && (
              <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive" className="border-red-200 bg-red-50">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <strong>AWS Credentials Required</strong>
          <div className="text-sm mt-1">
            {credentials.error || 'Missing AWS credentials in environment variables'}
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="destructive">
            Disconnected
          </Badge>
          {onOpenSettings && (
            <Button variant="outline" size="sm" onClick={onOpenSettings}>
              <Settings className="h-3 w-3 mr-1" />
              Setup
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
};