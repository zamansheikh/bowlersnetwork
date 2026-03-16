'use client';

import { useState } from 'react';
import { Bell, ChevronDown, ChevronUp, MessageCircle, Search, Share2, UserCircle2 } from 'lucide-react';

type DiscussionCard = {
    id: number;
    label: string;
    title: string;
    excerpt: string;
    author: string;
    posted: string;
    score: number;
    viewerVote: boolean | null;
    comments: number;
    imageUrl: string;
};

type SidebarArticle = {
    id: number;
    title: string;
    views: string;
    imageUrl: string;
};

const initialDiscussions: DiscussionCard[] = [
    {
        id: 1,
        label: 'Equipment',
        title: 'What is that one app that would help you in your game?',
        excerpt:
            'Looking for recommendations on apps that can track my scores, analyze my form, and help me improve consistency.',
        author: 'Rahul Sankar',
        posted: '1 hour ago',
        score: 24,
        viewerVote: null,
        comments: 8,
        imageUrl: 'https://www.figma.com/api/mcp/asset/b687925e-112d-4f58-aa14-9a395f64a641',
    },
    {
        id: 2,
        label: 'Pro Tip',
        title: 'Mastering the Hook: A Complete Guide',
        excerpt:
            'Learn the fundamentals of bowling hook shots, from grip techniques to release points in this guide.',
        author: 'Sarah Mitchell',
        posted: '3 hours ago',
        score: 156,
        viewerVote: null,
        comments: 42,
        imageUrl: 'https://www.figma.com/api/mcp/asset/a58ca32a-171a-42ca-b6fb-d5da0f4d8894',
    },
    {
        id: 3,
        label: 'Webinar',
        title: 'Two Handed Righty Spares: Webinar Follow-Up',
        excerpt:
            'Newer bowler here trying to find better score consistency. The recent webinar was very helpful.',
        author: 'Gavin Jager',
        posted: '5 hours ago',
        score: 89,
        viewerVote: null,
        comments: 23,
        imageUrl: 'https://www.figma.com/api/mcp/asset/5e4ae40e-310d-432e-a3df-efddd1bf115a',
    },
    {
        id: 4,
        label: 'Equipment',
        title: 'Choosing the Right Shoes for League Play',
        excerpt:
            'Slide or traction? Here is a quick breakdown of what to look for when buying high-performance shoes.',
        author: 'Mike Chen',
        posted: '6 hours ago',
        score: 67,
        viewerVote: null,
        comments: 14,
        imageUrl: 'https://www.figma.com/api/mcp/asset/399dbf04-a112-473e-b721-b0610467f518',
    },
    {
        id: 5,
        label: 'Events',
        title: 'Upcoming Regional Championship: Dates Announced',
        excerpt:
            'Mark your calendars. Regional championship registration opens next week for all divisions.',
        author: 'Tournament Director',
        posted: '1 day ago',
        score: 230,
        viewerVote: null,
        comments: 85,
        imageUrl: 'https://www.figma.com/api/mcp/asset/a58ca32a-171a-42ca-b6fb-d5da0f4d8894',
    },
    {
        id: 6,
        label: 'Local Leagues',
        title: 'Summer League Sign-ups Now Open',
        excerpt:
            'Get your teams ready. Summer league registration is now open for mixed, mens, and womens divisions.',
        author: 'Community Manager',
        posted: '1 day ago',
        score: 45,
        viewerVote: null,
        comments: 12,
        imageUrl: 'https://www.figma.com/api/mcp/asset/b687925e-112d-4f58-aa14-9a395f64a641',
    },
];

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
    const [discussions, setDiscussions] = useState<DiscussionCard[]>(initialDiscussions);

    const handleVote = (discussionId: number, isUpvote: boolean) => {
        setDiscussions((prev) =>
            prev.map((item) => {
                if (item.id !== discussionId) {
                    return item;
                }

                if (item.viewerVote === isUpvote) {
                    return {
                        ...item,
                        viewerVote: null,
                        score: isUpvote ? item.score - 1 : item.score + 1,
                    };
                }

                if (item.viewerVote === null) {
                    return {
                        ...item,
                        viewerVote: isUpvote,
                        score: isUpvote ? item.score + 1 : item.score - 1,
                    };
                }

                return {
                    ...item,
                    viewerVote: isUpvote,
                    score: isUpvote ? item.score + 2 : item.score - 2,
                };
            })
        );
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
                                className="h-10 w-full rounded-[14px] border border-[#e5e7eb] bg-[#f9fafb] pl-9 pr-24 text-sm text-[#101828] placeholder:text-[#99a1af] focus:outline-none"
                            />
                            <button className="absolute right-1.5 top-1.5 rounded-[10px] bg-[#00a63e] px-5 py-1.5 text-xs font-bold text-white shadow-sm">
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
                        <button className="mb-4 flex h-11 w-full items-center justify-center rounded-[10px] bg-[#00a63e] text-sm font-bold text-white shadow-sm hover:bg-[#009136]">
                            + Create Discussion
                        </button>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {discussions.map((item) => (
                                <article
                                    key={item.id}
                                    className="overflow-hidden rounded-2xl border border-[#f3f4f6] bg-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
                                >
                                    <div className="relative h-44 w-full overflow-hidden">
                                        <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                                        <span className="absolute left-3 top-3 rounded-full bg-[#00c950] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.3px] text-white">
                                            {item.label}
                                        </span>
                                    </div>

                                    <div className="p-4">
                                        <h3 className="line-clamp-2 text-lg font-bold leading-6 text-[#101828]">{item.title}</h3>
                                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#6a7282]">{item.excerpt}</p>

                                        <div className="mt-3 flex items-center gap-2 border-b border-[#f9fafb] pb-3 text-xs text-[#99a1af]">
                                            <span className="text-[#4a5565]">By {item.author}</span>
                                            <span>•</span>
                                            <span>{item.posted}</span>
                                        </div>

                                        <div className="mt-3 flex items-center justify-between text-xs text-[#99a1af]">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        onClick={() => handleVote(item.id, true)}
                                                        className={`rounded p-1 transition-colors ${item.viewerVote === true
                                                            ? 'bg-green-50 text-[#00a63e]'
                                                            : 'text-[#99a1af] hover:bg-green-50 hover:text-[#00a63e]'
                                                            }`}
                                                        aria-label="Upvote discussion"
                                                    >
                                                        <ChevronUp className="h-4 w-4" />
                                                    </button>
                                                    <span className={`min-w-[22px] text-center font-semibold ${item.score > 0 ? 'text-[#00a63e]' : item.score < 0 ? 'text-red-600' : 'text-[#99a1af]'
                                                        }`}>
                                                        {item.score}
                                                    </span>
                                                    <button
                                                        onClick={() => handleVote(item.id, false)}
                                                        className={`rounded p-1 transition-colors ${item.viewerVote === false
                                                            ? 'bg-red-50 text-red-600'
                                                            : 'text-[#99a1af] hover:bg-red-50 hover:text-red-600'
                                                            }`}
                                                        aria-label="Downvote discussion"
                                                    >
                                                        <ChevronDown className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MessageCircle className="h-4 w-4" />
                                                    <span>{item.comments}</span>
                                                </div>
                                            </div>
                                            <button className="flex items-center gap-1 hover:text-[#4a5565]">
                                                <Share2 className="h-4 w-4" />
                                                <span>Share</span>
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        <div className="mt-6 text-center">
                            <button className="rounded-[10px] border border-[#d1d5db] bg-white px-6 py-2 text-xs font-medium text-[#4a5565] hover:bg-[#f9fafb]">
                                Load More Discussions
                            </button>
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
        </div>
    );
}
