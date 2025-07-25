import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Globe, Key } from 'lucide-react';

const ApiDocumentation: React.FC = () => {
  const baseUrl = window.location.origin;

  const endpoints = [
    {
      method: 'GET',
      path: '/api/stats',
      description: 'Get application statistics',
      response: `{
  "success": true,
  "data": {
    "totalOrders": 1247,
    "pendingApprovals": 23,
    "activeSuppliers": 156,
    "monthlySavings": 45000
  }
}`
    },
    {
      method: 'GET',
      path: '/api/orders',
      description: 'Get recent orders',
      response: `{
  "success": true,
  "data": [
    {
      "id": "1",
      "supplier": "TechCorp Solutions",
      "amount": 15420,
      "status": "Approved",
      "date": "2024-01-15"
    }
  ]
}`
    },
    {
      method: 'POST',
      path: '/api/orders',
      description: 'Create a new order',
      body: `{
  "supplier": "Example Corp",
  "amount": 10000,
  "description": "Office supplies"
}`,
      response: `{
  "success": true,
  "data": {
    "id": "123",
    "supplier": "Example Corp",
    "amount": 10000,
    "status": "Pending",
    "date": "2024-01-15"
  },
  "message": "Order created successfully"
}`
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          API Documentation
        </CardTitle>
        <CardDescription>
          Documentation for integrating with this application's API
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Authentication</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  All API requests require a valid API key to be included in the request headers.
                </p>
                <div className="bg-muted p-3 rounded-md">
                  <code className="text-sm">
                    Authorization: Bearer YOUR_API_KEY
                  </code>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Base URL</h3>
                <div className="bg-muted p-3 rounded-md">
                  <code className="text-sm">{baseUrl}</code>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Response Format</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  All responses follow a consistent JSON format:
                </p>
                <div className="bg-muted p-3 rounded-md">
                  <pre className="text-sm">{`{
  "success": boolean,
  "data": any,
  "error": string,
  "message": string
}`}</pre>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="endpoints" className="space-y-4">
            {endpoints.map((endpoint, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Badge variant={endpoint.method === 'GET' ? 'default' : 'secondary'}>
                      {endpoint.method}
                    </Badge>
                    <code className="text-sm">{endpoint.path}</code>
                  </div>
                  <CardDescription>{endpoint.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {endpoint.body && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Request Body:</h4>
                      <div className="bg-muted p-3 rounded-md">
                        <pre className="text-sm">{endpoint.body}</pre>
                      </div>
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Response:</h4>
                    <div className="bg-muted p-3 rounded-md">
                      <pre className="text-sm">{endpoint.response}</pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="examples" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">JavaScript Example</h3>
                <div className="bg-muted p-3 rounded-md">
                  <pre className="text-sm">{`// Fetch app statistics
const response = await fetch('${baseUrl}/api/stats', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
if (data.success) {
  console.log('Stats:', data.data);
} else {
  console.error('Error:', data.error);
}`}</pre>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">cURL Example</h3>
                <div className="bg-muted p-3 rounded-md">
                  <pre className="text-sm">{`curl -X GET "${baseUrl}/api/stats" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"`}</pre>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ApiDocumentation;