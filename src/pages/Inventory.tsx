import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertTriangle,
  ArrowLeft,
  Filter
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

const Inventory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: '',
    cost: '',
    stock: '',
    minStock: '',
    supplier: '',
    description: ''
  });

  useEffect(() => {
    const savedProducts = JSON.parse(localStorage.getItem('shop_products') || '[]');
    setProducts(savedProducts);
  }, []);

  const saveProducts = (updatedProducts) => {
    localStorage.setItem('shop_products', JSON.stringify(updatedProducts));
    setProducts(updatedProducts);
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const product = {
      id: Date.now().toString(),
      ...newProduct,
      price: parseFloat(newProduct.price),
      cost: parseFloat(newProduct.cost) || 0,
      stock: parseInt(newProduct.stock),
      minStock: parseInt(newProduct.minStock) || 5,
      createdAt: new Date().toISOString()
    };

    const updatedProducts = [...products, product];
    saveProducts(updatedProducts);
    
    setNewProduct({
      name: '',
      category: '',
      price: '',
      cost: '',
      stock: '',
      minStock: '',
      supplier: '',
      description: ''
    });
    setIsAddDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Product added successfully",
    });
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setNewProduct({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      cost: product.cost.toString(),
      stock: product.stock.toString(),
      minStock: product.minStock.toString(),
      supplier: product.supplier || '',
      description: product.description || ''
    });
    setIsAddDialogOpen(true);
  };

  const handleUpdateProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const updatedProduct = {
      ...editingProduct,
      ...newProduct,
      price: parseFloat(newProduct.price),
      cost: parseFloat(newProduct.cost) || 0,
      stock: parseInt(newProduct.stock),
      minStock: parseInt(newProduct.minStock) || 5,
      updatedAt: new Date().toISOString()
    };

    const updatedProducts = products.map(p => 
      p.id === editingProduct.id ? updatedProduct : p
    );
    saveProducts(updatedProducts);
    
    setNewProduct({
      name: '',
      category: '',
      price: '',
      cost: '',
      stock: '',
      minStock: '',
      supplier: '',
      description: ''
    });
    setEditingProduct(null);
    setIsAddDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Product updated successfully",
    });
  };

  const handleDeleteProduct = (productId) => {
    const updatedProducts = products.filter(p => p.id !== productId);
    saveProducts(updatedProducts);
    
    toast({
      title: "Success",
      description: "Product deleted successfully",
    });
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(products.map(p => p.category))].filter(Boolean);

  const getStockStatus = (product) => {
    if (product.stock <= product.minStock) {
      return { status: 'Low Stock', color: 'destructive' };
    } else if (product.stock <= product.minStock * 2) {
      return { status: 'Medium Stock', color: 'secondary' };
    }
    return { status: 'In Stock', color: 'default' };
  };

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
                <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
                <p className="text-gray-600">Manage your product inventory</p>
              </div>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingProduct(null);
                  setNewProduct({
                    name: '',
                    category: '',
                    price: '',
                    cost: '',
                    stock: '',
                    minStock: '',
                    supplier: '',
                    description: ''
                  });
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                  <DialogDescription>
                    {editingProduct ? 'Update product details' : 'Enter product information'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                      placeholder="Enter product name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                      placeholder="Enter category"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Selling Price *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cost">Cost Price</Label>
                      <Input
                        id="cost"
                        type="number"
                        step="0.01"
                        value={newProduct.cost}
                        onChange={(e) => setNewProduct({...newProduct, cost: e.target.value})}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="stock">Current Stock *</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={newProduct.stock}
                        onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="minStock">Min Stock Level</Label>
                      <Input
                        id="minStock"
                        type="number"
                        value={newProduct.minStock}
                        onChange={(e) => setNewProduct({...newProduct, minStock: e.target.value})}
                        placeholder="5"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="supplier">Supplier</Label>
                    <Input
                      id="supplier"
                      value={newProduct.supplier}
                      onChange={(e) => setNewProduct({...newProduct, supplier: e.target.value})}
                      placeholder="Enter supplier name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                      placeholder="Enter product description"
                    />
                  </div>
                  <Button 
                    onClick={editingProduct ? handleUpdateProduct : handleAddProduct}
                    className="w-full"
                  >
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Products List */}
        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Package className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 text-center mb-4">
                {products.length === 0 
                  ? "Start by adding your first product to the inventory."
                  : "No products match your search criteria."
                }
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product);
              return (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <CardDescription>{product.category}</CardDescription>
                      </div>
                      <Badge variant={stockStatus.color}>
                        {stockStatus.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-semibold">${product.price.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Stock:</span>
                        <span className={`font-semibold ${product.stock <= product.minStock ? 'text-red-600' : ''}`}>
                          {product.stock} units
                        </span>
                      </div>
                      {product.stock <= product.minStock && (
                        <div className="flex items-center text-red-600 text-sm">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Low stock alert
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Min Stock:</span>
                        <span>{product.minStock} units</span>
                      </div>
                      {product.supplier && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Supplier:</span>
                          <span>{product.supplier}</span>
                        </div>
                      )}
                      <div className="flex space-x-2 pt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                          className="flex-1"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="flex-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;