// DynamoDB Configuration
export const DYNAMODB_CONFIG = {
  region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  tables: {
    users: import.meta.env.VITE_DYNAMODB_USERS_TABLE || 'Procurement-Users',
    sessions: import.meta.env.VITE_DYNAMODB_SESSIONS_TABLE || 'Procurement-Sessions',
    apiKeys: import.meta.env.VITE_DYNAMODB_API_KEYS_TABLE || 'Procurement-ApiKeys'
  },
  indexes: {
    emailIndex: 'EmailIndex',
    sessionIndex: 'SessionIndex'
  }
};

// Environment check
export const isDynamoDBEnabled = () => {
  const hasAccessKey = !!(import.meta.env.VITE_AWS_ACCESS_KEY_ID && import.meta.env.VITE_AWS_ACCESS_KEY_ID.trim() !== '');
  const hasSecretKey = !!(import.meta.env.VITE_AWS_SECRET_ACCESS_KEY && import.meta.env.VITE_AWS_SECRET_ACCESS_KEY.trim() !== '');
  
  console.log('🔧 DynamoDB Configuration Check:', {
    hasAccessKey,
    hasSecretKey,
    accessKeyPreview: import.meta.env.VITE_AWS_ACCESS_KEY_ID ? import.meta.env.VITE_AWS_ACCESS_KEY_ID.substring(0, 4) + '...' : 'NOT SET',
    secretKeyPreview: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY ? import.meta.env.VITE_AWS_SECRET_ACCESS_KEY.substring(0, 4) + '...' : 'NOT SET',
    enabled: hasAccessKey && hasSecretKey
  });
  
  if (!hasAccessKey || !hasSecretKey) {
    console.warn('⚠️ DynamoDB not enabled. Missing:');
    if (!hasAccessKey) console.warn('  - VITE_AWS_ACCESS_KEY_ID');
    if (!hasSecretKey) console.warn('  - VITE_AWS_SECRET_ACCESS_KEY');
    console.warn('  Falling back to localStorage for user management');
  }
  
  return hasAccessKey && hasSecretKey;
};

// Fallback mode configuration
export const FALLBACK_MODE = {
  localStorage: true,
  showWarnings: true
};