"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Package,
  Plus,
  Search,
  Trash2,
  Eye,
  Star,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ShoppingCart,
  Target,
  Zap,
  Wrench,
  Shirt,
  Trophy,
  Tag,
  Copy,
  Archive,
} from "lucide-react";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  category: 'balls' | 'shoes' | 'bags' | 'accessories' | 'apparel' | 'lane-equipment';
  brand: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  condition: 'new' | 'like-new' | 'good' | 'fair';
  description: string;
  images: string[];
  inStock: boolean;
  stockQuantity: number;
  lowStockThreshold: number;
  specifications?: { [key: string]: string };
  tags: string[];
  featured: boolean;
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
  views: number;
  likes: number;
  sales: number;
  rating: number;
  reviewCount: number;
}

export default function ProductsPage() {
  const { user } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('updated');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Mock data
  const mockProducts: Product[] = [
    {
      id: 1,
      name: "Storm Phaze II Bowling Ball",
      category: 'balls',
      brand: "Storm",
      price: 180,
      originalPrice: 220,
      discountPercentage: 18,
      condition: 'new',
      description: "Professional grade reactive resin ball, perfect for intermediate to advanced players. Features the innovative R2S coverstock.",
      images: ["/api/placeholder/400/400", "/api/placeholder/400/400"],
      inStock: true,
      stockQuantity: 8,
      lowStockThreshold: 3,
      specifications: {
        "Weight": "15 lbs",
        "Coverstock": "R2S Solid Reactive",
        "Core": "Phaze II Core",
        "RG": "2.49",
        "Differential": "0.051"
      },
      tags: ["Reactive Resin", "Tournament", "Advanced"],
      featured: true,
      status: 'active',
      createdAt: '2025-08-15',
      updatedAt: '2025-08-28',
      views: 156,
      likes: 23,
      sales: 5,
      rating: 4.8,
      reviewCount: 12
    },
    {
      id: 2,
      name: "Professional Bowling Shoes - Dexter SST 8",
      category: 'shoes',
      brand: "Dexter",
      price: 140,
      condition: 'new',
      description: "High-performance bowling shoes with interchangeable soles and heels for professional bowlers.",
      images: ["/api/placeholder/400/400"],
      inStock: true,
      stockQuantity: 15,
      lowStockThreshold: 5,
      specifications: {
        "Size Range": "7-13",
        "Material": "Leather/Synthetic",
        "Sole Type": "Interchangeable",
        "Heel Type": "Interchangeable"
      },
      tags: ["Professional", "Interchangeable", "Tournament"],
      featured: false,
      status: 'active',
      createdAt: '2025-08-20',
      updatedAt: '2025-08-25',
      views: 89,
      likes: 15,
      sales: 3,
      rating: 4.6,
      reviewCount: 8
    },
    {
      id: 3,
      name: "Vintage Brunswick House Ball Set",
      category: 'balls',
      brand: "Brunswick",
      price: 300,
      originalPrice: 500,
      discountPercentage: 40,
      condition: 'good',
      description: "Set of 5 house balls in excellent condition. Perfect for home chatter or smaller centers.",
      images: ["/api/placeholder/400/400"],
      inStock: true,
      stockQuantity: 2,
      lowStockThreshold: 1,
      specifications: {
        "Weight Range": "12-16 lbs",
        "Material": "Polyester",
        "Quantity": "5 balls"
      },
      tags: ["House Balls", "Set", "Vintage"],
      featured: false,
      status: 'active',
      createdAt: '2025-08-10',
      updatedAt: '2025-08-20',
      views: 234,
      likes: 45,
      sales: 1,
      rating: 4.2,
      reviewCount: 5
    },
    {
      id: 4,
      name: "Lane Conditioning Machine - Kegel",
      category: 'lane-equipment',
      brand: "Kegel",
      price: 15000,
      originalPrice: 25000,
      discountPercentage: 40,
      condition: 'good',
      description: "Professional lane conditioning machine. Well maintained, perfect for bowling centers looking to upgrade.",
      images: ["/api/placeholder/400/400"],
      inStock: true,
      stockQuantity: 1,
      lowStockThreshold: 1,
      specifications: {
        "Model": "Kegel Ikon",
        "Oil Capacity": "5 gallons",
        "Power": "110V",
        "Weight": "450 lbs"
      },
      tags: ["Professional", "Lane Conditioning", "Kegel"],
      featured: true,
      status: 'active',
      createdAt: '2025-08-05',
      updatedAt: '2025-08-15',
      views: 78,
      likes: 12,
      sales: 0,
      rating: 0,
      reviewCount: 0
    },
    {
      id: 5,
      name: "Brunswick Rhino Bowling Ball",
      category: 'balls',
      brand: "Brunswick",
      price: 85,
      condition: 'new',
      description: "Entry-level reactive ball perfect for beginners transitioning from plastic balls.",
      images: ["/api/placeholder/400/400"],
      inStock: false,
      stockQuantity: 0,
      lowStockThreshold: 2,
      specifications: {
        "Weight": "14 lbs",
        "Coverstock": "R-16 Reactive",
        "Core": "Light Bulb Core"
      },
      tags: ["Entry Level", "Reactive", "Beginner"],
      featured: false,
      status: 'draft',
      createdAt: '2025-08-25',
      updatedAt: '2025-08-25',
      views: 12,
      likes: 2,
      sales: 0,
      rating: 0,
      reviewCount: 0
    }
  ];

  const categories = [
    { id: 'balls', name: 'Bowling Balls', icon: Target, color: 'bg-red-100 text-red-600' },
    { id: 'shoes', name: 'Bowling Shoes', icon: Zap, color: 'bg-blue-100 text-blue-600' },
    { id: 'bags', name: 'Bags & Cases', icon: ShoppingCart, color: 'bg-purple-100 text-purple-600' },
    { id: 'accessories', name: 'Accessories', icon: Wrench, color: 'bg-yellow-100 text-yellow-600' },
    { id: 'apparel', name: 'Apparel', icon: Shirt, color: 'bg-green-100 text-green-600' },
    { id: 'lane-equipment', name: 'Lane Equipment', icon: Trophy, color: 'bg-indigo-100 text-indigo-600' },
  ];

  useEffect(() => {
    setProducts(mockProducts);
  }, []);

  useEffect(() => {
    const filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesStatus = statusFilter === 'all' || product.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'price-high': return b.price - a.price;
        case 'price-low': return a.price - b.price;
        case 'sales': return b.sales - a.sales;
        case 'rating': return b.rating - a.rating;
        case 'created': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'updated':
        default: return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, statusFilter, sortBy]);

  const handleSelectProduct = (productId: number) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockStatus = (product: Product) => {
    if (!product.inStock || product.stockQuantity === 0) {
      return { color: 'text-red-600', icon: XCircle, text: 'Out of Stock' };
    } else if (product.stockQuantity <= product.lowStockThreshold) {
      return { color: 'text-yellow-600', icon: AlertTriangle, text: 'Low Stock' };
    } else {
      return { color: 'text-green-600', icon: CheckCircle, text: 'In Stock' };
    }
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.icon : Package;
  };

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.color : 'bg-gray-100 text-gray-600';
  };

  const bulkActions = [
    { id: 'activate', label: 'Activate', icon: CheckCircle },
    { id: 'deactivate', label: 'Deactivate', icon: XCircle },
    { id: 'feature', label: 'Feature', icon: Star },
    { id: 'archive', label: 'Archive', icon: Archive },
    { id: 'delete', label: 'Delete', icon: Trash2 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
              <p className="text-gray-600 mt-1">
                Manage your bowling equipment inventory and marketplace listings
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/products/add"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Product
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Total Products</p>
                  <p className="text-2xl font-bold">{products.length}</p>
                </div>
                <Package className="w-8 h-8 text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Active Listings</p>
                  <p className="text-2xl font-bold">{products.filter(p => p.status === 'active').length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">Low Stock Items</p>
                  <p className="text-2xl font-bold">
                    {products.filter(p => p.stockQuantity <= p.lowStockThreshold).length}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Total Sales</p>
                  <p className="text-2xl font-bold">{products.reduce((sum, p) => sum + p.sales, 0)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-200" />
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 relative min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products, brands, descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="updated">Recently Updated</option>
                <option value="created">Recently Created</option>
                <option value="name">Name A-Z</option>
                <option value="price-high">Price: High to Low</option>
                <option value="price-low">Price: Low to High</option>
                <option value="sales">Best Selling</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedProducts.length > 0 && (
        <div className="bg-green-50 border-b border-green-200">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-green-800">
                  {selectedProducts.length} product(s) selected
                </span>
                <div className="flex items-center gap-2">
                  {bulkActions.map((action) => (
                    <button
                      key={action.id}
                      className="px-3 py-1 text-sm bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-1 transition-colors"
                    >
                      <action.icon className="w-4 h-4" />
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setSelectedProducts([])}
                className="text-green-600 hover:text-green-800 text-sm"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid/List */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {filteredProducts.length > 0 ? (
          <div className="space-y-6">
            {/* View Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-600">
                  Select All ({filteredProducts.length} products)
                </span>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product);
                const CategoryIcon = getCategoryIcon(product.category);

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Product Image */}
                    <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <CategoryIcon className="w-12 h-12 mx-auto mb-2" />
                          <p className="text-sm font-medium">{product.brand}</p>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {product.featured && (
                          <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-bold">
                            ⭐ FEATURED
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(product.status)}`}>
                          {product.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="absolute top-3 right-3">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                      </div>

                      {product.discountPercentage && (
                        <div className="absolute bottom-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                          -{product.discountPercentage}% OFF
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-6 h-6 rounded flex items-center justify-center ${getCategoryColor(product.category)}`}>
                          <CategoryIcon className="w-4 h-4" />
                        </div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                          {categories.find(c => c.id === product.category)?.name}
                        </span>
                      </div>

                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>

                      <div className="flex items-center gap-2 mb-2">
                        <stockStatus.icon className={`w-4 h-4 ${stockStatus.color}`} />
                        <span className={`text-sm ${stockStatus.color}`}>{stockStatus.text}</span>
                        <span className="text-xs text-gray-500">({product.stockQuantity} left)</span>
                      </div>

                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {product.tags.slice(0, 2).map((tag, index) => (
                          <span key={index} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Pricing */}
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-lg font-bold text-green-600">${product.price}</span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-sm text-gray-500 line-through ml-2">${product.originalPrice}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          {product.rating > 0 ? product.rating.toFixed(1) : 'No rating'}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-500 mb-3 border-t pt-2">
                        <div>
                          <Eye className="w-3 h-3 mx-auto mb-1" />
                          {product.views} views
                        </div>
                        <div>
                          <Star className="w-3 h-3 mx-auto mb-1" />
                          {product.likes} likes
                        </div>
                        <div>
                          <ShoppingCart className="w-3 h-3 mx-auto mb-1" />
                          {product.sales} sales
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/products/${product.id}/edit`}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-medium text-center transition-colors"
                        >
                          Edit
                        </Link>
                        <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'Get started by adding your first product to the inventory.'}
            </p>
            {!searchTerm && selectedCategory === 'all' && statusFilter === 'all' && (
              <Link
                href="/products/add"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Your First Product
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
