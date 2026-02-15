"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import {
  Save,
  X,
  Plus,
  DollarSign,
  Package,
  Tag,
  FileText,
  Percent,
  Star,
  Eye,
  AlertTriangle,
  Target,
  Zap,
  ShoppingCart,
  Wrench,
  Shirt,
  Trophy,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  category: string;
  brand: string;
  price: number;
  originalPrice: number;
  condition: string;
  description: string;
  images: string[];
  stockQuantity: number;
  lowStockThreshold: number;
  specifications: { [key: string]: string };
  tags: string[];
  featured: boolean;
  status: string;
  views: number;
  likes: number;
  sales: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function EditProductPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [newTag, setNewTag] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'edit' | 'analytics'>('edit');

  const categories = [
    { id: 'balls', name: 'Bowling Balls', icon: Target },
    { id: 'shoes', name: 'Bowling Shoes', icon: Zap },
    { id: 'bags', name: 'Bags & Cases', icon: ShoppingCart },
    { id: 'accessories', name: 'Accessories', icon: Wrench },
    { id: 'apparel', name: 'Apparel', icon: Shirt },
    { id: 'lane-equipment', name: 'Lane Equipment', icon: Trophy },
  ];

  const conditions = [
    { value: 'new', label: 'New', description: 'Brand new, never used' },
    { value: 'like-new', label: 'Like New', description: 'Minimal use, excellent condition' },
    { value: 'good', label: 'Good', description: 'Some wear but fully functional' },
    { value: 'fair', label: 'Fair', description: 'Noticeable wear but usable' },
  ];

  // Mock product data based on the ID
  const mockProduct: Product = {
    id: parseInt(productId),
    name: "Storm Phaze II Bowling Ball",
    category: 'balls',
    brand: "Storm",
    price: 180,
    originalPrice: 220,
    condition: 'new',
    description: "Professional grade reactive resin ball, perfect for intermediate to advanced players. Features the innovative R2S coverstock.",
    images: ["/api/placeholder/400/400", "/api/placeholder/400/400"],
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
    views: 156,
    likes: 23,
    sales: 5,
    rating: 4.8,
    reviewCount: 12,
    createdAt: '2025-08-15',
    updatedAt: '2025-08-28'
  };

  useEffect(() => {
    // Simulate loading product data
    const loadProduct = async () => {
      setIsLoading(true);
      try {
        // In a real app, you'd fetch from your API
        await new Promise(resolve => setTimeout(resolve, 500));
        setProduct(mockProduct);
        setFormData(mockProduct);
        setImageUrls(mockProduct.images.length > 0 ? mockProduct.images : ['']);
      } catch (error) {
        console.error('Error loading product:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  const handleInputChange = (field: keyof Product, value: string | number | string[] | boolean | { [key: string]: string }) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addSpecification = () => {
    if (newSpecKey.trim() && newSpecValue.trim()) {
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [newSpecKey.trim()]: newSpecValue.trim()
        }
      }));
      setNewSpecKey('');
      setNewSpecValue('');
    }
  };

  const removeSpecification = (key: string) => {
    setFormData(prev => {
      const newSpecs = { ...prev.specifications };
      delete newSpecs[key];
      return { ...prev, specifications: newSpecs };
    });
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  const updateImageUrl = (index: number, url: string) => {
    setImageUrls(prev => prev.map((img, i) => i === index ? url : img));
    setFormData(prev => ({
      ...prev,
      images: imageUrls.filter(url => url.trim() !== '')
    }));
  };

  const addImageUrl = () => {
    setImageUrls(prev => [...prev, '']);
  };

  const removeImageUrl = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: imageUrls.filter((url, i) => i !== index && url.trim() !== '')
    }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name?.trim()) newErrors.name = 'Product name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.brand?.trim()) newErrors.brand = 'Brand is required';
    if ((formData.price || 0) <= 0) newErrors.price = 'Price must be greater than 0';
    if (!formData.description?.trim()) newErrors.description = 'Description is required';
    if ((formData.stockQuantity || 0) < 0) newErrors.stockQuantity = 'Stock quantity cannot be negative';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const productData = {
        ...formData,
        images: imageUrls.filter(url => url.trim() !== ''),
        discountPercentage: (formData.originalPrice || 0) > (formData.price || 0) && (formData.originalPrice || 0) > 0
          ? Math.round((((formData.originalPrice || 0) - (formData.price || 0)) / (formData.originalPrice || 0)) * 100)
          : 0,
        updatedAt: new Date().toISOString()
      };

      // Here you would typically send the data to your API
      console.log('Updated product data:', productData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirect to products page
      router.push('/products');
    } catch (error) {
      console.error('Error updating product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const discountPercentage = (formData.originalPrice || 0) > (formData.price || 0) && (formData.originalPrice || 0) > 0
    ? Math.round((((formData.originalPrice || 0) - (formData.price || 0)) / (formData.originalPrice || 0)) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-green-600 animate-pulse" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Product</h3>
          <p className="text-gray-600">Please wait while we fetch the product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Product Not Found</h3>
          <p className="text-gray-600 mb-4">The product you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            href="/products"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link
                href="/products"
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
                <p className="text-gray-600 mt-1">
                  Update your product listing and manage inventory
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-6 border-b border-gray-200">
            {[
              { id: 'edit', label: 'Edit Product', icon: FileText },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'edit' | 'analytics')}
                className={`flex items-center gap-2 px-1 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'edit' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Package className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.name ? 'border-red-300' : 'border-gray-300'
                        }`}
                      placeholder="e.g., Storm Phaze II Bowling Ball"
                    />
                    {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category || ''}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.category ? 'border-red-300' : 'border-gray-300'
                        }`}
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                    {errors.category && <p className="text-red-600 text-sm mt-1">{errors.category}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand *
                    </label>
                    <input
                      type="text"
                      value={formData.brand || ''}
                      onChange={(e) => handleInputChange('brand', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.brand ? 'border-red-300' : 'border-gray-300'
                        }`}
                      placeholder="e.g., Storm, Brunswick, Dexter"
                    />
                    {errors.brand && <p className="text-red-600 text-sm mt-1">{errors.brand}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Condition *
                    </label>
                    <select
                      value={formData.condition || ''}
                      onChange={(e) => handleInputChange('condition', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {conditions.map((condition) => (
                        <option key={condition.value} value={condition.value}>
                          {condition.label} - {condition.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.description ? 'border-red-300' : 'border-gray-300'
                        }`}
                      placeholder="Detailed description of the product, its features, and condition..."
                    />
                    {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Pricing</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selling Price * ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price || 0}
                      onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.price ? 'border-red-300' : 'border-gray-300'
                        }`}
                      placeholder="0.00"
                    />
                    {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Original Price ($) <span className="text-gray-500">(optional)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.originalPrice || 0}
                      onChange={(e) => handleInputChange('originalPrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0.00"
                    />
                  </div>

                  {discountPercentage > 0 && (
                    <div className="md:col-span-2">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-green-800">
                          <Percent className="w-4 h-4" />
                          <span className="font-medium">Discount Applied</span>
                        </div>
                        <p className="text-green-700 text-sm mt-1">
                          Your product shows a <strong>{discountPercentage}% discount</strong> from the original price.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Inventory */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Package className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Inventory</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stockQuantity || 0}
                      onChange={(e) => handleInputChange('stockQuantity', parseInt(e.target.value) || 0)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.stockQuantity ? 'border-red-300' : 'border-gray-300'
                        }`}
                      placeholder="0"
                    />
                    {errors.stockQuantity && <p className="text-red-600 text-sm mt-1">{errors.stockQuantity}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Low Stock Alert Threshold
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.lowStockThreshold || 0}
                      onChange={(e) => handleInputChange('lowStockThreshold', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="3"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Get alerted when stock falls below this number
                    </p>
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <FileText className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Specifications</h2>
                </div>

                <div className="space-y-4">
                  {Object.entries(formData.specifications || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div className="font-medium text-gray-900">{key}</div>
                        <div className="text-gray-600">{value}</div>
                      </div>
                      <button
                        onClick={() => removeSpecification(key)}
                        className="p-1 text-red-600 hover:text-red-800 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={newSpecKey}
                      onChange={(e) => setNewSpecKey(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Specification name"
                    />
                    <input
                      type="text"
                      value={newSpecValue}
                      onChange={(e) => setNewSpecValue(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Value"
                    />
                    <button
                      onClick={addSpecification}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Tag className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Tags</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {(formData.tags || []).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Add tags"
                    />
                    <button
                      onClick={addTag}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Product Status */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Status</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Publication Status
                    </label>
                    <select
                      value={formData.status || ''}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured || false}
                      onChange={(e) => handleInputChange('featured', e.target.checked)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        Featured Product
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Product Stats */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Performance</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Views</span>
                    </div>
                    <span className="font-medium text-gray-900">{product.views}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Likes</span>
                    </div>
                    <span className="font-medium text-gray-900">{product.likes}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Sales</span>
                    </div>
                    <span className="font-medium text-green-600">{product.sales}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">Rating</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {product.rating.toFixed(1)} ({product.reviewCount} reviews)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Analytics Tab */
          <div className="space-y-8">
            {/* Analytics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Views</p>
                    <p className="text-2xl font-bold text-blue-600">{product.views}</p>
                  </div>
                  <Eye className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Likes</p>
                    <p className="text-2xl font-bold text-purple-600">{product.likes}</p>
                  </div>
                  <Star className="w-8 h-8 text-purple-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Sales</p>
                    <p className="text-2xl font-bold text-green-600">{product.sales}</p>
                  </div>
                  <ShoppingCart className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Revenue</p>
                    <p className="text-2xl font-bold text-yellow-600">${(product.sales * product.price).toFixed(0)}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
            </div>

            {/* Analytics Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Insights</h3>

              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Detailed Analytics Coming Soon</h4>
                <p className="text-gray-600">
                  We&apos;re working on comprehensive analytics including conversion rates, traffic sources, and performance trends.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
