import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, CreateUserData } from '@/types/user';
import { toast } from '@/components/ui/use-toast';
import { hashPassword } from '@/utils/encryption';
import { dynamoUserService } from '@/services/dynamoUserService';
interface UserContextType {
  users: User[];
  currentUser: User | null;
  createUser: (userData: CreateUserData) => void;
  removeUser: (userId: string) => void;
  updateUserRole: (userId: string, role: 'admin' | 'user') => void;
  setUserPassword: (userId: string, password: string, mustChangePassword?: boolean) => Promise<void>;
  isAdmin: () => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function useUserContext() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
}

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser] = useState<User>({
    UserID: '1',
    Name: 'Admin User',
    Email: 'admin@company.com',
    Password: 'hashed_password',
    DateCreated: new Date().toISOString(),
    IsActive: true,
    IsAdmin: true,
    Deleted: false,
    id: '1',
    name: 'Admin User',
    email: 'admin@company.com',
    role: 'admin' as const,
    status: 'active' as const,
    createdAt: new Date()
  });

  const [users, setUsers] = useState<User[]>([]);

  // Load users from DynamoDB and localStorage
  useEffect(() => {
    const loadUsers = async () => {
      try {
        // Try to load from DynamoDB first
        const dbUsers = await dynamoUserService.getAllUsers();
        if (dbUsers.length > 0) {
          // Convert DynamoDB users to proper format with Date objects
          const formattedUsers = dbUsers.map((user: any) => ({
            ...user,
            id: user.UserID,
            name: user.Name || user.UserName, // Support both Name and UserName fields
            email: user.Email,
            role: user.IsAdmin ? 'admin' : 'user',
            status: user.IsActive ? 'active' : 'inactive',
            createdAt: new Date(user.DateCreated)
          }));
          //setUsers([currentUser, ...formattedUsers.filter((u: any) => u.UserID !== currentUser.UserID)]);
          setUsers([currentUser, ...formattedUsers.filter((u: any) => u.UserID !== currentUser.UserID)]);
          return;
        }
      } catch (error) {
        console.error('Error loading users from DynamoDB:', error);
      }

      // Fallback to localStorage with default users
      setUsers([
        currentUser,
        {
          UserID: '2',
          Name: 'John Doe',
          Email: 'john@company.com',
          Password: 'hashed_password',
          DateCreated: new Date().toISOString(),
          IsActive: true,
          IsAdmin: false,
          Deleted: false,
          id: '2',
          name: 'John Doe',
          email: 'john@company.com',
          role: 'user' as const,
          status: 'active' as const,
          createdAt: new Date()
        }
      ]);
    };

    loadUsers();
  }, []);

  // Save users to localStorage for backward compatibility
  useEffect(() => {
    localStorage.setItem('app_users', JSON.stringify(users));
  }, [users]);
  const createUser = async (userData: CreateUserData) => {
    try {
      // Map UI fields to DynamoDB fields
      const newUser: User = {
        UserID: Date.now().toString(),
        Name: userData.name, // Map name to Name
        Email: userData.email, // Map email to Email
        Password: await hashPassword('Gdne*D$O2@2DW6'),
        DateCreated: new Date().toISOString(),
        IsActive: true,
        IsAdmin: userData.role === 'admin', // Map role to IsAdmin
        Deleted: false,
        mustChangePassword: true,
        // UI-compatible fields for immediate display
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        role: userData.role,
        status: 'active',
        createdAt: new Date(),
      } as User & { id: string; name: string; email: string; role: string; status: string; createdAt: Date };

      // Try to save to DynamoDB
      const success = await dynamoUserService.createUser(newUser);
      if (success) {
        setUsers(prev => [...prev, newUser]);
        toast({ title: 'User created successfully in DynamoDB' });
        return;
      }
    } catch (error) {
      console.error('Error creating user in DynamoDB:', error);
    }
    
    // Fallback to localStorage
    const newUser: User = {
      UserID: Date.now().toString(),
      Name: userData.name,
      Email: userData.email,
      Password: await hashPassword('tempPassword123'),
      DateCreated: new Date().toISOString(),
      IsActive: true,
      IsAdmin: userData.role === 'admin',
      Deleted: false,
      mustChangePassword: true,
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      role: userData.role,
      status: 'active',
      createdAt: new Date(),
    } as User & { id: string; name: string; email: string; role: string; status: string; createdAt: Date };
    
    setUsers(prev => [...prev, newUser]);
    toast({ title: 'User created successfully (localStorage)' });
  };
  const removeUser = (userId: string) => {
    if (userId === currentUser.UserID) {
      toast({ title: 'Cannot delete current user', variant: 'destructive' });
      return;
    }
    setUsers(prev => prev.filter(user => user.UserID !== userId));
    toast({ title: 'User removed successfully' });
  };

  const updateUserRole = (userId: string, role: 'admin' | 'user') => {
    setUsers(prev => prev.map(user => 
      user.UserID === userId ? { ...user, IsAdmin: role === 'admin' } : user
    ));
    toast({ title: 'User role updated successfully' });
  };

  const setUserPassword = async (userId: string, password: string, mustChangePassword?: boolean) => {
    try {
      const user = users.find(u => u.UserID === userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      const hashedPassword = await hashPassword(password);
      
      // Update user in DynamoDB
      const updatedUser = { ...user, Password: hashedPassword };
      await dynamoUserService.updateUser(updatedUser);
      
      setUsers(prev => prev.map(u => 
        u.UserID === userId ? updatedUser : u
      ));
      
      toast({ title: 'Password set successfully' });
      
    } catch (error) {
      console.error('Failed to set password:', error);
      toast({ title: 'Failed to set password', variant: 'destructive' });
      throw error;
    }
  };

  const isAdmin = () => currentUser?.IsAdmin === true;

  return (
    <UserContext.Provider value={{
      users,
      currentUser,
      createUser,
      removeUser,
      updateUserRole,
      setUserPassword,
      isAdmin
    }}>
      {children}
    </UserContext.Provider>
  );
};