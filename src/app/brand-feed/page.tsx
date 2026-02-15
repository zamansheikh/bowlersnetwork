'use client';

import { useState, useEffect } from 'react';
import { Heart, Search, Loader } from 'lucide-react';
import { api } from '@/lib/api';
import { Brand } from '@/types';
import Navigation from '@/components/Navigation';

export default function BrandFeedPage() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [toggling, setToggling] = useState<number[]>([]);

    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/brands/feed');
            setBrands(response.data);
        } catch (error) {
            console.error('Error fetching brands:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleFavorite = async (brandId: number) => {
        if (toggling.includes(brandId)) return;

        try {
            setToggling(prev => [...prev, brandId]);
            const response = await api.get(`/api/brands/toggle/${brandId}`);
            
            // Start updating local state based on response
            setBrands(prevBrands => 
                prevBrands.map(brand => 
                    brand.brand_id === brandId 
                        ? { ...brand, is_fav: response.data.is_fav } 
                        : brand
                )
            );
        } catch (error) {
            console.error('Error toggling favorite:', error);
        } finally {
            setToggling(prev => prev.filter(id => id !== brandId));
        }
    };

    const filteredBrands = brands.filter(brand => 
        brand.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        brand.brandType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group brands by type for better display
    const brandsByType = filteredBrands.reduce((acc, brand) => {
        const type = brand.brandType;
        if (!acc[type]) {
            acc[type] = [];
        }
        acc[type].push(brand);
        return acc;
    }, {} as Record<string, Brand[]>);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
                        <p className="text-gray-500 mt-1">Discover and follow your favorite bowling brands</p>
                    </div>
                    
                    <div className="relative w-full md:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search brands..."
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader className="w-8 h-8 animate-spin text-green-600" />
                    </div>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(brandsByType).map(([type, typeBrands]) => (
                            <div key={type} className="space-y-4">
                                <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">
                                    {type}
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {typeBrands.map((brand) => (
                                        <div 
                                            key={brand.brand_id} 
                                            className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-6 flex flex-col items-center text-center relative group"
                                        >
                                            <button
                                                onClick={() => toggleFavorite(brand.brand_id)}
                                                className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
                                                    brand.is_fav 
                                                        ? 'bg-red-50 text-red-500 hover:bg-red-100' 
                                                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-red-500'
                                                }`}
                                                disabled={toggling.includes(brand.brand_id)}
                                            >
                                                {toggling.includes(brand.brand_id) ? (
                                                    <Loader className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <Heart 
                                                        className={`w-5 h-5 ${brand.is_fav ? 'fill-current' : ''}`} 
                                                    />
                                                )}
                                            </button>

                                            <div className="h-24 w-full flex items-center justify-center mb-4 p-2">
                                                <img
                                                    src={brand.logo_url}
                                                    alt={brand.name}
                                                    className="max-h-full max-w-full object-contain"
                                                />
                                            </div>
                                            
                                            <h3 className="font-semibold text-gray-900 mb-1">{brand.name}</h3>
                                            {brand.formal_name !== brand.name && (
                                                <p className="text-xs text-gray-500 mb-2">{brand.formal_name}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {Object.keys(brandsByType).length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                No brands found matching your search.
                            </div>
                        )}
                    </div>
                )}
            </div>
    );
}
