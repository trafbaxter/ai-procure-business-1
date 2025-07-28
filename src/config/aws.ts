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
  const configured = !!(
    AWS_CONFIG.accessKeyId && 
    AWS_CONFIG.secretAccessKey && 
    AWS_CONFIG.sesFromEmail &&
    AWS_CONFIG.accessKeyId !== '' &&
    AWS_CONFIG.secretAccessKey !== ''
  );
  
  console.log('AWS Configuration Check:', {
    hasAccessKey: !!AWS_CONFIG.accessKeyId && AWS_CONFIG.accessKeyId !== '',
    hasSecretKey: !!AWS_CONFIG.secretAccessKey && AWS_CONFIG.secretAccessKey !== '',
    hasFromEmail: !!AWS_CONFIG.sesFromEmail,
    region: AWS_CONFIG.region,
    configured
  });
  
  return configured;
};

// Environment variables needed in your .env file:
// VITE_AWS_REGION=us-east-1
// VITE_AWS_ACCESS_KEY_ID=your_access_key_here
// VITE_AWS_SECRET_ACCESS_KEY=your_secret_key_here
// VITE_SES_FROM_EMAIL=noreply@yourcompany.com
// VITE_SES_FROM_NAME=Procurement System