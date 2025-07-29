import React from 'react';
import { AppProvider } from '@/contexts/AppContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Key, Lock } from 'lucide-react';
import TwoFactorSettings from '@/components/TwoFactorSettings';
import ChangePasswordForm from '@/components/ChangePasswordForm';

const SecuritySettings: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto p-6 space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold">Security Settings</h1>
          </div>
          
          <Tabs defaultValue="2fa" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="2fa" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Two-Factor Auth
              </TabsTrigger>
              <TabsTrigger value="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Change Password
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="2fa" className="space-y-4">
              <TwoFactorSettings />
            </TabsContent>
            
            <TabsContent value="password" className="space-y-4">
              <div className="max-w-md mx-auto">
                <ChangePasswordForm showTitle={false} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppProvider>
  );
};

export default SecuritySettings;