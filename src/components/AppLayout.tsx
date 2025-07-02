import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { useIsMobile } from '@/hooks/use-mobile';
import ProcurementHeader from './ProcurementHeader';
import DashboardStats from './DashboardStats';
import AIAssistant from './AIAssistant';
import RecentOrders from './RecentOrders';

const AppLayout: React.FC = () => {
  const { sidebarOpen, toggleSidebar } = useAppContext();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gray-50">
      <ProcurementHeader />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Procurement Dashboard</h2>
          <p className="text-gray-600">Monitor your procurement operations with AI-powered insights</p>
        </div>
        
        <div className="space-y-6">
          <DashboardStats />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RecentOrders />
            </div>
            <div className="lg:col-span-1">
              <AIAssistant />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppLayout;