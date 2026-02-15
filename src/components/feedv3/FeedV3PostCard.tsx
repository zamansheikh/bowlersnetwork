"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2, MoreVertical, Flag, Trash2, Share2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import MediaGallery from "../MediaGallery";
import AutoExpandingTextarea from "../AutoExpandingTextarea";
import PollCard from "./PollCard";
import SharedPostPreview from "./SharedPostPreview";
import CommentsSectionV3 from "./CommentsSectionV3";
import {
    FeedV3Post,
    FeedV3Comment,
    isDefaultContent,
    isPollContent,
    isSharedContent,
    LikeResponse,
} from "@/types/feedv3";

interface FeedV3PostCardProps {
    post: FeedV3Post;
    onPostUpdate?: () => void;
    onPostChange?: (updatedPost: FeedV3Post) => void;
    enableMediaLightbox?: boolean;
    initialCommentsExpanded?: boolean;
    commentsPageSize?: number;
}

export default function FeedV3PostCard({
    post,
    onPostUpdate,
    onPostChange,
    enableMediaLightbox = false,
    initialCommentsExpanded = false,
    commentsPageSize = 5,
}: FeedV3PostCardProps) {
    const { user } = useAuth();
    const [localLikes, setLocalLikes] = useState(post.likes_count);
    const [isLiking, setIsLiking] = useState(false);
    const [localPost, setLocalPost] = useState(post);
    const [isCommentsExpanded, setIsCommentsExpanded] = useState(initialCommentsExpanded);
    const [commentText, setCommentText] = useState("");
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareDescription, setShareDescription] = useState("");
    const [isSharing, setIsSharing] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const isOwnPost = post.is_mine;

    // Handle clicking outside of menu to close it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMenuOpen]);

    const handleUserClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(`/profile/${post.author.username}`);
    };

    const handlePostClick = () => {
        router.push(`/postv3/${post.id}`);
    };

    const handleShareClick = () => {
        if (isOwnPost) {
            alert("You cannot share your own post.");
            return;
        }
        setShowShareModal(true);
    };

    const handleShareSubmit = async () => {
        if (isSharing) return;

        try {
            setIsSharing(true);
            const payload: { description?: string; is_public?: boolean } = {
                is_public: true
            };

            if (shareDescription.trim()) {
                payload.description = shareDescription.trim();
            }

            await api.post(`/api/newsfeed/v1/${post.id}/share/`, payload);

            // Update local shares count
            setLocalPost(prev => ({
                ...prev,
                shares_count: prev.shares_count + 1
            }));

            setShowShareModal(false);
            setShareDescription("");

            if (onPostUpdate) {
                onPostUpdate();
            }
        } catch (error: any) {
            console.error("Error sharing post:", error);
            const errorMessage = error.response?.data?.detail || "Failed to share post. Please try again.";
            alert(errorMessage);
        } finally {
            setIsSharing(false);
        }
    };

    const handleDeletePost = async () => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            try {
                setIsDeleting(true);
                // Use FeedV3 API endpoint
                const response = await api.delete(`/api/newsfeed/v1/${post.id}/delete/`);

                if (response.status === 204) {
                    setIsDeleted(true);
                    if (onPostUpdate) {
                        onPostUpdate();
                    }
                }
            } catch (error) {
                console.error("Error deleting post:", error);
                alert("Failed to delete post. Please try again.");
            } finally {
                setIsDeleting(false);
                setIsMenuOpen(false);
            }
        }
    };

    const handleLike = async () => {
        if (isLiking) return;

        // Optimistic update
        const previousPost = { ...localPost };
        const previousLikes = localLikes;

        const newIsLiked = !localPost.has_liked;
        const newLikeCount = newIsLiked ? localPost.likes_count + 1 : localPost.likes_count - 1;

        const optimisticPost: FeedV3Post = {
            ...localPost,
            has_liked: newIsLiked,
            likes_count: newLikeCount,
        };

        setLocalPost(optimisticPost);
        setLocalLikes(newLikeCount);
        setIsLiking(true);

        try {
            // Use FeedV3 API endpoint
            const response = await api.post<LikeResponse>(`/api/newsfeed/v1/${post.id}/like/`);
            const { is_liked, likes_count } = response.data;

            // Update with actual server response
            const updatedPost: FeedV3Post = {
                ...localPost,
                has_liked: is_liked,
                likes_count: likes_count,
            };
            setLocalPost(updatedPost);
            setLocalLikes(likes_count);

            // Notify parent of the change
            if (onPostChange) {
                onPostChange(updatedPost);
            }
        } catch (error) {
            console.error("Error liking post:", error);
            // Revert to original state on error
            setLocalPost(previousPost);
            setLocalLikes(previousLikes);
        } finally {
            setIsLiking(false);
        }
    };

    const handleCommentClick = () => {
        setIsCommentsExpanded(!isCommentsExpanded);
    };

    const handleSubmitComment = async () => {
        if (!commentText.trim() || isSubmittingComment) return;

        try {
            setIsSubmittingComment(true);
            const payload = { text: commentText };

            // Use FeedV3 API endpoint
            await api.post(`/api/newsfeed/v1/${post.id}/comments/`, payload);

            setCommentText("");

            // Fetch updated post details
            const response = await api.get(`/api/newsfeed/v1/${post.id}/`);
            const updatedPost = response.data as FeedV3Post;

            setLocalPost(updatedPost);

            if (onPostUpdate) {
                onPostUpdate();
            }
        } catch (error) {
            console.error("Error submitting comment:", error);
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleReportPost = async () => {
        try {
            await api.post(`/api/newsfeed/v1/${post.id}/report/`, {
                reason: "Reported from feed"
            });
            alert("Post reported successfully");
        } catch (error) {
            console.error("Error reporting post:", error);
            alert("Failed to report post");
        }
        setIsMenuOpen(false);
    };

    const handlePollVote = (updatedPost: FeedV3Post) => {
        setLocalPost(updatedPost);
        if (onPostChange) {
            onPostChange(updatedPost);
        }
    };

    if (isDeleted) {
        return null;
    }

    // Function to render text with hashtags
    // Function to render text with hashtags and links
    const renderTextWithTags = (text: string) => {
        // Regex to capture hashtags and URLs
        const regex = /((?:#\w+)|(?:https?:\/\/[^\s]+))/g;

        return text.split(regex).map((part, index) => {
            if (part.startsWith("#")) {
                return (
                    <span key={index} className="text-green-600 font-medium">
                        {part}
                    </span>
                );
            }
            if (part.startsWith("http")) {
                return (
                    <a
                        key={index}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline break-all"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {part}
                    </a>
                );
            }
            return part;
        });
    };

    // Get content based on post type
    const renderContent = () => {
        const content = localPost.content;

        if (isDefaultContent(content)) {
            return (
                <div className="cursor-pointer" onClick={handlePostClick}>
                    {/* Title */}
                    {content.title && (
                        <h3 className="font-semibold text-gray-900 text-base md:text-lg mb-1">
                            {content.title}
                        </h3>
                    )}

                    {/* Description */}
                    {content.description && (
                        <p className="text-gray-600 text-sm mb-2">
                            {content.description}
                        </p>
                    )}

                    {/* Text Content */}
                    {content.text && (
                        <div className="mb-3 md:mb-4">
                            <p className="text-gray-800 leading-relaxed text-sm md:text-[15px] line-height-6 overflow-wrap break-word">
                                {renderTextWithTags(content.text)}
                            </p>
                        </div>
                    )}

                    {/* Media Gallery */}
                    {content.media_urls && content.media_urls.length > 0 && (
                        <div
                            className={`max-h-fit overflow-hidden`}
                            onClick={(e) => {
                                if (enableMediaLightbox) e.stopPropagation();
                            }}
                        >
                            <MediaGallery
                                media={content.media_urls}
                                enableLightbox={enableMediaLightbox}
                                maxHeight="400px"
                            />
                        </div>
                    )}
                </div>
            );
        }

        if (isPollContent(content)) {
            return (
                <div className="cursor-pointer" onClick={handlePostClick}>
                    <PollCard
                        postId={post.id}
                        content={content}
                        onVote={handlePollVote}
                        post={localPost}
                    />
                </div>
            );
        }

        if (isSharedContent(content)) {
            return (
                <div className="cursor-pointer" onClick={handlePostClick}>
                    {/* Share description */}
                    {content.description && (
                        <div className="mb-3 md:mb-4">
                            <p className="text-gray-800 leading-relaxed text-sm md:text-[15px]">
                                {renderTextWithTags(content.description)}
                            </p>
                        </div>
                    )}

                    {/* Original post preview */}
                    <SharedPostPreview originalPost={content.original} />
                </div>
            );
        }

        return null;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
            {/* Post Header */}
            <div className="p-3 md:p-6 pb-2 md:pb-4 cursor-pointer" onClick={handlePostClick}>
                <div className="flex items-center justify-between gap-3 mb-3 md:mb-4">
                    <div
                        className="flex items-center gap-2 md:gap-3 cursor-pointer hover:bg-gray-50 p-1 md:p-2 rounded-lg transition-colors shrink-0 min-w-0"
                        onClick={handleUserClick}
                    >
                        <img
                            src={post.author.profile_picture_url}
                            alt={post.author.name}
                            className="w-10 md:w-12 h-10 md:h-12 rounded-full object-cover ring-2 ring-gray-100 shrink-0"
                        />
                        <div className="min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">
                                {post.author.name}
                            </h3>
                            <p className="text-xs md:text-sm text-gray-500 truncate">{post.created}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 md:gap-2 relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
                        {/* Post type badge */}
                        {post.post_type !== 'default' && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${post.post_type === 'poll'
                                ? 'bg-lime-100 text-[#8BC342]'
                                : 'bg-lime-100 text-[#8BC342]'
                                }`}>
                                {post.post_type === 'poll' ? '📊 Poll' : '🔄 Shared'}
                            </span>
                        )}

                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                            aria-label="More options"
                        >
                            <MoreVertical className="w-5 h-5" />
                        </button>

                        {isMenuOpen && (
                            <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                                <button
                                    onClick={handleReportPost}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <Flag className="w-4 h-4" />
                                    Report post
                                </button>

                                {isOwnPost && (
                                    <button
                                        onClick={handleDeletePost}
                                        disabled={isDeleting}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                    >
                                        {isDeleting ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                        Delete post
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Post Content */}
                {renderContent()}
            </div>

            {/* Post Actions */}
            <div className="px-3 md:px-6 py-3 md:py-4 border-t border-gray-50 bg-gray-50/30">
                <div className="flex items-center justify-between gap-2 md:gap-4">
                    <div className="flex items-center gap-4 md:gap-6">
                        {/* Like Action */}
                        <div className="flex items-center gap-1 group">
                            <button
                                onClick={handleLike}
                                disabled={isLiking}
                                className={`flex items-center gap-1.5 p-1.5 md:p-2 rounded-full transition-all duration-300 transform 
                  disabled:opacity-50 disabled:cursor-not-allowed shrink-0
                  hover:bg-red-50 hover:scale-110 active:scale-95
                  ${localPost.has_liked
                                        ? "text-red-500"
                                        : "text-gray-400 hover:text-red-500"
                                    }`}
                            >
                                <div className="relative">
                                    <div className={`${localPost.has_liked ? "animate-like-pop" : "transition-transform duration-200"}`}>
                                        {localPost.has_liked ? (
                                            <Image
                                                src="/icons/like_icon.svg"
                                                alt="Unlike"
                                                unoptimized
                                                width={20}
                                                height={20}
                                                className="md:w-6 md:h-6 drop-shadow-sm"
                                            />
                                        ) : (
                                            <Image
                                                src="/icons/not_like_icon.svg"
                                                alt="Like"
                                                unoptimized
                                                width={20}
                                                height={20}
                                                className="md:w-6 md:h-6 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100"
                                            />
                                        )}
                                    </div>
                                    {/* Ping effect when liked */}
                                    {localPost.has_liked && (
                                        <span className="absolute inset-0 rounded-full bg-red-400 animate-ping-once pointer-events-none"></span>
                                    )}
                                </div>
                                <span className="text-xs md:text-sm font-semibold">Like</span>
                            </button>
                            <span className={`text-xs md:text-sm font-semibold transition-colors duration-200 ${localPost.has_liked ? "text-red-500" : "text-gray-600"}`}>
                                {localLikes}
                            </span>
                        </div>

                        {/* Comment Action */}
                        <button
                            onClick={handleCommentClick}
                            className="flex items-center gap-1 md:gap-2 group text-gray-600 hover:text-green-600 transition-all duration-200 hover:scale-110 active:scale-95"
                        >
                            <div className="flex items-center gap-1.5 p-1.5 md:p-2 rounded-full group-hover:bg-green-50 transition-colors">
                                <Image
                                    src="/icons/comment_icon.svg"
                                    alt="Comment"
                                    unoptimized
                                    width={20}
                                    height={20}
                                    className="md:w-6 md:h-6 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
                                />
                                <span className="text-xs md:text-sm font-semibold">Comment</span>
                            </div>
                            <span className="text-xs md:text-sm font-medium whitespace-nowrap">
                                {localPost.comments_count}
                            </span>
                        </button>
                    </div>

                    {/* Share Action */}
                    <button
                        onClick={handleShareClick}
                        className="flex items-center gap-1 md:gap-2 p-1.5 md:p-2 rounded-full text-gray-600 hover:text-blue-500 hover:bg-blue-50 transition-all duration-200 hover:scale-110 active:scale-95 shrink-0 group"
                    >
                        <Share2 className="w-5 h-5 md:w-6 md:h-6 opacity-70 group-hover:opacity-100" />
                        <span className="text-xs md:text-sm font-medium">Share</span>
                        <span className="text-xs md:text-sm font-medium text-gray-500">
                            {localPost.shares_count}
                        </span>
                    </button>
                </div>
            </div>

            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                        {/* Modal Header */}
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Share Post</h3>
                            <button
                                onClick={() => {
                                    setShowShareModal(false);
                                    setShareDescription("");
                                }}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-4">
                            {/* User info */}
                            <div className="flex items-center gap-3 mb-4">
                                <img
                                    src={user?.profile_media?.profile_picture_url || "/logo/default-avatar.png"}
                                    alt="Your avatar"
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <div>
                                    <p className="font-medium text-gray-900">{user?.first_name} {user?.last_name}</p>
                                    <p className="text-xs text-gray-500">Sharing to your feed</p>
                                </div>
                            </div>

                            {/* Description input */}
                            <textarea
                                value={shareDescription}
                                onChange={(e) => setShareDescription(e.target.value)}
                                placeholder="Add a comment about this post... (optional)"
                                className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                rows={3}
                                disabled={isSharing}
                            />

                            {/* Original post preview */}
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <img
                                        src={post.author.profile_picture_url}
                                        alt={post.author.name}
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-medium text-sm text-gray-900">{post.author.name}</p>
                                        <p className="text-xs text-gray-500">{post.created}</p>
                                    </div>
                                </div>
                                {isDefaultContent(localPost.content) && localPost.content.text && (
                                    <p className="text-sm text-gray-700 line-clamp-2">
                                        {localPost.content.text}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowShareModal(false);
                                    setShareDescription("");
                                }}
                                disabled={isSharing}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleShareSubmit}
                                disabled={isSharing}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSharing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Sharing...
                                    </>
                                ) : (
                                    <>
                                        <Share2 className="w-4 h-4" />
                                        Share Now
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Comments Section */}
            {isCommentsExpanded && (
                <CommentsSectionV3
                    postId={post.id}
                    pageSize={commentsPageSize}
                    onCommentAdded={() => {
                        // Refresh post to get updated comment count
                        api.get(`/api/newsfeed/v1/${post.id}/`).then(response => {
                            setLocalPost(response.data);
                        });
                    }}
                    onViewAllClick={handlePostClick}
                />
            )}
        </div>
    );
}
