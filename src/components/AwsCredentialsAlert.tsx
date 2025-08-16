import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface AwsCredentialsAlertProps {
  show: boolean;
}

export function AwsCredentialsAlert({ show }: AwsCredentialsAlertProps) {
  if (!show) return null;

  return (
    <Alert className="mb-4 border-orange-200 bg-orange-50">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800">
        <strong>AWS Credentials Issue:</strong> Your AWS Access Key or Secret Key appears to be invalid. 
        Please update your credentials in the <code>.env</code> file to enable DynamoDB functionality. 
        The app is currently using localStorage for authentication.
      </AlertDescription>
    </Alert>
  );
}