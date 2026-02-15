'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FeedPost } from '@/types';
import CreatePost from '@/components/CreatePost';
import FeedPostCard from '@/components/FeedPostCard';
import FeedSidebar from '@/components/FeedSidebar';

export default function FeedPage() {
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFeed = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/posts/v2/feed');
            setPosts(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching feed:', err);
            setError('Failed to load feed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeed();
    }, []);

    const handlePostChange = (updatedPost: FeedPost) => {
        setPosts(prevPosts =>
            prevPosts.map(post =>
                post.post_id === updatedPost.post_id ? updatedPost : post
            )
        );
    };

    if (loading) {
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

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100">
                <div className="max-w-6xl mx-auto px-6 py-6">
                    <div className="flex gap-8">
                        <div className="flex-1 max-w-2xl">
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <p className="text-red-600 mb-4">{error}</p>
                                    <button
                                        onClick={() => window.location.reload()}
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
                        <CreatePost onPostCreated={fetchFeed} />
                        </div>

                        {/* Posts Feed */}
                        <div className="space-y-6">
                            {posts.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 text-lg mb-2">No posts yet</p>
                                    <p className="text-gray-400">Be the first to share something!</p>
                                </div>
                            ) : (
                                posts.map((post) => (
                                    <FeedPostCard
                                        key={post.post_id}
                                        post={post}
                                        onPostChange={handlePostChange}
                                    />
                                ))
                            )}
                        </div>

                        {/* Load More Button (if needed in future) */}
                        {posts.length > 0 && (
                            <div className="text-center mt-8">
                                <button className="text-green-600 hover:text-green-700 font-medium">
                                    Load more posts
                                </button>
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
