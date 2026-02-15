'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { ThumbsUp, MessageCircle, Share2 } from 'lucide-react';

interface ReachEngagementData {
    reach: {
        likes: number;
        comments: number;
        shares: number;
    };
    engagement: {
        likes: number;
        comments: number;
        shares: number;
    };
}

export default function ReachEngagementCard() {
    const [data, setData] = useState<ReachEngagementData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'reach' | 'engagement'>('reach');

    useEffect(() => {
        const fetchReachEngagement = async () => {
            try {
                setLoading(true);
                const response = await api.get('/api/posts/v2/reach-and-engagement');
                setData(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching reach and engagement:', err);
                setError('Failed to load metrics');
            } finally {
                setLoading(false);
            }
        };

        fetchReachEngagement();
    }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return null;
    }

    const metrics = activeTab === 'reach' ? data.reach : data.engagement;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Tabs */}
            <div className="flex p-1 bg-gray-50 border-b border-gray-100">
                <button
                    onClick={() => setActiveTab('reach')}
                    className={`flex-1 py-2 px-4 text-sm font-semibold rounded-xl transition-all ${
                        activeTab === 'reach'
                            ? 'bg-white text-[#8BC342] shadow-sm ring-1 ring-gray-200'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Reach
                </button>
                <button
                    onClick={() => setActiveTab('engagement')}
                    className={`flex-1 py-2 px-4 text-sm font-semibold rounded-xl transition-all ${
                        activeTab === 'engagement'
                            ? 'bg-white text-[#8BC342] shadow-sm ring-1 ring-gray-200'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Engagement
                </button>
            </div>

            {/* Content */}
            <div className="p-5">
                <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col items-center">
                        <span className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-tight">likes</span>
                        <span className="text-2xl font-bold text-gray-900 leading-none">{metrics.likes}</span>
                    </div>
                    <div className="flex flex-col items-center border-x border-gray-100 px-2">
                        <span className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-tight">comments</span>
                        <span className="text-2xl font-bold text-gray-900 leading-none">{metrics.comments}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-tight">shares</span>
                        <span className="text-2xl font-bold text-gray-900 leading-none">{metrics.shares}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
