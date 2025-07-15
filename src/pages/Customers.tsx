import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  ArrowLeft,
  Mail,
  Calendar,
  DollarSign,
  Edit,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

const Customers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });

  useEffect(() => {
    const savedCustomers = JSON.parse(localStorage.getItem('shop_customers') || '[]');
    const savedSales = JSON.parse(localStorage.getItem('shop_sales') || '[]');
    
    // Calculate customer stats
    const customersWithStats = savedCustomers.map(customer => {
      const customerSales = savedSales.filter(sale => 
        sale.customerEmail === customer.email || sale.customerName === customer.name
      );
      const totalPurchases = customerSales.reduce((sum, sale) => sum + sale.total, 0);
      const lastPurchase = customerSales.length > 0 
        ? Math.max(...customerSales.map(sale => new Date(sale.date).getTime()))
        : null;
      
      return {
        ...customer,
        totalPurchases,
        purchaseCount: customerSales.length,
        lastPurchase: lastPurchase ? new Date(lastPurchase).toISOString() : null
      };
    });
    
    setCustomers(customersWithStats);
    setSales(savedSales);
  }, []);

  const saveCustomers = (updatedCustomers) => {
    localStorage.setItem('shop_customers', JSON.stringify(updatedCustomers));
    setCustomers(updatedCustomers);
  };

  const handleAddCustomer = () => {
    if (!newCustomer.name || !newCustomer.email) {
      toast({
        title: "Error",
        description: "Please fill in name and email fields",
        variant: "destructive",
      });
      return;
    }

    // Check if email already exists
    if (customers.find(c => c.email === newCustomer.email)) {
      toast({
        title: "Error",
        description: "Customer with this email already exists",
        variant: "destructive",
      });
      return;
    }

    const customer = {
      id: Date.now().toString(),
      ...newCustomer,
      totalPurchases: 0,
      purchaseCount: 0,
      lastPurchase: null,
      createdAt: new Date().toISOString()
    };

    const updatedCustomers = [...customers, customer];
    saveCustomers(updatedCustomers);
    
    setNewCustomer({
      name: '',
      email: '',
      phone: '',
      address: '',
      notes: ''
    });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Customer added successfully",
    });
  };

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setNewCustomer({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
      address: customer.address || '',
      notes: customer.notes || ''
    });
    setIsAddDialogOpen(true);
  };

  const handleUpdateCustomer = () => {
    if (!newCustomer.name || !newCustomer.email) {
      toast({
        title: "Error",
        description: "Please fill in name and email fields",
        variant: "destructive",
      });
      return;
    }

    // Check if email already exists (excluding current customer)
    if (customers.find(c => c.email === newCustomer.email && c.id !== editingCustomer.id)) {
      toast({
        title: "Error",
        description: "Customer with this email already exists",
        variant: "destructive",
      });
      return;
    }

    const updatedCustomer = {
      ...editingCustomer,
      ...newCustomer,
      updatedAt: new Date().toISOString()
    };

    const updatedCustomers = customers.map(c => 
      c.id === editingCustomer.id ? updatedCustomer : c
    );
    saveCustomers(updatedCustomers);
    
    setNewCustomer({
      name: '',
      email: '',
      phone: '',
      address: '',
      notes: ''
    });
    setEditingCustomer(null);
    setIsAddDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Customer updated successfully",
    });
  };

  const handleDeleteCustomer = (customerId) => {
    const updatedCustomers = customers.filter(c => c.id !== customerId);
    saveCustomers(updatedCustomers);
    
    toast({
      title: "Success",
      description: "Customer deleted successfully",
    });
  };

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
                <p className="text-gray-600">Manage your customer database</p>
              </div>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingCustomer(null);
                  setNewCustomer({
                    name: '',
                    email: '',
                    phone: '',
                    address: '',
                    notes: ''
                  });
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
                  <DialogDescription>
                    {editingCustomer ? 'Update customer information' : 'Enter customer details'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={newCustomer.address}
                      onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                      placeholder="Enter address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Input
                      id="notes"
                      value={newCustomer.notes}
                      onChange={(e) => setNewCustomer({...newCustomer, notes: e.target.value})}
                      placeholder="Additional notes"
                    />
                  </div>
                  <Button 
                    onClick={editingCustomer ? handleUpdateCustomer : handleAddCustomer}
                    className="w-full"
                  >
                    {editingCustomer ? 'Update Customer' : 'Add Customer'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search customers by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Customer Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {customers.filter(c => c.purchaseCount > 0).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customer Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${customers.reduce((sum, c) => sum + c.totalPurchases, 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customers List */}
        {filteredCustomers.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Users className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No customers found</h3>
              <p className="text-gray-600 text-center mb-4">
                {customers.length === 0 
                  ? "Start by adding your first customer to the database."
                  : "No customers match your search criteria."
                }
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Customer
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map((customer) => (
              <Card key={customer.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{customer.name}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Mail className="w-4 h-4 mr-1" />
                        {customer.email}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {customer.phone && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span>{customer.phone}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Purchases:</span>
                      <span className="font-semibold">${customer.totalPurchases.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Orders:</span>
                      <span>{customer.purchaseCount}</span>
                    </div>
                    {customer.lastPurchase && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Purchase:</span>
                        <span className="text-sm">
                          {new Date(customer.lastPurchase).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Member Since:</span>
                      <span className="text-sm">
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {customer.address && (
                      <div>
                        <span className="text-gray-600">Address:</span>
                        <p className="text-sm mt-1">{customer.address}</p>
                      </div>
                    )}
                    {customer.notes && (
                      <div>
                        <span className="text-gray-600">Notes:</span>
                        <p className="text-sm mt-1">{customer.notes}</p>
                      </div>
                    )}
                    <div className="flex space-x-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCustomer(customer)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCustomer(customer.id)}
                        className="flex-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Customers;