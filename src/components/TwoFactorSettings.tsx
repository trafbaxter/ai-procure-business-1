import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import TwoFactorSetup from './TwoFactorSetup';

const TwoFactorSettings: React.FC = () => {
  const { user } = useAuth();
  const [showSetup, setShowSetup] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Check if user has 2FA enabled (from localStorage or user data)
  React.useEffect(() => {
    if (user) {
      const twoFactorData = localStorage.getItem(`2fa_${user.id}`);
      setTwoFactorEnabled(!!twoFactorData);
    }
  }, [user]);

  const handleEnable2FA = () => {
    setShowSetup(true);
  };

  const handleDisable2FA = () => {
    if (user) {
      localStorage.removeItem(`2fa_${user.id}`);
      localStorage.removeItem(`2fa_backup_${user.id}`);
      setTwoFactorEnabled(false);
      toast({
        title: "Two-Factor Authentication Disabled",
        description: "2FA has been disabled for your account.",
      });
    }
  };

  const handleSetupComplete = (secret: string, backupCodes: string[]) => {
    if (user) {
      // Store 2FA data
      localStorage.setItem(`2fa_${user.id}`, JSON.stringify({
        secret,
        enabled: true,
        setupDate: new Date().toISOString()
      }));
      
      // Store backup codes
      localStorage.setItem(`2fa_backup_${user.id}`, JSON.stringify(backupCodes));
      
      setTwoFactorEnabled(true);
      setShowSetup(false);
      
      toast({
        title: "Two-Factor Authentication Enabled",
        description: "Your account is now protected with 2FA.",
      });
    }
  };

  if (showSetup) {
    return (
      <div className="flex justify-center">
        <TwoFactorSetup
          onComplete={handleSetupComplete}
          onCancel={() => setShowSetup(false)}
        />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">Status:</span>
              {twoFactorEnabled ? (
                <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  Enabled
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Disabled
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {twoFactorEnabled 
                ? 'Your account is protected with two-factor authentication'
                : 'Enable 2FA to secure your account with an additional verification step'
              }
            </p>
          </div>
          
          {twoFactorEnabled ? (
            <Button variant="destructive" onClick={handleDisable2FA}>
              Disable 2FA
            </Button>
          ) : (
            <Button onClick={handleEnable2FA}>
              Enable 2FA
            </Button>
          )}
        </div>

        {!twoFactorEnabled && (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Two-factor authentication adds an extra layer of security by requiring a code from your phone in addition to your password.
            </AlertDescription>
          </Alert>
        )}

        {twoFactorEnabled && (
          <Alert>
            <ShieldCheck className="h-4 w-4" />
            <AlertDescription>
              Your account is secured with two-factor authentication. Make sure to keep your backup codes in a safe place.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default TwoFactorSettings;