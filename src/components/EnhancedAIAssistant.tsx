import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, MessageSquare, BarChart3, Settings, Zap } from 'lucide-react';
import AIChat from './AIChat';
import { Progress } from '@/components/ui/progress';

interface AICapability {
  id: string;
  name: string;
  description: string;
  accuracy: number;
  status: 'active' | 'training' | 'offline';
}

const EnhancedAIAssistant: React.FC = () => {
  const [capabilities] = useState<AICapability[]>([
    {
      id: 'supplier-analysis',
      name: 'Supplier Analysis',
      description: 'Evaluate supplier performance and recommendations',
      accuracy: 94,
      status: 'active'
    },
    {
      id: 'cost-optimization',
      name: 'Cost Optimization',
      description: 'Identify cost savings and budget optimization',
      accuracy: 89,
      status: 'active'
    },
    {
      id: 'demand-forecasting',
      name: 'Demand Forecasting',
      description: 'Predict future procurement needs',
      accuracy: 87,
      status: 'training'
    },
    {
      id: 'contract-analysis',
      name: 'Contract Analysis',
      description: 'Review and analyze contract terms',
      accuracy: 92,
      status: 'active'
    }
  ]);

  const [aiStats] = useState({
    totalQueries: 1247,
    avgResponseTime: '1.2s',
    successRate: 96.8,
    costSavingsGenerated: '$2.4M'
  });

  return (
    <div className="space-y-6">
      {/* AI Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Queries</p>
                <p className="text-2xl font-bold">{aiStats.totalQueries.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium">Avg Response</p>
                <p className="text-2xl font-bold">{aiStats.avgResponseTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Success Rate</p>
                <p className="text-2xl font-bold">{aiStats.successRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Cost Savings</p>
                <p className="text-2xl font-bold">{aiStats.costSavingsGenerated}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main AI Interface */}
      <Tabs defaultValue="chat" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat">AI Chat</TabsTrigger>
          <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat" className="space-y-4">
          <AIChat />
        </TabsContent>
        
        <TabsContent value="capabilities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Capabilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {capabilities.map((capability) => (
                <div key={capability.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{capability.name}</h3>
                    <Badge 
                      variant={capability.status === 'active' ? 'default' : 
                               capability.status === 'training' ? 'secondary' : 'destructive'}
                    >
                      {capability.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {capability.description}
                  </p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Accuracy</span>
                      <span>{capability.accuracy}%</span>
                    </div>
                    <Progress value={capability.accuracy} className="h-2" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                AI Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Response Style</h4>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" size="sm">Concise</Button>
                  <Button variant="default" size="sm">Detailed</Button>
                  <Button variant="outline" size="sm">Technical</Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Focus Areas</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">Cost Optimization</Button>
                  <Button variant="outline" size="sm">Supplier Management</Button>
                  <Button variant="outline" size="sm">Risk Analysis</Button>
                  <Button variant="outline" size="sm">Compliance</Button>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <Button className="w-full">Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedAIAssistant;