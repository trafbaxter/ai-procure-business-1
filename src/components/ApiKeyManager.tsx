import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Copy, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
  isActive: boolean;
}

const ApiKeyManager: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [showKeys, setShowKeys] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem('apiKeys');
    if (stored) {
      setApiKeys(JSON.parse(stored));
    }
  }, []);

  const generateApiKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'pk_';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const createApiKey = () => {
    if (!newKeyName.trim()) {
      toast({ title: 'Error', description: 'Please enter a name for the API key' });
      return;
    }

    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: generateApiKey(),
      createdAt: new Date().toISOString(),
      isActive: true
    };

    const updated = [...apiKeys, newKey];
    setApiKeys(updated);
    localStorage.setItem('apiKeys', JSON.stringify(updated));
    setNewKeyName('');
    toast({ title: 'Success', description: 'API key created successfully' });
  };

  const deleteApiKey = (id: string) => {
    const updated = apiKeys.filter(key => key.id !== id);
    setApiKeys(updated);
    localStorage.setItem('apiKeys', JSON.stringify(updated));
    toast({ title: 'Success', description: 'API key deleted' });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied', description: 'API key copied to clipboard' });
  };

  const toggleKeyVisibility = (id: string) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Key Management</CardTitle>
        <CardDescription>
          Create and manage API keys for external applications to access this app
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="keyName">API Key Name</Label>
            <Input
              id="keyName"
              placeholder="Enter a name for your API key"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
            />
          </div>
          <Button onClick={createApiKey} className="mt-6">
            <Plus className="w-4 h-4 mr-2" />
            Create Key
          </Button>
        </div>

        <div className="space-y-4">
          {apiKeys.map((apiKey) => (
            <div key={apiKey.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{apiKey.name}</h3>
                  <Badge variant={apiKey.isActive ? 'default' : 'secondary'}>
                    {apiKey.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteApiKey(apiKey.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <Input
                  value={showKeys[apiKey.id] ? apiKey.key : '••••••••••••••••••••••••••••••••••••'}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleKeyVisibility(apiKey.id)}
                >
                  {showKeys[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(apiKey.key)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Created: {new Date(apiKey.createdAt).toLocaleDateString()}
                {apiKey.lastUsed && (
                  <span className="ml-4">
                    Last used: {new Date(apiKey.lastUsed).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
          
          {apiKeys.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No API keys created yet. Create your first API key above.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiKeyManager;