"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { api } from "@/lib/api";
import MediaGallery from "./MediaGallery";

interface UserPost {
  metadata: {
    id: number;
    uid: string;
    post_privacy: string;
    total_likes: number;
    total_comments: number;
    created_at: string;
    updated_at: string;
    created: string;
    last_update: string;
    has_text: boolean;
    has_media: boolean;
    has_poll: boolean;
    has_event: boolean;
  };
  author: {
    user_id: number;
    name: string;
    profile_picture_url: string;
  };
  likes: {
    total: number;
    likers: Array<{
      user_id: number;
      name: string;
      profile_picture_url: string;
    }>;
  };
  comments: {
    total: number;
    comment_list: Array<{
      comment_id: number;
      user: {
        user_id: number;
        name: string;
        profile_picture_url: string;
      };
      text: string;
      pics: string[];
      replies: Array<{
        reply_id: number;
        user: {
          user_id: number;
          name: string;
          profile_picture_url: string;
        };
        text: string;
        pics: string[];
      }>;
    }>;
  };
  caption: string;
  media: string[];
  poll: {
    id: number;
    uid: string;
    title: string;
    poll_type: string;
    options: Array<{
      option_id: number;
      content: string;
      vote: number;
      perc: number;
    }>;
  } | null;
  event: {
    id: number;
    title: string;
    date: string;
    location?: string;
  } | null;
  tags: string[];
  is_liked_by_me: boolean;
}

interface UserPostCardProps {
  post: UserPost;
  onPostUpdate?: () => void;
  onPostChange?: (updatedPost: UserPost) => void;
  enableMediaLightbox?: boolean; // New prop to control media lightbox
}

export default function UserPostCard({
  post,
  onPostUpdate,
  onPostChange,
  enableMediaLightbox = false,
}: UserPostCardProps) {
  const [localLikes, setLocalLikes] = useState(post.metadata.total_likes);
  const [isLiking, setIsLiking] = useState(false);
  const [localPost, setLocalPost] = useState(post);
  const [selectedPollOption, setSelectedPollOption] = useState<number | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const router = useRouter();

  const handlePostClick = () => {
    router.push(`/post/${post.metadata.id}`);
  };

  const handleLike = async () => {
    if (isLiking) return;

    try {
      setIsLiking(true);
      // Optimistic update
      const newLikedState = !localPost.is_liked_by_me;
      const updatedPost: UserPost = {
        ...localPost,
        is_liked_by_me: newLikedState,
        metadata: {
          ...localPost.metadata,
          total_likes: newLikedState
            ? localPost.metadata.total_likes + 1
            : localPost.metadata.total_likes - 1,
        },
      };
      setLocalPost(updatedPost);
      setLocalLikes(newLikedState ? localLikes + 1 : localLikes - 1);

      // Call API
      await api.get(`/api/user/post/click-like/${localPost.metadata.id}`);

      // Notify parent of the change
      if (onPostChange) {
        onPostChange(updatedPost);
      }
    } catch (error) {
      console.error("Error liking post:", error);
      // Revert optimistic update on error
      setLocalPost(post);
      setLocalLikes(post.metadata.total_likes);
    } finally {
      setIsLiking(false);
    }
  };

  const handlePollVote = async (optionId: number) => {
    if (isVoting || !localPost.poll) return;

    try {
      setIsVoting(true);

      // Calculate current total votes from options
      const currentTotalVotes = localPost.poll.options.reduce((sum, option) => sum + option.vote, 0);
      const newTotalVotes = currentTotalVotes + 1;

      // Optimistic update - update local state immediately
      const updatedPoll = {
        ...localPost.poll,
        options: localPost.poll.options.map(option => {
          if (option.option_id === optionId) {
            return {
              ...option,
              vote: option.vote + 1,
              perc: Math.round(((option.vote + 1) / newTotalVotes) * 100)
            };
          }
          return {
            ...option,
            perc: Math.round((option.vote / newTotalVotes) * 100)
          };
        })
      };

      const updatedPost: UserPost = {
        ...localPost,
        poll: updatedPoll
      };

      setLocalPost(updatedPost);
      setSelectedPollOption(optionId);

      // Call the poll vote API
      const response = await api.get(`/api/user/post/vote/${optionId}`);

      // Check if response is successful (200-299 status codes)
      if (response.status >= 200 && response.status < 300) {
        // Vote was successful, keep the optimistic update
        if (onPostChange) {
          onPostChange(updatedPost);
        }
      } else {
        // Revert optimistic update on non-success status
        setLocalPost(localPost);
        setSelectedPollOption(null);
      }
    } catch (error) {
      console.error("Error voting in poll:", error);
      // Revert optimistic update on error
      setLocalPost(localPost);
      setSelectedPollOption(null);
    } finally {
      setIsVoting(false);
    }
  };

  // Function to parse caption (API returns it as string array format)
  const parseCaption = (caption: string): string => {
    try {
      // Handle caption that comes as "['text content']" format
      if (caption.startsWith("[") && caption.endsWith("]")) {
        const parsed = JSON.parse(caption.replace(/'/g, '"'));
        return Array.isArray(parsed) ? parsed[0] || "" : caption;
      }
      return caption;
    } catch (error) {
      return caption;
    }
  };

  // Function to render text with hashtags
  const renderTextWithTags = (text: string, tags: string[]) => {
    const cleanText = parseCaption(text);

    // If no tags, just return the text split by hashtags for styling
    if (tags.length === 0) {
      return cleanText.split(/(#\w+)/g).map((part, index) => {
        if (part.startsWith("#")) {
          return (
            <span key={index} className="text-green-600 font-medium">
              {part}
            </span>
          );
        }
        return part;
      });
    }

    // For texts with tags, we need to ensure hashtags are properly styled
    // Split text by hashtags and style them
    return cleanText.split(/(#\w+)/g).map((part, index) => {
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col min-h-[420px]">
      {/* Post Header */}
      <div className="p-4 pb-3 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <img
            src={localPost.author.profile_picture_url}
            alt={localPost.author.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm truncate">
              {localPost.author.name}
            </h3>
            <p className="text-xs text-gray-500 truncate">
              {localPost.metadata.created}
            </p>
          </div>
        </div>

        {/* Post Content - Clickable */}
        <div className="cursor-pointer" onClick={handlePostClick}>
          {localPost.caption && (
            <p className="text-gray-800 leading-relaxed text-sm line-clamp-2 mb-3">
              {renderTextWithTags(localPost.caption, localPost.tags)}
            </p>
          )}
        </div>
      </div>

      {/* Poll Content */}
      {localPost.poll ? (
        <div className="px-4 pb-4 flex-1 min-h-0">
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              📊 {localPost.poll.title}
            </h4>
            <div className="space-y-2">
              {localPost.poll.options.map((option) => {
                const totalVotes = localPost.poll!.options.reduce((sum, opt) => sum + opt.vote, 0);
                const percentage = totalVotes > 0 ? (option.vote / totalVotes) * 100 : 0;
                const isSelected = selectedPollOption === option.option_id;

                return (
                  <div key={option.option_id} className="relative">
                    <button
                      onClick={() => handlePollVote(option.option_id)}
                      disabled={isVoting || selectedPollOption !== null}
                      className={`w-full text-left p-2 rounded-md border transition-all duration-200 relative overflow-hidden text-xs ${isSelected
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : selectedPollOption !== null || totalVotes > 0
                          ? 'border-gray-300 bg-white text-gray-700 cursor-default'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-green-400 hover:bg-green-50'
                        } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {/* Progress bar background */}
                      {(selectedPollOption !== null || totalVotes > 0) && (
                        <div
                          className={`absolute inset-0 transition-all duration-500 ${isSelected ? 'bg-green-200' : 'bg-gray-200'
                            }`}
                          style={{ width: `${percentage}%` }}
                        />
                      )}

                      {/* Option content */}
                      <div className="relative flex items-center justify-between">
                        <span className="font-medium">{option.content}</span>
                        {(selectedPollOption !== null || totalVotes > 0) && (
                          <span className="text-xs font-bold text-gray-800">
                            {percentage.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Poll info */}
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>
                  {localPost.poll.options.reduce((sum, opt) => sum + opt.vote, 0)} vote
                  {localPost.poll.options.reduce((sum, opt) => sum + opt.vote, 0) !== 1 ? 's' : ''}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  {localPost.poll.poll_type}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : localPost.media && localPost.media.length > 0 ? (
        <div
          className={`flex-1 min-h-0 ${enableMediaLightbox ? "" : "cursor-pointer"}`}
          onClick={enableMediaLightbox ? undefined : handlePostClick}
        >
          <div className="h-[200px] overflow-hidden">
            <MediaGallery media={localPost.media} enableLightbox={enableMediaLightbox} />
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex items-center justify-center bg-gray-50">
          <div className="text-center text-gray-400">
            <div className="w-12 h-12 mx-auto mb-2 opacity-20">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
              </svg>
            </div>
            <p className="text-xs font-medium">Text Post</p>
          </div>
        </div>
      )}

      {/* Post Actions */}
      <div className="px-4 py-3 border-t border-gray-50 bg-gray-50/30 flex-shrink-0 mt-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${localPost.is_liked_by_me
                ? "text-red-500 hover:text-red-600"
                : "text-green-400 hover:text-red-500"
                }`}
            >
              {localPost.is_liked_by_me ? (
                <Image
                  src="/icons/like_icon.svg"
                  alt="Unlike"
                  unoptimized
                  width={20}
                  height={20}
                />
              ) : (
                <Image
                  src="/icons/not_like_icon.svg"
                  alt="Like"
                  unoptimized
                  width={20}
                  height={20}
                />
              )}
            </button>
            <button
              onClick={handlePostClick}
              className="flex items-center gap-1 text-gray-600 hover:text-green-500 transition-colors duration-200"
            >
              <Image
                src="/icons/comment_icon.svg"
                alt="Comment"
                unoptimized
                width={20}
                height={20}
              />
            </button>
            <button className="flex items-center gap-1 text-gray-600 hover:text-green-500 transition-colors duration-200">
              <Image
                src="/icons/share_icon.svg"
                alt="Share"
                unoptimized
                width={20}
                height={20}
              />
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{localLikes} likes</span>
            <span>•</span>
            <span>
              {post.metadata.total_comments} comment
              {post.metadata.total_comments !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
