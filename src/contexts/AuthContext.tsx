import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { hashPassword, verifyPassword } from '@/utils/encryption';
import { createSession, validateSession, clearSession, refreshSession } from '@/utils/sessionManager';
import { emailService } from '@/services/emailService';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithOAuth: (provider: 'google' | 'github') => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (token: string, newPassword: string) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const session = validateSession();
    if (session) {
      const storedUsers = JSON.parse(localStorage.getItem('app_users') || '[]');
      const foundUser = storedUsers.find((u: any) => u.id === session.userId) || 
        (session.userId === '1' ? { id: '1', name: 'Admin User', email: 'admin@company.com', role: 'admin' } : null);
      
      if (foundUser) {
        setUser(foundUser);
        refreshSession(); // Extend session
      } else {
        clearSession();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const storedCredentials = JSON.parse(localStorage.getItem('user_credentials') || '{}');
      const storedUsers = JSON.parse(localStorage.getItem('app_users') || '[]');
      
      // Check hardcoded admin with hashed password
      if (email === 'admin@company.com') {
        const adminHash = hashPassword('admin123');
        if (verifyPassword(password, adminHash)) {
          const userData = { id: '1', name: 'Admin User', email: 'admin@company.com', role: 'admin' as const };
          setUser(userData);
          createSession(userData.id, userData.email);
          toast({ title: 'Login successful' });
          return true;
        }
      }
      
      // Check created users with hashed passwords
      const foundUser = storedUsers.find((u: any) => u.email === email);
      if (foundUser && storedCredentials[foundUser.id]) {
        if (verifyPassword(password, storedCredentials[foundUser.id])) {
          const userData = { id: foundUser.id, name: foundUser.name, email: foundUser.email, role: foundUser.role };
          setUser(userData);
          createSession(userData.id, userData.email);
          toast({ title: 'Login successful' });
          return true;
        }
      }
      
      toast({ 
        title: 'Login failed', 
        description: 'Invalid email or password. Please check your credentials and try again.',
        variant: 'destructive' 
      });
      return false;
    } catch (error) {
      toast({ 
        title: 'Login error', 
        description: 'An error occurred during login. Please try again.',
        variant: 'destructive' 
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithOAuth = async (provider: 'google' | 'github'): Promise<boolean> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const userData = {
        id: provider === 'google' ? 'google_123' : 'github_456',
        name: provider === 'google' ? 'Google User' : 'GitHub User',
        email: `user@${provider}.com`,
        avatar: `https://via.placeholder.com/40?text=${provider.charAt(0).toUpperCase()}`,
        role: 'user' as const
      };
      
      setUser(userData);
      createSession(userData.id, userData.email);
      toast({ title: `${provider} login successful` });
      return true;
    } catch (error) {
      toast({ title: `${provider} login failed`, variant: 'destructive' });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      console.log('Reset password requested for:', email);
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.error('Invalid email format:', email);
        toast({
          title: 'Invalid email',
          description: 'Please enter a valid email address.',
          variant: 'destructive'
        });
        return false;
      }

      // Check if user exists
      const storedUsers = JSON.parse(localStorage.getItem('app_users') || '[]');
      const foundUser = storedUsers.find((u: any) => u.email === email) || 
        (email === 'admin@company.com' ? { id: '1', email: 'admin@company.com' } : null);
      
      console.log('User found for reset:', foundUser ? 'Yes' : 'No');
      
      // Always generate token and attempt to send email for security
      // (Don't reveal whether the email exists or not)
      if (foundUser) {
        const resetToken = emailService.generateResetToken(email, foundUser.id);
        console.log('Generated reset token:', resetToken);
        
        const emailSent = await emailService.sendPasswordResetEmail(email, resetToken);
        console.log('Email sent successfully:', emailSent);
        
        if (!emailSent) {
          toast({
            title: 'Email service error',
            description: 'Unable to send reset email. Please try again later.',
            variant: 'destructive'
          });
          return false;
        }
        
        return true;
      }
      
      // For non-existent users, simulate the process but don't actually send email
      console.log('Simulating reset for non-existent user');
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true; // Always return true for security (don't reveal if email exists)
    } catch (error) {
      console.error('Reset password error:', error);
      toast({
        title: 'Reset failed',
        description: 'An error occurred while processing your request. Please try again.',
        variant: 'destructive'
      });
      return false;
    }
  };

  const updatePassword = async (token: string, newPassword: string): Promise<boolean> => {
    try {
      console.log('Updating password with token:', token);
      
      // Validate token
      const tokenData = emailService.validateResetToken(token);
      if (!tokenData) {
        console.error('Invalid or expired token');
        toast({
          title: 'Invalid reset link',
          description: 'This reset link is invalid or has expired. Please request a new one.',
          variant: 'destructive'
        });
        return false;
      }

      console.log('Token validated for user:', tokenData.userId);

      // Hash new password
      const hashedPassword = hashPassword(newPassword);
      
      // Update password in storage
      const storedCredentials = JSON.parse(localStorage.getItem('user_credentials') || '{}');
      storedCredentials[tokenData.userId] = hashedPassword;
      localStorage.setItem('user_credentials', JSON.stringify(storedCredentials));
      
      // Consume the token (one-time use)
      emailService.consumeResetToken(token);
      
      console.log('Password updated successfully');
      return true;
    } catch (error) {
      console.error('Update password error:', error);
      toast({
        title: 'Password update failed',
        description: 'An error occurred while updating your password. Please try again.',
        variant: 'destructive'
      });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    clearSession();
    toast({ title: 'Logged out successfully' });
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      loginWithOAuth,
      logout,
      resetPassword,
      updatePassword,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};