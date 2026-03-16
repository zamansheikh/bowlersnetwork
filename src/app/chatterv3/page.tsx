'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    Bell,
    ChevronDown,
    ChevronUp,
    MessageCircle,
    Search,
    Share2,
    UserCircle2,
    X,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Discussion, Topic } from '@/types/chatter';

type SidebarArticle = {
    id: number;
    title: string;
    views: string;
    imageUrl: string;
};

const cardLabels = ['Equipment', 'Pro Tip', 'Webinar', 'Events', 'Training', 'Community'];
const dummyCardImage = '/chatter_placeholder.png';

const mostRead: SidebarArticle[] = [
    {
        id: 1,
        title: 'Best bowling balls for beginners in 2026',
        views: '12.5k views',
        imageUrl: 'https://www.figma.com/api/mcp/asset/a58ca32a-171a-42ca-b6fb-d5da0f4d8894',
    },
    {
        id: 2,
        title: 'How to perfect your hook technique',
        views: '8.2k views',
        imageUrl: 'https://www.figma.com/api/mcp/asset/a1894541-fc9d-4179-80c4-5cb47594e521',
    },
    {
        id: 3,
        title: 'Local league championship results',
        views: '6.8k views',
        imageUrl: 'https://www.figma.com/api/mcp/asset/5e4ae40e-310d-432e-a3df-efddd1bf115a',
    },
];

const tags = ['#Equipment', '#ProTips', '#Tournaments', '#LocalLeagues', '#Training', '#GearReview', '#BeginnerHelp'];

export default function ChatterV3Page() {
    const [discussions, setDiscussions] = useState<Discussion[]>([]);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newDiscussionForm, setNewDiscussionForm] = useState({
        topic_id: '',
        title: '',
        description: '',
    });

    const fetchDiscussions = async () => {
        try {
            setLoading(true);
            const response = await api.get<Discussion[]>('/api/lanes/discussions/feed');
            setDiscussions(response.data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching chatter v3 feed:', err);
            setError('Failed to load discussions');
        } finally {
            setLoading(false);
        }
    };

    const fetchTopics = async () => {
        try {
            const response = await api.get<Topic[]>('/api/lanes/discussions/topics');
            setTopics(response.data || []);
        } catch (err) {
            console.error('Error fetching topics:', err);
        }
    };

    useEffect(() => {
        fetchDiscussions();
        fetchTopics();
    }, []);

    const filteredDiscussions = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) {
            return discussions;
        }

        return discussions.filter((item) => {
            return (
                item.title.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query) ||
                item.author.name.toLowerCase().includes(query)
            );
        });
    }, [discussions, search]);

    const upvoteClass = (viewerVote: boolean | null) => {
        return viewerVote === true
            ? 'bg-green-50 text-[#00a63e]'
            : 'text-[#99a1af] hover:bg-green-50 hover:text-[#00a63e]';
    };

    const downvoteClass = (viewerVote: boolean | null) => {
        return viewerVote === false
            ? 'bg-red-50 text-red-600'
            : 'text-[#99a1af] hover:bg-red-50 hover:text-red-600';
    };

    const scoreTextClass = (pointStr: string) => {
        if (pointStr.startsWith('+')) return 'text-[#00a63e]';
        if (pointStr.startsWith('-')) return 'text-red-600';
        return 'text-[#99a1af]';
    };

    const handleVote = async (discussionId: number, isUpvote: boolean) => {
        setDiscussions((prev) =>
            prev.map((item) => {
                if (item.discussion_id !== discussionId) return item;

                const currentPoint = item.point;
                const currentVote = item.viewer_vote;
                let nextPoint = currentPoint;
                let nextVote: boolean | null = currentVote;

                if (currentVote === isUpvote) {
                    nextVote = null;
                    nextPoint = isUpvote ? currentPoint - 1 : currentPoint + 1;
                } else if (currentVote === null) {
                    nextVote = isUpvote;
                    nextPoint = isUpvote ? currentPoint + 1 : currentPoint - 1;
                } else {
                    nextVote = isUpvote;
                    nextPoint = isUpvote ? currentPoint + 2 : currentPoint - 2;
                }

                return {
                    ...item,
                    point: nextPoint,
                    point_str: nextPoint > 0 ? `+${nextPoint}` : `${nextPoint}`,
                    viewer_vote: nextVote,
                };
            })
        );

        try {
            await api.post('/api/lanes/discussions/vote', {
                node_type: 'discussion',
                node_id: discussionId,
                is_upvote: isUpvote,
            });
            const response = await api.get<Discussion[]>(`/api/lanes/discussions/feed`);
            setDiscussions(response.data || []);
        } catch (err) {
            console.error('Error voting on discussion:', err);
            fetchDiscussions();
        }
    };

    const handleCreateDiscussion = async (e: FormEvent) => {
        e.preventDefault();
        if (!newDiscussionForm.topic_id || !newDiscussionForm.title || !newDiscussionForm.description) {
            setError('Please fill in all fields');
            return;
        }

        try {
            setIsSubmitting(true);
            await api.post('/api/lanes/discussions', {
                topic_id: parseInt(newDiscussionForm.topic_id, 10),
                title: newDiscussionForm.title,
                description: newDiscussionForm.description,
            });

            setNewDiscussionForm({ topic_id: '', title: '', description: '' });
            setIsCreateOpen(false);
            await fetchDiscussions();
            setError(null);
        } catch (err) {
            console.error('Error creating discussion:', err);
            setError('Failed to create discussion');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f9fafb]">
            <div className="mx-auto max-w-[1220px] px-4 py-6">
                <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-[#101828]">Chatter</h1>
                        <p className="text-xs text-[#6a7282]">Community discussions & insights</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative w-full lg:w-[560px]">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#99a1af]" />
                            <input
                                placeholder="Search discussions, topics, members..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-10 w-full rounded-[14px] border border-[#e5e7eb] bg-[#f9fafb] pl-9 pr-24 text-sm text-[#101828] placeholder:text-[#99a1af] focus:outline-none"
                            />
                            <button
                                onClick={() => setSearch(search.trim())}
                                className="absolute right-1.5 top-1.5 rounded-[10px] bg-[#00a63e] px-5 py-1.5 text-xs font-bold text-white shadow-sm"
                            >
                                Search
                            </button>
                        </div>

                        <button className="relative rounded-full p-2 text-[#6a7282] hover:bg-white">
                            <Bell className="h-5 w-5" />
                            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border border-white bg-red-500" />
                        </button>
                        <button className="rounded-full bg-[#f3f4f6] p-2 text-[#6a7282] hover:bg-white">
                            <UserCircle2 className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
                    <section>
                        <button
                            onClick={() => setIsCreateOpen(true)}
                            className="mb-4 flex h-11 w-full items-center justify-center rounded-[10px] bg-[#00a63e] text-sm font-bold text-white shadow-sm hover:bg-[#009136]"
                        >
                            + Create Discussion
                        </button>

                        {error && (
                            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        {loading && (
                            <div className="mb-4 rounded-xl border border-[#f3f4f6] bg-white px-4 py-8 text-center text-sm text-[#6a7282]">
                                Loading discussions...
                            </div>
                        )}

                        {!loading && filteredDiscussions.length === 0 && (
                            <div className="mb-4 rounded-xl border border-[#f3f4f6] bg-white px-4 py-8 text-center text-sm text-[#6a7282]">
                                No discussions found.
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {filteredDiscussions.map((item, index) => (
                                <article
                                    key={item.discussion_id}
                                    className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#f3f4f6] bg-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
                                >
                                    <Link href={`/chatterv3/${item.uid}`} className="relative block h-44 w-full overflow-hidden">
                                        <img
                                            src={dummyCardImage}
                                            alt={item.title}
                                            className="h-full w-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = '/chatter_placeholder.png';
                                            }}
                                        />
                                        <span className="absolute left-3 top-3 rounded-full bg-[#00c950] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.3px] text-white">
                                            {cardLabels[index % cardLabels.length]}
                                        </span>
                                    </Link>

                                    <div className="flex flex-1 flex-col p-4">
                                        <Link href={`/chatterv3/${item.uid}`}>
                                            <h3 className="line-clamp-2 min-h-12 text-lg font-bold leading-6 text-[#101828]">{item.title}</h3>
                                            <p className="mt-2 line-clamp-3 min-h-[72px] text-sm leading-6 text-[#6a7282]">{item.description}</p>
                                        </Link>

                                        <div className="mt-3 flex items-center gap-2 border-b border-[#f9fafb] pb-3 text-xs text-[#99a1af]">
                                            <span className="text-[#4a5565]">By {item.author.name}</span>
                                            <span>•</span>
                                            <span>{item.created}</span>
                                        </div>

                                        <div className="mt-auto flex min-h-8 items-center justify-between pt-3 text-xs text-[#99a1af]">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        onClick={() => handleVote(item.discussion_id, true)}
                                                        className={`rounded p-1 transition-colors ${upvoteClass(item.viewer_vote)}`}
                                                        aria-label="Upvote discussion"
                                                    >
                                                        <ChevronUp className="h-4 w-4" />
                                                    </button>
                                                    <span className={`min-w-[22px] text-center font-semibold ${scoreTextClass(item.point_str)}`}>
                                                        {item.point_str}
                                                    </span>
                                                    <button
                                                        onClick={() => handleVote(item.discussion_id, false)}
                                                        className={`rounded p-1 transition-colors ${downvoteClass(item.viewer_vote)}`}
                                                        aria-label="Downvote discussion"
                                                    >
                                                        <ChevronDown className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <Link href={`/chatterv3/${item.uid}`} className="flex items-center gap-1 hover:text-[#4a5565]">
                                                    <MessageCircle className="h-4 w-4" />
                                                    <span>{item.opinions.length}</span>
                                                </Link>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if (typeof window !== 'undefined') {
                                                        navigator.clipboard.writeText(`${window.location.origin}/chatterv3/${item.uid}`);
                                                    }
                                                }}
                                                className="flex items-center gap-1 hover:text-[#4a5565]"
                                            >
                                                <Share2 className="h-4 w-4" />
                                                <span>Share</span>
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        <div className="mt-6 text-center">
                            <Link
                                href="/chatter"
                                className="inline-block rounded-[10px] border border-[#d1d5db] bg-white px-6 py-2 text-xs font-medium text-[#4a5565] hover:bg-[#f9fafb]"
                            >
                                Open Classic Chatter
                            </Link>
                        </div>
                    </section>

                    <aside className="space-y-4">
                        <div className="rounded-2xl border border-[#f3f4f6] bg-white p-4 shadow-sm">
                            <h3 className="mb-3 text-lg font-bold text-[#101828]">Most-read Articles</h3>
                            <div className="space-y-3">
                                {mostRead.map((article) => (
                                    <div key={article.id} className="flex gap-3">
                                        <img
                                            src={article.imageUrl}
                                            alt={article.title}
                                            className="h-14 w-14 rounded-[10px] object-cover"
                                        />
                                        <div>
                                            <p className="line-clamp-2 text-sm font-bold leading-4 text-[#101828]">{article.title}</p>
                                            <p className="mt-1 text-xs text-[#99a1af]">{article.views}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-[#f3f4f6] bg-white p-4 shadow-sm">
                            <h3 className="mb-3 text-lg font-bold text-[#101828]">Popular Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag) => (
                                    <span key={tag} className="rounded-full bg-[#f9fafb] px-3 py-1.5 text-xs text-[#4a5565]">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-[#f3f4f6] bg-white p-4 shadow-sm">
                            <h3 className="mb-3 text-lg font-bold text-[#101828]">Community Stats</h3>
                            <div className="space-y-2.5 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-[#4a5565]">Active Members</span>
                                    <span className="font-bold text-[#00a63e]">15.2k</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[#4a5565]">Discussions</span>
                                    <span className="font-bold text-[#00a63e]">2,847</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[#4a5565]">Events This Week</span>
                                    <span className="font-bold text-[#00a63e]">12</span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-[#dcfce7] bg-white p-4 shadow-sm">
                            <h3 className="text-lg font-bold text-[#101828]">Stay in the Know</h3>
                            <p className="mt-2 text-sm leading-6 text-[#6a7282]">
                                Subscribe to get updates on the latest discussions and bowling tips directly to your inbox.
                            </p>
                            <div className="mt-3 space-y-3">
                                <input
                                    placeholder="Enter your email"
                                    className="h-10 w-full rounded-[10px] border border-[#e5e7eb] bg-[#f9fafb] px-3 text-sm text-[#101828] placeholder:text-[#99a1af] focus:outline-none"
                                />
                                <button className="h-10 w-full rounded-[10px] bg-[#00a63e] text-sm font-bold text-white hover:bg-[#009136]">
                                    Subscribe Now
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
                    <div className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-[#101828]">Create Discussion</h2>
                            <button
                                onClick={() => setIsCreateOpen(false)}
                                className="rounded-md p-1 text-[#6a7282] hover:bg-[#f3f4f6]"
                                aria-label="Close"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateDiscussion} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-[#4a5565]">Topic</label>
                                <select
                                    value={newDiscussionForm.topic_id}
                                    onChange={(e) => setNewDiscussionForm((prev) => ({ ...prev, topic_id: e.target.value }))}
                                    className="h-10 w-full rounded-[10px] border border-[#e5e7eb] bg-[#f9fafb] px-3 text-sm text-[#101828] focus:outline-none"
                                >
                                    <option value="">Select a topic</option>
                                    {topics.map((topic) => (
                                        <option key={topic.id} value={topic.id}>
                                            {topic.topic}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-[#4a5565]">Title</label>
                                <input
                                    value={newDiscussionForm.title}
                                    onChange={(e) => setNewDiscussionForm((prev) => ({ ...prev, title: e.target.value }))}
                                    placeholder="Discussion title"
                                    className="h-10 w-full rounded-[10px] border border-[#e5e7eb] bg-[#f9fafb] px-3 text-sm text-[#101828] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-[#4a5565]">Description</label>
                                <textarea
                                    value={newDiscussionForm.description}
                                    onChange={(e) => setNewDiscussionForm((prev) => ({ ...prev, description: e.target.value }))}
                                    rows={5}
                                    placeholder="Write your discussion"
                                    className="w-full rounded-[10px] border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2 text-sm text-[#101828] focus:outline-none"
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="rounded-[10px] border border-[#d1d5db] bg-white px-4 py-2 text-sm font-medium text-[#4a5565]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="rounded-[10px] bg-[#00a63e] px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                                >
                                    {isSubmitting ? 'Posting...' : 'Post Discussion'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
