import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Check, RefreshCw } from 'lucide-react';

export function AwsCredentialManager() {
  const [credentials, setCredentials] = useState({
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '',
    region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
    sesFromEmail: import.meta.env.VITE_SES_FROM_EMAIL || ''
  });
  
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    setTestResult(null);
  };

  const testCredentials = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      // Basic validation
      if (!credentials.accessKeyId.startsWith('AKIA') || credentials.accessKeyId.length < 16) {
        throw new Error('Invalid Access Key format. Should start with AKIA and be at least 16 characters.');
      }
      
      if (credentials.secretAccessKey.length < 32) {
        throw new Error('Invalid Secret Key format. Should be at least 32 characters.');
      }

      // Test DynamoDB connection
      const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
      const { ListTablesCommand } = await import('@aws-sdk/client-dynamodb');
      
      const client = new DynamoDBClient({
        region: credentials.region,
        credentials: {
          accessKeyId: credentials.accessKeyId,
          secretAccessKey: credentials.secretAccessKey,
        },
      });

      await client.send(new ListTablesCommand({}));
      
      setTestResult({
        type: 'success',
        message: 'AWS credentials are valid and DynamoDB connection successful!'
      });
    } catch (error) {
      console.error('Credential test failed:', error);
      setTestResult({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to validate credentials'
      });
    } finally {
      setTesting(false);
    }
  };

  const saveCredentials = () => {
    // Note: In a real application, you would need to update the .env file
    // For now, we'll show instructions to the user
    alert(`To save these credentials, update your .env file with:

VITE_AWS_ACCESS_KEY_ID=${credentials.accessKeyId}
VITE_AWS_SECRET_ACCESS_KEY=${credentials.secretAccessKey}
VITE_AWS_REGION=${credentials.region}
VITE_SES_FROM_EMAIL=${credentials.sesFromEmail}

Then restart the application.`);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          AWS Credential Manager
        </CardTitle>
        <CardDescription>
          Update your AWS credentials to fix authentication issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="accessKey">AWS Access Key ID</Label>
          <Input
            id="accessKey"
            type="text"
            value={credentials.accessKeyId}
            onChange={(e) => handleInputChange('accessKeyId', e.target.value)}
            placeholder="AKIA..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="secretKey">AWS Secret Access Key</Label>
          <Input
            id="secretKey"
            type="password"
            value={credentials.secretAccessKey}
            onChange={(e) => handleInputChange('secretAccessKey', e.target.value)}
            placeholder="Enter secret key"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="region">AWS Region</Label>
          <Input
            id="region"
            type="text"
            value={credentials.region}
            onChange={(e) => handleInputChange('region', e.target.value)}
            placeholder="us-east-1"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fromEmail">SES From Email</Label>
          <Input
            id="fromEmail"
            type="email"
            value={credentials.sesFromEmail}
            onChange={(e) => handleInputChange('sesFromEmail', e.target.value)}
            placeholder="noreply@yourcompany.com"
          />
        </div>

        {testResult && (
          <Alert variant={testResult.type === 'error' ? 'destructive' : 'default'}>
            {testResult.type === 'success' ? (
              <Check className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{testResult.message}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={testCredentials} 
            disabled={testing}
            variant="outline"
            className="flex items-center gap-2"
          >
            {testing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            Test Credentials
          </Button>
          
          <Button 
            onClick={saveCredentials}
            disabled={!testResult || testResult.type === 'error'}
          >
            Save Instructions
          </Button>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Current Issue:</strong> InvalidSignatureException indicates your AWS Secret Access Key may be incorrect or expired. 
            Please verify your credentials in the AWS Console and update them above.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}