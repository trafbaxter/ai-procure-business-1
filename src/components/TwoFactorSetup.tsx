import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QRCodeSVG } from 'qrcode.react';
import { Shield, Copy, Check } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface TwoFactorSetupProps {
  onComplete: (secret: string, backupCodes: string[]) => void;
  onCancel: () => void;
}

const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({ onComplete, onCancel }) => {
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [step, setStep] = useState<'setup' | 'verify' | 'backup'>('setup');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Generate a random secret for 2FA
    const generateSecret = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
      let result = '';
      for (let i = 0; i < 32; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const newSecret = generateSecret();
    setSecret(newSecret);
    
    // Create QR code URL for authenticator apps
    const appName = 'Procurement App';
    const userEmail = 'user@example.com'; // This should come from user context
    const qrUrl = `otpauth://totp/${appName}:${userEmail}?secret=${newSecret}&issuer=${appName}`;
    setQrCodeUrl(qrUrl);

    // Generate backup codes
    const codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
    }
    setBackupCodes(codes);
  }, []);

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    toast({
      title: "Secret copied",
      description: "The secret key has been copied to your clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const verifyCode = () => {
    // Simple verification - in real app, this would verify against the TOTP algorithm
    if (verificationCode.length === 6) {
      setStep('backup');
    } else {
      toast({
        title: "Invalid code",
        description: "Please enter a valid 6-digit code from your authenticator app.",
        variant: "destructive",
      });
    }
  };

  const completeSetup = () => {
    onComplete(secret, backupCodes);
  };

  if (step === 'setup') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Set up Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Scan the QR code with your authenticator app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <QRCodeSVG value={qrCodeUrl} size={200} />
          </div>
          
          <div className="space-y-2">
            <Label>Or enter this secret manually:</Label>
            <div className="flex items-center gap-2">
              <Input value={secret} readOnly className="font-mono text-sm" />
              <Button
                variant="outline"
                size="sm"
                onClick={copySecret}
                className="shrink-0"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Alert>
            <AlertDescription>
              Install an authenticator app like Google Authenticator or Authy, then scan the QR code or enter the secret manually.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button onClick={() => setStep('verify')} className="flex-1">
              Continue
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'verify') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verify Setup</CardTitle>
          <CardDescription>
            Enter the 6-digit code from your authenticator app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Verification Code</Label>
            <Input
              id="code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="000000"
              maxLength={6}
              className="text-center text-lg tracking-widest"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={verifyCode} className="flex-1" disabled={verificationCode.length !== 6}>
              Verify
            </Button>
            <Button variant="outline" onClick={() => setStep('setup')}>
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Save Backup Codes</CardTitle>
        <CardDescription>
          Store these codes safely. You can use them to access your account if you lose your device.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          {backupCodes.map((code, index) => (
            <div key={index} className="font-mono text-sm text-center py-1">
              {code}
            </div>
          ))}
        </div>

        <Alert>
          <AlertDescription>
            Each backup code can only be used once. Store them in a secure location.
          </AlertDescription>
        </Alert>

        <Button onClick={completeSetup} className="w-full">
          Complete Setup
        </Button>
      </CardContent>
    </Card>
  );
};