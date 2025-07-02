import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Package, Users, Clock } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, trend, icon, color }) => {
  return (
    <Card className={`border-l-4 ${color} hover:shadow-lg transition-shadow`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className="text-gray-400">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center text-xs mt-1">
          {trend === 'up' ? (
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
          )}
          <span className={trend === 'up' ? 'text-green-600' : 'text-red-600'}>
            {change}
          </span>
          <span className="text-gray-500 ml-1">from last month</span>
        </div>
      </CardContent>
    </Card>
  );
};

const DashboardStats: React.FC = () => {
  const stats = [
    {
      title: 'Total Spend',
      value: '$2.4M',
      change: '+12.5%',
      trend: 'up' as const,
      icon: <DollarSign className="h-4 w-4" />,
      color: 'border-l-green-500'
    },
    {
      title: 'Active Orders',
      value: '147',
      change: '+8.2%',
      trend: 'up' as const,
      icon: <Package className="h-4 w-4" />,
      color: 'border-l-blue-500'
    },
    {
      title: 'Suppliers',
      value: '89',
      change: '+5.1%',
      trend: 'up' as const,
      icon: <Users className="h-4 w-4" />,
      color: 'border-l-purple-500'
    },
    {
      title: 'Avg. Lead Time',
      value: '12 days',
      change: '-2.3%',
      trend: 'down' as const,
      icon: <Clock className="h-4 w-4" />,
      color: 'border-l-orange-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default DashboardStats;