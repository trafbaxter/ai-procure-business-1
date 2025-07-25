import { useState, useEffect } from 'react';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
  isActive: boolean;
}

export const useApiAuth = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('apiKeys');
    if (stored) {
      setApiKeys(JSON.parse(stored));
    }
  }, []);

  const validateApiKey = (key: string): boolean => {
    const validKey = apiKeys.find(apiKey => 
      apiKey.key === key && apiKey.isActive
    );
    
    if (validKey) {
      // Update last used timestamp
      const updated = apiKeys.map(k => 
        k.id === validKey.id 
          ? { ...k, lastUsed: new Date().toISOString() }
          : k
      );
      setApiKeys(updated);
      localStorage.setItem('apiKeys', JSON.stringify(updated));
      return true;
    }
    
    return false;
  };

  const getApiKeyInfo = (key: string) => {
    return apiKeys.find(apiKey => apiKey.key === key);
  };

  return {
    validateApiKey,
    getApiKeyInfo,
    apiKeys
  };
};

export default useApiAuth;