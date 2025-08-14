import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, AlertCircle, Shield, UserPlus } from 'lucide-react';
import ForgotPasswordDialog from './ForgotPasswordDialog';
import ChangePasswordForm from './ChangePasswordForm';
import { RegisterForm } from './RegisterForm';
const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [error, setError] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const { login, verifyTwoFactor, isLoading, pendingPasswordChange, pendingTwoFactor } = useAuth();

  // If there's a pending password change, show the change password form
  if (pendingPasswordChange) {
    return <ChangePasswordForm />;
  }

  // If there's a pending 2FA verification, show the 2FA form
  if (pendingTwoFactor) {
    const handleTwoFactorVerify = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      
      try {
        const success = await verifyTwoFactor(twoFactorCode, useBackupCode);
        if (!success) {
          setError(useBackupCode ? 'Invalid backup code' : 'Invalid verification code');
        }
      } catch (err) {
        setError('Verification failed. Please try again.');
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
              Signing in as: <strong>{pendingTwoFactor.email}</strong>
            </div>
            
            <form onSubmit={handleTwoFactorVerify} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">
                  {useBackupCode ? 'Backup Code' : 'Verification Code'}
                </Label>
                <Input
                  id="code"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder={useBackupCode ? 'Enter backup code' : '000000'}
                  maxLength={useBackupCode ? 10 : 6}
                  className="text-center text-lg tracking-widest"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || twoFactorCode.length < 6}
              >
                {isLoading ? 'Verifying...' : 'Verify'}
              </Button>
            </form>

            <Button
              variant="link"
              onClick={() => {
                setUseBackupCode(!useBackupCode);
                setTwoFactorCode('');
                setError('');
              }}
              className="w-full text-sm"
            >
              {useBackupCode 
                ? 'Use authenticator app instead' 
                : 'Use backup code instead'
              }
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔧 Starting login, clearing error state');
    setError('');
    
    try {
      const result = await login(email, password);
      console.log('🔧 Login result:', result);
      if (!result.success) {
        // Use specific message if provided, otherwise use generic message
        const errorMessage = result.message || 'Invalid email or password. Please try again.';
        console.log('🔧 Setting error message:', errorMessage);
        setError(errorMessage);
        console.log('🔧 Error message set, should display now');
      }
      // If requiresTwoFactor is true, the pendingTwoFactor state will be set
      // and the component will re-render to show the 2FA form
    } catch (err) {
      console.error('🔧 Login error:', err);
      const errorMessage = 'An error occurred during login. Please try again.';
      setError(errorMessage);
    }
  };
  
  // Show registration form if requested
  if (showRegister) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <RegisterForm 
          onSuccess={() => setShowRegister(false)}
          onBackToLogin={() => setShowRegister(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Sign in</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <>
              {console.log('🔧 Rendering error alert with message:', error)}
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </>
          )}
          {console.log('🔧 Current error state:', error)}
          
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <ForgotPasswordDialog>
                  <Button variant="link" className="px-0 font-normal h-auto">
                    Forgot password?
                  </Button>
                </ForgotPasswordDialog>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Sign in
            </Button>
          </form>
          
          <div className="text-center">
            <Button
              variant="link"
              onClick={() => setShowRegister(true)}
              className="text-sm"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Don't have an account? Register here
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


export default LoginForm;