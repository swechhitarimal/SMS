import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  ArrowLeft,
  Trash2,
  User,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

const Sales = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);
  
  const [newSale, setNewSale] = useState({
    customerName: '',
    customerEmail: '',
    items: [],
    paymentMethod: 'cash',
    notes: ''
  });

  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const savedSales = JSON.parse(localStorage.getItem('shop_sales') || '[]');
    const savedProducts = JSON.parse(localStorage.getItem('shop_products') || '[]');
    const savedCustomers = JSON.parse(localStorage.getItem('shop_customers') || '[]');
    
    setSales(savedSales);
    setProducts(savedProducts);
    setCustomers(savedCustomers);
  }, []);

  const saveSales = (updatedSales) => {
    localStorage.setItem('shop_sales', JSON.stringify(updatedSales));
    setSales(updatedSales);
  };

  const updateProductStock = (productId, quantitySold) => {
    const updatedProducts = products.map(product => {
      if (product.id === productId) {
        return { ...product, stock: product.stock - quantitySold };
      }
      return product;
    });
    localStorage.setItem('shop_products', JSON.stringify(updatedProducts));
    setProducts(updatedProducts);
  };

  const addItemToSale = () => {
    if (!selectedProduct || quantity <= 0) return;

    const product = products.find(p => p.id === selectedProduct);
    if (!product || product.stock < quantity) {
      toast({
        title: "Error",
        description: "Insufficient stock for this product",
        variant: "destructive",
      });
      return;
    }

    const existingItemIndex = newSale.items.findIndex(item => item.productId === selectedProduct);
    let updatedItems;

    if (existingItemIndex > -1) {
      updatedItems = newSale.items.map((item, index) => {
        if (index === existingItemIndex) {
          const newQuantity = item.quantity + quantity;
          return {
            ...item,
            quantity: newQuantity,
            total: product.price * newQuantity
          };
        }
        return item;
      });
    } else {
      const newItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        total: product.price * quantity
      };
      updatedItems = [...newSale.items, newItem];
    }

    setNewSale({ ...newSale, items: updatedItems });
    setSelectedProduct('');
    setQuantity(1);
  };

  const removeItemFromSale = (index) => {
    const updatedItems = newSale.items.filter((_, i) => i !== index);
    setNewSale({ ...newSale, items: updatedItems });
  };

  const calculateTotal = () => {
    return newSale.items.reduce((sum, item) => sum + item.total, 0);
  };

  const completeSale = () => {
    if (!newSale.customerName || newSale.items.length === 0) {
      toast({
        title: "Error",
        description: "Please add customer name and at least one item",
        variant: "destructive",
      });
      return;
    }

    const sale = {
      id: Date.now().toString(),
      customerName: newSale.customerName,
      customerEmail: newSale.customerEmail,
      items: newSale.items,
      total: calculateTotal(),
      paymentMethod: newSale.paymentMethod,
      notes: newSale.notes,
      date: new Date().toISOString(),
      status: 'completed'
    };

    // Update stock for each item
    newSale.items.forEach(item => {
      updateProductStock(item.productId, item.quantity);
    });

    // Save the sale
    const updatedSales = [sale, ...sales];
    saveSales(updatedSales);

    // Add customer if new
    if (newSale.customerEmail && !customers.find(c => c.email === newSale.customerEmail)) {
      const newCustomer = {
        id: Date.now().toString(),
        name: newSale.customerName,
        email: newSale.customerEmail,
        totalPurchases: calculateTotal(),
        lastPurchase: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      const updatedCustomers = [...customers, newCustomer];
      localStorage.setItem('shop_customers', JSON.stringify(updatedCustomers));
      setCustomers(updatedCustomers);
    }

    // Reset form
    setNewSale({
      customerName: '',
      customerEmail: '',
      items: [],
      paymentMethod: 'cash',
      notes: ''
    });
    setIsNewSaleOpen(false);

    toast({
      title: "Success",
      description: "Sale completed successfully",
    });
  };

  const filteredSales = sales.filter(sale => 
    sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.id.includes(searchTerm)
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
                <h1 className="text-2xl font-bold text-gray-900">Sales Management</h1>
                <p className="text-gray-600">Process sales and view transaction history</p>
              </div>
            </div>
            <Dialog open={isNewSaleOpen} onOpenChange={setIsNewSaleOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Sale
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>New Sale</DialogTitle>
                  <DialogDescription>
                    Process a new sale transaction
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Customer Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Customer Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="customerName">Customer Name *</Label>
                        <Input
                          id="customerName"
                          value={newSale.customerName}
                          onChange={(e) => setNewSale({...newSale, customerName: e.target.value})}
                          placeholder="Enter customer name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="customerEmail">Customer Email</Label>
                        <Input
                          id="customerEmail"
                          type="email"
                          value={newSale.customerEmail}
                          onChange={(e) => setNewSale({...newSale, customerEmail: e.target.value})}
                          placeholder="Enter customer email"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Add Items */}
                  <div className="space-y-4">
                    <h3 className="font-semibold">Add Items</h3>
                    <div className="flex gap-4">
                      <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.filter(p => p.stock > 0).map(product => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} - ${product.price.toFixed(2)} (Stock: {product.stock})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        placeholder="Qty"
                        className="w-20"
                      />
                      <Button onClick={addItemToSale} disabled={!selectedProduct}>
                        Add
                      </Button>
                    </div>
                  </div>

                  {/* Sale Items */}
                  {newSale.items.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-semibold">Sale Items</h3>
                      <div className="space-y-2">
                        {newSale.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-600">
                                ${item.price.toFixed(2)} × {item.quantity}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold">${item.total.toFixed(2)}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItemFromSale(index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg font-bold">
                          <span>Total:</span>
                          <span>${calculateTotal().toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment & Notes */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="paymentMethod">Payment Method</Label>
                      <Select value={newSale.paymentMethod} onValueChange={(value) => setNewSale({...newSale, paymentMethod: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Input
                        id="notes"
                        value={newSale.notes}
                        onChange={(e) => setNewSale({...newSale, notes: e.target.value})}
                        placeholder="Additional notes"
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={completeSale}
                    className="w-full"
                    disabled={newSale.items.length === 0}
                  >
                    Complete Sale - ${calculateTotal().toFixed(2)}
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
              placeholder="Search sales by customer name or sale ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Sales List */}
        {filteredSales.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <ShoppingCart className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No sales found</h3>
              <p className="text-gray-600 text-center mb-4">
                {sales.length === 0 
                  ? "Start by processing your first sale."
                  : "No sales match your search criteria."
                }
              </p>
              <Button onClick={() => setIsNewSaleOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Sale
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredSales.map((sale) => (
              <Card key={sale.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Sale #{sale.id}</CardTitle>
                      <CardDescription className="flex items-center space-x-4 mt-1">
                        <span className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {sale.customerName}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(sale.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          ${sale.total.toFixed(2)}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge variant="default">
                      {sale.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">Items:</h4>
                      <div className="space-y-1">
                        {sale.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.name} × {item.quantity}</span>
                            <span>${item.total.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <div className="text-sm text-gray-600">
                        Payment: {sale.paymentMethod.replace('_', ' ').toUpperCase()}
                      </div>
                      <div className="font-bold">
                        Total: ${sale.total.toFixed(2)}
                      </div>
                    </div>
                    {sale.notes && (
                      <div className="text-sm text-gray-600">
                        <strong>Notes:</strong> {sale.notes}
                      </div>
                    )}
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

export default Sales;
