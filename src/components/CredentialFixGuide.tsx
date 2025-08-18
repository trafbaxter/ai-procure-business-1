// import React from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { AlertTriangle, Key, RefreshCw, CheckCircle } from 'lucide-react';
// import { Button } from '@/components/ui/button';

// export function CredentialFixGuide() {
//   const handleRefresh = () => {
//     window.location.reload();
//   };

//   return (
//     <div className="max-w-4xl mx-auto p-6 space-y-6">
//       <Card className="border-red-200 bg-red-50">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2 text-red-700">
//             <AlertTriangle className="h-5 w-5" />
//             AWS Credential Error Detected
//           </CardTitle>
//           <CardDescription className="text-red-600">
//             InvalidSignatureException: Your AWS credentials are invalid or corrupted
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <Alert className="border-red-200 bg-red-50">
//             <Key className="h-4 w-4" />
//             <AlertDescription className="text-red-700">
//               <strong>Issue:</strong> The AWS Secret Access Key signature doesn't match. This usually means:
//               <ul className="list-disc list-inside mt-2 space-y-1">
//                 <li>The Secret Access Key is incorrect or has been regenerated</li>
//                 <li>There are extra spaces or characters in the credential</li>
//                 <li>The credentials have expired or been deactivated</li>
//               </ul>
//             </AlertDescription>
//           </Alert>

//           <div className="space-y-3">
//             <h3 className="font-semibold text-red-700">Quick Fix Steps:</h3>
            
//             <div className="space-y-2">
//               <div className="flex items-start gap-3 p-3 bg-white rounded border">
//                 <div className="bg-red-100 text-red-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
//                 <div>
//                   <p className="font-medium">Check AWS Console</p>
//                   <p className="text-sm text-gray-600">Log into AWS Console → IAM → Users → Your User → Security Credentials</p>
//                 </div>
//               </div>

//               <div className="flex items-start gap-3 p-3 bg-white rounded border">
//                 <div className="bg-red-100 text-red-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
//                 <div>
//                   <p className="font-medium">Generate New Access Key</p>
//                   <p className="text-sm text-gray-600">Create a new Access Key pair if the current one is compromised</p>
//                 </div>
//               </div>

//               <div className="flex items-start gap-3 p-3 bg-white rounded border">
//                 <div className="bg-red-100 text-red-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
//                 <div>
//                   <p className="font-medium">Update .env File</p>
//                   <p className="text-sm text-gray-600">Copy the exact credentials (no extra spaces) to your .env file</p>
//                 </div>
//               </div>

//               <div className="flex items-start gap-3 p-3 bg-white rounded border">
//                 <div className="bg-red-100 text-red-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
//                 <div>
//                   <p className="font-medium">Restart Development Server</p>
//                   <p className="text-sm text-gray-600">Stop your dev server (Ctrl+C) and restart it for changes to take effect</p>
//                 </div>
//               </div>
//             </div>

//             <div className="flex gap-3 pt-4">
//               <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2">
//                 <RefreshCw className="h-4 w-4" />
//                 Refresh Page
//               </Button>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <CheckCircle className="h-5 w-5 text-green-600" />
//             Required Environment Variables
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
//             <div>VITE_AWS_REGION=us-east-1</div>
//             <div>VITE_AWS_ACCESS_KEY_ID=AKIA...</div>
//             <div>VITE_AWS_SECRET_ACCESS_KEY=...</div>
//             <div>VITE_SES_FROM_EMAIL=noreply@yourcompany.com</div>
//             <div>VITE_DYNAMODB_USERS_TABLE=Procurement-Users</div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }