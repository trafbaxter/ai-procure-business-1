import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreateUserDialog } from '@/components/CreateUserDialog';
import { UserTable } from '@/components/UserTable';
import { PendingUsersPanel } from '@/components/PendingUsersPanel';
import { useUserContext } from '@/contexts/UserContext';
import { Users, Shield, User, ArrowLeft, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createAllTables } from '@/utils/createDynamoTables';
export const UserManagement: React.FC = () => {
  const { users, isAdmin } = useUserContext();
  const navigate = useNavigate();
  const [isCreatingTables, setIsCreatingTables] = useState(false);

  const handleBackToDashboard = () => {
    navigate('/');
  };

  const handleCreateTables = async () => {
    setIsCreatingTables(true);
    try {
      await createAllTables();
      // Refresh the page to retry loading users
      window.location.reload();
    } catch (error) {
      console.error('Failed to create tables:', error);
    } finally {
      setIsCreatingTables(false);
    }
  };

  if (!isAdmin()) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleBackToDashboard}
            className="flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
              <p className="text-gray-600">You need admin privileges to access user management.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const adminCount = users.filter(user => user.role === 'admin').length;
  const userCount = users.filter(user => user.role === 'user').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={handleBackToDashboard}
            className="flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-gray-600">Manage users and their roles</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleCreateTables}
            disabled={isCreatingTables}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Database className="h-4 w-4" />
            {isCreatingTables ? 'Creating Tables...' : 'Create DB Tables'}
          </Button>
          <CreateUserDialog />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount}</div>
          </CardContent>
        </Card>
      </div>
      <PendingUsersPanel />

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Manage user accounts and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserTable />
        </CardContent>
      </Card>
    </div>
  );
};