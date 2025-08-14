import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { dynamoUserService } from '@/services/dynamoUserService';
import { User } from '@/types/user';
import { CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';

export const PendingUsersPanel: React.FC = () => {
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadPendingUsers = async () => {
    setIsLoading(true);
    try {
      const users = await dynamoUserService.getPendingUsers();
      setPendingUsers(users);
    } catch (error) {
      console.error('Error loading pending users:', error);
      toast({
        title: "Error",
        description: "Failed to load pending users",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPendingUsers();
  }, []);

  const handleApprove = async (user: User) => {
    try {
      const success = await dynamoUserService.approveUser(user.UserID, user.Email);
      if (success) {
        toast({
          title: "User Approved",
          description: `${user.Name || user.Email} has been approved and can now log in.`
        });
        loadPendingUsers(); // Refresh the list
      } else {
        throw new Error('Failed to approve user');
      }
    } catch (error) {
      console.error('Error approving user:', error);
      toast({
        title: "Error",
        description: "Failed to approve user",
        variant: "destructive"
      });
    }
  };

  const handleReject = async (user: User) => {
    try {
      const success = await dynamoUserService.rejectUser(user.UserID, user.Email);
      if (success) {
        toast({
          title: "User Rejected",
          description: `${user.Name || user.Email} has been rejected.`
        });
        loadPendingUsers(); // Refresh the list
      } else {
        throw new Error('Failed to reject user');
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast({
        title: "Error",
        description: "Failed to reject user",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending User Approvals
            </CardTitle>
            <CardDescription>
              Review and approve new user registrations
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={loadPendingUsers} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {pendingUsers.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No pending user approvals
          </p>
        ) : (
          <div className="space-y-4">
            {pendingUsers.map((user) => (
              <div key={user.UserID} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">{user.Name || 'Unknown User'}</h3>
                    <Badge variant="secondary">
                      {user.status || 'pending'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{user.Email}</p>
                  <p className="text-xs text-muted-foreground">
                    Registered: {new Date(user.DateCreated).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600 border-green-600 hover:bg-green-50"
                    onClick={() => handleApprove(user)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                    onClick={() => handleReject(user)}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};