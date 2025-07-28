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
    const session = validateSession();
    if (session) {
      const storedUsers = JSON.parse(localStorage.getItem('app_users') || '[]');
      const foundUser = storedUsers.find((u: any) => u.id === session.userId) || 
        (session.userId === '1' ? { id: '1', name: 'Admin User', email: 'admin@company.com', role: 'admin' } : null);
      
      if (foundUser) {
        setUser(foundUser);
        refreshSession();
      } else {
        clearSession();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const storedCredentials = JSON.parse(localStorage.getItem('user_credentials') || '{}');
      const storedUsers = JSON.parse(localStorage.getItem('app_users') || '[]');
      
      // Check admin
      if (email === 'admin@company.com') {
        const adminHash = hashPassword('admin123');
        if (verifyPassword(password, adminHash)) {
          const userData = { id: '1', name: 'Admin User', email: 'admin@company.com', role: 'admin' as const };
          setUser(userData);
          createSession(userData.id, userData.email);
          return true;
        }
      }
      
      // Check users
      const foundUser = storedUsers.find((u: any) => u.email === email);
      if (foundUser && storedCredentials[foundUser.id]) {
        if (verifyPassword(password, storedCredentials[foundUser.id])) {
          setUser(foundUser);
          createSession(foundUser.id, foundUser.email);
          return true;
        }
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithOAuth = async (provider: 'google' | 'github'): Promise<boolean> => {
    const userData = {
      id: provider + '_123',
      name: provider + ' User',
      email: `user@${provider}.com`,
      role: 'user' as const
    };
    setUser(userData);
    createSession(userData.id, userData.email);
    return true;
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    const storedUsers = JSON.parse(localStorage.getItem('app_users') || '[]');
    const foundUser = storedUsers.find((u: any) => u.email === email) || 
      (email === 'admin@company.com' ? { id: '1', email } : null);
    
    if (foundUser) {
      const resetToken = emailService.generateResetToken(email, foundUser.id);
      await emailService.sendPasswordResetEmail(email, resetToken);
    }
    return true;
  };

  const updatePassword = async (token: string, newPassword: string): Promise<boolean> => {
    const tokenData = emailService.validateResetToken(token);
    if (!tokenData) return false;

    const hashedPassword = hashPassword(newPassword);
    const storedCredentials = JSON.parse(localStorage.getItem('user_credentials') || '{}');
    storedCredentials[tokenData.userId] = hashedPassword;
    localStorage.setItem('user_credentials', JSON.stringify(storedCredentials));
    
    emailService.consumeResetToken(token);
    return true;
  };

  const logout = () => {
    setUser(null);
    clearSession();
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