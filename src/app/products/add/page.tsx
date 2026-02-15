"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  Save,
  X,
  Plus,
  DollarSign,
  Package,
  Tag,
  FileText,
  Camera,
  Percent,
  Star,
  Eye,
  CheckCircle,
  Target,
  Zap,
  ShoppingCart,
  Wrench,
  Shirt,
  Trophy,
  Info,
  Trash2,
} from "lucide-react";
import Link from "next/link";

interface ProductForm {
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
}

export default function AddProductPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState<ProductForm>({
    name: '',
    category: '',
    brand: '',
    price: 0,
    originalPrice: 0,
    condition: 'new',
    description: '',
    images: [],
    stockQuantity: 0,
    lowStockThreshold: 3,
    specifications: {},
    tags: [],
    featured: false,
    status: 'draft'
  });

  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [newTag, setNewTag] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

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

  const handleInputChange = (field: keyof ProductForm, value: string | number | string[] | boolean) => {
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
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addImageUrl = () => {
    setImageUrls(prev => [...prev, '']);
  };

  const updateImageUrl = (index: number, url: string) => {
    setImageUrls(prev => prev.map((img, i) => i === index ? url : img));
    setFormData(prev => ({
      ...prev,
      images: imageUrls.filter(url => url.trim() !== '')
    }));
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

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
    if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.stockQuantity < 0) newErrors.stockQuantity = 'Stock quantity cannot be negative';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (status: 'draft' | 'active') => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const productData = {
        ...formData,
        status,
        images: imageUrls.filter(url => url.trim() !== ''),
        discountPercentage: formData.originalPrice > formData.price
          ? Math.round(((formData.originalPrice - formData.price) / formData.originalPrice) * 100)
          : 0
      };

      // Here you would typically send the data to your API
      console.log('Product data:', productData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Redirect to products page
      router.push('/products');
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const discountPercentage = formData.originalPrice > formData.price && formData.originalPrice > 0
    ? Math.round(((formData.originalPrice - formData.price) / formData.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/products"
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
                <p className="text-gray-600 mt-1">
                  Create a new product listing for your bowling center marketplace
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                {previewMode ? 'Edit' : 'Preview'}
              </button>
              <button
                onClick={() => handleSubmit('draft')}
                disabled={isSubmitting}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Draft
              </button>
              <button
                onClick={() => handleSubmit('active')}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                {isSubmitting ? 'Publishing...' : 'Publish Product'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
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
                    value={formData.name}
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
                    value={formData.category}
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
                    value={formData.brand}
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
                    value={formData.condition}
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
                    value={formData.description}
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
                    value={formData.price}
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
                    value={formData.originalPrice}
                    onChange={(e) => handleInputChange('originalPrice', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Used to show discount percentage
                  </p>
                </div>

                {discountPercentage > 0 && (
                  <div className="md:col-span-2">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-green-800">
                        <Percent className="w-4 h-4" />
                        <span className="font-medium">Discount Applied</span>
                      </div>
                      <p className="text-green-700 text-sm mt-1">
                        Your product will show a <strong>{discountPercentage}% discount</strong> from the original price.
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
                    value={formData.stockQuantity}
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
                    value={formData.lowStockThreshold}
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

            {/* Product Images */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Camera className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">Product Images</h2>
              </div>

              <div className="space-y-4">
                {imageUrls.map((url, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-1">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => updateImageUrl(index, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Enter image URL"
                      />
                    </div>
                    {imageUrls.length > 1 && (
                      <button
                        onClick={() => removeImageUrl(index)}
                        className="p-2 text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  onClick={addImageUrl}
                  className="flex items-center gap-2 px-4 py-2 text-green-600 border border-green-300 rounded-lg hover:bg-green-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Another Image
                </button>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Image Guidelines:</p>
                      <ul className="space-y-1">
                        <li>• Use high-quality images (minimum 400x400px)</li>
                        <li>• Show multiple angles of the product</li>
                        <li>• First image will be used as the main thumbnail</li>
                        <li>• Supported formats: JPG, PNG, WebP</li>
                      </ul>
                    </div>
                  </div>
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
                {Object.entries(formData.specifications).map(([key, value]) => (
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
                    placeholder="Specification name (e.g., Weight, Material)"
                  />
                  <input
                    type="text"
                    value={newSpecValue}
                    onChange={(e) => setNewSpecValue(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Value (e.g., 15 lbs, Reactive Resin)"
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
                  {formData.tags.map((tag) => (
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
                    placeholder="Add tags (e.g., Professional, Tournament, Beginner)"
                  />
                  <button
                    onClick={addTag}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-gray-500">
                  Tags help customers find your products. Press Enter or click + to add tags.
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status & Visibility */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status & Visibility</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Publication Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="draft">Draft - Not visible to customers</option>
                    <option value="active">Active - Visible in marketplace</option>
                    <option value="archived">Archived - Hidden from marketplace</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      Featured Product
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Featured products appear prominently in search results
                    </p>
                  </label>
                </div>
              </div>
            </div>

            {/* Product Preview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Preview</h3>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Mini Product Card Preview */}
                <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      {formData.category && (
                        <>
                          {(() => {
                            const CategoryIcon = categories.find(c => c.id === formData.category)?.icon || Package;
                            return <CategoryIcon className="w-8 h-8 mx-auto mb-1" />;
                          })()}
                        </>
                      )}
                      <p className="text-xs font-medium">{formData.brand || 'Brand'}</p>
                    </div>
                  </div>

                  {formData.featured && (
                    <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-bold">
                      ⭐ FEATURED
                    </div>
                  )}

                  {discountPercentage > 0 && (
                    <div className="absolute bottom-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                      -{discountPercentage}% OFF
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
                    {formData.name || 'Product Name'}
                  </h4>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-green-600">${formData.price || 0}</span>
                      {formData.originalPrice > formData.price && formData.originalPrice > 0 && (
                        <span className="text-sm text-gray-500 line-through ml-2">${formData.originalPrice}</span>
                      )}
                    </div>
                  </div>

                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Tips</h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span className="text-gray-700">Add detailed specifications for better search visibility</span>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span className="text-gray-700">Use high-quality images to attract more customers</span>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span className="text-gray-700">Set competitive pricing based on condition and market value</span>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <span className="text-gray-700">Add relevant tags to help customers discover your products</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
