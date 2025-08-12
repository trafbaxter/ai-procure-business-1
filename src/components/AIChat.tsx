import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Send, User, Loader2, FileText, TrendingUp, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'action' | 'suggestion';
}

interface AIAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
}

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI procurement assistant. I can help you with supplier analysis, cost optimization, order management, and procurement insights. What would you like to work on today?',
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions: AIAction[] = [
    {
      id: 'analyze-spend',
      title: 'Analyze Spending',
      description: 'Get insights on procurement spending patterns',
      icon: <TrendingUp className="w-4 h-4" />,
      action: () => handleQuickAction('analyze-spend')
    },
    {
      id: 'find-suppliers',
      title: 'Find Suppliers',
      description: 'Search for qualified suppliers',
      icon: <Package className="w-4 h-4" />,
      action: () => handleQuickAction('find-suppliers')
    },
    {
      id: 'generate-report',
      title: 'Generate Report',
      description: 'Create procurement performance reports',
      icon: <FileText className="w-4 h-4" />,
      action: () => handleQuickAction('generate-report')
    }
  ];

  const handleQuickAction = (actionId: string) => {
    const actionMessages = {
      'analyze-spend': 'Please analyze our procurement spending patterns for the last quarter.',
      'find-suppliers': 'Help me find qualified suppliers for office supplies.',
      'generate-report': 'Generate a procurement performance report for this month.'
    };
    
    const message = actionMessages[actionId as keyof typeof actionMessages];
    if (message) {
      setInput(message);
    }
  };

  const getAIResponse = async (userMessage: string): Promise<string> => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const msg = userMessage.toLowerCase();
    
    if (msg.includes('spend') || msg.includes('cost') || msg.includes('budget')) {
      return `Based on your spending analysis request, I've identified several key insights:

• Total procurement spend: $2.4M (15% increase from last quarter)
• Top spending categories: Office supplies (32%), IT equipment (28%), Services (25%)
• Cost savings opportunities: Consolidating suppliers could save ~8-12%
• Recommended actions: Negotiate volume discounts with top 3 suppliers

Would you like me to generate a detailed spending report or explore specific cost optimization strategies?`;
    }
    
    if (msg.includes('supplier') || msg.includes('vendor')) {
      return `I found several qualified suppliers for your requirements:

🏢 **Premium Office Solutions**
- Rating: 4.8/5 | Certified: ISO 9001
- Specialties: Office supplies, furniture
- Avg. delivery: 2-3 days | Payment terms: Net 30

🏢 **Global Supply Co.**
- Rating: 4.6/5 | Certified: ISO 14001
- Specialties: Bulk orders, custom solutions  
- Avg. delivery: 5-7 days | Payment terms: Net 45

Would you like detailed proposals from these suppliers or should I search for additional options?`;
    }
    
    if (msg.includes('report') || msg.includes('performance')) {
      return `I've generated your procurement performance report:

📊 **Key Metrics (This Month)**
• Orders processed: 156 (+12% vs last month)
• Average order value: $3,240
• On-time delivery rate: 94.2%
• Supplier satisfaction score: 4.7/5
• Cost savings achieved: $48,600

📈 **Trends & Insights**
• IT equipment orders increased 25%
• New supplier onboarding improved efficiency by 18%
• Emergency orders decreased by 8%

The full detailed report has been generated. Would you like me to email it to you or export specific sections?`;
    }
    
    return `I understand you're asking about "${userMessage}". I can help you with:

• **Supplier Management**: Find, evaluate, and manage vendor relationships
• **Cost Analysis**: Analyze spending patterns and identify savings opportunities  
• **Order Tracking**: Monitor purchase orders and delivery status
• **Performance Reports**: Generate insights on procurement metrics
• **Contract Management**: Review terms and compliance tracking

What specific area would you like to explore further?`;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
      type: 'text'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const aiResponse = await getAIResponse(userMessage.content);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          AI Procurement Assistant
          <Badge variant="secondary" className="ml-auto">
            Online
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Quick Actions */}
        <div className="flex gap-2 flex-wrap">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              onClick={action.action}
              className="text-xs"
            >
              {action.icon}
              <span className="ml-1 hidden sm:inline">{action.title}</span>
            </Button>
          ))}
        </div>
        
        {/* Messages */}
        <ScrollArea className="flex-1 h-96">
          <div className="space-y-4 pr-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className={`flex items-start gap-2 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                      {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-foreground'
                    }`}>
                      <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                      <div className={`text-xs mt-1 ${
                        message.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      AI is thinking...
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        {/* Input */}
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about suppliers, costs, orders, or anything procurement-related..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="min-h-[60px] resize-none"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSend} 
            disabled={!input.trim() || isLoading}
            className="px-3"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIChat;