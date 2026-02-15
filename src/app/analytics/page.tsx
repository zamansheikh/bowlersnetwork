'use client';

import { useState } from 'react';
import { TrendingUp, Trophy, Target, Calendar, Award, Clock, MapPin, Users } from 'lucide-react';

export default function AnalyticsPage() {
    const [selectedPeriod, setSelectedPeriod] = useState('6months');

    // Mock data for the charts
    const performanceData = [
        { month: 'Jan', score: 175, average: 180 },
        { month: 'Feb', score: 185, average: 182 },
        { month: 'Mar', score: 195, average: 185 },
        { month: 'Apr', score: 210, average: 188 },
        { month: 'May', score: 225, average: 190 },
        { month: 'Jun', score: 240, average: 192 }
    ];

    const monthlyScores = [
        { month: 'Jan', score: 210 },
        { month: 'Feb', score: 205 },
        { month: 'Mar', score: 200 },
        { month: 'Apr', score: 235 },
        { month: 'May', score: 220 },
        { month: 'Jun', score: 195 }
    ];

    const recentActivities = [
        {
            id: 1,
            type: 'achievement',
            title: 'Earned Achievement: 200+ Game',
            time: '3 days ago',
            icon: Trophy
        },
        {
            id: 2,
            type: 'game',
            title: 'Logged Game: 187',
            time: '3 days ago',
            icon: Target
        },
        {
            id: 3,
            type: 'achievement',
            title: 'Watched: Mastering the hook shot',
            time: '4 days ago',
            icon: Award
        },
        {
            id: 4,
            type: 'tournament',
            title: 'Registered for City Tournament',
            time: '3 week ago',
            icon: Users
        }
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                        <p className="text-gray-600 text-sm mt-1">Track your bowling performance, content engagement, and platform activity.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <select 
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                            <option value="6months">Overview</option>
                            <option value="3months">3 Months</option>
                            <option value="1year">1 Year</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Achievements */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-600">Total Achievements</h3>
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">24/100</div>
                    <p className="text-xs text-gray-500">24% of all achievements unlocked</p>
                </div>

                {/* Achievement Points */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-600">Achievement Points</h3>
                        <Trophy className="w-4 h-4 text-pink-400" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">1,205</div>
                    <p className="text-xs text-gray-500">+12 from last month</p>
                </div>

                {/* Ranking */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-600">Ranking</h3>
                        <Award className="w-4 h-4 text-pink-400" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">Top 15%</div>
                    <p className="text-xs text-gray-500">Among all bowlers in your area</p>
                </div>

                {/* Recent Unlocks */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-600">Recent Unlocks</h3>
                        <Calendar className="w-4 h-4 text-pink-400" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">3</div>
                    <p className="text-xs text-gray-500">Upcoming tournaments this month</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Performance Overview */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance Overview</h3>
                    <p className="text-sm text-gray-600 mb-6">Your bowling performance over the last 6 months</p>
                    
                    {/* Line Chart */}
                    <div className="relative h-64">
                        <svg className="w-full h-full" viewBox="0 0 400 200">
                            {/* Grid lines */}
                            <defs>
                                <pattern id="grid" width="50" height="25" patternUnits="userSpaceOnUse">
                                    <path d="M 50 0 L 0 0 0 25" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                            
                            {/* Y-axis labels */}
                            <text x="10" y="180" className="text-xs fill-gray-500">150</text>
                            <text x="10" y="140" className="text-xs fill-gray-500">175</text>
                            <text x="10" y="100" className="text-xs fill-gray-500">200</text>
                            <text x="10" y="60" className="text-xs fill-gray-500">225</text>
                            <text x="10" y="20" className="text-xs fill-gray-500">250</text>
                            
                            {/* X-axis labels */}
                            <text x="60" y="195" className="text-xs fill-gray-500">Jan</text>
                            <text x="120" y="195" className="text-xs fill-gray-500">Feb</text>
                            <text x="180" y="195" className="text-xs fill-gray-500">Mar</text>
                            <text x="240" y="195" className="text-xs fill-gray-500">Apr</text>
                            <text x="300" y="195" className="text-xs fill-gray-500">May</text>
                            <text x="360" y="195" className="text-xs fill-gray-500">Jun</text>
                            
                            {/* Score line (red) */}
                            <polyline
                                fill="none"
                                stroke="#ef4444"
                                strokeWidth="2"
                                points="60,140 120,120 180,100 240,80 300,60 360,40"
                            />
                            
                            {/* Average line (dark blue) */}
                            <polyline
                                fill="none"
                                stroke="#1e40af"
                                strokeWidth="2"
                                points="60,135 120,130 180,125 240,115 300,110 360,105"
                            />
                            
                            {/* Data points */}
                            {performanceData.map((point, index) => (
                                <g key={index}>
                                    <circle cx={60 + index * 60} cy={140 - ((point.score - 150) * 1.2)} r="4" fill="#ef4444" />
                                    <circle cx={60 + index * 60} cy={140 - ((point.average - 150) * 1.2)} r="4" fill="#1e40af" />
                                </g>
                            ))}
                        </svg>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Recent Activity</h3>
                    <p className="text-sm text-gray-600 mb-6">Your latest actions across the platform</p>
                    
                    <div className="space-y-4">
                        {recentActivities.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <activity.icon className="w-4 h-4 text-green-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-900 font-medium">{activity.title}</p>
                                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Game Scores Chart */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Your game scores over year vs goal games</h3>
                    
                    {/* Bar Chart */}
                    <div className="relative h-64 mt-6">
                        <svg className="w-full h-full" viewBox="0 0 400 200">
                            {/* Y-axis labels */}
                            <text x="10" y="180" className="text-xs fill-gray-500">150</text>
                            <text x="10" y="140" className="text-xs fill-gray-500">175</text>
                            <text x="10" y="100" className="text-xs fill-gray-500">200</text>
                            <text x="10" y="60" className="text-xs fill-gray-500">225</text>
                            <text x="10" y="20" className="text-xs fill-gray-500">250</text>
                            
                            {/* X-axis labels */}
                            <text x="60" y="195" className="text-xs fill-gray-500">Jan</text>
                            <text x="120" y="195" className="text-xs fill-gray-500">Feb</text>
                            <text x="180" y="195" className="text-xs fill-gray-500">Mar</text>
                            <text x="240" y="195" className="text-xs fill-gray-500">Apr</text>
                            <text x="300" y="195" className="text-xs fill-gray-500">May</text>
                            <text x="360" y="195" className="text-xs fill-gray-500">Jun</text>
                            
                            {/* Bars */}
                            {monthlyScores.map((data, index) => {
                                const barHeight = (data.score - 150) * 1.2;
                                return (
                                    <rect
                                        key={index}
                                        x={45 + index * 60}
                                        y={180 - barHeight}
                                        width="30"
                                        height={barHeight}
                                        fill="#8BC342"
                                        rx="2"
                                    />
                                );
                            })}
                        </svg>
                    </div>
                </div>

                {/* Statistics */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <div className="grid grid-cols-2 gap-8">
                        <div className="text-center">
                            <h4 className="text-sm font-medium text-gray-600 mb-2">Average</h4>
                            <div className="text-3xl font-bold text-gray-900">187</div>
                        </div>
                        <div className="text-center">
                            <h4 className="text-sm font-medium text-gray-600 mb-2">High Game</h4>
                            <div className="text-3xl font-bold text-gray-900">210</div>
                        </div>
                        <div className="text-center">
                            <h4 className="text-sm font-medium text-gray-600 mb-2">Strike %</h4>
                            <div className="text-3xl font-bold text-gray-900">42%</div>
                        </div>
                        <div className="text-center">
                            <h4 className="text-sm font-medium text-gray-600 mb-2">Spare %</h4>
                            <div className="text-3xl font-bold text-gray-900">68%</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
