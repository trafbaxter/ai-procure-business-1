import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Send, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const AIAssistant: React.FC = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I\'m your AI procurement assistant. How can I help you today?' }
  ]);

  const getAIResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase().trim();
    
    // More specific keyword matching
    if (msg.includes('supplier') || msg.includes('vendor') || msg.includes('source')) {
      return `I can help you find qualified suppliers for your procurement needs. Based on your query "${userMessage}", would you like me to search for suppliers in a specific category, location, or industry sector?`;
    } 
    
    if (msg.includes('cost') || msg.includes('price') || msg.includes('budget') || msg.includes('spend')) {
      return `I can analyze costs and help optimize your procurement budget. For "${userMessage}", I can provide cost breakdowns, budget forecasts, or spending analysis. What specific cost information do you need?`;
    } 
    
    if (msg.includes('order') || msg.includes('purchase') || msg.includes('buy')) {
      return `I can help track orders and manage purchase requests. Regarding "${userMessage}", would you like to check order status, create a new purchase request, or review existing orders?`;
    } 
    
    if (msg.includes('contract') || msg.includes('agreement') || msg.includes('terms')) {
      return `I can assist with contract management and vendor agreements. For your question about "${userMessage}", I can help with contract reviews, terms negotiation, or compliance tracking.`;
    } 
    
    if (msg.includes('inventory') || msg.includes('stock') || msg.includes('warehouse')) {
      return `I can help manage inventory levels and stock optimization. Based on "${userMessage}", I can provide stock levels, reorder recommendations, or inventory forecasts.`;
    } 
    
    if (msg.includes('report') || msg.includes('analytics') || msg.includes('data')) {
      return `I can generate procurement reports and analytics. For "${userMessage}", I can create spending reports, supplier performance analytics, or custom dashboards. What metrics interest you?`;
    } 
    
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('help') || msg === '') {
      return 'Hello! I\'m here to assist with procurement tasks like finding suppliers, analyzing costs, tracking orders, and generating reports. What can I help you with today?';
    }
    
    // Default response that acknowledges the specific question
    return `Thanks for asking about "${userMessage}". I specialize in procurement assistance including supplier management, cost analysis, order tracking, contract management, inventory optimization, and reporting. Could you tell me more specifically what you'd like help with?`;
  };

  const handleSend = () => {
    if (!message.trim()) return;
    
    const userMsg = message.trim();
    const aiResponse = getAIResponse(userMsg);
    
    setMessages(prev => [...prev, 
      { role: 'user', content: userMsg },
      { role: 'assistant', content: aiResponse }
    ]);
    setMessage('');
  };

  return (
    <Card className="h-full border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/20 dark:to-blue-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
          <Bot className="h-5 w-5" />
          AI Assistant
          <Badge variant="secondary" className="ml-auto bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">
            <Sparkles className="h-3 w-3 mr-1" />
            Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-64 overflow-y-auto space-y-3 p-3 bg-white/50 dark:bg-gray-900/50 rounded-lg border dark:border-gray-700">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-2 rounded-lg text-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-500 text-white dark:bg-blue-600' 
                  : 'bg-white dark:bg-gray-800 border dark:border-gray-600 shadow-sm text-foreground'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about suppliers, costs, orders..."
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1"
          />
          <Button onClick={handleSend} size="icon" className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIAssistant;