import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';

export function CredentialDiagnostic() {
  const [status, setStatus] = useState<any>(null);

  const checkCredentials = () => {
    const accessKey = import.meta.env.VITE_AWS_ACCESS_KEY_ID || '';
    const secretKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '';
    const region = import.meta.env.VITE_AWS_REGION || '';

    setStatus({
      accessKey: {
        exists: !!accessKey,
        valid: accessKey.startsWith('AKIA') && accessKey.length === 20,
        preview: accessKey ? `${accessKey.substring(0, 4)}...` : 'NOT SET'
      },
      secretKey: {
        exists: !!secretKey,
        valid: secretKey.length === 40,
        preview: secretKey ? `${secretKey.substring(0, 4)}...` : 'NOT SET'
      },
      region: {
        value: region || 'us-east-1'
      }
    });
  };

  useEffect(() => {
    checkCredentials();
  }, []);

  if (!status) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          AWS Credentials Status
          <Button variant="outline" size="sm" onClick={checkCredentials}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span>Access Key ID</span>
          <div className="flex items-center gap-2">
            {status.accessKey.valid ? 
              <CheckCircle className="h-4 w-4 text-green-500" /> : 
              <XCircle className="h-4 w-4 text-red-500" />
            }
            <Badge variant={status.accessKey.valid ? "default" : "destructive"}>
              {status.accessKey.preview}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span>Secret Access Key</span>
          <div className="flex items-center gap-2">
            {status.secretKey.valid ? 
              <CheckCircle className="h-4 w-4 text-green-500" /> : 
              <XCircle className="h-4 w-4 text-red-500" />
            }
            <Badge variant={status.secretKey.valid ? "default" : "destructive"}>
              {status.secretKey.preview}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span>Region</span>
          <Badge variant="outline">{status.region.value}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}