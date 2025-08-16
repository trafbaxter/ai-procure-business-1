import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { hashPassword, verifyPassword } from '@/utils/encryption';
import { createSession, validateSession, clearSession, refreshSession } from '@/utils/sessionManager';
import { emailService } from '@/services/emailService';
import { dynamoUserService } from '@/services/dynamoUserService';
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user';
  mustChangePassword?: boolean;
}

interface LoginResult {
  success: boolean;
  mustChangePassword?: boolean;
  requiresTwoFactor?: boolean;
  user?: User;
  message?: string; // Add message field for specific error messages
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  verifyTwoFactor: (code: string, isBackupCode?: boolean) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (token: string, newPassword: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  isLoading: boolean;
  pendingPasswordChange: User | null;
  pendingTwoFactor: User | null;
  completePendingLogin: () => void;
  loginError: string; // Add login error state
  clearLoginError: () => void; // Add method to clear error
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
  const [pendingPasswordChange, setPendingPasswordChange] = useState<User | null>(null);
  const [pendingTwoFactor, setPendingTwoFactor] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState(''); // Add login error state

  const clearLoginError = () => setLoginError(''); // Add clear error method

  useEffect(() => {
    const initAuth = async () => {
      const session = validateSession();
      if (session) {
        try {
          // Try to get user from DynamoDB first
          const dbUser = await dynamoUserService.getUserById(session.userId);
          if (dbUser) {
            const userData = {
              id: dbUser.UserID,
              name: dbUser.Name || dbUser.Email || 'Unknown User',
              email: dbUser.Email,
              role: dbUser.IsAdmin ? 'admin' as const : 'user' as const,
              mustChangePassword: dbUser.mustChangePassword
            };
            setUser(userData);
            refreshSession();
          } else {
            // Comment out default admin user fallback
            // if (session.userId === '1') {
            //   const userData = { id: '1', name: 'Admin User', email: 'admin@company.com', role: 'admin' as const };
            //   setUser(userData);
            //   refreshSession();
            // } else {
              clearSession();
            // }
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          clearSession();
        }
      }
      setIsLoading(false);
    };
    
    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<LoginResult> => {
    setIsLoading(true);
    clearLoginError(); // Clear any previous error
    console.log('🔧 Login attempt for:', email);
    
    try {
      // Try DynamoDB first
      console.log('🔧 Checking DynamoDB for user...');
      const dbUser = await dynamoUserService.getUserByEmail(email);
      
      if (dbUser) {
        console.log('🔧 User found in DB:', { status: dbUser.status, approved: dbUser.approved });
        
        // Check if user is approved
        if (dbUser.status === 'pending' || (dbUser.approved === false && dbUser.status !== 'approved')) {
          console.log('🔧 User account pending approval');
          const errorMessage = 'Your account is pending approval. Please wait for an administrator to approve your registration.';
          setLoginError(errorMessage); // Set error in context
          return { 
            success: false, 
            message: errorMessage 
          };
        }
        
        if (dbUser.status === 'rejected') {
          console.log('🔧 User account has been rejected');
          const errorMessage = 'Your account registration has been rejected. Please contact an administrator for more information.';
          setLoginError(errorMessage); // Set error in context
          return { 
            success: false, 
            message: errorMessage 
          };
        }
        

        
        console.log('🔧 DynamoDB user password verification...');
        console.log('🔧 Input password:', password);
        console.log('🔧 Stored hash:', dbUser.Password);
        console.log('🔧 Hash length:', dbUser.Password?.length);
        
        const passwordMatch = await verifyPassword(password, dbUser.Password);
        console.log('🔧 DynamoDB password match:', passwordMatch);
        
        if (passwordMatch) {
          console.log('🔧 User data from DB:', {
            UserID: dbUser.UserID,
            Name: dbUser.Name,
            Email: dbUser.Email,
            IsAdmin: dbUser.IsAdmin
          });
          const userData = {
            id: dbUser.UserID,
            name: dbUser.Name || dbUser.Email || 'Unknown User',
            email: dbUser.Email,
            role: dbUser.IsAdmin ? 'admin' as const : 'user' as const,
            mustChangePassword: dbUser.mustChangePassword
          };
          
          if (dbUser.mustChangePassword) {
            setPendingPasswordChange(userData);
            return { success: true, mustChangePassword: true, user: userData };
          }
          
          // Check 2FA from DynamoDB first, then fallback to localStorage
          // Explicitly check for true since undefined should be treated as false
          const dbTwoFactorEnabled = dbUser.twoFactorEnabled === true;
          const localTwoFactorEnabled = !!localStorage.getItem(`2fa_${userData.id}`);
          const has2FAEnabled = dbTwoFactorEnabled || localTwoFactorEnabled;
          console.log('🔧 2FA check - DynamoDB:', dbTwoFactorEnabled, 'localStorage:', localTwoFactorEnabled, 'final:', has2FAEnabled);
          
          if (has2FAEnabled) {
            setPendingTwoFactor(userData);
            return { success: true, requiresTwoFactor: true, user: userData };
          }
          
          setUser(userData);
          createSession(userData.id, userData.email);
          return { success: true, user: userData };
        } else {
          console.log('🔧 DynamoDB password verification failed');
          // Try plain text comparison as fallback
          console.log('🔧 Trying plain text comparison...');
          if (password === dbUser.Password) {
            console.log('🔧 Plain text password match - updating to hashed');
            // Update to hashed password
            const hashedPassword = await hashPassword(password);
            const updatedUser = {
              ...dbUser,
              Name: dbUser.Name || 'Unknown User', // Ensure Name exists
              Password: hashedPassword
            };
            await dynamoUserService.updateUser(updatedUser);
            
            const userData = {
              id: dbUser.UserID,
              name: dbUser.Name || dbUser.Email || 'Unknown User',
              email: dbUser.Email,
              role: dbUser.IsAdmin ? 'admin' as const : 'user' as const,
              mustChangePassword: dbUser.mustChangePassword
            };
            
            setUser(userData);
            createSession(userData.id, userData.email);
            return { success: true, user: userData };
          }
        }
      }
      // Fallback to localStorage for existing users
      console.log('🔧 Checking localStorage for user...');
      const storedCredentials = JSON.parse(localStorage.getItem('user_credentials') || '{}');
      const storedUsers = JSON.parse(localStorage.getItem('app_users') || '[]');
      console.log('🔧 LocalStorage users count:', storedUsers.length);
      
      const foundUser = storedUsers.find((u: any) => u.email === email);
      console.log('🔧 LocalStorage user found:', !!foundUser);
      
      if (foundUser && storedCredentials[foundUser.id]) {
        console.log('🔧 Verifying localStorage password...');
        if (await verifyPassword(password, storedCredentials[foundUser.id])) {
          console.log('🔧 LocalStorage login successful');
          if (foundUser.mustChangePassword) {
            setPendingPasswordChange(foundUser);
            return { success: true, mustChangePassword: true, user: foundUser };
          }
          
          const twoFactorData = localStorage.getItem(`2fa_${foundUser.id}`);
          if (twoFactorData) {
            setPendingTwoFactor(foundUser);
            return { success: true, requiresTwoFactor: true, user: foundUser };
          }
          
          setUser(foundUser);
          createSession(foundUser.id, foundUser.email);
          return { success: true, user: foundUser };
        } else {
          console.log('🔧 LocalStorage password verification failed');
        }
      }
      
      // Create a fallback admin user if no users exist and credentials match
      if (storedUsers.length === 0 && email === 'admin@company.com' && password === 'admin123') {
        console.log('🔧 Creating fallback admin user...');
        const adminUser = {
          id: '1',
          name: 'Admin User',
          email: 'admin@company.com',
          role: 'admin' as const,
          mustChangePassword: true
        };
        
        const hashedPassword = await hashPassword(password);
        const newUsers = [adminUser];
        const newCredentials = { '1': hashedPassword };
        
        localStorage.setItem('app_users', JSON.stringify(newUsers));
        localStorage.setItem('user_credentials', JSON.stringify(newCredentials));
        
        setPendingPasswordChange(adminUser);
        return { success: true, mustChangePassword: true, user: adminUser };
      }
      
      
      console.log('🔧 Login failed - no matching user found');
      return { success: false };
    } catch (error) {
      console.error('🔧 Login error:', error);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };
  const verifyTwoFactor = async (code: string, isBackupCode = false): Promise<boolean> => {
    if (!pendingTwoFactor) return false;
    
    // Simple verification - in real app would use proper TOTP
    if (isBackupCode) {
      const backupCodes = JSON.parse(localStorage.getItem(`2fa_backup_${pendingTwoFactor.id}`) || '[]');
      const codeIndex = backupCodes.indexOf(code.toUpperCase());
      if (codeIndex !== -1) {
        backupCodes.splice(codeIndex, 1);
        localStorage.setItem(`2fa_backup_${pendingTwoFactor.id}`, JSON.stringify(backupCodes));
        
        setUser(pendingTwoFactor);
        createSession(pendingTwoFactor.id, pendingTwoFactor.email);
        setPendingTwoFactor(null);
        return true;
      }
    } else {
      // Simple check - in real app would verify TOTP
      if (code.length === 6) {
        setUser(pendingTwoFactor);
        createSession(pendingTwoFactor.id, pendingTwoFactor.email);
        setPendingTwoFactor(null);
        return true;
      }
    }
    
    return false;
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!pendingPasswordChange && !user) return false;
    
    const targetUser = pendingPasswordChange || user;
    const storedCredentials = JSON.parse(localStorage.getItem('user_credentials') || '{}');
    
    if (!(await verifyPassword(currentPassword, storedCredentials[targetUser!.id]))) {
      return false;
    }
    
    const hashedPassword = await hashPassword(newPassword);
    storedCredentials[targetUser!.id] = hashedPassword;
    localStorage.setItem('user_credentials', JSON.stringify(storedCredentials));
    
    const storedUsers = JSON.parse(localStorage.getItem('app_users') || '[]');
    const userIndex = storedUsers.findIndex((u: any) => u.id === targetUser!.id);
    if (userIndex !== -1) {
      storedUsers[userIndex].mustChangePassword = false;
      localStorage.setItem('app_users', JSON.stringify(storedUsers));
    }
    
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'app_users',
      newValue: JSON.stringify(storedUsers)
    }));
    
    if (pendingPasswordChange) {
      setUser({ ...pendingPasswordChange, mustChangePassword: false });
      createSession(pendingPasswordChange.id, pendingPasswordChange.email);
      setPendingPasswordChange(null);
    } else if (user) {
      setUser({ ...user, mustChangePassword: false });
    }
    
    return true;
  };

  const completePendingLogin = () => {
    if (pendingPasswordChange) {
      setUser(pendingPasswordChange);
      createSession(pendingPasswordChange.id, pendingPasswordChange.email);
      setPendingPasswordChange(null);
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    const storedUsers = JSON.parse(localStorage.getItem('app_users') || '[]');
    const foundUser = storedUsers.find((u: any) => u.email === email);
    // Comment out admin user fallback: || (email === 'admin@company.com' ? { id: '1', email } : null);
    
    if (foundUser) {
      const resetToken = emailService.generateResetToken(email, foundUser.id);
      await emailService.sendPasswordResetEmail(email, resetToken);
    }
    return true;
  };

  const updatePassword = async (token: string, newPassword: string): Promise<boolean> => {
    const tokenData = emailService.validateResetToken(token);
    if (!tokenData) return false;

    const hashedPassword = await hashPassword(newPassword);
    const storedCredentials = JSON.parse(localStorage.getItem('user_credentials') || '{}');
    storedCredentials[tokenData.userId] = hashedPassword;
    localStorage.setItem('user_credentials', JSON.stringify(storedCredentials));
    
    emailService.consumeResetToken(token);
    return true;
  };

  const logout = () => {
    setUser(null);
    setPendingPasswordChange(null);
    setPendingTwoFactor(null);
    clearSession();
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      verifyTwoFactor,
      logout,
      resetPassword,
      updatePassword,
      changePassword,
      isLoading,
      pendingPasswordChange,
      pendingTwoFactor,
      completePendingLogin,
      loginError, // Add login error to context value
      clearLoginError // Add clear error method to context value
    }}>
      {children}
    </AuthContext.Provider>
  );
};