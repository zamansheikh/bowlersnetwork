"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2, MoreVertical, Flag, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { FeedPost } from "@/types";
import MediaGallery from "./MediaGallery";
import AutoExpandingTextarea from "./AutoExpandingTextarea";

interface FeedPostCardProps {
  post: FeedPost;
  onPostUpdate?: () => void;
  onPostChange?: (updatedPost: FeedPost) => void;
  enableMediaLightbox?: boolean; // New prop to control media lightbox
}

export default function FeedPostCard({
  post,
  onPostUpdate,
  onPostChange,
  enableMediaLightbox = false, // Default to false for feeds
}: FeedPostCardProps) {
  const { user } = useAuth();
  const [localLikes, setLocalLikes] = useState(post.like_count);
  const [isLiking, setIsLiking] = useState(false);
  const [localPost, setLocalPost] = useState(post);
  const [isCommentsExpanded, setIsCommentsExpanded] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const isOwnPost = user?.user_id === post.author.user_id;

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

  // Initialize following state
  const [isFollowing, setIsFollowing] = useState(post.author.is_following);

  const handleUserClick = () => {
    router.push(`/profile/${post.author.username}`);
  };

  const handlePostClick = () => {
    router.push(`/post/${post.uid}`);
  };

  const handleShareClick = () => {
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 3000);
  };

  const handleDeletePost = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        setIsDeleting(true);
        const response = await api.delete(`/api/posts/v2/delete/${post.uid}`);
        
        if (response.status === 200) {
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
    
    const newIsLiked = !localPost.is_liked;
    const newLikeCount = newIsLiked ? localPost.like_count + 1 : localPost.like_count - 1;

    const optimisticPost: FeedPost = {
      ...localPost,
      is_liked: newIsLiked,
      like_count: newLikeCount,
    };

    setLocalPost(optimisticPost);
    setLocalLikes(newLikeCount);
    setIsLiking(true);

    try {
      // Call API
      const response = await api.get(`/api/posts/v2/like/${post.uid}`);
      const { is_liked, like_count } = response.data;

      // Update with actual server response
      const updatedPost: FeedPost = {
        ...localPost,
        is_liked,
        like_count,
      };
      setLocalPost(updatedPost);
      setLocalLikes(like_count);

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

  const handleFollow = async () => {
    try {
      // Toggle the follow state optimistically
      const newFollowingState = !isFollowing;
      setIsFollowing(newFollowingState);

      // Call API - GET /api/follow/{user_id}
      const response = await api.get(`/api/follow/${post.author.user_id}`);
      const data = response.data;

      // Update state based on actual API response
      setIsFollowing(data.is_following);

      // Update local post
      const updatedPost = {
        ...localPost,
        author: {
          ...localPost.author,
          is_following: data.is_following,
        },
      };
      setLocalPost(updatedPost);

      if (onPostChange) {
        onPostChange(updatedPost);
      }
    } catch (error: any) {
      console.error("Error toggling follow:", error);
      // Revert to original state on error
      setIsFollowing(post.author.is_following);
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
      
      await api.post(`/api/posts/v2/comment/${post.uid}`, payload);
      
      setCommentText("");

      // Fetch updated post details to get the new comment
      const response = await api.get(`/api/posts/v2/details/${post.uid}`);
      const updatedPost = response.data;
      
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

  if (isDeleted) {
    return null;
  }

  // Function to render text with hashtags
  const renderTextWithTags = (text: string) => {
    return text.split(/(#\w+)/g).map((part, index) => {
      if (part.startsWith("#")) {
        return (
          <span key={index} className="text-green-600 font-medium">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Post Header */}
      <div className="p-3 md:p-6 pb-2 md:pb-4">
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
          
          <div className="flex items-center gap-1 md:gap-2 relative" ref={menuRef}>
            {post.author.is_followable && (
              <button
                className={`border px-3 md:px-4 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-medium transition-all duration-200 whitespace-nowrap shrink-0 ${isFollowing
                  ? "border-gray-300 text-gray-600 hover:bg-gray-50"
                  : "border-green-600 text-green-600 hover:bg-green-50 hover:border-green-700"
                  }`}
                onClick={handleFollow}
              >
                {isFollowing ? "Following" : "+ Follow"}
              </button>
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
                  onClick={() => {
                    alert("Report feature coming soon");
                    setIsMenuOpen(false);
                  }}
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

        {/* Post Content - Clickable */}
        <div className="mb-3 md:mb-4 cursor-pointer" onClick={handlePostClick}>
          {post.text && (
            <p className="text-gray-800 leading-relaxed text-sm md:text-[15px] line-height-6 overflow-wrap break-word">
              {renderTextWithTags(post.text)}
            </p>
          )}
        </div>



        {/* Post Media Gallery - Clickable */}
        {post.media_urls && post.media_urls.length > 0 && (
          <div
            className={`max-h-fit overflow-hidden ${enableMediaLightbox ? "" : "cursor-pointer"}`}
            onClick={enableMediaLightbox ? undefined : handlePostClick}
          >
            <MediaGallery
              media={post.media_urls}
              enableLightbox={enableMediaLightbox}
              maxHeight="400px"
            />
          </div>
        )}
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
                  ${localPost.is_liked
                    ? "text-red-500"
                    : "text-gray-400 hover:text-red-500"
                  }`}
              >
                <div className="relative">
                  <div className={`${localPost.is_liked ? "animate-like-pop" : "transition-transform duration-200"}`}>
                    {localPost.is_liked ? (
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
                  {localPost.is_liked && (
                    <span className="absolute inset-0 rounded-full bg-red-400 animate-ping-once pointer-events-none"></span>
                  )}
                </div>
                <span className="text-xs md:text-sm font-semibold">Like</span>
              </button>
              <span className={`text-xs md:text-sm font-semibold transition-colors duration-200 ${localPost.is_liked ? "text-red-500" : "text-gray-600"}`}>
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
                {localPost.comments?.length || 0}
              </span>
            </button>
          </div>

          {/* Share Action */}
          <button 
            onClick={handleShareClick}
            className="flex items-center gap-1 md:gap-2 p-1.5 md:p-2 rounded-full text-gray-600 hover:text-blue-500 hover:bg-blue-50 transition-all duration-200 hover:scale-110 active:scale-95 shrink-0 group"
          >
            <Image
              src="/icons/share_icon.svg"
              alt="Share"
              unoptimized
              width={20}
              height={20}
              className="md:w-6 md:h-6 shrink-0 opacity-70 group-hover:opacity-100"
            />
            <span className="text-xs md:text-sm font-medium">Share</span>
          </button>
        </div>
      </div>

      {/* Share Toast */}
      {showShareToast && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-up">
          <div className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-blue-400 backdrop-blur-sm">
            <Send className="w-4 h-4" />
            <span className="text-sm font-medium">Share feature is coming soon!</span>
          </div>
        </div>
      )}

      {/* Comments Section */}
      {isCommentsExpanded && (
        <div className="px-3 md:px-6 py-3 md:py-4 border-t border-gray-100 bg-gray-50">
          {/* Existing Comments */}
          {localPost.comments && localPost.comments.length > 0 && (
            <div className="space-y-4 mb-4">
              {localPost.comments.slice(-2).map((comment) => (
                <div key={comment.comment_id} className="flex gap-3">
                  <img
                    src={comment.user.profile_picture_url}
                    alt={comment.user.name}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 bg-white p-3 rounded-lg shadow-sm">
                    <p className="font-semibold text-sm text-gray-900">
                      {comment.user.name}
                    </p>
                    <p className="text-gray-800 text-sm mt-1">{comment.text}</p>
                  </div>
                </div>
              ))}
              {localPost.comments.length > 2 && (
                <button 
                  onClick={handlePostClick}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  View all {localPost.comments.length} comments
                </button>
              )}
            </div>
          )}

          {/* Comment Input */}
          <div className="flex gap-3">
            <img
              src={user?.profile_picture_url || "/logo/default-avatar.png"}
              alt="Your avatar"
              className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-2"
            />
            <div className="flex-1 relative">
              <AutoExpandingTextarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitComment();
                  }
                }}
                placeholder="Write a comment..."
                minRows={1}
                maxRows={5}
                className="w-full px-4 py-2 pr-10 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                onClick={handleSubmitComment}
                disabled={!commentText.trim() || isSubmittingComment}
                className="absolute right-2 bottom-2 p-1.5 text-green-600 hover:bg-green-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
      )}
    </div>
  );
}
