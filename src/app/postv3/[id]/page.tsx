"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { FeedV3Post } from "@/types/feedv3";
import FeedV3PostCard from "@/components/feedv3/FeedV3PostCard";

export default function PostV3DetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const postId = params.id as string;

    const [post, setPost] = useState<FeedV3Post | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch post details by numeric id
    const fetchPost = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await api.get(`/api/newsfeed/v1/${postId}`);
            setPost(response.data);
        } catch (err: any) {
            console.error("Error fetching post:", err);
            setError("Failed to load post");
        } finally {
            setIsLoading(false);
        }
    }, [postId]);

    useEffect(() => {
        if (postId && user?.access_token) {
            fetchPost();
        }
    }, [postId, user?.access_token, fetchPost]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-green-600 animate-spin mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Loading post...</p>
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center bg-white rounded-2xl shadow-sm p-8 max-w-sm mx-4">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h2 className="font-semibold text-gray-900 text-lg mb-2">Post Not Found</h2>
                    <p className="text-gray-500 text-sm mb-6">{error || "This post may have been deleted or is unavailable."}</p>
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium text-sm"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-2xl mx-auto px-4 py-6">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium text-sm">Back</span>
                </button>

                {/* Post Card with comments auto-expanded */}
                <FeedV3PostCard
                    post={post}
                    onPostUpdate={fetchPost}
                    onPostChange={(updatedPost) => setPost(updatedPost)}
                    enableMediaLightbox={true}
                    initialCommentsExpanded={true}
                    commentsPageSize={15}
                />
            </div>
        </div>
    );
}
