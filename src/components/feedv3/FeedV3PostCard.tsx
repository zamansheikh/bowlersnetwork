"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Send,
    Loader2,
    MoreHorizontal,
    Flag,
    Trash2,
    Share2,
    Heart,
    MessageCircle,
    Bookmark,
    X,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import MediaGallery from "../MediaGallery";
import PollCard from "./PollCard";
import SharedPostPreview from "./SharedPostPreview";
import FollowButton from "./FollowButton";
import {
    FeedV3Post,
    FeedV3Comment,
    isDefaultContent,
    isPollContent,
    isSharedContent,
    LikeResponse,
    PaginatedResponse,
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
    const [isCommentsDrawerOpen, setIsCommentsDrawerOpen] = useState(initialCommentsExpanded);
    const [drawerComments, setDrawerComments] = useState<FeedV3Comment[]>([]);
    const [isLoadingDrawerComments, setIsLoadingDrawerComments] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [replyToComment, setReplyToComment] = useState<FeedV3Comment | null>(null);
    const [likingCommentIds, setLikingCommentIds] = useState<Set<number>>(new Set());
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareDescription, setShareDescription] = useState("");
    const [isSharing, setIsSharing] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const isOwnPost = localPost.is_mine;

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

    useEffect(() => {
        if (!isCommentsDrawerOpen) return;

        const previousOverflow = document.body.style.overflow;
        const onEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsCommentsDrawerOpen(false);
            }
        };

        document.body.style.overflow = "hidden";
        document.addEventListener("keydown", onEscape);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", onEscape);
        };
    }, [isCommentsDrawerOpen]);

    const handleUserClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(`/profile/${localPost.author.username}`);
    };

    const handlePostClick = () => {
        router.push(`/postv3/${localPost.id}`);
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
                is_public: true,
            };

            if (shareDescription.trim()) {
                payload.description = shareDescription.trim();
            }

            await api.post(`/api/newsfeed/v1/${localPost.id}/share/`, payload);

            setLocalPost((prev) => ({
                ...prev,
                shares_count: prev.shares_count + 1,
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
                const response = await api.delete(`/api/newsfeed/v1/${localPost.id}/delete/`);

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
            const response = await api.post<LikeResponse>(`/api/newsfeed/v1/${localPost.id}/like/`);
            const { is_liked, likes_count } = response.data;

            const updatedPost: FeedV3Post = {
                ...localPost,
                has_liked: is_liked,
                likes_count,
            };

            setLocalPost(updatedPost);
            setLocalLikes(likes_count);

            if (onPostChange) {
                onPostChange(updatedPost);
            }
        } catch (error) {
            console.error("Error liking post:", error);
            setLocalPost(previousPost);
            setLocalLikes(previousLikes);
        } finally {
            setIsLiking(false);
        }
    };

    const fetchDrawerComments = async () => {
        try {
            setIsLoadingDrawerComments(true);
            const response = await api.get<PaginatedResponse<FeedV3Comment>>(
                `/api/newsfeed/v1/${localPost.id}/comments/?page=1&page_size=${commentsPageSize}`
            );
            setDrawerComments(response.data.results || []);
        } catch (error) {
            console.error("Error fetching drawer comments:", error);
        } finally {
            setIsLoadingDrawerComments(false);
        }
    };

    const handleCommentClick = () => {
        setIsCommentsDrawerOpen(true);
        fetchDrawerComments();
    };

    const handleSubmitComment = async () => {
        if (!commentText.trim() || isSubmittingComment) return;

        try {
            setIsSubmittingComment(true);
            const payload: { text: string; parent_id?: number } = {
                text: commentText.trim(),
            };

            if (replyToComment) {
                payload.parent_id = replyToComment.id;
            }

            await api.post(`/api/newsfeed/v1/${localPost.id}/comments/`, payload);

            setCommentText("");
            setReplyToComment(null);

            const response = await api.get(`/api/newsfeed/v1/${localPost.id}/`);
            const updatedPost = response.data as FeedV3Post;
            setLocalPost(updatedPost);

            if (isCommentsDrawerOpen) {
                fetchDrawerComments();
            }

            if (onPostChange) {
                onPostChange(updatedPost);
            }
            if (onPostUpdate) {
                onPostUpdate();
            }
        } catch (error) {
            console.error("Error submitting comment:", error);
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const updateCommentTree = (
        comments: FeedV3Comment[],
        commentId: number,
        updater: (comment: FeedV3Comment) => FeedV3Comment
    ): FeedV3Comment[] => {
        return comments.map((comment) => {
            if (comment.id === commentId) {
                return updater(comment);
            }

            if (comment.replies && comment.replies.length > 0) {
                return {
                    ...comment,
                    replies: updateCommentTree(comment.replies, commentId, updater),
                };
            }

            return comment;
        });
    };

    const handleLikeComment = async (commentId: number) => {
        if (likingCommentIds.has(commentId)) return;

        setLikingCommentIds((prev) => new Set(prev).add(commentId));

        try {
            const response = await api.post<LikeResponse>(`/api/newsfeed/v1/comments/${commentId}/like/`);
            const { is_liked, likes_count } = response.data;

            setDrawerComments((prev) =>
                updateCommentTree(prev, commentId, (comment) => ({
                    ...comment,
                    has_liked: is_liked,
                    likes_count,
                }))
            );
        } catch (error) {
            console.error("Error liking comment:", error);
        } finally {
            setLikingCommentIds((prev) => {
                const next = new Set(prev);
                next.delete(commentId);
                return next;
            });
        }
    };

    const handleReplyClick = (comment: FeedV3Comment) => {
        setReplyToComment(comment);
        if (!commentText.trim()) {
            setCommentText(`@${comment.author.username} `);
        }
    };

    const renderDrawerComment = (comment: FeedV3Comment, isReply = false) => {
        const isLikingComment = likingCommentIds.has(comment.id);

        return (
            <div key={comment.id} className={`${isReply ? "ml-8" : ""} flex gap-3 items-start`}>
                <img
                    src={comment.author.profile_picture_url}
                    alt={comment.author.name}
                    className={`${isReply ? "size-8" : "size-9"} rounded-full object-cover shrink-0`}
                />
                <div className="flex-1 min-w-0">
                    <div className="bg-[#f3f4f6] rounded-2xl px-4 py-2">
                        <p className="text-sm font-semibold text-[#101828] leading-5">{comment.author.name}</p>
                        <p className="text-sm text-[#1e2939] leading-5 break-words">{comment.text}</p>
                    </div>
                    <div className="mt-1.5 pl-3 flex items-center gap-4 text-xs">
                        <span className="text-[#6a7282]">{comment.created}</span>
                        <button
                            type="button"
                            disabled={isLikingComment}
                            onClick={() => handleLikeComment(comment.id)}
                            className={`font-medium transition-colors disabled:opacity-50 ${
                                comment.has_liked
                                    ? "text-[#5145cd]"
                                    : "text-[#4a5565] hover:text-[#1e2939]"
                            }`}
                        >
                            {isLikingComment ? "..." : "Like"}
                        </button>
                        <button
                            type="button"
                            onClick={() => handleReplyClick(comment)}
                            className="text-[#4a5565] font-medium hover:text-[#1e2939] transition-colors"
                        >
                            Reply
                        </button>
                        <span className="text-[#6a7282]">&middot; {comment.likes_count} likes</span>
                    </div>

                    {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-3 space-y-3">
                            {comment.replies.map((reply) => renderDrawerComment(reply, true))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const handleReportPost = async () => {
        try {
            await api.post(`/api/newsfeed/v1/${localPost.id}/report/`, {
                reason: "Reported from feed",
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

    const renderTextWithTags = (text: string) => {
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

    const getPreviewText = () => {
        const content = localPost.content;

        if (isDefaultContent(content)) {
            return content.text || content.description || "";
        }

        if (isSharedContent(content)) {
            return content.description || content.original?.author?.name || "Shared a post";
        }

        if (isPollContent(content)) {
            return `${content.title}${content.description ? ` - ${content.description}` : ""}`;
        }

        return "";
    };

    const renderContent = () => {
        const content = localPost.content;

        if (isDefaultContent(content)) {
            return (
                <div className="cursor-pointer" onClick={handlePostClick}>
                    {content.title && (
                        <h3 className="font-semibold text-[#101828] text-base md:text-lg mb-1">
                            {content.title}
                        </h3>
                    )}

                    {content.description && (
                        <p className="text-[#4a5565] text-sm mb-2">
                            {content.description}
                        </p>
                    )}

                    {content.text && (
                        <div className="mb-3 md:mb-4">
                            <p className="text-[#1e2939] leading-[26px] text-[16px] break-words">
                                {renderTextWithTags(content.text)}
                            </p>
                        </div>
                    )}

                    {content.media_urls && content.media_urls.length > 0 && (
                        <div
                            className="max-h-fit overflow-hidden"
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
                        postId={localPost.id}
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
                    {content.description && (
                        <div className="mb-3 md:mb-4">
                            <p className="text-[#1e2939] leading-[1.6] text-[15px] md:text-[16px]">
                                {renderTextWithTags(content.description)}
                            </p>
                        </div>
                    )}

                    <SharedPostPreview originalPost={content.original} />
                </div>
            );
        }

        return null;
    };

    return (
        <>
            <div className="bg-white rounded-2xl border border-[#e5e7eb] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] overflow-hidden transition-shadow duration-200">
                <div className="p-6 cursor-pointer" onClick={handlePostClick}>
                    <div className="flex min-h-[48px] items-start justify-between gap-3 mb-4">
                        <div
                            className="flex flex-1 min-w-0 items-start gap-3 cursor-pointer"
                            onClick={handleUserClick}
                        >
                            <img
                                src={localPost.author.profile_picture_url}
                                alt={localPost.author.name}
                                className="w-12 h-12 rounded-full object-cover shrink-0"
                            />
                            <div className="min-w-0">
                                <h3 className="font-bold text-[#101828] text-[16px] leading-6 truncate">{localPost.author.name}</h3>
                                <div className="mt-0.5 flex items-center gap-1.5 text-[14px] min-w-0 leading-5">
                                    <span className="text-[#6a7282] truncate">@{localPost.author.username}</span>
                                    <span className="text-[#99a1af] shrink-0">&middot; {localPost.created}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
                            {localPost.post_type !== "default" && (
                                <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        localPost.post_type === "poll"
                                            ? "bg-lime-100 text-[#8BC342]"
                                            : "bg-lime-100 text-[#8BC342]"
                                    }`}
                                >
                                    {localPost.post_type === "poll" ? "Poll" : "Shared"}
                                </span>
                            )}

                            {!isOwnPost && localPost.author.is_followable && (
                                <FollowButton
                                    authorId={localPost.author.user_id}
                                    initialIsFollowing={localPost.author.is_following}
                                    isFollowable={localPost.author.is_followable}
                                    className="h-[34px] px-[17px] py-[7px] rounded-full"
                                    onFollowChange={(isFollowing) => {
                                        setLocalPost((prev) => ({
                                            ...prev,
                                            author: {
                                                ...prev.author,
                                                is_following: isFollowing,
                                            },
                                        }));
                                    }}
                                />
                            )}

                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="size-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors text-[#6a7282]"
                                aria-label="More options"
                            >
                                <MoreHorizontal className="w-5 h-5" />
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

                    {renderContent()}
                </div>

                <div className="h-[47px] px-6 pt-px border-t border-[#f3f4f6]">
                    <div className="h-full flex items-center justify-between gap-4">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleLike}
                                    disabled={isLiking}
                                    className={`size-[30px] rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                        localPost.has_liked
                                            ? "text-red-500"
                                            : "text-[#6a7282] hover:bg-gray-100"
                                    }`}
                                >
                                    <Heart
                                        className="w-[17px] h-[15px]"
                                        fill={localPost.has_liked ? "currentColor" : "none"}
                                    />
                                </button>
                                <span className="text-sm text-[#6a7282]">{localLikes}</span>
                            </div>

                            <button className="flex items-center gap-2" onClick={handleCommentClick}>
                                <span className="size-[30px] rounded-full flex items-center justify-center text-[#6a7282] hover:bg-gray-100 transition-colors">
                                    <MessageCircle className="w-[17px] h-[17px]" />
                                </span>
                                <span className="text-sm text-[#6a7282] whitespace-nowrap">{localPost.comments_count}</span>
                            </button>

                            <button className="flex items-center gap-2" onClick={handleShareClick}>
                                <span className="size-[30px] rounded-full flex items-center justify-center text-[#6a7282] hover:bg-gray-100 transition-colors">
                                    <Share2 className="w-[13px] h-[15px]" />
                                </span>
                                <span className="text-sm text-[#6a7282]">{localPost.shares_count}</span>
                            </button>
                        </div>

                        <button className="size-[34px] rounded-full flex items-center justify-center text-[#6a7282] hover:bg-gray-100 transition-colors">
                            <Bookmark className="w-[11px] h-[15px] md:w-[14px] md:h-[18px]" />
                        </button>
                    </div>
                </div>

                {showShareModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
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
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>

                            <div className="p-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <img
                                        src={user?.profile_media?.profile_picture_url || "/logo/default-avatar.png"}
                                        alt="Your avatar"
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {user?.first_name} {user?.last_name}
                                        </p>
                                        <p className="text-xs text-gray-500">Sharing to your feed</p>
                                    </div>
                                </div>

                                <textarea
                                    value={shareDescription}
                                    onChange={(e) => setShareDescription(e.target.value)}
                                    placeholder="Add a comment about this post... (optional)"
                                    className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    rows={3}
                                    disabled={isSharing}
                                />

                                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <img
                                            src={localPost.author.profile_picture_url}
                                            alt={localPost.author.name}
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                        <div>
                                            <p className="font-medium text-sm text-gray-900">{localPost.author.name}</p>
                                            <p className="text-xs text-gray-500">{localPost.created}</p>
                                        </div>
                                    </div>
                                    {isDefaultContent(localPost.content) && localPost.content.text && (
                                        <p className="text-sm text-gray-700 line-clamp-2">{localPost.content.text}</p>
                                    )}
                                </div>
                            </div>

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
            </div>

            {isCommentsDrawerOpen && (
                <div className="fixed inset-0 z-50" onClick={() => setIsCommentsDrawerOpen(false)}>
                    <div className="absolute inset-0 bg-black/35" />
                    <aside
                        className="absolute right-0 top-0 h-full w-full sm:max-w-[448px] bg-white shadow-[0px_25px_50px_0px_rgba(0,0,0,0.25)] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="h-[69px] border-b border-[#e5e7eb] flex items-center justify-between px-4">
                            <h2 className="text-[#101828] text-lg font-semibold">Comments</h2>
                            <button
                                onClick={() => setIsCommentsDrawerOpen(false)}
                                className="size-9 rounded-full flex items-center justify-center text-[#6a7282] hover:bg-gray-100 transition-colors"
                                aria-label="Close comments"
                            >
                                <X className="w-[15px] h-[15px]" />
                            </button>
                        </div>

                        <div className="bg-[#f9fafb] border-b border-[#e5e7eb] px-4 py-4">
                            <div className="flex gap-3">
                                <img
                                    src={localPost.author.profile_picture_url}
                                    alt={localPost.author.name}
                                    className="size-10 rounded-full object-cover shrink-0"
                                />
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 text-sm leading-5">
                                        <span className="font-semibold text-[#101828]">{localPost.author.name}</span>
                                        <span className="text-[#6a7282]">@{localPost.author.username}</span>
                                    </div>
                                    <p className="mt-1 text-sm leading-5 text-[#364153] line-clamp-3">{getPreviewText()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                            {isLoadingDrawerComments && (
                                <div className="flex items-center gap-2 text-sm text-[#6a7282]">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Loading comments...
                                </div>
                            )}

                            {!isLoadingDrawerComments && drawerComments.length === 0 && (
                                <p className="text-sm text-[#6a7282]">No comments yet. Start the conversation.</p>
                            )}

                            {drawerComments.map((comment) => renderDrawerComment(comment))}
                        </div>

                        <div className="border-t border-[#e5e7eb] bg-white px-4 pt-3 pb-3">
                            {replyToComment && (
                                <div className="mb-2 ml-12 flex items-center justify-between rounded-lg bg-[#f3f4f6] px-3 py-1.5 text-xs">
                                    <span className="text-[#4a5565]">
                                        Replying to <span className="font-medium text-[#1e2939]">@{replyToComment.author.username}</span>
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setReplyToComment(null)}
                                        className="text-[#6a7282] hover:text-[#1e2939] transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            )}
                            <div className="h-10 flex items-start gap-3 w-full">
                                <img
                                    src={user?.profile_media?.profile_picture_url || "/logo/default-avatar.png"}
                                    alt="Your avatar"
                                    className="size-9 rounded-full object-cover shrink-0"
                                />
                                <div className="flex-1 flex items-start gap-2 h-10">
                                    <input
                                        type="text"
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                handleSubmitComment();
                                            }
                                        }}
                                        placeholder="Write a comment..."
                                        className="flex-1 h-10 px-4 bg-[#f3f4f6] rounded-full text-base text-[#6a7282] placeholder:text-[#6a7282] border-0 outline-none focus:outline-none focus:ring-0"
                                    />
                                    <button
                                        onClick={handleSubmitComment}
                                        disabled={!commentText.trim() || isSubmittingComment}
                                        className="size-10 rounded-full bg-[#e5e7eb] text-[#9ca3af] hover:text-[#6a7282] flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                                    >
                                        {isSubmittingComment ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Send className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            )}
        </>
    );
}
