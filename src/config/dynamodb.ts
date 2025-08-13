// DynamoDB Configuration
export const DYNAMODB_CONFIG = {
  region: process.env.REACT_APP_AWS_REGION || 'us-east-1',
  tables: {
    users: process.env.REACT_APP_DYNAMODB_USERS_TABLE || 'Users',
    sessions: process.env.REACT_APP_DYNAMODB_SESSIONS_TABLE || 'Sessions',
    apiKeys: process.env.REACT_APP_DYNAMODB_API_KEYS_TABLE || 'ApiKeys'
  },
  indexes: {
    emailIndex: 'EmailIndex',
    sessionIndex: 'SessionIndex'
  }
};

// Environment check
export const isDynamoDBEnabled = () => {
  return !!(process.env.REACT_APP_AWS_ACCESS_KEY_ID && 
           process.env.REACT_APP_AWS_SECRET_ACCESS_KEY);
};

// Fallback mode configuration
export const FALLBACK_MODE = {
  localStorage: true,
  showWarnings: true
};