import React from 'react';
import { Button } from '@/components/ui/button';
import { Search, Bot } from 'lucide-react';
import { Input } from '@/components/ui/input';
import UserDropdown from './UserDropdown';
import { ThemeToggle } from './ThemeToggle';

const ProcurementHeader: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Bot className="h-8 w-8 text-yellow-300" />
            <h1 className="text-2xl font-bold">ProcureAI</h1>
          </div>
          
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search suppliers, products, orders..."
                className="pl-10 bg-white/10 border-white/20 text-white placeholder-white/70"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <UserDropdown />
          </div>
        </div>
      </div>
    </header>
  );
};

export default ProcurementHeader;