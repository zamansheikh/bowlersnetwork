'use client';

import { useState } from 'react';
import { Search, Star, Tag, ShoppingCart, Users, Package, Zap, Shirt, Target, Wrench, Trophy, User, Shield } from 'lucide-react';
import Image from 'next/image';

interface Product {
  id: number;
  name: string;
  category: 'balls' | 'shoes' | 'bags' | 'accessories' | 'apparel' | 'lane-equipment';
  sellerType: 'amateur' | 'pro' | 'center' | 'manufacturer';
  sellerName: string;
  sellerRating: number;
  reviewCount: number;
  price: number;
  originalPrice?: number;
  condition: 'new' | 'like-new' | 'good' | 'fair';
  description: string;
  image: string;
  location: string;
  postedDate: string;
  tags: string[];
  brand: string;
  specifications?: { [key: string]: string };
  inStock: boolean;
  isFeatured?: boolean;
}

const mockProducts: Product[] = [
  // Pro Player Products
  {
    id: 1,
    name: "Storm Phaze II Bowling Ball",
    category: 'balls',
    sellerType: 'pro',
    sellerName: "Mike Jensen",
    sellerRating: 4.9,
    reviewCount: 87,
    price: 180,
    originalPrice: 220,
    condition: 'like-new',
    description: "Professional grade reactive resin ball, barely used. Perfect for intermediate to advanced players.",
    image: "/api/placeholder/300/300",
    location: "Brooklyn, NY",
    postedDate: "2 days ago",
    tags: ["Reactive Resin", "15 lbs", "Pro Used"],
    brand: "Storm",
    inStock: true,
    isFeatured: true
  },
  {
    id: 2,
    name: "Professional Bowling Shirt - Team USA",
    category: 'apparel',
    sellerType: 'pro',
    sellerName: "Jason Belmonte Store",
    sellerRating: 5.0,
    reviewCount: 78,
    price: 65,
    condition: 'new',
    description: "Official Team USA bowling shirt. Moisture-wicking fabric with professional cut.",
    image: "/api/placeholder/300/300",
    location: "Pro Shop Direct",
    postedDate: "4 days ago",
    tags: ["Team USA", "Moisture Wicking", "Professional"],
    brand: "Team USA",
    inStock: true
  },
  {
    id: 3,
    name: "Pro Performance Wrist Support",
    category: 'accessories',
    sellerType: 'pro',
    sellerName: "EJ Tackett Official",
    sellerRating: 4.9,
    reviewCount: 156,
    price: 75,
    condition: 'new',
    description: "Tournament-grade wrist support used by PBA professionals. Provides excellent support and consistency.",
    image: "/api/placeholder/300/300",
    location: "Tournament Circuit",
    postedDate: "1 week ago",
    tags: ["Tournament Grade", "PBA Approved", "Professional"],
    brand: "Robby's",
    inStock: true,
    isFeatured: true
  },

  // Bowling Center Products
  {
    id: 4,
    name: "House Ball Set - 12-16 lbs",
    category: 'balls',
    sellerType: 'center',
    sellerName: "Sunset Chatter Pro Shop",
    sellerRating: 4.7,
    reviewCount: 45,
    price: 300,
    originalPrice: 500,
    condition: 'good',
    description: "Set of 5 house balls in excellent condition. Perfect for home chatter or smaller centers.",
    image: "/api/placeholder/300/300",
    location: "Sunset Chatter, CA",
    postedDate: "3 days ago",
    tags: ["House Balls", "Set of 5", "Multiple Weights"],
    brand: "Brunswick",
    inStock: true
  },
  {
    id: 5,
    name: "Rental Shoes Collection - 20 Pairs",
    category: 'shoes',
    sellerType: 'center',
    sellerName: "Strike Zone Bowling",
    sellerRating: 4.5,
    reviewCount: 32,
    price: 400,
    originalPrice: 800,
    condition: 'good',
    description: "Collection of rental shoes in good condition. Various sizes from 6-14. Great for starting a pro shop.",
    image: "/api/placeholder/300/300",
    location: "Strike Zone, TX",
    postedDate: "5 days ago",
    tags: ["Rental Shoes", "Bulk Sale", "Various Sizes"],
    brand: "Dexter",
    inStock: true
  },
  {
    id: 6,
    name: "Lane Conditioning Machine",
    category: 'lane-equipment',
    sellerType: 'center',
    sellerName: "Maple Chatter Bowling Center",
    sellerRating: 4.8,
    reviewCount: 23,
    price: 15000,
    originalPrice: 25000,
    condition: 'good',
    description: "Professional lane conditioning machine. Well maintained, perfect for bowling centers looking to upgrade.",
    image: "/api/placeholder/300/300",
    location: "Maple Chatter, OH",
    postedDate: "1 week ago",
    tags: ["Professional", "Lane Conditioning", "Bowling Center"],
    brand: "Kegel",
    inStock: true,
    isFeatured: true
  },

  // Manufacturer Products
  {
    id: 7,
    name: "Hammer Black Widow 2.0",
    category: 'balls',
    sellerType: 'manufacturer',
    sellerName: "Hammer Bowling Official",
    sellerRating: 4.8,
    reviewCount: 143,
    price: 210,
    condition: 'new',
    description: "Brand new Hammer Black Widow 2.0. Aggressive hook potential for heavy oil conditions.",
    image: "/api/placeholder/300/300",
    location: "Manufacturer Direct",
    postedDate: "2 days ago",
    tags: ["16 lbs", "Heavy Oil", "Undrilled", "New"],
    brand: "Hammer",
    inStock: true,
    isFeatured: true
  },
  {
    id: 8,
    name: "Brunswick Edge 4-Ball Roller Bag",
    category: 'bags',
    sellerType: 'manufacturer',
    sellerName: "Brunswick Official",
    sellerRating: 4.8,
    reviewCount: 156,
    price: 320,
    condition: 'new',
    description: "Brand new 4-ball roller bag with premium wheels and durable construction.",
    image: "/api/placeholder/300/300",
    location: "Manufacturer Direct",
    postedDate: "1 week ago",
    tags: ["4-Ball", "Roller", "Tournament", "New"],
    brand: "Brunswick",
    inStock: true,
    isFeatured: true
  },
  {
    id: 9,
    name: "Lane Conditioning Oil - House Shot",
    category: 'lane-equipment',
    sellerType: 'manufacturer',
    sellerName: "Kegel Training Center",
    sellerRating: 4.9,
    reviewCount: 92,
    price: 45,
    condition: 'new',
    description: "Professional lane conditioning oil for house shot patterns. 5-gallon container.",
    image: "/api/placeholder/300/300",
    location: "Lake Wales, FL",
    postedDate: "1 week ago",
    tags: ["House Shot", "5 Gallon", "Professional"],
    brand: "Kegel",
    inStock: true
  },

  // Amateur Player Products
  {
    id: 10,
    name: "Motiv Venom Shock",
    category: 'balls',
    sellerType: 'amateur',
    sellerName: "Tony Rodriguez",
    sellerRating: 4.7,
    reviewCount: 34,
    price: 95,
    originalPrice: 150,
    condition: 'good',
    description: "Great entry-level reactive ball. Has been my go-to ball for 2 years.",
    image: "/api/placeholder/300/300",
    location: "Manhattan, NY",
    postedDate: "3 days ago",
    tags: ["14 lbs", "Reactive", "Entry Level"],
    brand: "Motiv",
    inStock: true
  },
  {
    id: 11,
    name: "Dexter SST 8 Pro Bowling Shoes",
    category: 'shoes',
    sellerType: 'amateur',
    sellerName: "Sarah Williams",
    sellerRating: 4.6,
    reviewCount: 23,
    price: 85,
    originalPrice: 140,
    condition: 'good',
    description: "Comfortable professional bowling shoes in excellent condition. Size 8.5 women's.",
    image: "/api/placeholder/300/300",
    location: "Queens, NY",
    postedDate: "5 days ago",
    tags: ["Size 8.5", "Women's", "Interchangeable"],
    brand: "Dexter",
    inStock: true
  },
  {
    id: 12,
    name: "Wrist Support - Robby's RevMax",
    category: 'accessories',
    sellerType: 'amateur',
    sellerName: "Lisa Chen",
    sellerRating: 4.5,
    reviewCount: 19,
    price: 35,
    originalPrice: 55,
    condition: 'like-new',
    description: "Barely used wrist support. Helps maintain proper wrist position during release.",
    image: "/api/placeholder/300/300",
    location: "Staten Island, NY",
    postedDate: "6 days ago",
    tags: ["Wrist Support", "Adjustable", "Like New"],
    brand: "Robby's",
    inStock: true
  }
];

export default function XchangePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>('all');

  const sellerTypes = [
    {
      id: 'pro',
      name: 'Professional Players',
      icon: Trophy,
      gradient: 'from-purple-600 to-indigo-700',
      description: 'Pro-used equipment and exclusive gear from tournament players'
    },
    {
      id: 'center',
      name: 'Bowling Centers',
      icon: Users,
      gradient: 'from-blue-600 to-cyan-700',
      description: 'Equipment from bowling centers and pro shops'
    },
    {
      id: 'manufacturer',
      name: 'Manufacturers',
      icon: Shield,
      gradient: 'from-indigo-600 to-purple-700',
      description: 'Direct sales from trusted bowling equipment manufacturers'
    },
    {
      id: 'amateur',
      name: 'Amateur Players',
      icon: User,
      gradient: 'from-green-600 to-emerald-700',
      description: 'Buy and sell equipment from the bowling community'
    }
  ];

  const categories = [
    { id: 'balls', name: 'Bowling Balls', icon: Target },
    { id: 'shoes', name: 'Bowling Shoes', icon: Zap },
    { id: 'bags', name: 'Bags & Cases', icon: ShoppingCart },
    { id: 'accessories', name: 'Accessories', icon: Wrench },
    { id: 'apparel', name: 'Apparel', icon: Shirt },
    { id: 'lane-equipment', name: 'Lane Equipment', icon: Trophy },
  ];

  const getProductsBySellerType = (sellerType: string) => {
    return mockProducts.filter(product =>
      product.sellerType === sellerType &&
      (searchTerm === '' ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedCategory === 'all' || product.category === selectedCategory) &&
      (selectedCondition === 'all' || product.condition === selectedCondition) &&
      (priceRange === 'all' || isPriceInRange(product.price, priceRange))
    );
  };

  const isPriceInRange = (price: number, range: string) => {
    switch (range) {
      case 'under-50': return price < 50;
      case '50-100': return price >= 50 && price <= 100;
      case '100-200': return price > 100 && price <= 200;
      case 'over-200': return price > 200;
      default: return true;
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new': return 'bg-green-100 text-green-800';
      case 'like-new': return 'bg-blue-100 text-blue-800';
      case 'good': return 'bg-yellow-100 text-yellow-800';
      case 'fair': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSellerTypeIcon = (sellerType: string) => {
    switch (sellerType) {
      case 'pro': return <Trophy className="w-3 h-3" />;
      case 'center': return <Users className="w-3 h-3" />;
      case 'manufacturer': return <Shield className="w-3 h-3" />;
      case 'amateur': return <User className="w-3 h-3" />;
      default: return <User className="w-3 h-3" />;
    }
  };

  const getSellerTypeColor = (sellerType: string) => {
    switch (sellerType) {
      case 'pro': return 'bg-purple-100 text-purple-800';
      case 'center': return 'bg-blue-100 text-blue-800';
      case 'manufacturer': return 'bg-indigo-100 text-indigo-800';
      case 'amateur': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
      {product.isFeatured && (
        <div className="bg-yellow-400 text-yellow-900 text-center py-1 text-xs font-bold">
          ⭐ FEATURED
        </div>
      )}

      <div className="relative h-48">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center">
          <div className="text-center text-white">
            <Package className="w-12 h-12 mx-auto mb-2" />
            <p className="text-sm font-medium">{product.brand}</p>
          </div>
        </div>

        {/* Condition Badge */}
        <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-bold ${getConditionColor(product.condition)}`}>
          {product.condition.toUpperCase()}
        </div>

        {/* Price Badge */}
        <div className="absolute top-3 right-3 bg-white text-gray-900 px-3 py-1 rounded-full text-sm font-bold shadow-lg">
          ${product.price}
        </div>

        {!product.inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">SOLD OUT</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h4 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{product.name}</h4>

        {/* Seller Info */}
        <div className="flex items-center gap-2 mb-2">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getSellerTypeColor(product.sellerType)}`}>
            {getSellerTypeIcon(product.sellerType)}
            {product.sellerType.charAt(0).toUpperCase() + product.sellerType.slice(1)}
          </div>
          <span className="text-sm text-gray-600">{product.sellerName}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-600 mb-2">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="text-sm font-medium">{product.sellerRating}</span>
          <span className="text-xs text-gray-500">({product.reviewCount})</span>
        </div>

        <p className="text-gray-700 text-sm mb-3 line-clamp-2">{product.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {product.tags.slice(0, 2).map((tag, index) => (
            <span key={index} className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
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
        </div>

        {/* Action Button */}
        <button
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${product.inStock
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          disabled={!product.inStock}
        >
          {product.inStock ? 'View Details' : 'Sold Out'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#8BC342] to-[#6fa332] text-white">
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-6 md:py-12">
          <div className="text-center">
            <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-2 md:gap-4 mb-3 md:mb-6">
              <div className="w-14 h-14 md:w-20 md:h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto md:mx-0">
                <ShoppingCart className="w-7 h-7 md:w-10 md:h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-bold mb-1 md:mb-2">Xchange</h1>
                <p className="text-xs md:text-lg text-white/90">Buy & Sell Bowling Equipment</p>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 md:p-6 max-w-4xl mx-auto">
              <p className="text-xs md:text-base leading-relaxed">
                Connect with amateur players, pros, and manufacturers to buy and sell quality bowling equipment.
                From beginner gear to professional tournament equipment - find everything you need!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-4">
            <div className="flex-1 relative min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search bowling balls, shoes, accessories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="text-sm text-gray-600">
              {searchTerm && `Searching for: "${searchTerm}"`}
            </div>
          </div>

          {/* Filter Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            {/* Condition Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Conditions</option>
                <option value="new">New</option>
                <option value="like-new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </select>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Prices</option>
                <option value="under-50">Under $50</option>
                <option value="50-100">$50 - $100</option>
                <option value="100-200">$100 - $200</option>
                <option value="over-200">Over $200</option>
              </select>
            </div>
          </div>
        </div>

        {/* Featured Products Banner */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          </div>
          <p className="text-gray-700">Check out these specially curated items from top sellers!</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            {mockProducts.filter(p => p.isFeatured &&
              (searchTerm === '' ||
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.brand.toLowerCase().includes(searchTerm.toLowerCase())) &&
              (selectedCategory === 'all' || p.category === selectedCategory) &&
              (selectedCondition === 'all' || p.condition === selectedCondition) &&
              (priceRange === 'all' || isPriceInRange(p.price, priceRange))
            ).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>

      {/* Seller Type Sections */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-12">
          {sellerTypes.map((sellerType) => {
            const SellerIcon = sellerType.icon;
            const products = getProductsBySellerType(sellerType.id);

            if (products.length === 0) return null;

            return (
              <div key={sellerType.id}>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-12 h-12 bg-gradient-to-br ${sellerType.gradient} rounded-lg flex items-center justify-center`}>
                    <SellerIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{sellerType.name}</h3>
                    <p className="text-gray-600">{products.length} items available • {sellerType.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {(searchTerm || selectedCategory !== 'all' || selectedCondition !== 'all' || priceRange !== 'all') &&
          sellerTypes.every(seller => getProductsBySellerType(seller.id).length === 0) && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search terms or filters.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedCondition('all');
                  setPriceRange('all');
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}

        {/* Seller Info Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mt-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Join the Xchange Community</h2>
            <p className="text-gray-600 mb-6 max-w-3xl mx-auto">
              Whether you&apos;re looking to upgrade your equipment or sell items you no longer need,
              Xchange connects you with passionate bowlers, professionals, and trusted manufacturers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Amateur Players</h3>
              <p className="text-gray-600 text-sm">Buy and sell equipment as you progress in your bowling journey</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Professional Players</h3>
              <p className="text-gray-600 text-sm">Access to pro-used equipment and exclusive gear from tournament players</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Bowling Centers</h3>
              <p className="text-gray-600 text-sm">Professional equipment from bowling centers and pro shops</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Manufacturers</h3>
              <p className="text-gray-600 text-sm">Direct sales from trusted bowling equipment manufacturers</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium">
              Start Selling
            </button>
            <button className="border border-green-600 text-green-600 px-6 py-3 rounded-lg hover:bg-green-50 transition-colors font-medium">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
