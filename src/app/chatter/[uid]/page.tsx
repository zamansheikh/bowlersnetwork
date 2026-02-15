'use client';

import { useState, useEffect } from 'react';
import { Award, ArrowLeft, Send, ChevronUp, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Author {
    user_id: number;
    username: string;
    name: string;
    first_name: string;
    last_name: string;
    email: string;
    profile_picture_url: string;
}

interface Opinion {
    opinion_id: number;
    opinion: string;
    created: string;
    edited: string;
    is_edited: boolean;
    is_upvoted_by_the_pros: boolean;
    point: number;
    point_str: string;
    author: Author;
    viewer_is_author: boolean;
    viewer_vote: boolean | null;
}

interface Discussion {
    discussion_id: number;
    uid: string;
    title: string;
    description: string;
    created: string;
    edited: string;
    is_upvoted_by_the_pros: boolean;
    point: number;
    point_str: string;
    author: Author;
    opinions: Opinion[];
    viewer_is_author: boolean;
    viewer_vote: boolean | null;
}

export default function DiscussionDetailPage() {
    const { user } = useAuth();
    const params = useParams();
    const uid = params.uid as string;

    const [discussion, setDiscussion] = useState<Discussion | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newOpinion, setNewOpinion] = useState('');
    const [postingOpinion, setPostingOpinion] = useState(false);

    // Fetch discussion details
    const fetchDiscussionDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/lanes/discussions/details/${uid}`);
            setDiscussion(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching discussion details:', err);
            setError('Failed to load discussion details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (uid) {
            fetchDiscussionDetails();
        }
    }, [uid]);

    // Handle vote
    const handleVote = async (nodeType: 'discussion' | 'opinion', nodeId: number, isUpvote: boolean) => {
        if (!discussion) return;

        try {
            const response = await api.post('/api/lanes/discussions/vote', {
                node_type: nodeType,
                node_id: nodeId,
                is_upvote: isUpvote
            });

            if (nodeType === 'discussion') {
                setDiscussion({
                    ...discussion,
                    point_str: response.data.point_str,
                    viewer_vote: isUpvote,
                    point: parseInt(response.data.point_str.replace(/[+\-\s]/g, ''))
                });
            } else {
                setDiscussion({
                    ...discussion,
                    opinions: discussion.opinions.map(o =>
                        o.opinion_id === nodeId
                            ? {
                                ...o,
                                point_str: response.data.point_str,
                                viewer_vote: isUpvote,
                                point: parseInt(response.data.point_str.replace(/[+\-\s]/g, ''))
                            }
                            : o
                    )
                });
            }
        } catch (err) {
            console.error('Error voting:', err);
        }
    };

    // Handle post opinion
    const handlePostOpinion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newOpinion.trim() || !discussion) return;

        try {
            setPostingOpinion(true);
            await api.post(`/api/lanes/discussions/opinion/${discussion.discussion_id}`, {
                opinion: newOpinion
            });

            // Refresh discussion details
            await fetchDiscussionDetails();
            setNewOpinion('');
            setError(null);
        } catch (err) {
            console.error('Error posting opinion:', err);
            setError('Failed to post opinion');
        } finally {
            setPostingOpinion(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10">
                    <div className="text-center py-12">
                        <p className="text-gray-600 text-base">Loading discussion...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !discussion) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10">
                    <Link href="/chatter" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">Back to Chatter</span>
                    </Link>
                    <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
                        {error || 'Discussion not found'}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10">
                {/* Back button */}
                <Link href="/chatter" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6">
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-medium">Back to Chatter</span>
                </Link>

                <div className="space-y-4">
                    {/* Discussion Card */}
                    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8">
                        <div className="flex items-start gap-3 sm:gap-4 mb-4">
                            {discussion.author.profile_picture_url ? (
                                <Image
                                    src={discussion.author.profile_picture_url}
                                    alt={discussion.author.name}
                                    width={48}
                                    height={48}
                                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
                                />
                            ) : (
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#8BC342] to-[#6fa332] flex items-center justify-center text-white font-bold flex-shrink-0">
                                    {discussion.author.name.split(' ').map(n => n[0]).join('')}
                                </div>
                            )}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-gray-900">{discussion.author.name}</h3>
                                    <span className="text-sm text-gray-500">@{discussion.author.username}</span>
                                    {discussion.is_upvoted_by_the_pros && (
                                        <div className="flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full">
                                            <Award className="w-3 h-3 text-[#8BC342]" />
                                            <span className="text-xs font-bold text-[#8BC342]">Pro Voted</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500">{discussion.created}</p>
                            </div>
                        </div>

                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3">{discussion.title}</h1>
                        <p className="text-gray-700 text-base leading-relaxed mb-4">{discussion.description}</p>

                        {/* Voting */}
                        <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                            <button
                                onClick={() => handleVote('discussion', discussion.discussion_id, true)}
                                className={`p-2 rounded transition-colors ${discussion.viewer_vote === true
                                    ? 'text-[#8BC342] bg-green-50'
                                    : 'text-gray-400 hover:text-[#8BC342] hover:bg-green-50'
                                    }`}
                            >
                                <ChevronUp className="w-6 h-6" />
                            </button>
                            <span className={`text-base font-bold min-w-[3rem] text-center ${discussion.point_str.startsWith('+') ? 'text-[#8BC342]' :
                                discussion.point_str.startsWith('-') ? 'text-red-600' :
                                    'text-gray-600'
                                }`}>
                                {discussion.point_str}
                            </span>
                            <button
                                onClick={() => handleVote('discussion', discussion.discussion_id, false)}
                                className={`p-2 rounded transition-colors ${discussion.viewer_vote === false
                                    ? 'text-red-600 bg-red-50'
                                    : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                                    }`}
                            >
                                <ChevronDown className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Opinions Section */}
                    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
                            Opinions ({discussion.opinions.length})
                        </h3>

                        {/* New Opinion Form */}
                        <form onSubmit={handlePostOpinion} className="mb-6">
                            <textarea
                                value={newOpinion}
                                onChange={(e) => setNewOpinion(e.target.value)}
                                placeholder="Share your opinion..."
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8BC342] focus:border-transparent resize-none"
                            />
                            <div className="flex justify-end mt-2">
                                <button
                                    type="submit"
                                    disabled={!newOpinion.trim() || postingOpinion}
                                    className="bg-[#8BC342] hover:bg-[#6fa332] disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                    {postingOpinion ? 'Posting...' : 'Post Opinion'}
                                </button>
                            </div>
                        </form>

                        {/* Opinions List */}
                        {discussion.opinions.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">No opinions yet. Be the first to share your thoughts!</p>
                        ) : (
                            <div className="space-y-4">
                                {discussion.opinions.map((opinion) => (
                                    <div key={opinion.opinion_id} className="border-l-2 border-gray-200 pl-4 py-2">
                                        <div className="flex items-start gap-3 mb-2">
                                            {opinion.author.profile_picture_url ? (
                                                <Image
                                                    src={opinion.author.profile_picture_url}
                                                    alt={opinion.author.name}
                                                    width={32}
                                                    height={32}
                                                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8BC342] to-[#6fa332] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                                                    {opinion.author.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-sm text-gray-900">{opinion.author.name}</span>
                                                    <span className="text-xs text-gray-500">@{opinion.author.username}</span>
                                                    {opinion.is_upvoted_by_the_pros && (
                                                        <div className="flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full">
                                                            <Award className="w-3 h-3 text-[#8BC342]" />
                                                            <span className="text-xs font-bold text-[#8BC342]">Pro Voted</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 mb-2">{opinion.created}</p>
                                                <p className="text-gray-700 text-sm leading-relaxed">{opinion.opinion}</p>

                                                {/* Opinion Voting */}
                                                <div className="flex items-center gap-2 mt-2">
                                                    <button
                                                        onClick={() => handleVote('opinion', opinion.opinion_id, true)}
                                                        className={`p-1 rounded transition-colors ${opinion.viewer_vote === true
                                                            ? 'text-[#8BC342] bg-green-50'
                                                            : 'text-gray-400 hover:text-[#8BC342] hover:bg-green-50'
                                                            }`}
                                                    >
                                                        <ChevronUp className="w-4 h-4" />
                                                    </button>
                                                    <span className={`text-xs font-semibold ${opinion.point_str.startsWith('+') ? 'text-[#8BC342]' :
                                                        opinion.point_str.startsWith('-') ? 'text-red-600' :
                                                            'text-gray-600'
                                                        }`}>
                                                        {opinion.point_str}
                                                    </span>
                                                    <button
                                                        onClick={() => handleVote('opinion', opinion.opinion_id, false)}
                                                        className={`p-1 rounded transition-colors ${opinion.viewer_vote === false
                                                            ? 'text-red-600 bg-red-50'
                                                            : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                                                            }`}
                                                    >
                                                        <ChevronDown className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
