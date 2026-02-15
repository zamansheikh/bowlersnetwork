"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Award, ChevronUp, ChevronDown, MessageCircle, Send, Loader2 } from "lucide-react";
import { Discussion } from "@/types/chatter";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import AutoExpandingTextarea from "./AutoExpandingTextarea";

interface DiscussionCardProps {
  discussion: Discussion;
  onUpdate?: (updatedDiscussion: Discussion) => void;
}

export default function DiscussionCard({ discussion, onUpdate }: DiscussionCardProps) {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [opinionText, setOpinionText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localDiscussion, setLocalDiscussion] = useState(discussion);

  // Update local state when prop changes
  if (discussion.discussion_id !== localDiscussion.discussion_id) {
    setLocalDiscussion(discussion);
  }

  const handleVote = async (type: 'discussion' | 'opinion', id: number, isUpvote: boolean) => {
    try {
      // Optimistic update
      if (type === 'discussion') {
        // Logic for optimistic update can be complex due to point string format, skipping for now or doing simple update
      }

      const endpoint = type === 'discussion'
        ? `/api/lanes/discussions/${id}/vote`
        : `/api/lanes/opinions/${id}/vote`;

      // The API endpoint in ChatterPage was different: /api/lanes/discussions/vote with body
      // But in ChatterPage handleVote it was:
      // const endpoint = type === 'discussion' ? `/api/lanes/discussions/${id}/vote` ...
      // Wait, let me check ChatterPage again.
      
      // In ChatterPage:
      // const endpoint = type === 'discussion'
      //     ? `/api/lanes/discussions/${id}/vote`
      //     : `/api/lanes/opinions/${id}/vote`;
      // await api.post(endpoint, { is_upvote: isUpvote });
      
      // In DiscussionDetailPage:
      // await api.post('/api/lanes/discussions/vote', { node_type, node_id, is_upvote });
      
      // I should stick to what ChatterPage uses since I am replacing code there.
      // Actually, let's use the one that works. The user didn't complain about voting in ChatterPage.
      
      await api.post(type === 'discussion' ? `/api/lanes/discussions/${id}/vote` : `/api/lanes/opinions/${id}/vote`, { is_upvote: isUpvote });
      
      // Fetch updated discussion to get correct points
      const response = await api.get(`/api/lanes/discussions/details/${localDiscussion.uid}`);
      setLocalDiscussion(response.data);
      if (onUpdate) onUpdate(response.data);

    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  const handleSubmitOpinion = async () => {
    if (!opinionText.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await api.post(`/api/lanes/discussions/opinion/${localDiscussion.discussion_id}`, {
        opinion: opinionText
      });

      setOpinionText("");
      
      // Fetch updated discussion details
      const response = await api.get(`/api/lanes/discussions/details/${localDiscussion.uid}`);
      setLocalDiscussion(response.data);
      if (onUpdate) onUpdate(response.data);
      
    } catch (err) {
      console.error('Error posting opinion:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200 mb-4">
      <div className="p-3 sm:p-4 md:p-6">
        {/* Header - clickable part */}
        <Link href={`/chatter/${localDiscussion.uid}`}>
          <div className="flex items-start justify-between mb-4 sm:mb-5 gap-2 sm:gap-3 cursor-pointer">
            <div className="flex items-start gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {localDiscussion.author.profile_picture_url ? (
                  <Image
                    src={localDiscussion.author.profile_picture_url}
                    alt={localDiscussion.author.name}
                    width={48}
                    height={48}
                    className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-[#8BC342] to-[#6fa332] flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0">
                    {localDiscussion.author.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
              </div>

              {/* Author info and title */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3 flex-wrap">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{localDiscussion.author.name}</h3>
                  <span className="text-xs sm:text-sm text-gray-500">@{localDiscussion.author.username}</span>
                </div>
                <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3 line-clamp-2">{localDiscussion.title}</h2>
                <p className="text-gray-700 text-xs sm:text-sm md:text-base mb-2 sm:mb-3 line-clamp-3">{localDiscussion.description}</p>
                
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <span>{localDiscussion.created}</span>
                  <span>•</span>
                  <span>{localDiscussion.opinions.length} {localDiscussion.opinions.length === 1 ? 'opinion' : 'opinions'}</span>
                </div>

                {/* Add Opinion Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                  className="flex items-center gap-2 text-[#8BC342] hover:text-[#6fa332] font-semibold text-xs sm:text-sm mb-3 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  {isExpanded ? 'Hide opinion box' : 'Add your opinion'}
                </button>
              </div>

              {/* Pro badge */}
              {localDiscussion.is_upvoted_by_the_pros && (
                <div className="flex-shrink-0 flex items-center gap-1 bg-green-50 px-2 sm:px-3 py-1 rounded-full">
                  <Award className="w-3 h-3 sm:w-4 sm:h-4 text-[#8BC342]" />
                  <span className="text-xs font-bold text-[#8BC342]">Pro Voted</span>
                </div>
              )}
            </div>
          </div>
        </Link>

        {/* Footer with vote and expand button */}
        <div className="flex items-center justify-between pt-4 sm:pt-5 border-t border-gray-200">
          {/* Voting buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleVote('discussion', localDiscussion.discussion_id, true)}
              className={`p-1.5 sm:p-2 rounded transition-colors ${localDiscussion.viewer_vote === true
                ? 'text-[#8BC342] bg-green-50'
                : 'text-gray-400 hover:text-[#8BC342] hover:bg-green-50'
                }`}
            >
              <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <span className={`text-sm font-semibold min-w-[2rem] text-center ${localDiscussion.point_str.startsWith('+') ? 'text-[#8BC342]' :
              localDiscussion.point_str.startsWith('-') ? 'text-red-600' :
                'text-gray-600'
              }`}>
              {localDiscussion.point_str}
            </span>
            <button
              onClick={() => handleVote('discussion', localDiscussion.discussion_id, false)}
              className={`p-1.5 sm:p-2 rounded transition-colors ${localDiscussion.viewer_vote === false
                ? 'text-red-600 bg-red-50'
                : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                }`}
            >
              <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Expand Opinions Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-gray-600 hover:text-[#8BC342] transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">
              {localDiscussion.opinions.length} Opinions
            </span>
          </button>
        </div>
      </div>

      {/* Expanded Opinions Section */}
      {isExpanded && (
        <div className="px-3 md:px-6 py-3 md:py-4 border-t border-gray-100 bg-gray-50">
          {/* Existing Opinions */}
          {localDiscussion.opinions && localDiscussion.opinions.length > 0 && (
            <div className="space-y-4 mb-4">
              {localDiscussion.opinions.slice(-2).map((opinion) => (
                <div key={opinion.opinion_id} className="flex gap-3">
                  <div className="flex-shrink-0">
                    {opinion.author.profile_picture_url ? (
                      <Image
                        src={opinion.author.profile_picture_url}
                        alt={opinion.author.name}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs font-bold">
                        {opinion.author.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 bg-white p-3 rounded-lg shadow-sm">
                    <div className="flex justify-between items-start">
                      <p className="font-semibold text-sm text-gray-900">
                        {opinion.author.name}
                      </p>
                      <span className="text-xs text-gray-500">{opinion.created}</span>
                    </div>
                    <p className="text-gray-800 text-sm mt-1">{opinion.opinion}</p>
                    
                    {/* Opinion Voting */}
                    <div className="flex items-center gap-2 mt-2">
                        <button
                            onClick={() => handleVote('opinion', opinion.opinion_id, true)}
                            className={`p-1 rounded transition-colors ${opinion.viewer_vote === true
                                ? 'text-[#8BC342] bg-green-50'
                                : 'text-gray-400 hover:text-[#8BC342] hover:bg-green-50'
                                }`}
                        >
                            <ChevronUp className="w-4 h-4" />
                        </button>
                        <span className={`text-xs font-semibold ${opinion.point_str.startsWith('+') ? 'text-[#8BC342]' :
                            opinion.point_str.startsWith('-') ? 'text-red-600' :
                                'text-gray-600'
                            }`}>
                            {opinion.point_str}
                        </span>
                        <button
                            onClick={() => handleVote('opinion', opinion.opinion_id, false)}
                            className={`p-1 rounded transition-colors ${opinion.viewer_vote === false
                                ? 'text-red-600 bg-red-50'
                                : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                                }`}
                        >
                            <ChevronDown className="w-4 h-4" />
                        </button>
                    </div>
                  </div>
                </div>
              ))}
              {localDiscussion.opinions.length > 2 && (
                <Link 
                  href={`/chatter/${localDiscussion.uid}`}
                  className="block text-sm text-[#8BC342] hover:text-[#6fa332] font-medium text-center"
                >
                  View all {localDiscussion.opinions.length} opinions
                </Link>
              )}
            </div>
          )}

          {/* Opinion Input */}
          <div className="flex gap-3">
            <div className="flex-shrink-0">
                {user?.profile_picture_url ? (
                    <Image
                    src={user.profile_picture_url}
                    alt="Your avatar"
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs font-bold">
                        U
                    </div>
                )}
            </div>
            <div className="flex-1 relative">
              <AutoExpandingTextarea
                value={opinionText}
                onChange={(e) => setOpinionText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitOpinion();
                  }
                }}
                placeholder="Share your opinion..."
                className="w-full px-4 py-2 pr-10 bg-white border border-gray-200 rounded-3xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8BC342] focus:border-transparent"
                minRows={1}
                maxRows={10}
              />
              <button
                onClick={handleSubmitOpinion}
                disabled={!opinionText.trim() || isSubmitting}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#8BC342] hover:bg-green-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
      )}
    </div>
  );
}
