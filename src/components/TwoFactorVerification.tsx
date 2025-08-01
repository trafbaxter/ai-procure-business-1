import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertCircle } from 'lucide-react';

interface TwoFactorVerificationProps {
  onVerify: (code: string, isBackupCode?: boolean) => Promise<boolean>;
  onCancel: () => void;
  userEmail: string;
}

const TwoFactorVerification: React.FC<TwoFactorVerificationProps> = ({ 
  onVerify, 
  onCancel, 
  userEmail 
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await onVerify(code, useBackupCode);
      if (!success) {
        setError(useBackupCode ? 'Invalid backup code' : 'Invalid verification code');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
            <Shield className="h-6 w-6" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription className="text-center">
            {useBackupCode 
              ? 'Enter one of your backup codes'
              : 'Enter the 6-digit code from your authenticator app'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="text-sm text-muted-foreground text-center">
            Signing in as: <strong>{userEmail}</strong>
          </div>
          
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">
                {useBackupCode ? 'Backup Code' : 'Verification Code'}
              </Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={useBackupCode ? 'Enter backup code' : '000000'}
                maxLength={useBackupCode ? 10 : 6}
                className="text-center text-lg tracking-widest"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || code.length < (useBackupCode ? 6 : 6)}
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </Button>
          </form>

          <div className="space-y-2">
            <Button
              variant="link"
              onClick={() => {
                setUseBackupCode(!useBackupCode);
                setCode('');
                setError('');
              }}
              className="w-full text-sm"
            >
              {useBackupCode 
                ? 'Use authenticator app instead' 
                : 'Use backup code instead'
              }
            </Button>

            <Button
              variant="outline"
              onClick={onCancel}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TwoFactorVerification;