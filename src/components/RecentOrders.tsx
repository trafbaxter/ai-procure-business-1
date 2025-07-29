import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, MoreHorizontal } from 'lucide-react';

interface Order {
  id: string;
  supplier: string;
  amount: string;
  status: 'pending' | 'approved' | 'delivered' | 'cancelled';
  date: string;
  items: string;
}

const RecentOrders: React.FC = () => {
  const orders: Order[] = [
    {
      id: 'PO-2024-001',
      supplier: 'TechSupply Co.',
      amount: '$15,420',
      status: 'approved',
      date: '2024-01-15',
      items: 'Laptops, Monitors'
    },
    {
      id: 'PO-2024-002',
      supplier: 'Office Plus',
      amount: '$3,250',
      status: 'pending',
      date: '2024-01-14',
      items: 'Office Supplies'
    },
    {
      id: 'PO-2024-003',
      supplier: 'Industrial Parts Ltd',
      amount: '$28,900',
      status: 'delivered',
      date: '2024-01-12',
      items: 'Manufacturing Components'
    },
    {
      id: 'PO-2024-004',
      supplier: 'Green Energy Solutions',
      amount: '$45,600',
      status: 'approved',
      date: '2024-01-10',
      items: 'Solar Panels'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'delivered': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Recent Orders
          <Button variant="outline" size="sm">
            View All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-medium text-sm text-foreground">{order.id}</span>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  <div>{order.supplier}</div>
                  <div className="text-xs">{order.items}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-foreground">{order.amount}</div>
                <div className="text-xs text-muted-foreground">{order.date}</div>
              </div>
              <div className="ml-3 flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentOrders;