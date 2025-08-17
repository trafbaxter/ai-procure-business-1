import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export function CredentialDiagnostic() {
  const [diagnostics, setDiagnostics] = useState<any>(null);

  const runDiagnostics = () => {
    const accessKey = import.meta.env.VITE_AWS_ACCESS_KEY_ID || '';
    const secretKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '';
    const region = import.meta.env.VITE_AWS_REGION || '';
    const sesEmail = import.meta.env.VITE_SES_FROM_EMAIL || '';

    const results = {
      accessKey: {
        exists: !!accessKey,
        format: accessKey.startsWith('AKIA') && accessKey.length === 20,
        preview: accessKey ? `${accessKey.substring(0, 4)}...${accessKey.substring(16)}` : 'NOT SET',
        value: accessKey
      },
      secretKey: {
        exists: !!secretKey,
        format: secretKey.length === 40,
        preview: secretKey ? `${secretKey.substring(0, 4)}...${secretKey.substring(36)}` : 'NOT SET',
        length: secretKey.length
      },
      region: {
        exists: !!region,
        value: region || 'us-east-1 (default)'
      },
      sesEmail: {
        exists: !!sesEmail,
        value: sesEmail || 'NOT SET'
      },
      overall: {
        ready: !!(accessKey && secretKey && accessKey.startsWith('AKIA') && accessKey.length === 20 && secretKey.length === 40)
      }
    };

    setDiagnostics(results);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  if (!diagnostics) return null;

  const StatusIcon = ({ condition }: { condition: boolean }) => 
    condition ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          AWS Credentials Diagnostic
          <Button variant="outline" size="sm" onClick={runDiagnostics}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            <span>Access Key ID</span>
            <div className="flex items-center gap-2">
              <StatusIcon condition={diagnostics.accessKey.exists} />
              <Badge variant={diagnostics.accessKey.format ? "default" : "destructive"}>
                {diagnostics.accessKey.preview}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Secret Access Key</span>
            <div className="flex items-center gap-2">
              <StatusIcon condition={diagnostics.secretKey.exists} />
              <Badge variant={diagnostics.secretKey.format ? "default" : "destructive"}>
                {diagnostics.secretKey.preview} ({diagnostics.secretKey.length} chars)
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Region</span>
            <div className="flex items-center gap-2">
              <StatusIcon condition={diagnostics.region.exists} />
              <Badge variant="outline">{diagnostics.region.value}</Badge>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span>SES From Email</span>
            <div className="flex items-center gap-2">
              <StatusIcon condition={diagnostics.sesEmail.exists} />
              <Badge variant={diagnostics.sesEmail.exists ? "default" : "secondary"}>
                {diagnostics.sesEmail.value}
              </Badge>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Overall Status</span>
            <Badge variant={diagnostics.overall.ready ? "default" : "destructive"}>
              {diagnostics.overall.ready ? "Ready" : "Not Configured"}
            </Badge>
          </div>
        </div>

        {!diagnostics.overall.ready && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h4 className="font-semibold text-yellow-800">Setup Instructions:</h4>
            <ol className="mt-2 text-sm text-yellow-700 list-decimal list-inside space-y-1">
              <li>Create a <code>.env</code> file in your project root</li>
              <li>Copy the contents from <code>.env.example</code></li>
              <li>Replace placeholder values with your actual AWS credentials</li>
              <li>Restart your development server</li>
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
}