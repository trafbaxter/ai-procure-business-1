// import React, { useState } from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { CheckCircle, AlertTriangle, Copy, Eye, EyeOff } from 'lucide-react';
// import { getAwsCredentials } from '@/config/awsCredentials';

// export function AwsCredentialSetup() {
//   const [showSecrets, setShowSecrets] = useState(false);
//   const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
//   const [testMessage, setTestMessage] = useState('');

//   const credentials = getAwsCredentials();
//   const currentAccessKey = import.meta.env.VITE_AWS_ACCESS_KEY_ID || '';
//   const currentSecretKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '';
//   const currentRegion = import.meta.env.VITE_AWS_REGION || 'us-east-1';

//   const copyToClipboard = (text: string) => {
//     navigator.clipboard.writeText(text);
//   };

//   const testCredentials = async () => {
//     setTestResult(null);
//     setTestMessage('Testing credentials...');

//     try {
//       // Import dynamically to avoid build issues
//       const { DynamoDBClient, ListTablesCommand } = await import('@aws-sdk/client-dynamodb');
      
//       const client = new DynamoDBClient({
//         region: currentRegion,
//         credentials: {
//           accessKeyId: currentAccessKey,
//           secretAccessKey: currentSecretKey
//         }
//       });

//       await client.send(new ListTablesCommand({}));
//       setTestResult('success');
//       setTestMessage('✅ AWS credentials are valid and DynamoDB is accessible!');
//     } catch (error: any) {
//       setTestResult('error');
//       if (error.name === 'InvalidSignatureException') {
//         setTestMessage('❌ Invalid AWS credentials. Please check your Access Key and Secret Key.');
//       } else if (error.name === 'UnrecognizedClientException') {
//         setTestMessage('❌ Invalid AWS Access Key ID format.');
//       } else {
//         setTestMessage(`❌ Error: ${error.message}`);
//       }
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             {credentials.isValid ? (
//               <CheckCircle className="h-5 w-5 text-green-600" />
//             ) : (
//               <AlertTriangle className="h-5 w-5 text-orange-600" />
//             )}
//             AWS Credentials Setup
//           </CardTitle>
//           <CardDescription>
//             Configure your AWS credentials to enable DynamoDB functionality
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           {!credentials.isValid && (
//             <Alert className="border-orange-200 bg-orange-50">
//               <AlertTriangle className="h-4 w-4 text-orange-600" />
//               <AlertDescription className="text-orange-800">
//                 <strong>Issue:</strong> {credentials.error}
//               </AlertDescription>
//             </Alert>
//           )}

//           <div className="space-y-4">
//             <div>
//               <Label htmlFor="accessKey">AWS Access Key ID</Label>
//               <div className="flex gap-2">
//                 <Input
//                   id="accessKey"
//                   type={showSecrets ? 'text' : 'password'}
//                   value={currentAccessKey}
//                   readOnly
//                   placeholder="AKIA..."
//                   className="font-mono"
//                 />
//                 <Button
//                   variant="outline"
//                   size="icon"
//                   onClick={() => copyToClipboard(currentAccessKey)}
//                   disabled={!currentAccessKey}
//                 >
//                   <Copy className="h-4 w-4" />
//                 </Button>
//               </div>
//               <p className="text-sm text-muted-foreground mt-1">
//                 Should start with "AKIA" and be 20 characters long
//               </p>
//             </div>

//             <div>
//               <Label htmlFor="secretKey">AWS Secret Access Key</Label>
//               <div className="flex gap-2">
//                 <Input
//                   id="secretKey"
//                   type={showSecrets ? 'text' : 'password'}
//                   value={currentSecretKey}
//                   readOnly
//                   placeholder="40 character secret key"
//                   className="font-mono"
//                 />
//                 <Button
//                   variant="outline"
//                   size="icon"
//                   onClick={() => copyToClipboard(currentSecretKey)}
//                   disabled={!currentSecretKey}
//                 >
//                   <Copy className="h-4 w-4" />
//                 </Button>
//               </div>
//               <p className="text-sm text-muted-foreground mt-1">
//                 Should be exactly 40 characters long
//               </p>
//             </div>

//             <div>
//               <Label htmlFor="region">AWS Region</Label>
//               <Input
//                 id="region"
//                 value={currentRegion}
//                 readOnly
//                 className="font-mono"
//               />
//             </div>

//             <div className="flex gap-2">
//               <Button
//                 variant="outline"
//                 onClick={() => setShowSecrets(!showSecrets)}
//               >
//                 {showSecrets ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
//                 {showSecrets ? 'Hide' : 'Show'} Credentials
//               </Button>
//               <Button onClick={testCredentials} disabled={!currentAccessKey || !currentSecretKey}>
//                 Test Connection
//               </Button>
//             </div>

//             {testMessage && (
//               <Alert className={testResult === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
//                 <AlertDescription className={testResult === 'success' ? 'text-green-800' : 'text-red-800'}>
//                   {testMessage}
//                 </AlertDescription>
//               </Alert>
//             )}
//           </div>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle>Setup Instructions</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="space-y-2">
//             <h4 className="font-semibold">1. Get AWS Credentials</h4>
//             <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
//               <li>Log into your AWS Console</li>
//               <li>Go to IAM → Users → Your User → Security Credentials</li>
//               <li>Create a new Access Key if needed</li>
//               <li>Ensure your user has DynamoDB and SES permissions</li>
//             </ul>
//           </div>

//           <div className="space-y-2">
//             <h4 className="font-semibold">2. Update Environment File</h4>
//             <div className="bg-gray-100 p-3 rounded-md font-mono text-sm">
//               <div>VITE_AWS_ACCESS_KEY_ID=your_access_key_here</div>
//               <div>VITE_AWS_SECRET_ACCESS_KEY=your_secret_key_here</div>
//               <div>VITE_AWS_REGION=us-east-1</div>
//               <div>VITE_SES_FROM_EMAIL=noreply@taddobbins.com</div>
//             </div>
//           </div>

//           <div className="space-y-2">
//             <h4 className="font-semibold">3. Restart Development Server</h4>
//             <p className="text-sm text-muted-foreground">
//               After updating your .env file, restart your development server for changes to take effect.
//             </p>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }