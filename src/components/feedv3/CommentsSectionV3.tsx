"use client";

import { useState, useEffect, useCallback } from "react";
import { Send, Loader2, Heart, Trash2, Edit2, Reply, ChevronDown, ChevronUp } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { FeedV3Comment, LikeResponse, PaginatedResponse } from "@/types/feedv3";
import AutoExpandingTextarea from "../AutoExpandingTextarea";

interface CommentsSectionV3Props {
    postId: number;
    pageSize?: number; // 5 for feed, 15 for post details
    onCommentAdded: () => void;
    onViewAllClick: () => void;
}

export default function CommentsSectionV3({
    postId,
    pageSize = 5,
    onCommentAdded,
    onViewAllClick,
}: CommentsSectionV3Props) {
    const { user } = useAuth();
    const [localComments, setLocalComments] = useState<FeedV3Comment[]>([]);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [totalComments, setTotalComments] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [commentText, setCommentText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [replyTo, setReplyTo] = useState<FeedV3Comment | null>(null);
    const [editingComment, setEditingComment] = useState<number | null>(null);
    const [editText, setEditText] = useState("");
    const [expandedReplies, setExpandedReplies] = useState<Set<number>>(new Set());
    const [likingComments, setLikingComments] = useState<Set<number>>(new Set());

    // Fetch comments from API
    const fetchComments = useCallback(async (page: number = 1) => {
        try {
            setIsLoadingComments(true);
            const response = await api.get<PaginatedResponse<FeedV3Comment>>(
                `/api/newsfeed/v1/${postId}/comments/?page=${page}&page_size=${pageSize}`
            );

            if (page === 1) {
                setLocalComments(response.data.results);
            } else {
                setLocalComments(prev => [...prev, ...response.data.results]);
            }

            setTotalComments(response.data.count);
            setHasMore(!!response.data.next);
            setCurrentPage(page);
        } catch (err) {
            console.error("Error fetching comments:", err);
        } finally {
            setIsLoadingComments(false);
        }
    }, [postId, pageSize]);

    // Fetch comments on mount
    useEffect(() => {
        fetchComments(1);
    }, [fetchComments]);

    const handleSubmitComment = async () => {
        if (!commentText.trim() || isSubmitting) return;

        try {
            setIsSubmitting(true);
            const payload: { text: string; parent_id?: number } = {
                text: commentText,
            };

            if (replyTo) {
                payload.parent_id = replyTo.id;
            }

            await api.post(`/api/newsfeed/v1/${postId}/comments/`, payload);

            // Refresh comments from server to get accurate data
            await fetchComments(1);

            setCommentText("");
            setReplyTo(null);
            onCommentAdded();
        } catch (error) {
            console.error("Error submitting comment:", error);
            alert("Failed to post comment. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLikeComment = async (commentId: number) => {
        if (likingComments.has(commentId)) return;

        setLikingComments(prev => new Set(prev).add(commentId));

        try {
            const response = await api.post<LikeResponse>(`/api/newsfeed/v1/comments/${commentId}/like/`);
            const { is_liked, likes_count } = response.data;

            // Update comment in local state
            const updateComment = (comments: FeedV3Comment[]): FeedV3Comment[] => {
                return comments.map(comment => {
                    if (comment.id === commentId) {
                        return { ...comment, has_liked: is_liked, likes_count };
                    }
                    if (comment.replies) {
                        return { ...comment, replies: updateComment(comment.replies) };
                    }
                    return comment;
                });
            };

            setLocalComments(prev => updateComment(prev));
        } catch (error) {
            console.error("Error liking comment:", error);
        } finally {
            setLikingComments(prev => {
                const next = new Set(prev);
                next.delete(commentId);
                return next;
            });
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;

        try {
            await api.delete(`/api/newsfeed/v1/comments/${commentId}/`);

            // Remove from local state
            const removeComment = (comments: FeedV3Comment[]): FeedV3Comment[] => {
                return comments
                    .filter(comment => comment.id !== commentId)
                    .map(comment => ({
                        ...comment,
                        replies: comment.replies ? removeComment(comment.replies) : undefined,
                    }));
            };

            setLocalComments(prev => removeComment(prev));
            onCommentAdded();
        } catch (error) {
            console.error("Error deleting comment:", error);
            alert("Failed to delete comment. Please try again.");
        }
    };

    const handleEditComment = async (commentId: number) => {
        if (!editText.trim()) return;

        try {
            const response = await api.patch(`/api/newsfeed/v1/comments/${commentId}/`, {
                text: editText,
            });
            const updatedComment = response.data as FeedV3Comment;

            // Update in local state
            const updateComment = (comments: FeedV3Comment[]): FeedV3Comment[] => {
                return comments.map(comment => {
                    if (comment.id === commentId) {
                        return { ...comment, text: updatedComment.text };
                    }
                    if (comment.replies) {
                        return { ...comment, replies: updateComment(comment.replies) };
                    }
                    return comment;
                });
            };

            setLocalComments(prev => updateComment(prev));
            setEditingComment(null);
            setEditText("");
        } catch (error) {
            console.error("Error editing comment:", error);
            alert("Failed to edit comment. Please try again.");
        }
    };

    const toggleReplies = (commentId: number) => {
        setExpandedReplies(prev => {
            const next = new Set(prev);
            if (next.has(commentId)) {
                next.delete(commentId);
            } else {
                next.add(commentId);
            }
            return next;
        });
    };

    const renderComment = (comment: FeedV3Comment, isReply = false) => {
        const isEditing = editingComment === comment.id;
        const hasReplies = comment.replies && comment.replies.length > 0;
        const repliesExpanded = expandedReplies.has(comment.id);

        return (
            <div key={comment.id} className={`${isReply ? "ml-10 mt-3" : ""}`}>
                <div className="flex gap-3">
                    <img
                        src={comment.author.profile_picture_url}
                        alt={comment.author.name}
                        className={`${isReply ? "w-7 h-7" : "w-8 h-8"} rounded-full object-cover flex-shrink-0`}
                    />
                    <div className="flex-1 min-w-0">
                        <div className="bg-white p-3 rounded-lg shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm text-gray-900">
                                    {comment.author.name}
                                </span>
                                {comment.is_post_author && (
                                    <span className="bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-full">
                                        Author
                                    </span>
                                )}
                                <span className="text-xs text-gray-400">{comment.created}</span>
                            </div>

                            {isEditing ? (
                                <div className="mt-2">
                                    <AutoExpandingTextarea
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                        minRows={1}
                                        maxRows={5}
                                    />
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            onClick={() => handleEditComment(comment.id)}
                                            className="text-sm text-green-600 font-medium hover:text-green-700"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingComment(null);
                                                setEditText("");
                                            }}
                                            className="text-sm text-gray-500 hover:text-gray-600"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-800 text-sm">{comment.text}</p>
                            )}

                            {/* Comment media */}
                            {comment.media_url && (
                                <img
                                    src={comment.media_url}
                                    alt="Comment media"
                                    className="mt-2 rounded-lg max-h-48 object-cover"
                                />
                            )}
                        </div>

                        {/* Comment actions */}
                        <div className="flex items-center gap-4 mt-1.5 ml-1">
                            <button
                                onClick={() => handleLikeComment(comment.id)}
                                disabled={likingComments.has(comment.id)}
                                className={`flex items-center gap-1 text-xs transition-colors ${comment.has_liked
                                    ? "text-red-500"
                                    : "text-gray-500 hover:text-red-500"
                                    }`}
                            >
                                <Heart
                                    className={`w-3 h-3 ${comment.has_liked ? "fill-current" : ""}`}
                                />
                                <span>{comment.likes_count}</span>
                            </button>

                            {!isReply && (
                                <button
                                    onClick={() => {
                                        setReplyTo(comment);
                                        setCommentText("");
                                    }}
                                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-green-600 transition-colors"
                                >
                                    <Reply className="w-3 h-3" />
                                    Reply
                                </button>
                            )}

                            {comment.is_mine && (
                                <>
                                    <button
                                        onClick={() => {
                                            setEditingComment(comment.id);
                                            setEditText(comment.text);
                                        }}
                                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition-colors"
                                    >
                                        <Edit2 className="w-3 h-3" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteComment(comment.id)}
                                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        Delete
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Replies toggle */}
                        {hasReplies && !isReply && (
                            <button
                                onClick={() => toggleReplies(comment.id)}
                                className="flex items-center gap-1 mt-2 ml-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                {repliesExpanded ? (
                                    <ChevronUp className="w-3 h-3" />
                                ) : (
                                    <ChevronDown className="w-3 h-3" />
                                )}
                                {repliesExpanded ? "Hide" : "View"} {comment.replies?.length} {comment.replies?.length === 1 ? "reply" : "replies"}
                            </button>
                        )}

                        {/* Replies */}
                        {hasReplies && repliesExpanded && (
                            <div className="mt-2">
                                {comment.replies?.map(reply => renderComment(reply, true))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="px-3 md:px-6 py-3 md:py-4 border-t border-gray-100 bg-gray-50">
            {/* Loading state */}
            {isLoadingComments && localComments.length === 0 && (
                <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    <span className="ml-2 text-sm text-gray-500">Loading comments...</span>
                </div>
            )}

            {/* Comments list */}
            {localComments.length > 0 && (
                <div className="space-y-4 mb-4">
                    {localComments.map(comment => renderComment(comment))}

                    {/* Load more / View all */}
                    {hasMore && (
                        <button
                            onClick={() => {
                                if (pageSize <= 5) {
                                    // In feed mode, navigate to full post
                                    onViewAllClick();
                                } else {
                                    // In post details, load next page
                                    fetchComments(currentPage + 1);
                                }
                            }}
                            disabled={isLoadingComments}
                            className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                        >
                            {isLoadingComments ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                            ) : null}
                            {pageSize <= 5
                                ? `View all ${totalComments} comments`
                                : `Load more comments (${localComments.length}/${totalComments})`
                            }
                        </button>
                    )}
                </div>
            )}

            {/* Reply indicator */}
            {replyTo && (
                <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-green-50 rounded-lg">
                    <Reply className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700">
                        Replying to <strong>{replyTo.author.name}</strong>
                    </span>
                    <button
                        onClick={() => setReplyTo(null)}
                        className="ml-auto text-green-600 hover:text-green-700 text-sm"
                    >
                        Cancel
                    </button>
                </div>
            )}

            {/* Comment Input */}
            <div className="flex gap-3">
                <img
                    src={user?.profile_media?.profile_picture_url || "/logo/default-avatar.png"}
                    alt="Your avatar"
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-2"
                />
                <div className="flex-1 relative">
                    <AutoExpandingTextarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmitComment();
                            }
                        }}
                        placeholder={replyTo ? `Reply to ${replyTo.author.name}...` : "Write a comment..."}
                        minRows={1}
                        maxRows={5}
                        className="w-full px-4 py-2 pr-10 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <button
                        onClick={handleSubmitComment}
                        disabled={!commentText.trim() || isSubmitting}
                        className="absolute right-2 bottom-2 p-1.5 text-green-600 hover:bg-green-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
