// API Service for external applications to interact with this app

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface AppData {
  stats: {
    totalOrders: number;
    pendingApprovals: number;
    activeSuppliers: number;
    monthlySavings: number;
  };
  recentOrders: Array<{
    id: string;
    supplier: string;
    amount: number;
    status: string;
    date: string;
  }>;
}

class ApiService {
  private validateApiKey(apiKey: string): boolean {
    const stored = localStorage.getItem('apiKeys');
    if (!stored) return false;
    
    const apiKeys = JSON.parse(stored);
    const validKey = apiKeys.find((key: any) => 
      key.key === apiKey && key.isActive
    );
    
    if (validKey) {
      // Update last used timestamp
      const updated = apiKeys.map((k: any) => 
        k.id === validKey.id 
          ? { ...k, lastUsed: new Date().toISOString() }
          : k
      );
      localStorage.setItem('apiKeys', JSON.stringify(updated));
      return true;
    }
    
    return false;
  }

  // Get app statistics
  async getStats(apiKey: string): Promise<ApiResponse> {
    if (!this.validateApiKey(apiKey)) {
      return { success: false, error: 'Invalid API key' };
    }

    const stats = {
      totalOrders: 1247,
      pendingApprovals: 23,
      activeSuppliers: 156,
      monthlySavings: 45000
    };

    return { success: true, data: stats };
  }

  // Get recent orders
  async getRecentOrders(apiKey: string): Promise<ApiResponse> {
    if (!this.validateApiKey(apiKey)) {
      return { success: false, error: 'Invalid API key' };
    }

    const orders = [
      { id: '1', supplier: 'TechCorp Solutions', amount: 15420, status: 'Approved', date: '2024-01-15' },
      { id: '2', supplier: 'Global Supplies Inc', amount: 8750, status: 'Pending', date: '2024-01-14' },
      { id: '3', supplier: 'Innovation Partners', amount: 22100, status: 'In Review', date: '2024-01-13' }
    ];

    return { success: true, data: orders };
  }

  // Get all app data
  async getAppData(apiKey: string): Promise<ApiResponse<AppData>> {
    if (!this.validateApiKey(apiKey)) {
      return { success: false, error: 'Invalid API key' };
    }

    const statsResponse = await this.getStats(apiKey);
    const ordersResponse = await this.getRecentOrders(apiKey);

    if (!statsResponse.success || !ordersResponse.success) {
      return { success: false, error: 'Failed to fetch app data' };
    }

    return {
      success: true,
      data: {
        stats: statsResponse.data,
        recentOrders: ordersResponse.data
      }
    };
  }

  // Create a new order (example POST endpoint)
  async createOrder(apiKey: string, orderData: any): Promise<ApiResponse> {
    if (!this.validateApiKey(apiKey)) {
      return { success: false, error: 'Invalid API key' };
    }

    // Simulate order creation
    const newOrder = {
      id: Date.now().toString(),
      ...orderData,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0]
    };

    return { 
      success: true, 
      data: newOrder, 
      message: 'Order created successfully' 
    };
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;

// Export types for external use
export type { ApiResponse, AppData };