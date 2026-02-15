'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageCircle, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Topic, Discussion } from '@/types/chatter';
import DiscussionCard from '@/components/DiscussionCard';

export default function ChatterPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'about' | 'discussions' | 'new'>('discussions');
    const [discussions, setDiscussions] = useState<Discussion[]>([]);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form states for new discussion
    const [newDiscussionForm, setNewDiscussionForm] = useState({
        topic_id: '',
        title: '',
        description: ''
    });

    // Fetch discussions
    const fetchDiscussions = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/lanes/discussions/feed');
            setDiscussions(response.data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching discussions:', err);
            setError('Failed to load discussions');
        } finally {
            setLoading(false);
        }
    };

    // Fetch topics
    const fetchTopics = async () => {
        try {
            const response = await api.get('/api/lanes/discussions/topics');
            setTopics(response.data || []);
        } catch (err) {
            console.error('Error fetching topics:', err);
        }
    };

    // Initial load
    useEffect(() => {
        fetchDiscussions();
        fetchTopics();
    }, []);

    // Handle discussion update from card
    const handleDiscussionUpdate = (updatedDiscussion: Discussion) => {
        setDiscussions(prev => prev.map(d => 
            d.discussion_id === updatedDiscussion.discussion_id ? updatedDiscussion : d
        ));
    };

    // Handle post new discussion
    const handlePostDiscussion = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newDiscussionForm.topic_id || !newDiscussionForm.title || !newDiscussionForm.description) {
            setError('Please fill in all fields');
            return;
        }

        try {
            setLoading(true);
            await api.post('/api/lanes/discussions', {
                topic_id: parseInt(newDiscussionForm.topic_id),
                title: newDiscussionForm.title,
                description: newDiscussionForm.description
            });

            // Reset form
            setNewDiscussionForm({
                topic_id: '',
                title: '',
                description: ''
            });

            // Refresh discussions
            await fetchDiscussions();

            // Switch to discussions tab
            setActiveTab('discussions');
            setError(null);
        } catch (err) {
            console.error('Error posting discussion:', err);
            setError('Failed to post discussion');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Geometric Header */}
            <div className="relative h-28 sm:h-32 md:h-40 lg:h-48 overflow-hidden flex items-center">
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#8BC342] via-[#6fa332] to-[#8BC342]" />

                {/* Overlay for depth */}
                <div className="absolute inset-0 bg-black bg-opacity-20" />

                {/* Geometric design elements - responsive */}
                <div className="absolute top-0 left-0 w-48 sm:w-64 h-48 sm:h-64 bg-[#8BC342] opacity-20 transform -skew-x-12 -translate-x-16 sm:-translate-x-20 -translate-y-16 sm:-translate-y-20" />
                <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-[#6fa332] opacity-20 transform skew-x-12 translate-x-16 sm:translate-x-20 -translate-y-16 sm:-translate-y-20" />

                {/* Content */}
                <div className="relative z-10 flex items-center gap-3 sm:gap-4 md:gap-5 px-4 sm:px-6 md:px-8 w-full">
                    {/* Icon */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center border-2 sm:border-3 border-white/40 flex-shrink-0 backdrop-blur-sm">
                        <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[#8BC342]" strokeWidth={1.5} />
                    </div>

                    {/* Text */}
                    <div className="flex-1">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">
                            Chatter
                        </h1>
                        <p className="text-sm sm:text-base text-white/80 mt-0.5 sm:mt-1 font-medium">
                            Community discussions & insights
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            {/* Tabs Navigation */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                    <div className="flex gap-1 sm:gap-2 md:gap-4 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('about')}
                            className={`py-3 sm:py-4 px-3 sm:px-4 md:px-6 font-semibold text-sm sm:text-base border-b-3 transition-all whitespace-nowrap ${activeTab === 'about'
                                ? 'text-[#8BC342] border-[#8BC342]'
                                : 'text-gray-600 border-transparent hover:text-gray-900'
                                }`}
                        >
                            About
                        </button>
                        <button
                            onClick={() => setActiveTab('discussions')}
                            className={`py-3 sm:py-4 px-3 sm:px-4 md:px-6 font-semibold text-sm sm:text-base border-b-3 transition-all whitespace-nowrap ${activeTab === 'discussions'
                                ? 'text-[#8BC342] border-[#8BC342]'
                                : 'text-gray-600 border-transparent hover:text-gray-900'
                                }`}
                        >
                            Discussions
                        </button>
                        <button
                            onClick={() => setActiveTab('new')}
                            className={`py-3 sm:py-4 px-3 sm:px-4 md:px-6 font-semibold text-sm sm:text-base border-b-3 transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${activeTab === 'new'
                                ? 'text-[#8BC342] border-[#8BC342]'
                                : 'text-gray-600 border-transparent hover:text-gray-900'
                                }`}
                        >
                            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                            New
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10">
                {/* About Tab */}
                {activeTab === 'about' && (
                    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 max-w-4xl">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6">Welcome to Chatter</h2>

                        <div className="space-y-3 sm:space-y-4 md:space-y-6 text-gray-700 text-sm sm:text-base">
                            <p className="text-gray-900 font-semibold">The home of focused, high-quality bowling conversations.</p>

                            <p className="leading-relaxed">
                                This is where amateurs and pros connect, share perspectives, debate big ideas, and explore the sport’s past, present, and future. Whether you're reflecting on your journey, questioning why bowling is underrated, or imagining what the next decade of the sport looks like — Chatter is where those discussions belong.
                            </p>

                            <p className="leading-relaxed">
                                Join in, contribute meaningfully, and help shape the voice of the bowling community.
                            </p>

                            <div className="pt-4 border-t border-gray-200">
                                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mt-2 mb-3">Community Rules</h3>

                                <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm sm:text-base">
                                    <li>Choose the right topic before posting — keep each discussion in its proper lane.</li>
                                    <li>Stay relevant — all posts should contribute meaningfully to the chosen topic.</li>
                                    <li>Respect everyone — amateurs and pros are both essential to this community.</li>
                                    <li>No spam or self-promotion — keep the signal strong.</li>
                                    <li>Keep discussions constructive — challenge ideas, not people.</li>
                                    <li>Use clear titles — help others understand what your discussion is about at a glance.</li>
                                    <li>Share real experiences and honest opinions — authenticity drives the best conversations.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Discussions Tab */}
                {activeTab === 'discussions' && (
                    <div className="space-y-3 sm:space-y-4 md:space-y-5">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-800 p-3 sm:p-4 rounded-lg text-sm sm:text-base">
                                {error}
                            </div>
                        )}

                        {loading ? (
                            <div className="text-center py-8 sm:py-12 md:py-16">
                                <p className="text-gray-600 text-sm sm:text-base">Loading discussions...</p>
                            </div>
                        ) : discussions.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 md:p-12 text-center">
                                <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                                <p className="text-gray-600 mb-4 text-sm sm:text-base md:text-lg">No discussions yet</p>
                                <button
                                    onClick={() => setActiveTab('new')}
                                    className="bg-[#8BC342] hover:bg-[#6fa332] text-white px-4 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-lg font-semibold text-sm sm:text-base transition-colors"
                                >
                                    Start a Discussion
                                </button>
                            </div>
                        ) : (
                            discussions.map(discussion => (
                                <DiscussionCard 
                                    key={discussion.discussion_id} 
                                    discussion={discussion} 
                                    onUpdate={handleDiscussionUpdate}
                                />
                            ))
                        )}
                    </div>
                )}

                {/* New Discussion Tab */}
                {activeTab === 'new' && (
                    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8 max-w-3xl">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 md:mb-8">Start a New Discussion</h2>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-800 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 text-sm sm:text-base">{error}</div>
                        )}

                        <form onSubmit={handlePostDiscussion} className="space-y-6 sm:space-y-8 md:space-y-10">
                            {/* Topic Selection with Cards */}
                            <div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Select a Topic</h3>

                                {topics.length === 0 ? (
                                    <div className="text-center py-6 text-gray-500">Loading topics...</div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                                        {topics.map(topic => (
                                            <label
                                                key={topic.id}
                                                className={`p-4 sm:p-5 rounded-lg border-2 transition-all cursor-pointer ${newDiscussionForm.topic_id === String(topic.id)
                                                    ? 'border-[#8BC342] bg-green-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <input
                                                        type="radio"
                                                        name="topic"
                                                        value={topic.id}
                                                        checked={newDiscussionForm.topic_id === String(topic.id)}
                                                        onChange={(e) => setNewDiscussionForm({
                                                            ...newDiscussionForm,
                                                            topic_id: e.target.value
                                                        })}
                                                        className="w-5 h-5 mt-1 flex-shrink-0 accent-[#8BC342] cursor-pointer"
                                                    />
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-900 text-base sm:text-lg">{topic.topic}</h4>
                                                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">{topic.description}</p>
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Title and Description - shown after topic selection */}
                            {newDiscussionForm.topic_id && (
                                <>
                                    {/* Title */}
                                    <div>
                                        <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                                            Discussion Title
                                        </label>
                                        <input
                                            type="text"
                                            value={newDiscussionForm.title}
                                            onChange={(e) => setNewDiscussionForm({
                                                ...newDiscussionForm,
                                                title: e.target.value
                                            })}
                                            placeholder="What's your discussion about?"
                                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8BC342] focus:border-transparent text-sm sm:text-base"
                                            required
                                        />
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            value={newDiscussionForm.description}
                                            onChange={(e) => setNewDiscussionForm({
                                                ...newDiscussionForm,
                                                description: e.target.value
                                            })}
                                            placeholder="Share your thoughts, questions, or insights..."
                                            rows={6}
                                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8BC342] focus:border-transparent text-sm sm:text-base resize-none"
                                            required
                                        />
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="bg-[#8BC342] hover:bg-[#6fa332] disabled:bg-gray-400 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base"
                                        >
                                            {loading ? 'Posting...' : 'Post Discussion'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setNewDiscussionForm({
                                                    topic_id: '',
                                                    title: '',
                                                    description: ''
                                                });
                                                setActiveTab('discussions');
                                            }}
                                            className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </>
                            )}
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
