'use client';

import { useState } from 'react';
import { Search, MapPin, Star, Clock, Tag, Gift, TreePine, Building, Coffee, Dumbbell, Utensils } from 'lucide-react';
import Image from 'next/image';

interface Perk {
  id: number;
  name: string;
  category: 'restaurants' | 'fitness' | 'entertainment' | 'shopping';
  location: string;
  rating: number;
  reviewCount: number;
  discount: string;
  description: string;
  image: string;
  distance: string;
  hours: string;
  couponCode: string;
  tags: string[];
  originalPrice?: string;
  discountedPrice?: string;
}

const mockPerks: Perk[] = [
  {
    id: 1,
    name: "Mario's Italian Kitchen",
    category: 'restaurants',
    location: "Downtown Plaza, NY",
    rating: 4.8,
    reviewCount: 324,
    discount: "25% OFF",
    description: "Authentic Italian cuisine with fresh pasta and wood-fired pizzas. Perfect for post-game dining with the team.",
    image: "/api/placeholder/300/200",
    distance: "0.5 miles",
    hours: "11:00 AM - 10:00 PM",
    couponCode: "BOWLERS25",
    tags: ["Italian", "Family-friendly", "Outdoor seating"],
    originalPrice: "$45",
    discountedPrice: "$34"
  },
  {
    id: 2,
    name: "FitZone Gym & Wellness",
    category: 'fitness',
    location: "Sports Complex, NY",
    rating: 4.6,
    reviewCount: 198,
    discount: "30% OFF First Month",
    description: "State-of-the-art gym with bowling-specific training programs and recovery facilities.",
    image: "/api/placeholder/300/200",
    distance: "1.2 miles",
    hours: "5:00 AM - 11:00 PM",
    couponCode: "STRIKE30",
    tags: ["Fitness", "Personal Training", "Recovery"],
    originalPrice: "$89/month",
    discountedPrice: "$62/month"
  },
  {
    id: 3,
    name: "Central Park Adventure Zone",
    category: 'entertainment',
    location: "Central Park, NY",
    rating: 4.7,
    reviewCount: 567,
    discount: "20% OFF Activities",
    description: "Outdoor recreation and team building activities. Great for bowler meetups and tournaments.",
    image: "/api/placeholder/300/200",
    distance: "2.1 miles",
    hours: "8:00 AM - 8:00 PM",
    couponCode: "PARK20",
    tags: ["Outdoor", "Team Building", "Activities"],
    originalPrice: "$35",
    discountedPrice: "$28"
  },
  {
    id: 4,
    name: "Striker's Sports Bar & Grill",
    category: 'restaurants',
    location: "Bowling District, NY",
    rating: 4.5,
    reviewCount: 412,
    discount: "15% OFF Food",
    description: "Sports-themed restaurant with bowling memorabilia and live game viewing. Bowler's favorite hangout spot.",
    image: "/api/placeholder/300/200",
    distance: "0.3 miles",
    hours: "12:00 PM - 2:00 AM",
    couponCode: "BOWLFOOD15",
    tags: ["Sports Bar", "Live TV", "Late Night"],
    originalPrice: "$32",
    discountedPrice: "$27"
  },
  {
    id: 5,
    name: "Premium Fitness Studio",
    category: 'fitness',
    location: "Health District, NY",
    rating: 4.9,
    reviewCount: 156,
    discount: "40% OFF Classes",
    description: "Specialized fitness classes including flexibility and strength training for bowlers.",
    image: "/api/placeholder/300/200",
    distance: "1.8 miles",
    hours: "6:00 AM - 10:00 PM",
    couponCode: "FIT40",
    tags: ["Classes", "Strength Training", "Flexibility"],
    originalPrice: "$25/class",
    discountedPrice: "$15/class"
  },
  {
    id: 6,
    name: "Bowler's Outlet Mall",
    category: 'shopping',
    location: "Shopping Center, NY",
    rating: 4.4,
    reviewCount: 289,
    discount: "10% OFF Purchase",
    description: "Bowling equipment, apparel, and accessories with exclusive Bowlers Network member discounts.",
    image: "/api/placeholder/300/200",
    distance: "3.5 miles",
    hours: "10:00 AM - 9:00 PM",
    couponCode: "SHOP10",
    tags: ["Bowling Gear", "Apparel", "Equipment"],
    originalPrice: "Various",
    discountedPrice: "10% Off All Items"
  }
];

export default function PerksPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('distance');

  const categories = [
    { id: 'all', name: 'All Partners', icon: Building, count: mockPerks.length },
    { id: 'restaurants', name: 'Restaurants', icon: Utensils, count: mockPerks.filter(p => p.category === 'restaurants').length },
    { id: 'fitness', name: 'Fitness Centers', icon: Dumbbell, count: mockPerks.filter(p => p.category === 'fitness').length },
    { id: 'entertainment', name: 'Entertainment', icon: TreePine, count: mockPerks.filter(p => p.category === 'entertainment').length },
    { id: 'shopping', name: 'Shopping', icon: Coffee, count: mockPerks.filter(p => p.category === 'shopping').length },
  ];

  const filteredPerks = mockPerks.filter(perk => {
    const matchesCategory = selectedCategory === 'all' || perk.category === selectedCategory;
    const matchesSearch = perk.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      perk.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedPerks = [...filteredPerks].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'discount':
        return parseInt(b.discount) - parseInt(a.discount);
      case 'distance':
      default:
        return parseFloat(a.distance) - parseFloat(b.distance);
    }
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#8BC342] to-[#6fa332] text-white">
        <div className="max-w-7xl mx-auto px-3 md:px-4 py-6 md:py-10">
          <div className="text-center">
            <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-2 md:gap-3 mb-3 md:mb-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto md:mx-0">
                <Gift className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-bold">Perks</h1>
                <p className="text-xs md:text-lg text-white/90 mt-1">Exclusive member discounts</p>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 md:p-4 max-w-2xl mx-auto">
              <p className="text-xs md:text-base">
                Save at your favorite local spots! Exclusive discounts for Bowlers Network members.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 md:px-4 py-4 md:py-8">
        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search partners, restaurants, fitness centers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="distance">Sort by Distance</option>
                <option value="rating">Sort by Rating</option>
                <option value="discount">Sort by Discount</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${selectedCategory === category.id
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50'
                  }`}
              >
                <div className="flex flex-col items-center">
                  <IconComponent className="w-8 h-8 mb-2" />
                  <span className="font-medium text-sm">{category.name}</span>
                  <span className="text-xs text-gray-500">({category.count})</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Partner Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPerks.map((perk) => (
            <div key={perk.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="relative h-48">
                <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Building className="w-16 h-16 mx-auto mb-2" />
                    <p className="text-sm">{perk.name}</p>
                  </div>
                </div>
                {/* Discount Badge */}
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {perk.discount}
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{perk.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{perk.rating}</span>
                    <span className="text-xs text-gray-500">({perk.reviewCount})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{perk.location}</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{perk.distance}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600 mb-3">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{perk.hours}</span>
                </div>

                <p className="text-gray-700 text-sm mb-4">{perk.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {perk.tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Pricing */}
                {perk.originalPrice && perk.discountedPrice && (
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-lg font-bold text-green-600">{perk.discountedPrice}</span>
                      <span className="text-sm text-gray-500 line-through ml-2">{perk.originalPrice}</span>
                    </div>
                  </div>
                )}

                {/* Coupon Code */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Coupon Code:</p>
                      <p className="font-mono text-lg font-bold text-green-600">{perk.couponCode}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(perk.couponCode)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
                    >
                      Copy Code
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium">
                    View Details
                  </button>
                  <button className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                    <MapPin className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sortedPerks.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No partners found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}

        {/* Partnership Info */}
        <div className="bg-white rounded-lg shadow-lg p-8 mt-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Want to Partner with Bowlers Network?</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Join our growing network of partners and offer exclusive deals to thousands of bowling enthusiasts.
              Increase your visibility and attract new customers from our passionate community.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium">
                Become a Partner
              </button>
              <button className="border border-green-600 text-green-600 px-6 py-3 rounded-lg hover:bg-green-50 transition-colors font-medium">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
