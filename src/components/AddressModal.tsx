'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Search, Loader, MapPin, Map as MapIcon } from 'lucide-react';
import { useMapboxGeocoding } from '@/lib/useMapboxGeocoding';
import { GeocodingResult } from '@/lib/mapboxGeocodingService';

interface AddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (address: {
        address: string;
        zipcode: string;
        latitude: string;
        longitude: string;
    }) => void;
    initialAddress?: string;
    initialZipcode?: string;
    title?: string;
}

export default function AddressModal({
    isOpen,
    onClose,
    onSave,
    initialAddress = '',
    initialZipcode = '',
    title = 'Update Address'
}: AddressModalProps) {
    const [searchType, setSearchType] = useState<'address' | 'zipcode'>('zipcode');
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [showMapPicker, setShowMapPicker] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState({
        address: initialAddress,
        zipcode: initialZipcode,
        latitude: '',
        longitude: ''
    });
    const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 }); // Default: NYC
    const [markerPosition, setMarkerPosition] = useState({ lat: 40.7128, lng: -74.0060 });

    const { geocodeMultiple, results: addressSuggestions, isLoading: isGeocodingLoading } = useMapboxGeocoding();
    const searchDebounceTimer = useRef<NodeJS.Timeout | undefined>(undefined);
    const mapRef = useRef<any>(null);

    useEffect(() => {
        if (isOpen) {
            setSearchQuery('');
            setShowSuggestions(false);
            setShowMapPicker(false);
            setSelectedAddress({
                address: initialAddress,
                zipcode: initialZipcode,
                latitude: '',
                longitude: ''
            });
        }
    }, [isOpen, initialAddress, initialZipcode]);

    // Load Mapbox script when map picker is shown
    useEffect(() => {
        if (showMapPicker && !(window as any).mapboxgl) {
            const script = document.createElement('script');
            script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
            script.async = true;
            document.head.appendChild(script);

            const link = document.createElement('link');
            link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
            link.rel = 'stylesheet';
            document.head.appendChild(link);

            script.onload = () => initializeMap();
        } else if (showMapPicker && (window as any).mapboxgl) {
            initializeMap();
        }
    }, [showMapPicker]);

    const initializeMap = () => {
        if (!(window as any).mapboxgl || mapRef.current) return;

        const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
        if (!mapboxToken) return;

        (window as any).mapboxgl.accessToken = mapboxToken;

        const map = new (window as any).mapboxgl.Map({
            container: 'address-map',
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [mapCenter.lng, mapCenter.lat],
            zoom: 12
        });

        // Add marker
        const marker = new (window as any).mapboxgl.Marker({
            draggable: true,
            color: '#8BC342'
        })
            .setLngLat([mapCenter.lng, mapCenter.lat])
            .addTo(map);

        // Update position when marker is dragged
        marker.on('dragend', async () => {
            const lngLat = marker.getLngLat();
            setMarkerPosition({ lat: lngLat.lat, lng: lngLat.lng });

            // Reverse geocode to get address
            try {
                const response = await fetch(
                    `https://api.mapbox.com/geocoding/v5/mapbox.places/${lngLat.lng},${lngLat.lat}.json?access_token=${mapboxToken}`
                );
                const data = await response.json();
                if (data.features && data.features.length > 0) {
                    const feature = data.features[0];
                    const zipcode = feature.context?.find((c: any) => c.id.startsWith('postcode'))?.text || '';

                    setSelectedAddress({
                        address: feature.place_name || '',
                        zipcode: zipcode,
                        latitude: lngLat.lat.toString(),
                        longitude: lngLat.lng.toString()
                    });
                }
            } catch (error) {
                console.error('Reverse geocoding error:', error);
            }
        });

        // Click on map to move marker
        map.on('click', async (e: any) => {
            marker.setLngLat([e.lngLat.lng, e.lngLat.lat]);
            setMarkerPosition({ lat: e.lngLat.lat, lng: e.lngLat.lng });

            // Reverse geocode
            try {
                const response = await fetch(
                    `https://api.mapbox.com/geocoding/v5/mapbox.places/${e.lngLat.lng},${e.lngLat.lat}.json?access_token=${mapboxToken}`
                );
                const data = await response.json();
                if (data.features && data.features.length > 0) {
                    const feature = data.features[0];
                    const zipcode = feature.context?.find((c: any) => c.id.startsWith('postcode'))?.text || '';

                    setSelectedAddress({
                        address: feature.place_name || '',
                        zipcode: zipcode,
                        latitude: e.lngLat.lat.toString(),
                        longitude: e.lngLat.lng.toString()
                    });
                }
            } catch (error) {
                console.error('Reverse geocoding error:', error);
            }
        });

        mapRef.current = map;
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);

        if (searchDebounceTimer.current) {
            clearTimeout(searchDebounceTimer.current);
        }

        if (query.trim().length < 2) {
            setShowSuggestions(false);
            return;
        }

        searchDebounceTimer.current = setTimeout(() => {
            geocodeMultiple(query);
            setShowSuggestions(true);
        }, 300);
    };

    const handleSelectSuggestion = (result: GeocodingResult) => {
        setSelectedAddress({
            address: result.address || '',
            zipcode: result.zipcode || '',
            latitude: result.latitude?.toString() || '',
            longitude: result.longitude?.toString() || ''
        });
        setSearchQuery(result.address || '');
        setShowSuggestions(false);
    };

    const handleOpenMapPicker = () => {
        setShowMapPicker(true);
        setShowSuggestions(false);

        // If we have coordinates from selected address, use those
        if (selectedAddress.latitude && selectedAddress.longitude) {
            const lat = parseFloat(selectedAddress.latitude);
            const lng = parseFloat(selectedAddress.longitude);
            setMapCenter({ lat, lng });
            setMarkerPosition({ lat, lng });
        }
    };

    const handleSave = () => {
        if (!selectedAddress.address) {
            alert('Please select or enter an address');
            return;
        }
        onSave(selectedAddress);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {!showMapPicker ? (
                        <div className="space-y-6 max-w-2xl mx-auto">
                            {/* Search Type Toggle */}
                            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg shrink-0">
                                <button
                                    onClick={() => setSearchType('address')}
                                    className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition ${searchType === 'address'
                                            ? 'bg-white text-green-700 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-800'
                                        }`}
                                >
                                    Search by Address
                                </button>
                                <button
                                    onClick={() => setSearchType('zipcode')}
                                    className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition ${searchType === 'zipcode'
                                            ? 'bg-white text-green-700 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-800'
                                        }`}
                                >
                                    By Zip Code
                                </button>
                            </div>

                            {/* Search Input */}
                            <div className="relative shrink-0">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        onFocus={() => searchQuery.trim().length >= 2 && setShowSuggestions(true)}
                                        className="w-full p-2.5 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50/50 hover:bg-white transition text-sm font-medium shadow-sm"
                                        placeholder={
                                            searchType === 'address'
                                                ? 'Street address, city, or state...'
                                                : 'Enter 5-digit zip code...'
                                        }
                                    />
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                                    {isGeocodingLoading && (
                                        <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600 animate-spin" />
                                    )}
                                </div>

                                {/* Suggestions Dropdown */}
                                {showSuggestions && addressSuggestions.length > 0 && (
                                    <div className="w-full mt-2 bg-white border border-gray-100 rounded-lg shadow-sm divide-y divide-gray-50 ring-1 ring-black/5">
                                        {addressSuggestions.map((result, index) => (
                                            <div
                                                key={index}
                                                onClick={() => handleSelectSuggestion(result)}
                                                className="px-4 py-2 hover:bg-green-50 cursor-pointer transition-colors"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                                                        <MapPin className="w-4 h-4 text-gray-400" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-semibold text-gray-900 text-sm truncate">{result.address}</div>
                                                        <div className="text-xs text-gray-500 mt-0.5 flex flex-wrap items-center gap-2">
                                                            {result.zipcode && (
                                                                <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded-[4px] text-[10px] font-bold">
                                                                    {result.zipcode}
                                                                </span>
                                                            )}
                                                            <span>{result.city}{result.state && <>, {result.state}</>}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* No Results */}
                                {showSuggestions && addressSuggestions.length === 0 && !isGeocodingLoading && searchQuery.trim().length >= 2 && (
                                    <div className="w-full mt-1 bg-white border border-gray-100 rounded-lg shadow-sm p-3 text-center ring-1 ring-black/5">
                                        <p className="text-xs text-gray-500 mb-2">No addresses found</p>
                                        <button
                                            onClick={handleOpenMapPicker}
                                            className="inline-flex items-center gap-2 px-2.5 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition text-[10px] font-bold"
                                        >
                                            <MapIcon className="w-3 h-3" />
                                            Pick from Map
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Selected Address Display */}
                            {selectedAddress.address && (
                                <div className="p-4 bg-green-50/50 border border-green-100 rounded-lg shrink-0">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                            <MapPin className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-green-700 uppercase tracking-widest mb-1">Current Selection</p>
                                            <p className="text-base font-semibold text-gray-900 truncate">{selectedAddress.address}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Map Picker Button */}
                            {!showSuggestions && (
                                <div className="pt-6 border-t border-gray-100 shrink-0">
                                    <button
                                        onClick={handleOpenMapPicker}
                                        className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-300 group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                                            <MapIcon className="w-5 h-5 text-gray-400 group-hover:text-green-600" />
                                        </div>
                                        <span className="text-base font-bold text-gray-600 group-hover:text-green-700">Or pick precise location from map</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6 max-w-2xl mx-auto">
                            <div className="flex items-center justify-between px-1 shrink-0">
                                <p className="text-sm text-gray-500 font-medium">
                                    Click or drag the marker to select location
                                </p>
                                <button
                                    onClick={() => setShowMapPicker(false)}
                                    className="text-sm text-green-600 hover:text-green-700 font-bold px-3 py-1 bg-green-50 rounded-lg transition"
                                >
                                    Back to Search
                                </button>
                            </div>

                            <div
                                id="address-map"
                                className="w-full h-[400px] rounded-xl border border-gray-200 shadow-inner shrink-0"
                            />

                            {/* Selected Address from Map */}
                            {selectedAddress.address && (
                                <div className="p-4 bg-green-50 border border-green-100 rounded-lg shrink-0">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                            <MapPin className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-green-700 uppercase tracking-widest mb-1">Map Selection</p>
                                            <p className="text-base font-semibold text-gray-900 truncate">{selectedAddress.address}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!selectedAddress.address}
                        className="px-8 py-2.5 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed shadow-md shadow-green-200/50"
                    >
                        Save Address
                    </button>
                </div>
            </div>
        </div>
    );
}
