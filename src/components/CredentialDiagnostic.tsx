// import React, { useState, useEffect } from 'react';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { Button } from '@/components/ui/button';
// import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
// import { getAwsCredentials } from '@/config/awsCredentials';
// import { dynamoUserService } from '@/services/dynamoUserService';

// export const CredentialDiagnostic: React.FC = () => {
//   const [diagnostics, setDiagnostics] = useState<any>(null);
//   const [testing, setTesting] = useState(false);

//   const runDiagnostics = async () => {
//     setTesting(true);
//     const creds = getAwsCredentials();
    
//     // Test DynamoDB connection
//     let dbConnectionTest = 'unknown';
//     let dbError = '';
    
//     try {
//       const testUser = await dynamoUserService.getUserByEmail('test@test.com');
//       dbConnectionTest = 'success';
//     } catch (error: any) {
//       dbConnectionTest = 'failed';
//       dbError = error.message || error.toString();
//     }

//     setDiagnostics({
//       credentials: creds,
//       dbConnection: dbConnectionTest,
//       dbError,
//       envVars: {
//         accessKey: import.meta.env.VITE_AWS_ACCESS_KEY_ID || 'NOT SET',
//         secretKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY ? 'SET' : 'NOT SET',
//         region: import.meta.env.VITE_AWS_REGION || 'NOT SET',
//         tableName: import.meta.env.VITE_DYNAMODB_USERS_TABLE || 'NOT SET'
//       }
//     });
//     setTesting(false);
//   };

//   useEffect(() => {
//     runDiagnostics();
//   }, []);

//   if (!diagnostics) {
//     return <div>Loading diagnostics...</div>;
//   }

//   const StatusIcon = ({ status }: { status: string }) => {
//     if (status === 'success') return <CheckCircle className="h-4 w-4 text-green-500" />;
//     if (status === 'failed') return <XCircle className="h-4 w-4 text-red-500" />;
//     return <AlertCircle className="h-4 w-4 text-yellow-500" />;
//   };

//   return (
//     <div className="space-y-4">
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             AWS Credential Diagnostics
//             <Button onClick={runDiagnostics} disabled={testing} size="sm">
//               <RefreshCw className={`h-4 w-4 ${testing ? 'animate-spin' : ''}`} />
//             </Button>
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div>
//             <h3 className="font-semibold mb-2">Environment Variables</h3>
//             <div className="space-y-1 text-sm">
//               <div>Access Key: {diagnostics.envVars.accessKey.substring(0, 8)}...</div>
//               <div>Secret Key: {diagnostics.envVars.secretKey}</div>
//               <div>Region: {diagnostics.envVars.region}</div>
//               <div>Table: {diagnostics.envVars.tableName}</div>
//             </div>
//           </div>

//           <div>
//             <h3 className="font-semibold mb-2 flex items-center gap-2">
//               <StatusIcon status={diagnostics.credentials.isValid ? 'success' : 'failed'} />
//               Credential Validation
//             </h3>
//             {diagnostics.credentials.error && (
//               <Alert>
//                 <AlertDescription>{diagnostics.credentials.error}</AlertDescription>
//               </Alert>
//             )}
//           </div>

//           <div>
//             <h3 className="font-semibold mb-2 flex items-center gap-2">
//               <StatusIcon status={diagnostics.dbConnection} />
//               DynamoDB Connection
//             </h3>
//             {diagnostics.dbError && (
//               <Alert>
//                 <AlertDescription>Error: {diagnostics.dbError}</AlertDescription>
//               </Alert>
//             )}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };