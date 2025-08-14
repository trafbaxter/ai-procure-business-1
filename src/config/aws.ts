// AWS Configuration
export const AWS_CONFIG = {
  region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
  secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '',
  sesFromEmail: import.meta.env.VITE_SES_FROM_EMAIL, //|| 'noreply@yourcompany.com',
  sesFromName: import.meta.env.VITE_SES_FROM_NAME || 'Procurement System'
};

// Validate AWS configuration
export const isAwsConfigured = (): boolean => {
  const hasAccessKey = !!(AWS_CONFIG.accessKeyId && AWS_CONFIG.accessKeyId.trim() !== '');
  const hasSecretKey = !!(AWS_CONFIG.secretAccessKey && AWS_CONFIG.secretAccessKey.trim() !== '');
  const hasFromEmail = !!(AWS_CONFIG.sesFromEmail && AWS_CONFIG.sesFromEmail.trim() !== '');
  
  const configured = hasAccessKey && hasSecretKey && hasFromEmail;
  
  console.log('🔧 AWS Configuration Check:', {
    hasAccessKey,
    hasSecretKey, 
    hasFromEmail,
    region: AWS_CONFIG.region,
    fromEmail: AWS_CONFIG.sesFromEmail,
    configured,
    // Show first few chars of keys for debugging (safely)
    accessKeyPreview: AWS_CONFIG.accessKeyId ? AWS_CONFIG.accessKeyId.substring(0, 4) + '...' : 'NOT SET',
    secretKeyPreview: AWS_CONFIG.secretAccessKey ? AWS_CONFIG.secretAccessKey.substring(0, 4) + '...' : 'NOT SET'
  });
  
  if (!configured) {
    console.warn('⚠️ AWS SES not fully configured. Missing:');
    if (!hasAccessKey) console.warn('  - VITE_AWS_ACCESS_KEY_ID');
    if (!hasSecretKey) console.warn('  - VITE_AWS_SECRET_ACCESS_KEY');
    if (!hasFromEmail) console.warn('  - VITE_SES_FROM_EMAIL');
  }
  
  return configured;
};

// Environment variables needed in your .env file:
// VITE_AWS_REGION=us-east-1
// VITE_AWS_ACCESS_KEY_ID=your_access_key_here
// VITE_AWS_SECRET_ACCESS_KEY=your_secret_key_here
// VITE_SES_FROM_EMAIL=noreply@yourcompany.com
// VITE_SES_FROM_NAME=Procurement System