'use client';

import { useState } from 'react';
import { Calendar, CheckCircle, Clock, Target, AlertCircle, MessageCircle } from 'lucide-react';

export default function RoadmapPage() {
    const [expandedWeek, setExpandedWeek] = useState<string | null>('week1');

    const roadmapItems = [
        {
            id: 'week1',
            title: 'Week 1',
            period: 'First 7 Days',
            features: [
                {
                    name: 'Tournament People Input System',
                    description: 'A clearer and improved system for adding players into tournaments.',
                    details: [
                        'Improved clarity and input flow for tournament participant data',
                        'Streamlined fields for bowler details, categories, records',
                        'Optimized for both centre owners and tournament officials',
                        'Ensures clean data before tournaments begin'
                    ],
                    icon: '📝'
                },
                {
                    name: 'Match Analytics System (Basic Version)',
                    description: 'Real-time match analytics for league and tournament games',
                    details: [
                        'Frame-by-frame breakdown',
                        'Performance tracking for bowlers',
                        'Foundation for future advanced analytics modules'
                    ],
                    icon: '📊'
                }
            ]
        },
        {
            id: 'week2',
            title: 'Week 2',
            period: 'Days 8–14',
            features: [
                {
                    name: 'Full Tournament System',
                    description: 'Complete tournament flow including registration, fixtures, and results.',
                    details: [
                        'Full tournament workflow from registration → fixtures → results',
                        'Dynamic leaderboards',
                        'Match result integration'
                    ],
                    icon: '🏆'
                },
                {
                    name: 'Team Management',
                    description: 'Create and manage teams, edit rosters, and track team performance.',
                    details: [
                        'Team creation, management, roles, roster updates',
                        'Linked stats for each bowler',
                        'Team comparison and match-up statistics'
                    ],
                    icon: '👥'
                },
                {
                    name: 'Media Section for Professional Bowlers',
                    description: 'Profiles with photos, videos, and highlights for professional bowlers.',
                    details: [
                        'Dedicated pro bowler profiles with highlight videos',
                        'Photo galleries, achievements, and previous match moments',
                        'A space for fans to follow and collect their favourite pros'
                    ],
                    icon: '🎥'
                },
                {
                    name: 'XP, Follow, Collect, and New Landing Page',
                    description: 'Earn XP, follow bowlers, collect cards, and access the updated landing page.',
                    details: [
                        'Core gamification layer',
                        'XP system integrated with matches, cards, and fan actions',
                        'Follow/Collect actions enabled for bowlers and cards',
                        'Updated landing page showing live stats and trending bowlers'
                    ],
                    icon: '⭐'
                },
                {
                    name: 'Centre Interaction Dashboard',
                    description: 'Dashboard for bowling centres to view matches, manage events, and access analytics.',
                    details: [
                        'Dashboard for bowling centres',
                        'View matches, tournaments, and bowler engagement',
                        'Control panel for creating events',
                        'Early analytics for player performance'
                    ],
                    icon: '🖥️'
                },
                {
                    name: 'Expanded Trading Card Options',
                    description: 'New card designs, variations, and enhanced card features.',
                    details: [
                        'More card templates',
                        'Additional rarity tiers',
                        'Enhanced visual designs',
                        'New card attributes (XP, skill ratings, form score, etc.)'
                    ],
                    icon: '🎴'
                }
            ]
        },
        {
            id: 'december1',
            title: 'December 1',
            period: 'Full Release',
            features: [
                {
                    name: 'Complete Trading Card System (Full Release)',
                    description: 'Full trading card experience including real-time stat updates, pack openings, seasonal cards, and advanced visuals.',
                    details: [
                        'Fully dynamic card generation',
                        'Real-time stat updates',
                        'Seasonal and limited edition card sets',
                        'Integration with XP, achievements, and leaderboards'
                    ],
                    icon: '🔥'
                }
            ]
        }
    ];

    const summaryTimeline = [
        { feature: 'Tournament General People Input System', target: 'Week 1' },
        { feature: 'Full Match Analytics System', target: 'Week 1' },
        { feature: 'Complete Tournament System', target: 'Week 2' },
        { feature: 'Complete Team Management', target: 'Week 2' },
        { feature: 'Media Section for Pros', target: 'Week 2' },
        { feature: 'XP + Collect & Follow + Landing Page', target: 'Week 2' },
        { feature: 'Centre Interaction Dashboard', target: 'Week 2' },
        { feature: 'Expanded Trading Card Options', target: 'Week 2' },
        { feature: 'Complete Trading Card System', target: 'December 1, 2025' }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Bowlers Network Beta Roadmap</h1>
                    <p className="text-lg text-gray-600">
                        A transparent view of features we're developing and timelines for launch
                    </p>
                </div>
            </div>

            {/* Overview Section */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-lg p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <Target className="w-6 h-6 text-green-600" />
                                <h3 className="text-lg font-semibold text-gray-900">Rapid Updates</h3>
                            </div>
                            <p className="text-gray-600 text-sm">Features will be rolled out continuously, sometimes multiple times a week.</p>
                        </div>
                        <div className="bg-white rounded-lg p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <AlertCircle className="w-6 h-6 text-orange-600" />
                                <h3 className="text-lg font-semibold text-gray-900">Beta Experience</h3>
                            </div>
                            <p className="text-gray-600 text-sm">You may encounter UI/UX glitches or missing data points. Please report them.</p>
                        </div>
                        <div className="bg-white rounded-lg p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-2">
                                <MessageCircle className="w-6 h-6 text-blue-600" />
                                <h3 className="text-lg font-semibold text-gray-900">Your Feedback</h3>
                            </div>
                            <p className="text-gray-600 text-sm">Your input directly shapes the next updates and improvements.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Roadmap Details */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="space-y-6">
                    {roadmapItems.map((phase, index) => (
                        <div key={phase.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                            {/* Phase Header */}
                            <button
                                onClick={() => setExpandedWeek(expandedWeek === phase.id ? null : phase.id)}
                                className="w-full px-6 py-6 hover:bg-gray-50 transition-colors border-l-4 border-green-600 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="bg-green-100 rounded-full p-3">
                                        <Calendar className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div className="text-left">
                                        <h2 className="text-2xl font-bold text-gray-900">{phase.title}</h2>
                                        <p className="text-gray-600 text-sm">{phase.period}</p>
                                    </div>
                                </div>
                                <div className="text-gray-400">
                                    {expandedWeek === phase.id ? '▼' : '▶'}
                                </div>
                            </button>

                            {/* Phase Content */}
                            {expandedWeek === phase.id && (
                                <div className="border-t border-gray-100 px-6 py-6 space-y-6">
                                    {phase.features.map((feature, fIndex) => (
                                        <div key={fIndex} className="border-l-4 border-blue-200 pl-4">
                                            <div className="flex items-start gap-3 mb-3">
                                                <span className="text-2xl">{feature.icon}</span>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">{feature.name}</h3>
                                                    <p className="text-gray-600 text-sm">{feature.description}</p>
                                                </div>
                                            </div>
                                            <ul className="space-y-2 ml-11">
                                                {feature.details.map((detail, dIndex) => (
                                                    <li key={dIndex} className="flex items-start gap-2 text-gray-700 text-sm">
                                                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                        <span>{detail}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Summary Timeline */}
            <div className="bg-gray-100 border-t border-gray-200 py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">Summary Timeline Snapshot</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {summaryTimeline.map((item, index) => (
                            <div key={index} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                                <p className="text-sm font-medium text-gray-900 mb-2">{item.feature}</p>
                                <div className="flex items-center gap-2 text-green-600">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-xs font-semibold">{item.target}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 py-12">
                <div className="max-w-7xl mx-auto px-6 text-center text-white">
                    <h2 className="text-3xl font-bold mb-4">Help Shape Bowlers Network</h2>
                    <p className="text-lg mb-6 text-green-100">
                        Your feedback directly influences our roadmap and feature prioritization.
                    </p>
                    <a
                        href="/feedback"
                        className="inline-block bg-white text-green-600 hover:bg-green-50 font-semibold py-3 px-8 rounded-lg transition-colors"
                    >
                        Send Feedback
                    </a>
                </div>
            </div>
        </div>
    );
}
