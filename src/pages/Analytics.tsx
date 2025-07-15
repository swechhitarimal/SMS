import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ArrowLeft,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Calendar,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const Analytics = () => {
  const navigate = useNavigate();
  const [timeFilter, setTimeFilter] = useState('30');
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalSales: 0,
    averageOrderValue: 0,
    topProducts: [],
    salesByDay: [],
    salesByCategory: [],
    customerStats: {
      totalCustomers: 0,
      returningCustomers: 0,
      newCustomers: 0
    }
  });

  useEffect(() => {
    calculateAnalytics();
  }, [timeFilter]);

  const calculateAnalytics = () => {
    const sales = JSON.parse(localStorage.getItem('shop_sales') || '[]');
    const products = JSON.parse(localStorage.getItem('shop_products') || '[]');
    const customers = JSON.parse(localStorage.getItem('shop_customers') || '[]');

    // Filter sales by time period
    const daysAgo = parseInt(timeFilter);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
    
    const filteredSales = sales.filter(sale => 
      new Date(sale.date) >= cutoffDate
    );

    // Calculate basic metrics
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalSales = filteredSales.length;
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Calculate top products
    const productSales = {};
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        if (!productSales[item.name]) {
          productSales[item.name] = { quantity: 0, revenue: 0 };
        }
        productSales[item.name].quantity += item.quantity;
        productSales[item.name].revenue += item.total;
      });
    });

    const topProducts = Object.entries(productSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Calculate sales by day
    const salesByDay = [];
    for (let i = daysAgo - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const daySales = filteredSales.filter(sale => 
        sale.date.split('T')[0] === dateStr
      );
      
      salesByDay.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sales: daySales.length,
        revenue: daySales.reduce((sum, sale) => sum + sale.total, 0)
      });
    }

    // Calculate sales by category
    const categorySales = {};
    filteredSales.forEach(sale => {
      sale.items.forEach(item => {
        const product = products.find(p => p.name === item.name);
        const category = product?.category || 'Uncategorized';
        
        if (!categorySales[category]) {
          categorySales[category] = 0;
        }
        categorySales[category] += item.total;
      });
    });

    const salesByCategory = Object.entries(categorySales)
      .map(([category, revenue]) => ({ category, revenue }))
      .sort((a, b) => b.revenue - a.revenue);

    // Calculate customer stats
    const customerStats = {
      totalCustomers: customers.length,
      returningCustomers: customers.filter(c => c.purchaseCount > 1).length,
      newCustomers: customers.filter(c => {
        const joinDate = new Date(c.createdAt);
        return joinDate >= cutoffDate;
      }).length
    };

    setAnalytics({
      totalRevenue,
      totalSales,
      averageOrderValue,
      topProducts,
      salesByDay,
      salesByCategory,
      customerStats
    });
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
                <p className="text-gray-600">Track your business performance</p>
              </div>
            </div>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Last {timeFilter} days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalSales}</div>
              <p className="text-xs text-muted-foreground">
                Orders completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${analytics.averageOrderValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Per transaction
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.customerStats.newCustomers}</div>
              <p className="text-xs text-muted-foreground">
                New registrations
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Trend</CardTitle>
              <CardDescription>Daily sales and revenue over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.salesByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="sales" fill="#8884d8" name="Orders" />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#82ca9d" name="Revenue ($)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Sales by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
              <CardDescription>Revenue distribution across product categories</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.salesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {analytics.salesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Products & Customer Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
              <CardDescription>Best performing products by revenue</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.topProducts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No sales data available</p>
              ) : (
                <div className="space-y-4">
                  {analytics.topProducts.map((product, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.quantity} units sold</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${product.revenue.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">Revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Statistics</CardTitle>
              <CardDescription>Customer base insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium">Total Customers</p>
                    <p className="text-sm text-gray-600">All registered customers</p>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {analytics.customerStats.totalCustomers}
                  </div>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium">Returning Customers</p>
                    <p className="text-sm text-gray-600">Customers with multiple orders</p>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {analytics.customerStats.returningCustomers}
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                  <div>
                    <p className="font-medium">New Customers</p>
                    <p className="text-sm text-gray-600">Joined in selected period</p>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    {analytics.customerStats.newCustomers}
                  </div>
                </div>

                {analytics.customerStats.totalCustomers > 0 && (
                  <div className="pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span>Customer Retention Rate:</span>
                      <span className="font-semibold">
                        {((analytics.customerStats.returningCustomers / analytics.customerStats.totalCustomers) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;