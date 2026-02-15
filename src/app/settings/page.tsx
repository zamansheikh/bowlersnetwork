'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Settings as SettingsIcon, Bell, Shield, Palette } from 'lucide-react';

export default function SettingsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');

    const tabs = [
        { id: 'profile', name: 'Profile', icon: User },
        { id: 'notifications', name: 'Notifications', icon: Bell },
        { id: 'privacy', name: 'Privacy', icon: Shield },
        { id: 'appearance', name: 'Appearance', icon: Palette },
    ];

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600 mt-2">
                    Manage your account preferences and application settings.
                </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="border-b">
                    <nav className="flex space-x-8 px-6">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                        ? 'border-green-600 text-green-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue={user?.name}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        defaultValue={user?.username}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        defaultValue={user?.email}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-green-500 focus:border-green-500"
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors">
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-medium text-gray-900">Notification Preferences</h2>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">Game Reminders</p>
                                        <p className="text-sm text-gray-600">Get notified about upcoming games</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        defaultChecked
                                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">Achievement Notifications</p>
                                        <p className="text-sm text-gray-600">Get notified when you unlock achievements</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        defaultChecked
                                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">Weekly Summary</p>
                                        <p className="text-sm text-gray-600">Receive weekly performance summaries</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        defaultChecked
                                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'privacy' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-medium text-gray-900">Privacy Settings</h2>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">Public Profile</p>
                                        <p className="text-sm text-gray-600">Allow others to view your profile</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        defaultChecked
                                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">Show Statistics</p>
                                        <p className="text-sm text-gray-600">Display your performance statistics publicly</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        defaultChecked
                                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'appearance' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-medium text-gray-900">Appearance</h2>

                            <div>
                                <p className="font-medium text-gray-900 mb-4">Theme</p>
                                <div className="space-y-2">
                                    <div className="flex items-center">
                                        <input
                                            type="radio"
                                            id="light"
                                            name="theme"
                                            defaultChecked
                                            className="w-4 h-4 text-green-600 focus:ring-green-500"
                                        />
                                        <label htmlFor="light" className="ml-3 text-gray-900">Light Mode</label>
                                    </div>
                                    <div className="flex items-center opacity-50">
                                        <input
                                            type="radio"
                                            id="dark"
                                            name="theme"
                                            disabled
                                            className="w-4 h-4 text-green-600 focus:ring-green-500"
                                        />
                                        <label htmlFor="dark" className="ml-3 text-gray-900">Dark Mode (Coming Soon)</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
