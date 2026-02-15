"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Loader2, AlertCircle, Heart, Send, Image as ImageIcon, X, Upload } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { useCloudUpload } from "@/lib/useCloudUpload";
import FeedPostCard from "@/components/FeedPostCard";
import MediaGallery from "@/components/MediaGallery";
import AutoExpandingTextarea from "@/components/AutoExpandingTextarea";

interface Comment {
  post_id: number;
  comment_id: number;
  user: {
    user_id: number;
    name: string;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    roles: {
      is_pro: boolean;
      is_center_admin: boolean;
      is_tournament_director: boolean;
    };
    profile_picture_url: string;
  };
  text: string;
  media_urls: string[];
}

interface PostDetail {
  post_id: number;
  uid: string;
  author: {
    user_id: number;
    name: string;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    roles: {
      is_pro: boolean;
      is_center_admin: boolean;
      is_tournament_director: boolean;
    };
    profile_picture_url: string;
    is_followable: boolean;
    is_following: boolean;
    follower_count: number;
  };
  text: string;
  media_urls: string[];
  created: string;
  like_count: number;
  is_liked: boolean;
  comments: Comment[];
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const postUid = params.uid as string;

  const [post, setPost] = useState<PostDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [commentMediaUrl, setCommentMediaUrl] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Cloud upload hook
  const { uploadFile, state: uploadState, progress, speed, publicUrl, reset: resetUpload } = useCloudUpload();

  // Fetch post details using the new API
  const fetchPost = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get(
        `https://test.bowlersnetwork.com/api/posts/v2/details/${postUid}`,
        {
          headers: {
            Authorization: `Bearer ${user?.access_token}`,
          },
        }
      );
      
      setPost(response.data);
    } catch (err: unknown) {
      console.error("Error fetching post:", err);
      setError("Failed to load post");
    } finally {
      setIsLoading(false);
    }
  }, [postUid, user?.access_token]);

  useEffect(() => {
    if (postUid && user?.access_token) {
      fetchPost();
    }
  }, [postUid, user?.access_token, fetchPost]);

  // Handle like/unlike
  const handleLike = async () => {
    if (!post || isLiking) return;

    // Optimistic update
    const previousPost = { ...post };
    const newIsLiked = !post.is_liked;
    const newLikeCount = newIsLiked ? post.like_count + 1 : post.like_count - 1;

    setPost({
      ...post,
      is_liked: newIsLiked,
      like_count: newLikeCount
    });

    try {
      setIsLiking(true);
      const response = await axios.get(
        `https://test.bowlersnetwork.com/api/posts/v2/like/${postUid}`,
        {
          headers: {
            Authorization: `Bearer ${user?.access_token}`,
          },
        }
      );

      // Update post with new like status from server
      setPost(prev => prev ? {
        ...prev,
        is_liked: response.data.is_liked,
        like_count: response.data.like_count
      } : null);
    } catch (err) {
      console.error("Error toggling like:", err);
      // Revert on error
      setPost(previousPost);
    } finally {
      setIsLiking(false);
    }
  };

  // Handle comment submission
  const handleSubmitComment = async () => {
    if (!commentText.trim() || isSubmittingComment) return;
    
    try {
      setIsSubmittingComment(true);
      const payload: { text: string; media_urls?: string[] } = {
        text: commentText
      };
      
      // Upload media if a file was selected
      let uploadedMediaUrl: string | null = null;
      const file = (fileInputRef.current as any)?._file;
      if (file && commentMediaUrl) {
        try {
          setIsUploadingMedia(true);
          const result = await uploadFile(file, 'cdn');
          if (result.success && result.publicUrl) {
            uploadedMediaUrl = result.publicUrl;
            payload.media_urls = [uploadedMediaUrl];
          }
        } catch (uploadErr) {
          console.error("Error uploading media:", uploadErr);
          // Continue with comment even if media upload fails
        } finally {
          setIsUploadingMedia(false);
        }
      }
      
      await axios.post(
        `https://test.bowlersnetwork.com/api/posts/v2/comment/${postUid}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${user?.access_token}`,
          },
        }
      );
      
      // Clear form
      setCommentText("");
      setCommentMediaUrl("");
      resetUpload();
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
        (fileInputRef.current as any)._file = null;
      }
      
      // Refresh post to get new comments
      await fetchPost();
    } catch (err) {
      console.error("Error submitting comment:", err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Handle file selection for upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Create a local preview URL instead of uploading immediately
      const previewUrl = URL.createObjectURL(file);
      // Store the file for later upload
      const reader = new FileReader();
      reader.onload = () => {
        setCommentMediaUrl(previewUrl);
      };
      reader.readAsArrayBuffer(file);
      // Keep reference to file for upload on submission
      (fileInputRef.current as any)._file = file;
    } catch (err) {
      console.error("Error selecting file:", err);
    }
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Remove uploaded media
  const handleRemoveMedia = () => {
    setCommentMediaUrl("");
    resetUpload();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">{error || "Post not found"}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Post Detail */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Post Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Image
                src={post.author.profile_picture_url}
                alt={post.author.username}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold text-gray-900">
                  {post.author.name || post.author.username}
                </h3>
                <p className="text-sm text-gray-500">{post.created}</p>
              </div>
            </div>
          </div>

          {/* Post Content */}
          <div className="p-4">
            <p className="text-gray-900 mb-4">{post.text}</p>
            
            {/* Post Media */}
            {post.media_urls && post.media_urls.length > 0 && (
              <div className="mt-4">
                <MediaGallery 
                  media={post.media_urls} 
                  enableLightbox={true}
                  maxHeight="600px"
                />
              </div>
            )}
          </div>

          {/* Like Section */}
          <div className="px-4 py-3 border-t border-b border-gray-200 flex items-center">
            <div className="flex items-center gap-2 group">
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={`flex items-center gap-2 p-2 rounded-full transition-all duration-300 transform 
                  disabled:opacity-50 disabled:cursor-not-allowed
                  hover:bg-red-50 hover:scale-110 active:scale-95
                  ${post.is_liked
                    ? "text-red-500"
                    : "text-gray-400 hover:text-red-500"
                  }`}
              >
                <div className="relative">
                  <div className={`${post.is_liked ? "animate-like-pop" : "transition-transform duration-200"}`}>
                    {post.is_liked ? (
                      <Image
                        src="/icons/like_icon.svg"
                        alt="Unlike"
                        unoptimized
                        width={24}
                        height={24}
                        className="drop-shadow-sm"
                      />
                    ) : (
                      <Image
                        src="/icons/not_like_icon.svg"
                        alt="Like"
                        unoptimized
                        width={24}
                        height={24}
                        className="grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100"
                      />
                    )}
                  </div>
                  {/* Ping effect when liked */}
                  {post.is_liked && (
                    <span className="absolute inset-0 rounded-full bg-red-400 animate-ping-once pointer-events-none"></span>
                  )}
                </div>
                <span className="text-sm font-semibold">Like</span>
              </button>
              <span className={`text-sm font-semibold transition-colors duration-200 ${post.is_liked ? "text-red-500" : "text-gray-600"}`}>
                {post.like_count} {post.like_count === 1 ? "Like" : "Likes"}
              </span>
            </div>
          </div>

          {/* Comments Section */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-4">
              Comments ({post.comments?.length || 0})
            </h3>

            {/* Comments List */}
            <div className="space-y-4 mb-4">
              {post.comments && post.comments.length > 0 ? (
                post.comments.map((comment) => (
                  <div key={comment.comment_id} className="flex gap-3">
                    <Image
                      src={comment.user.profile_picture_url}
                      alt={comment.user.username}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-lg p-3">
                        <p className="font-semibold text-sm text-gray-900">
                          {comment.user.name || comment.user.username}
                        </p>
                        <p className="text-gray-800 text-sm mt-1">{comment.text}</p>
                        
                        {/* Comment Media */}
                        {comment.media_urls && comment.media_urls.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {comment.media_urls.map((url, index) => (
                              <Image
                                key={index}
                                src={url}
                                alt={`Comment media ${index + 1}`}
                                width={200}
                                height={150}
                                className="rounded max-w-full h-auto"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
              )}
            </div>

            {/* Add Comment Form */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex gap-3">
                <Image
                  src={user?.profile_picture_url || "/logo/default-avatar.png"}
                  alt="Your avatar"
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0 mt-2"
                />
                <div className="flex-1">
                  <AutoExpandingTextarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    minRows={1}
                    maxRows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />
                  
                  {/* Hidden File Input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  {/* Media Upload Section */}
                  <div className="mt-2">
                    {commentMediaUrl ? (
                      <div className="relative inline-block">
                        {isUploadingMedia ? (
                          <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                            <div className="flex items-center gap-2 mb-2">
                              <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                              <span className="text-sm text-gray-700">Uploading media...</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {progress}% - {speed}
                            </p>
                          </div>
                        ) : (
                          <>
                            <Image
                              src={commentMediaUrl}
                              alt="Upload preview"
                              width={150}
                              height={150}
                              className="rounded-lg object-cover"
                            />
                            <button
                              onClick={handleRemoveMedia}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    ) : uploadState === 'uploading' || uploadState === 'initiating' ? (
                      <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                        <div className="flex items-center gap-2 mb-2">
                          <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                          <span className="text-sm text-gray-700">Uploading...</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {progress}% - {speed}
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={handleUploadClick}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        Upload Image/Video
                      </button>
                    )}
                  </div>

                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleSubmitComment}
                      disabled={!commentText.trim() || isSubmittingComment || isUploadingMedia || uploadState === 'uploading'}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {isSubmittingComment ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      {isSubmittingComment ? "Posting..." : "Post Comment"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
