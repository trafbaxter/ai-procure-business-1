import React from 'react';
import { AppProvider } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Key, Book } from 'lucide-react';
import ApiKeyManager from '@/components/ApiKeyManager';
import ApiDocumentation from '@/components/ApiDocumentation';

const ApiSettings: React.FC = () => {
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
            <h1 className="text-3xl font-bold">API Settings</h1>
          </div>
          
          <Tabs defaultValue="keys" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="keys" className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                API Keys
              </TabsTrigger>
              <TabsTrigger value="docs" className="flex items-center gap-2">
                <Book className="w-4 h-4" />
                Documentation
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="keys" className="space-y-4">
              <ApiKeyManager />
            </TabsContent>
            
            <TabsContent value="docs" className="space-y-4">
              <ApiDocumentation />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppProvider>
  );
};

export default ApiSettings;