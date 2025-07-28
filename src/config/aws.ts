// AWS Configuration
export const AWS_CONFIG = {
  region: process.env.VITE_AWS_REGION || 'us-east-1',
  accessKeyId: process.env.VITE_AWS_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.VITE_AWS_SECRET_ACCESS_KEY || '',
  sesFromEmail: process.env.VITE_SES_FROM_EMAIL || 'noreply@yourcompany.com',
  sesFromName: process.env.VITE_SES_FROM_NAME || 'Procurement System'
};

// Validate AWS configuration
export const isAwsConfigured = (): boolean => {
  return !!(
    AWS_CONFIG.accessKeyId && 
    AWS_CONFIG.secretAccessKey && 
    AWS_CONFIG.sesFromEmail
  );
};

// Environment variables needed:
// VITE_AWS_REGION=us-east-1
// VITE_AWS_ACCESS_KEY_ID=your_access_key
// VITE_AWS_SECRET_ACCESS_KEY=your_secret_key
// VITE_SES_FROM_EMAIL=noreply@yourcompany.com
// VITE_SES_FROM_NAME=Procurement System