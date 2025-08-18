import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface DiagnosticResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

export function AdvancedCredentialDiagnostic() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: DiagnosticResult[] = [];

    // Check environment variables
    const accessKey = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
    const secretKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;
    const region = import.meta.env.VITE_AWS_REGION;

    results.push({
      name: 'Access Key Present',
      status: accessKey ? 'pass' : 'fail',
      message: accessKey ? 'Access key is present' : 'Access key is missing',
      details: accessKey ? `Key starts with: ${accessKey.substring(0, 4)}...` : 'Set VITE_AWS_ACCESS_KEY_ID'
    });

    results.push({
      name: 'Secret Key Present',
      status: secretKey ? 'pass' : 'fail',
      message: secretKey ? 'Secret key is present' : 'Secret key is missing',
      details: secretKey ? `Length: ${secretKey.length} chars` : 'Set VITE_AWS_SECRET_ACCESS_KEY'
    });

    results.push({
      name: 'Region Set',
      status: region ? 'pass' : 'warning',
      message: region ? `Region: ${region}` : 'Using default region',
      details: region || 'Defaulting to us-east-1'
    });

    // Check key formats
    if (accessKey) {
      const validFormat = accessKey.startsWith('AKIA') && accessKey.length === 20;
      results.push({
        name: 'Access Key Format',
        status: validFormat ? 'pass' : 'fail',
        message: validFormat ? 'Valid format' : 'Invalid format',
        details: validFormat ? 'Starts with AKIA, 20 chars' : 'Should start with AKIA and be 20 characters'
      });
    }

    if (secretKey) {
      const validLength = secretKey.length === 40;
      results.push({
        name: 'Secret Key Format',
        status: validLength ? 'pass' : 'fail',
        message: validLength ? 'Valid length' : 'Invalid length',
        details: validLength ? '40 characters' : `Current: ${secretKey.length} chars, should be 40`
      });
    }

    // Check for common issues
    if (accessKey && accessKey.includes(' ')) {
      results.push({
        name: 'Access Key Whitespace',
        status: 'fail',
        message: 'Contains whitespace',
        details: 'Remove spaces from access key'
      });
    }

    if (secretKey && secretKey.includes(' ')) {
      results.push({
        name: 'Secret Key Whitespace',
        status: 'fail',
        message: 'Contains whitespace',
        details: 'Remove spaces from secret key'
      });
    }

    // Check for placeholder values
    const placeholders = ['your_access_key_here', 'YOUR_ACCESS_KEY', 'AKIA1234567890123456'];
    if (accessKey && placeholders.some(p => accessKey.includes(p))) {
      results.push({
        name: 'Placeholder Detection',
        status: 'fail',
        message: 'Using placeholder value',
        details: 'Replace with actual AWS access key'
      });
    }

    setDiagnostics(results);
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fail': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pass: 'bg-green-100 text-green-800',
      fail: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800'
    };
    return variants[status as keyof typeof variants] || '';
  };

  const failCount = diagnostics.filter(d => d.status === 'fail').length;
  const warningCount = diagnostics.filter(d => d.status === 'warning').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Advanced Credential Diagnostic</CardTitle>
            <Button onClick={runDiagnostics} disabled={isRunning} size="sm">
              <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
              {isRunning ? 'Running...' : 'Re-run'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {failCount > 0 && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Found {failCount} critical issues that need to be fixed for AWS to work properly.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {diagnostics.map((diagnostic, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                {getStatusIcon(diagnostic.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{diagnostic.name}</p>
                    <Badge className={getStatusBadge(diagnostic.status)}>
                      {diagnostic.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{diagnostic.message}</p>
                  {diagnostic.details && (
                    <p className="text-xs text-gray-500 mt-1">{diagnostic.details}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="text-sm text-gray-600">
            <p className="font-medium mb-2">Common InvalidSignatureException Causes:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Incorrect secret access key (most common)</li>
              <li>Extra spaces or newlines in credentials</li>
              <li>Using placeholder/example values</li>
              <li>Credentials from wrong AWS account</li>
              <li>System clock significantly out of sync</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}