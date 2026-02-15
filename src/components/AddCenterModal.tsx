'use client';

import { useState } from 'react';
import { X, Loader, MapPin, Building2, Phone, Mail, Globe2, AlertCircle } from 'lucide-react';
import { BowlingCenter } from '@/types';
import AddressModal from './AddressModal';

interface AddCenterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newCenter: BowlingCenter) => void;
    accessToken?: string | null;
}

export default function AddCenterModal({
    isOpen,
    onClose,
    onSuccess,
    accessToken
}: AddCenterModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
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

    const handleAddCenter = async () => {
        if (!newCenter.name || !newCenter.lanes || !newCenter.address_str) {
            setError('Please fill in all required fields (Name, Lanes, Address)');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const token = accessToken || (typeof window !== 'undefined' ? localStorage.getItem('access_token') : null);
            
            const response = await fetch('/api/centers', {
                method: 'POST',
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
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
                onSuccess(createdCenter);
                handleClose();
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to add center');
            }
        } catch (err) {
            console.error('Error adding center:', err);
            setError('Failed to add center. Please try again.');
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

    const handleClose = () => {
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
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">Add New Center</h2>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 transition"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

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
                            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
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
                </div>
            </div>

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
