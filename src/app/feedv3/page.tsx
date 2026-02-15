'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '@/lib/api';
import { FeedV3Post, PaginatedResponse } from '@/types/feedv3';
import { FeedV3PostCard, CreatePostV3 } from '@/components/feedv3';
import FeedSidebar from '@/components/FeedSidebar';

export default function FeedV3Page() {
    const [posts, setPosts] = useState<FeedV3Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const observer = useRef<IntersectionObserver | null>(null);
    const lastPostElementRef = useCallback((node: HTMLDivElement | null) => {
        if (loadingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loadingMore, hasMore]);

    const fetchFeed = async (pageNum: number, isLoadMore = false) => {
        try {
            if (isLoadMore) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            // Using the FeedV3 API endpoint
            const response = await api.get<PaginatedResponse<FeedV3Post>>(
                `/api/newsfeed/v1/feed/?page=${pageNum}&page_size=20`
            );

            const data = response.data;
            const newPosts = data.results || [];

            setHasMore(!!data.next);
            setPosts(prevPosts => isLoadMore ? [...prevPosts, ...newPosts] : newPosts);
            setError(null);
        } catch (err) {
            console.error('Error fetching feed v3:', err);
            setError('Failed to load feed');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        if (page === 1) {
            fetchFeed(1, false);
        } else {
            fetchFeed(page, true);
        }
    }, [page]);

    const handlePostChange = (updatedPost: FeedV3Post) => {
        setPosts(prevPosts =>
            prevPosts.map(post =>
                post.id === updatedPost.id ? updatedPost : post
            )
        );
    };

    const reloadFeed = () => {
        setPage(1);
        setHasMore(true);
        fetchFeed(1, false);
    };

    if (loading && posts.length === 0) {
        return (
            <div className="min-h-screen bg-gray-100">
                <div className="max-w-6xl mx-auto px-6 py-6">
                    <div className="flex gap-8">
                        <div className="flex-1 max-w-2xl">
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                                    <p className="text-gray-600">Loading feed...</p>
                                </div>
                            </div>
                        </div>
                        <div className="hidden lg:block">
                            <FeedSidebar />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error && posts.length === 0) {
        return (
            <div className="min-h-screen bg-gray-100">
                <div className="max-w-6xl mx-auto px-6 py-6">
                    <div className="flex gap-8">
                        <div className="flex-1 max-w-2xl">
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <p className="text-red-600 mb-4">{error}</p>
                                    <button
                                        onClick={reloadFeed}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="hidden lg:block">
                            <FeedSidebar />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-6xl mx-auto px-2 sm:px-4 md:px-6 py-4 md:py-6">
                <div className="flex flex-col lg:flex-row gap-4 md:gap-8">
                    {/* Main Content */}
                    <div className="flex-1 w-full max-w-4xl">
                        {/* Create Post Section */}
                        <div className="mb-4 md:mb-6">
                            <CreatePostV3 onPostCreated={reloadFeed} />
                        </div>

                        {/* Posts Feed */}
                        <div className="space-y-6">
                            {posts.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 text-lg mb-2">No posts yet</p>
                                    <p className="text-gray-400">Be the first to share something!</p>
                                </div>
                            ) : (
                                posts.map((post, index) => {
                                    if (posts.length === index + 1) {
                                        return (
                                            <div ref={lastPostElementRef} key={post.id}>
                                                <FeedV3PostCard
                                                    post={post}
                                                    onPostChange={handlePostChange}
                                                    onPostUpdate={reloadFeed}
                                                />
                                            </div>
                                        );
                                    } else {
                                        return (
                                            <FeedV3PostCard
                                                key={post.id}
                                                post={post}
                                                onPostChange={handlePostChange}
                                                onPostUpdate={reloadFeed}
                                            />
                                        );
                                    }
                                })
                            )}
                        </div>

                        {/* Loading More Indicator */}
                        {loadingMore && (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                                <p className="text-gray-600 mt-2">Loading more posts...</p>
                            </div>
                        )}

                        {posts.length > 0 && !hasMore && (
                            <div className="text-center mt-8 pb-8">
                                <p className="text-gray-500 font-medium italic">You've reached the end of the feed!</p>
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar */}
                    <div className="hidden lg:block">
                        <FeedSidebar />
                    </div>
                </div>
            </div>
        </div>
    );
}
