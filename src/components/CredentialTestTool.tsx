import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, CheckCircle, XCircle } from 'lucide-react';
import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb';

interface TestResult {
  test: string;
  status: 'running' | 'pass' | 'fail';
  message: string;
  error?: string;
}

export function CredentialTestTool() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runCredentialTests = async () => {
    setIsRunning(true);
    const testResults: TestResult[] = [];

    // Test 1: Basic credential format validation
    const accessKey = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
    const secretKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;
    const region = import.meta.env.VITE_AWS_REGION || 'us-east-1';

    testResults.push({
      test: 'Credential Format Check',
      status: 'running',
      message: 'Validating credential formats...'
    });
    setTests([...testResults]);

    await new Promise(resolve => setTimeout(resolve, 500));

    if (!accessKey || !secretKey) {
      testResults[0] = {
        test: 'Credential Format Check',
        status: 'fail',
        message: 'Missing credentials',
        error: 'AWS credentials not found in environment variables'
      };
    } else if (!accessKey.startsWith('AKIA') || accessKey.length !== 20) {
      testResults[0] = {
        test: 'Credential Format Check',
        status: 'fail',
        message: 'Invalid access key format',
        error: 'Access key should start with AKIA and be 20 characters long'
      };
    } else if (secretKey.length !== 40) {
      testResults[0] = {
        test: 'Credential Format Check',
        status: 'fail',
        message: 'Invalid secret key format',
        error: 'Secret key should be 40 characters long'
      };
    } else {
      testResults[0] = {
        test: 'Credential Format Check',
        status: 'pass',
        message: 'Credential formats are valid'
      };
    }

    setTests([...testResults]);

    // Test 2: DynamoDB Connection Test
    if (testResults[0].status === 'pass') {
      testResults.push({
        test: 'DynamoDB Connection',
        status: 'running',
        message: 'Testing DynamoDB connection...'
      });
      setTests([...testResults]);

      try {
        const client = new DynamoDBClient({
          region,
          credentials: {
            accessKeyId: accessKey,
            secretAccessKey: secretKey
          }
        });

        const command = new ListTablesCommand({});
        const response = await client.send(command);
        
        testResults[1] = {
          test: 'DynamoDB Connection',
          status: 'pass',
          message: `Connected successfully. Found ${response.TableNames?.length || 0} tables.`
        };
      } catch (error: any) {
        testResults[1] = {
          test: 'DynamoDB Connection',
          status: 'fail',
          message: 'Connection failed',
          error: error.message || 'Unknown error occurred'
        };
      }

      setTests([...testResults]);
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'pass': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fail': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      running: 'bg-blue-100 text-blue-800',
      pass: 'bg-green-100 text-green-800',
      fail: 'bg-red-100 text-red-800'
    };
    return variants[status as keyof typeof variants] || '';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Live Credential Test</CardTitle>
          <Button onClick={runCredentialTests} disabled={isRunning}>
            <Play className="h-4 w-4 mr-2" />
            {isRunning ? 'Testing...' : 'Run Tests'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {tests.length === 0 && !isRunning && (
          <Alert>
            <AlertDescription>
              Click "Run Tests" to perform live AWS credential validation.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {tests.map((test, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
              {getStatusIcon(test.status)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{test.test}</p>
                  <Badge className={getStatusBadge(test.status)}>
                    {test.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">{test.message}</p>
                {test.error && (
                  <p className="text-xs text-red-600 mt-1 bg-red-50 p-2 rounded">
                    {test.error}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}