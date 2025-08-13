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
  return !!(import.meta.env.VITE_AWS_ACCESS_KEY_ID && 
           import.meta.env.VITE_AWS_SECRET_ACCESS_KEY);
};

// Fallback mode configuration
export const FALLBACK_MODE = {
  localStorage: true,
  showWarnings: true
};