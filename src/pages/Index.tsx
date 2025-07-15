import React, { useState, useEffect } from 'react';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  DollarSign,
  AlertTriangle,
  Plus,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    totalCustomers: 0,
    revenue: 0,
    lowStock: 0
  });

  const [recentSales, setRecentSales] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);

  useEffect(() => {
    // Load data from localStorage
    const products = JSON.parse(localStorage.getItem('shop_products') || '[]');
    const sales = JSON.parse(localStorage.getItem('shop_sales') || '[]');
    const customers = JSON.parse(localStorage.getItem('shop_customers') || '[]');

    const lowStock = products.filter(p => p.stock <= p.minStock);
    const revenue = sales.reduce((sum, sale) => sum + sale.total, 0);

    setStats({
      totalProducts: products.length,
      totalSales: sales.length,
      totalCustomers: customers.length,
      revenue,
      lowStock: lowStock.length
    });

    setRecentSales(sales.slice(-5).reverse());
    setLowStockItems(lowStock.slice(0, 5));
  }, []);

  const quickActions = [
    {
      title: "Add Product",
      description: "Add new product to inventory",
      icon: Package,
      color: "bg-blue-500",
      action: () => navigate('/inventory')
    },
    {
      title: "New Sale",
      description: "Process a new sale",
      icon: ShoppingCart,
      color: "bg-green-500",
      action: () => navigate('/sales')
    },
    {
      title: "Add Customer",
      description: "Register new customer",
      icon: Users,
      color: "bg-purple-500",
      action: () => navigate('/customers')
    },
    {
      title: "View Reports",
      description: "Analytics and insights",
      icon: TrendingUp,
      color: "bg-orange-500",
      action: () => navigate('/analytics')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Shop Management System</h1>
              <p className="text-gray-600">Manage your store efficiently</p>
            </div>
            <div className="flex space-x-4">
              <Button onClick={() => navigate('/inventory')} variant="outline">
                <Package className="w-4 h-4 mr-2" />
                Inventory
              </Button>
              <Button onClick={() => navigate('/sales')} variant="outline">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Sales
              </Button>
              <Button onClick={() => navigate('/customers')} variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Customers
              </Button>
              <Button onClick={() => navigate('/analytics')}>
                <TrendingUp className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSales}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.revenue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Alert</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{stats.lowStock}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={action.action}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${action.color} text-white`}>
                      <action.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Sales */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
              <CardDescription>Latest transactions in your store</CardDescription>
            </CardHeader>
            <CardContent>
              {recentSales.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No sales yet</p>
              ) : (
                <div className="space-y-3">
                  {recentSales.map((sale, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Sale #{sale.id}</p>
                        <p className="text-sm text-gray-600">{sale.customerName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${sale.total.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">{new Date(sale.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Low Stock Alert */}
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Alert</CardTitle>
              <CardDescription>Products that need restocking</CardDescription>
            </CardHeader>
            <CardContent>
              {lowStockItems.length === 0 ? (
                <p className="text-gray-500 text-center py-4">All products are well stocked</p>
              ) : (
                <div className="space-y-3">
                  {lowStockItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.category}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="destructive">{item.stock} left</Badge>
                        <p className="text-sm text-gray-600">Min: {item.minStock}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;