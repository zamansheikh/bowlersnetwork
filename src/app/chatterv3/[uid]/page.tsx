'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    Bell,
    ChevronDown,
    ChevronUp,
    MessageCircle,
    Search,
    Send,
    Share2,
    UserCircle2,
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Discussion, Opinion } from '@/types/chatter';

const detailDummyImage = '/chatter_placeholder.png';

export default function ChatterV3DetailPage() {
    const params = useParams();
    const uid = params.uid as string;

    const [discussion, setDiscussion] = useState<Discussion | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newOpinion, setNewOpinion] = useState('');
    const [postingOpinion, setPostingOpinion] = useState(false);

    const fetchDiscussion = async () => {
        try {
            setLoading(true);
            const response = await api.get<Discussion>(`/api/lanes/discussions/details/${uid}`);
            setDiscussion(response.data);
            setError(null);
        } catch (err) {
            console.error('Error loading chatter v3 detail:', err);
            setError('Failed to load discussion details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (uid) {
            fetchDiscussion();
        }
    }, [uid]);

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

    const updateDiscussionVoteOptimistically = (isUpvote: boolean) => {
        if (!discussion) return;

        const currentPoint = discussion.point;
        const currentVote = discussion.viewer_vote;
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

        setDiscussion({
            ...discussion,
            viewer_vote: nextVote,
            point: nextPoint,
            point_str: nextPoint > 0 ? `+${nextPoint}` : `${nextPoint}`,
        });
    };

    const updateOpinionVoteOptimistically = (opinion: Opinion, isUpvote: boolean) => {
        if (!discussion) return;

        const currentPoint = opinion.point;
        const currentVote = opinion.viewer_vote;
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

        setDiscussion({
            ...discussion,
            opinions: discussion.opinions.map((item) =>
                item.opinion_id === opinion.opinion_id
                    ? {
                          ...item,
                          viewer_vote: nextVote,
                          point: nextPoint,
                          point_str: nextPoint > 0 ? `+${nextPoint}` : `${nextPoint}`,
                      }
                    : item
            ),
        });
    };

    const handleDiscussionVote = async (isUpvote: boolean) => {
        if (!discussion) return;

        updateDiscussionVoteOptimistically(isUpvote);

        try {
            await api.post('/api/lanes/discussions/vote', {
                node_type: 'discussion',
                node_id: discussion.discussion_id,
                is_upvote: isUpvote,
            });
            await fetchDiscussion();
        } catch (err) {
            console.error('Error voting on discussion:', err);
            await fetchDiscussion();
        }
    };

    const handleOpinionVote = async (opinion: Opinion, isUpvote: boolean) => {
        updateOpinionVoteOptimistically(opinion, isUpvote);

        try {
            await api.post('/api/lanes/discussions/vote', {
                node_type: 'opinion',
                node_id: opinion.opinion_id,
                is_upvote: isUpvote,
            });
            await fetchDiscussion();
        } catch (err) {
            console.error('Error voting on opinion:', err);
            await fetchDiscussion();
        }
    };

    const handlePostOpinion = async (e: FormEvent) => {
        e.preventDefault();
        if (!discussion || !newOpinion.trim()) return;

        try {
            setPostingOpinion(true);
            await api.post(`/api/lanes/discussions/opinion/${discussion.discussion_id}`, {
                opinion: newOpinion,
            });
            setNewOpinion('');
            await fetchDiscussion();
        } catch (err) {
            console.error('Error posting opinion:', err);
            setError('Failed to post opinion');
        } finally {
            setPostingOpinion(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f9fafb]">
            <div className="mx-auto max-w-[1220px] px-4 py-6">
                <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-[#101828]">Discussion Details</h1>
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

                <div className="mb-4">
                    <Link href="/chatterv3" className="inline-flex items-center gap-2 text-sm font-semibold text-[#4a5565] hover:text-[#101828]">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Chatter
                    </Link>
                </div>

                {loading && (
                    <div className="rounded-2xl border border-[#f3f4f6] bg-white p-6 text-center text-sm text-[#6a7282]">
                        Loading discussion...
                    </div>
                )}

                {!loading && (error || !discussion) && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                        {error || 'Discussion not found'}
                    </div>
                )}

                {!loading && discussion && (
                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
                        <section className="space-y-4">
                            <article className="overflow-hidden rounded-2xl border border-[#f3f4f6] bg-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
                                <div className="relative h-56 w-full overflow-hidden">
                                    <img
                                        src={detailDummyImage}
                                        alt={discussion.title}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src = '/chatter_placeholder.png';
                                        }}
                                    />
                                    <span className="absolute left-3 top-3 rounded-full bg-[#00c950] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.3px] text-white">
                                        Discussion
                                    </span>
                                </div>

                                <div className="p-4">
                                    <h2 className="text-2xl font-bold leading-8 text-[#101828]">{discussion.title}</h2>
                                    <p className="mt-2 text-sm leading-6 text-[#6a7282]">{discussion.description}</p>

                                    <div className="mt-3 flex items-center gap-2 border-b border-[#f9fafb] pb-3 text-xs text-[#99a1af]">
                                        <span className="text-[#4a5565]">By {discussion.author.name}</span>
                                        <span>•</span>
                                        <span>{discussion.created}</span>
                                        {discussion.is_upvoted_by_the_pros && (
                                            <span className="ml-2 rounded-full bg-green-50 px-2 py-0.5 font-semibold text-[#00a63e]">Pro Voted</span>
                                        )}
                                    </div>

                                    <div className="mt-3 flex items-center justify-between text-xs text-[#99a1af]">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() => handleDiscussionVote(true)}
                                                    className={`rounded p-1 transition-colors ${upvoteClass(discussion.viewer_vote)}`}
                                                    aria-label="Upvote discussion"
                                                >
                                                    <ChevronUp className="h-4 w-4" />
                                                </button>
                                                <span className={`min-w-[22px] text-center font-semibold ${scoreTextClass(discussion.point_str)}`}>
                                                    {discussion.point_str}
                                                </span>
                                                <button
                                                    onClick={() => handleDiscussionVote(false)}
                                                    className={`rounded p-1 transition-colors ${downvoteClass(discussion.viewer_vote)}`}
                                                    aria-label="Downvote discussion"
                                                >
                                                    <ChevronDown className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MessageCircle className="h-4 w-4" />
                                                <span>{discussion.opinions.length}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (typeof window !== 'undefined') {
                                                    navigator.clipboard.writeText(window.location.href);
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

                            <article className="rounded-2xl border border-[#f3f4f6] bg-white p-4 shadow-sm">
                                <h3 className="mb-3 text-lg font-bold text-[#101828]">Post Opinion</h3>
                                <form onSubmit={handlePostOpinion} className="space-y-3">
                                    <textarea
                                        value={newOpinion}
                                        onChange={(e) => setNewOpinion(e.target.value)}
                                        rows={4}
                                        placeholder="Share your opinion..."
                                        className="w-full rounded-[10px] border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2 text-sm text-[#101828] focus:outline-none"
                                    />
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={!newOpinion.trim() || postingOpinion}
                                            className="inline-flex items-center gap-2 rounded-[10px] bg-[#00a63e] px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                                        >
                                            <Send className="h-4 w-4" />
                                            {postingOpinion ? 'Posting...' : 'Post Opinion'}
                                        </button>
                                    </div>
                                </form>
                            </article>

                            <article className="rounded-2xl border border-[#f3f4f6] bg-white p-4 shadow-sm">
                                <h3 className="mb-4 text-lg font-bold text-[#101828]">Opinions ({discussion.opinions.length})</h3>

                                {discussion.opinions.length === 0 && (
                                    <p className="text-sm text-[#6a7282]">No opinions yet. Be the first to share your thoughts.</p>
                                )}

                                <div className="space-y-4">
                                    {discussion.opinions.map((opinion) => (
                                        <div key={opinion.opinion_id} className="rounded-xl border border-[#f3f4f6] bg-[#fcfcfd] p-3">
                                            <div className="mb-1 flex items-center gap-2 text-xs text-[#99a1af]">
                                                <span className="font-semibold text-[#4a5565]">{opinion.author.name}</span>
                                                <span>•</span>
                                                <span>{opinion.created}</span>
                                                {opinion.is_upvoted_by_the_pros && (
                                                    <span className="rounded-full bg-green-50 px-2 py-0.5 font-semibold text-[#00a63e]">Pro Voted</span>
                                                )}
                                            </div>
                                            <p className="text-sm leading-6 text-[#4a5565]">{opinion.opinion}</p>

                                            <div className="mt-2 flex items-center gap-1.5 text-xs">
                                                <button
                                                    onClick={() => handleOpinionVote(opinion, true)}
                                                    className={`rounded p-1 transition-colors ${upvoteClass(opinion.viewer_vote)}`}
                                                    aria-label="Upvote opinion"
                                                >
                                                    <ChevronUp className="h-4 w-4" />
                                                </button>
                                                <span className={`min-w-[22px] text-center font-semibold ${scoreTextClass(opinion.point_str)}`}>
                                                    {opinion.point_str}
                                                </span>
                                                <button
                                                    onClick={() => handleOpinionVote(opinion, false)}
                                                    className={`rounded p-1 transition-colors ${downvoteClass(opinion.viewer_vote)}`}
                                                    aria-label="Downvote opinion"
                                                >
                                                    <ChevronDown className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </article>
                        </section>

                        <aside className="space-y-4">
                            <div className="rounded-2xl border border-[#f3f4f6] bg-white p-4 shadow-sm">
                                <h3 className="mb-3 text-lg font-bold text-[#101828]">Discussion Stats</h3>
                                <div className="space-y-2.5 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[#4a5565]">Score</span>
                                        <span className="font-bold text-[#00a63e]">{discussion.point_str}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[#4a5565]">Opinions</span>
                                        <span className="font-bold text-[#00a63e]">{discussion.opinions.length}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[#4a5565]">Author</span>
                                        <span className="font-bold text-[#00a63e]">{discussion.author.username}</span>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                )}
            </div>
        </div>
    );
}
