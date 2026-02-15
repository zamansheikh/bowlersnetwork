'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Search, Loader, MapPin, Building2, Plus, Layers, Phone, Mail, Globe2, AlertCircle } from 'lucide-react';
import { BowlingCenter } from '@/types';
import AddressModal from './AddressModal';

interface HomeCenterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (centerId: number, isPublic: boolean, center?: BowlingCenter) => void;
    currentCenterId?: number;
    accessToken: string;
}

export default function HomeCenterModal({
    isOpen,
    onClose,
    onSave,
    currentCenterId,
    accessToken
}: HomeCenterModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [centers, setCenters] = useState<BowlingCenter[]>([]);
    const [filteredCenters, setFilteredCenters] = useState<BowlingCenter[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCenterId, setSelectedCenterId] = useState<number | undefined>(currentCenterId);
    const [isPublic, setIsPublic] = useState(true);
    const [showAddCenterForm, setShowAddCenterForm] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Add center form state
    const [newCenter, setNewCenter] = useState({
        name: '',
        lanes: '',
        address_str: '',
        zipcode: '',
        lat: '',
        long: '',
        website_url: '',
        email: '',
        phone_number: ''
    });

    const searchDebounceTimer = useRef<NodeJS.Timeout | undefined>(undefined);

    useEffect(() => {
        if (isOpen) {
            fetchCenters();
            setSelectedCenterId(currentCenterId);
        }
    }, [isOpen, currentCenterId]);

    useEffect(() => {
        if (searchDebounceTimer.current) {
            clearTimeout(searchDebounceTimer.current);
        }

        if (!searchQuery.trim()) {
            setFilteredCenters(centers);
            return;
        }

        searchDebounceTimer.current = setTimeout(() => {
            const term = searchQuery.toLowerCase();
            const filtered = centers.filter(center =>
                center.name.toLowerCase().includes(term) ||
                center.address_str?.toLowerCase().includes(term) ||
                center.zipcode?.toLowerCase().includes(term) ||
                center.admin?.toLowerCase().includes(term)
            );
            setFilteredCenters(filtered);
        }, 300);
    }, [searchQuery, centers]);

    const fetchCenters = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/centers', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Failed to fetch centers: ${response.status}`);
            }

            const data = await response.json();
            setCenters(Array.isArray(data) ? data : []);
            setFilteredCenters(Array.isArray(data) ? data : []);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch centers';
            console.error('Error fetching centers:', error);
            setError(errorMessage);
            setCenters([]);
            setFilteredCenters([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddCenter = async () => {
        if (!newCenter.name || !newCenter.lanes || !newCenter.address_str) {
            alert('Please fill in all required fields (Name, Lanes, Address)');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('https://test.bowlersnetwork.com/api/centers', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: newCenter.name,
                    lanes: parseInt(newCenter.lanes),
                    address_str: newCenter.address_str,
                    zipcode: newCenter.zipcode,
                    lat: newCenter.lat,
                    long: newCenter.long,
                    website_url: newCenter.website_url || undefined,
                    email: newCenter.email || undefined,
                    phone_number: newCenter.phone_number || undefined
                })
            });

            if (response.ok) {
                const createdCenter = await response.json();
                // Add to centers list and select it
                setCenters(prev => [createdCenter, ...prev]);
                setFilteredCenters(prev => [createdCenter, ...prev]);
                setSelectedCenterId(createdCenter.id);
                setShowAddCenterForm(false);
                // Reset form
                setNewCenter({
                    name: '',
                    lanes: '',
                    address_str: '',
                    zipcode: '',
                    lat: '',
                    long: '',
                    website_url: '',
                    email: '',
                    phone_number: ''
                });
                alert('Center added successfully!');
            } else {
                const error = await response.json();
                alert(`Failed to add center: ${error.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error adding center:', error);
            alert('Failed to add center. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddressSelect = (address: {
        address: string;
        zipcode: string;
        latitude: string;
        longitude: string;
    }) => {
        setNewCenter(prev => ({
            ...prev,
            address_str: address.address,
            zipcode: address.zipcode,
            lat: address.latitude,
            long: address.longitude
        }));
        setShowAddressModal(false);
    };

    const handleSave = () => {
        if (!selectedCenterId) {
            alert('Please select a center');
            return;
        }
        const selectedCenter = centers.find(c => c.id === selectedCenterId);
        onSave(selectedCenterId, isPublic, selectedCenter);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">Select Home Center</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {!showAddCenterForm ? (
                            <>
                                {/* Error Message */}
                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
                                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                {/* Search Input */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="Search centers by name, address, ZIP..."
                                    />
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    {isLoading && (
                                        <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600 animate-spin" />
                                    )}
                                </div>

                                {/* Add New Center Button */}
                                <button
                                    onClick={() => setShowAddCenterForm(true)}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition text-gray-600 hover:text-green-700"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span className="font-medium">Add New Center</span>
                                </button>

                                {/* Centers List */}
                                <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {isLoading && (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader className="w-6 h-6 text-green-600 animate-spin" />
                                        </div>
                                    )}

                                    {!isLoading && filteredCenters.length === 0 && !error && (
                                        <div className="text-center py-8 text-gray-500">
                                            No centers found. Try a different search or add a new center.
                                        </div>
                                    )}

                                    {filteredCenters.map((center) => (
                                        <div
                                            key={center.id}
                                            onClick={() => setSelectedCenterId(center.id)}
                                            className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                                                selectedCenterId === center.id
                                                    ? 'border-green-500 bg-green-50'
                                                    : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center bg-gray-50 shrink-0">
                                                    <img
                                                        src={center.logo || '/logo/logo.png'}
                                                        alt={center.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.src = '/logo/logo.png';
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900">{center.name}</h3>
                                                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                                                                <MapPin className="w-4 h-4" />
                                                                <span>{center.address_str}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3 mt-2">
                                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                                                    <Layers className="w-3 h-3" />
                                                                    {center.lanes} lanes
                                                                </span>
                                                                {center.zipcode && (
                                                                    <span className="text-xs text-gray-500">ZIP: {center.zipcode}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Privacy Setting */}
                                {selectedCenterId && (
                                    <div className="pt-4 border-t border-gray-200">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="center-privacy"
                                                checked={isPublic}
                                                onChange={(e) => setIsPublic(e.target.checked)}
                                                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                            />
                                            <label htmlFor="center-privacy" className="text-sm text-gray-600">
                                                Make my home center public on my profile
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                {/* Add Center Form */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900">Add New Center</h3>
                                        <button
                                            onClick={() => setShowAddCenterForm(false)}
                                            className="text-sm text-gray-600 hover:text-gray-900"
                                        >
                                            Back to list
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Center Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={newCenter.name}
                                                onChange={(e) => setNewCenter(prev => ({ ...prev, name: e.target.value }))}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                placeholder="e.g., Dhaka Alley"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Number of Lanes <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                value={newCenter.lanes}
                                                onChange={(e) => setNewCenter(prev => ({ ...prev, lanes: e.target.value }))}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                placeholder="e.g., 10"
                                                min="1"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Address <span className="text-red-500">*</span>
                                            </label>
                                            <div className="space-y-2">
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={newCenter.address_str}
                                                        readOnly
                                                        onClick={() => setShowAddressModal(true)}
                                                        className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer bg-white"
                                                        placeholder="Click to select address"
                                                    />
                                                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                </div>
                                                {newCenter.zipcode && (
                                                    <p className="text-sm text-gray-600">ZIP: {newCenter.zipcode}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Website URL <span className="text-gray-400">(optional)</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={newCenter.website_url}
                                                    onChange={(e) => setNewCenter(prev => ({ ...prev, website_url: e.target.value }))}
                                                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                    placeholder="https://example.com"
                                                />
                                                <Globe2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Email <span className="text-gray-400">(optional)</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    value={newCenter.email}
                                                    onChange={(e) => setNewCenter(prev => ({ ...prev, email: e.target.value }))}
                                                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                    placeholder="info@example.com"
                                                />
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Phone Number <span className="text-gray-400">(optional)</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="tel"
                                                    value={newCenter.phone_number}
                                                    onChange={(e) => setNewCenter(prev => ({ ...prev, phone_number: e.target.value }))}
                                                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                    placeholder="+1234567890"
                                                />
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleAddCenter}
                                        disabled={isLoading || !newCenter.name || !newCenter.lanes || !newCenter.address_str}
                                        className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader className="w-5 h-5 animate-spin" />
                                                Adding Center...
                                            </>
                                        ) : (
                                            <>
                                                <Building2 className="w-5 h-5" />
                                                Add Center
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    {!showAddCenterForm && (
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!selectedCenterId}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                Save Home Center
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Address Modal for Add Center */}
            <AddressModal
                isOpen={showAddressModal}
                onClose={() => setShowAddressModal(false)}
                onSave={handleAddressSelect}
                initialAddress={newCenter.address_str}
                initialZipcode={newCenter.zipcode}
                title="Select Center Address"
            />
        </>
    );
}
