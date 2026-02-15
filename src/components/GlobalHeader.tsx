'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { api } from '@/lib/api';

interface Sponsor {
    brand_id: number;
    brandType: string;
    name: string;
    formal_name: string;
    logo_url: string;
}

export default function GlobalHeader() {
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSponsors = async () => {
            try {
                setLoading(true);
                // Fetch brands from the API
                const response = await fetch('https://test.bowlersnetwork.com/api/brands');
                const data = await response.json();

                console.log('API Response:', data); // Debug log

                // Handle different response structures
                let brandData = [];

                // Check if response has the expected structure from the logs
                if (data.Shoes && Array.isArray(data.Shoes)) {
                    // Combine all brand types from the response
                    brandData = [
                        // ...(data.Shoes || []),
                        // ...(data.Apparels || []),
                        // ...(data.Balls || []),
                        // ...(data.Accessories || []),
                        ...(data['Business Sponsors'] || [])
                    ];
                } else if (data.data && Array.isArray(data.data)) {
                    brandData = data.data;
                } else if (data.brands && Array.isArray(data.brands)) {
                    brandData = data.brands;
                } else if (Array.isArray(data)) {
                    brandData = data;
                } else {
                    console.error('Unexpected API response structure:', data);
                    brandData = [];
                }

                console.log('Processed brandData:', brandData); // Debug log

                // Ensure brandData is an array and slice it
                if (Array.isArray(brandData)) {
                    // const sponsorData = brandData.slice(0, 10);
                    const sponsorData = brandData;
                    console.log('Setting sponsors:', sponsorData); // Debug log
                    setSponsors(sponsorData); // Show max 8 sponsors
                } else {
                    console.error('brandData is not an array:', brandData);
                    setSponsors([]);
                }
            } catch (err) {
                console.error('Error fetching sponsors:', err);
                setSponsors([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSponsors();
    }, []);

    console.log('GlobalHeader render - loading:', loading, 'sponsors:', sponsors); // Debug log

    if (loading) {
        return (
            <div className="bg-white border-b border-gray-200 py-2 md:py-4 min-h-[60px] md:min-h-[80px]">
                <style>{`
                    .hide-scrollbar {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                    .hide-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>
                <div className="max-w-7xl mx-auto px-3 md:px-6">
                    {/* Mobile: Stacked layout */}
                    <div className="md:hidden flex flex-col gap-2">
                        <div className="text-xs text-gray-500 font-medium">Business Sponsors</div>
                        <div className="overflow-x-auto hide-scrollbar">
                            <div className="flex items-center justify-start gap-2">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0 animate-pulse"></div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Desktop: Single line centered */}
                    <div className="hidden md:flex items-center justify-center gap-3">
                        <div className="text-xs text-gray-500 font-medium whitespace-nowrap">Business Sponsors</div>
                        <div className="overflow-x-auto hide-scrollbar">
                            <div className="flex items-center gap-3">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0 animate-pulse"></div>
                                ))}
                            </div>
                        </div>
                        <div className="text-xs text-gray-500 font-medium whitespace-nowrap">Business Sponsors</div>
                    </div>
                </div>
            </div>
        );
    }

    // Always show the header, even if no sponsors
    return (
        <div className="bg-white border-b border-gray-200 py-2 md:py-4 min-h-[60px] md:min-h-[80px]">
            <style>{`
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
            <div className="max-w-7xl mx-auto px-3 md:px-6">
                {/* Mobile: Stacked layout */}
                <div className="md:hidden flex flex-col gap-2">
                    <div className="text-xs text-gray-500 font-medium">Business Sponsors</div>
                    <div className="overflow-x-auto hide-scrollbar">
                        <div className="flex items-center justify-start gap-2">
                            {sponsors.length > 0 ? (
                                sponsors.map((sponsor, index) => (
                                    <div
                                        key={sponsor.brand_id || index}
                                        className="flex items-center justify-center bg-gray-50 rounded-full p-1.5 hover:bg-gray-100 transition-colors duration-200 flex-shrink-0"
                                        title={sponsor.formal_name}
                                    >
                                        <Image
                                            src={sponsor.logo_url.trim()}
                                            alt={sponsor.formal_name}
                                            width={32}
                                            height={32}
                                            className="object-contain w-8 h-8"
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="text-xs text-gray-400">No sponsors available</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Desktop: Single line centered with optional scrolling for many sponsors */}
                <div className="hidden md:flex items-center justify-center gap-4">
                    <div className="text-xs text-gray-500 font-medium whitespace-nowrap">Business Sponsors</div>
                    <div className="overflow-x-auto hide-scrollbar flex-1 max-w-[600px]">
                        <div className="flex items-center justify-center gap-3">
                            {sponsors.length > 0 ? (
                                sponsors.map((sponsor, index) => (
                                    <div
                                        key={sponsor.brand_id || index}
                                        className="flex items-center justify-center bg-gray-50 rounded-full p-2 hover:bg-gray-100 transition-colors duration-200 flex-shrink-0"
                                        title={sponsor.formal_name}
                                    >
                                        <Image
                                            src={sponsor.logo_url.trim()}
                                            alt={sponsor.formal_name}
                                            width={40}
                                            height={40}
                                            className="object-contain w-10 h-10"
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="text-xs text-gray-400">No sponsors available</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
