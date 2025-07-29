import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUserContext } from '@/contexts/UserContext';
import { SetPasswordDialog } from '@/components/SetPasswordDialog';
import { Trash2, AlertTriangle } from 'lucide-react';

export const UserTable: React.FC = () => {
  const { users, removeUser, updateUserRole, setUserPassword, isAdmin, currentUser } = useUserContext();

  const handleRoleChange = (userId: string, newRole: 'admin' | 'user') => {
    updateUserRole(userId, newRole);
  };

  const handlePasswordSet = async (userId: string, newPassword: string, mustChangePassword?: boolean) => {
    await setUserPassword(userId, newPassword, mustChangePassword);
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            {isAdmin() && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {user.name}
                  {user.mustChangePassword && (
                    <AlertTriangle className="h-4 w-4 text-amber-500" title="Must change password on login" />
                  )}
                </div>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {isAdmin() && user.id !== currentUser?.id ? (
                  <Select
                    value={user.role}
                    onValueChange={(value: 'admin' | 'user') => handleRoleChange(user.id, value)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                    {user.status}
                  </Badge>
                  {user.mustChangePassword && (
                    <Badge variant="outline" className="text-xs text-amber-600">
                      Password Reset Required
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>{user.createdAt.toLocaleDateString()}</TableCell>
              {isAdmin() && (
                <TableCell>
                  <div className="flex items-center gap-2">
                    <SetPasswordDialog user={user} onPasswordSet={handlePasswordSet} />
                    {user.id !== currentUser?.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeUser(user.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};