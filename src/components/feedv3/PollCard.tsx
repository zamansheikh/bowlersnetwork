"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { PollContent, FeedV3Post, VoteResponse } from "@/types/feedv3";
import { Check, Clock, Trophy, Users } from "lucide-react";

interface PollCardProps {
    postId: number;
    content: PollContent;
    post: FeedV3Post;
    onVote: (updatedPost: FeedV3Post) => void;
}

export default function PollCard({ postId, content, post, onVote }: PollCardProps) {
    const [pollContent, setPollContent] = useState<PollContent>(content);
    const [selectedOptions, setSelectedOptions] = useState<number[]>(
        content.options.filter(opt => opt.has_voted).map(opt => opt.id)
    );
    const [isVoting, setIsVoting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(content.time_left_seconds);

    // Countdown timer
    useEffect(() => {
        if (pollContent.has_expired || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setPollContent(prev => ({ ...prev, has_expired: true }));
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [pollContent.has_expired, timeLeft]);

    const formatTimeLeft = (seconds: number): string => {
        if (seconds <= 0) return "Expired";
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 24) {
            const days = Math.floor(hours / 24);
            return `${days}d ${hours % 24}h left`;
        }
        if (hours > 0) {
            return `${hours}h ${minutes}m left`;
        }
        if (minutes > 0) {
            return `${minutes}m ${secs}s left`;
        }
        return `${secs}s left`;
    };

    const handleOptionClick = (optionId: number) => {
        if (pollContent.has_expired || isVoting) return;

        if (pollContent.poll_type === 'single') {
            setSelectedOptions([optionId]);
        } else {
            setSelectedOptions(prev =>
                prev.includes(optionId)
                    ? prev.filter(id => id !== optionId)
                    : [...prev, optionId]
            );
        }
    };

    const handleVote = async () => {
        if (selectedOptions.length === 0 || isVoting || pollContent.has_expired) return;

        const previousOptions = [...selectedOptions];
        setIsVoting(true);

        try {
            const response = await api.post<VoteResponse>(`/api/newsfeed/v1/${postId}/vote/`, {
                option_ids: selectedOptions
            });

            // Update poll content with response
            setPollContent(response.data.poll);

            // Create updated post object
            const updatedPost: FeedV3Post = {
                ...post,
                content: response.data.poll
            };
            onVote(updatedPost);
        } catch (error) {
            console.error("Error voting:", error);
            setSelectedOptions(previousOptions);
            alert("Failed to submit vote. Please try again.");
        } finally {
            setIsVoting(false);
        }
    };

    const handleUnvote = async () => {
        if (isVoting || pollContent.has_expired) return;

        setIsVoting(true);

        try {
            await api.post(`/api/newsfeed/v1/${postId}/unvote/`, {});

            // Refresh post data
            const response = await api.get(`/api/newsfeed/v1/${postId}/`);
            const updatedPost = response.data as FeedV3Post;

            if (updatedPost.content && 'options' in updatedPost.content) {
                setPollContent(updatedPost.content as PollContent);
                setSelectedOptions([]);
            }

            onVote(updatedPost);
        } catch (error) {
            console.error("Error removing vote:", error);
            alert("Failed to remove vote. Please try again.");
        } finally {
            setIsVoting(false);
        }
    };

    const hasVoted = pollContent.options.some(opt => opt.has_voted);
    const showResults = hasVoted || pollContent.has_expired;

    return (
        <div className="bg-gradient-to-br from-lime-50 to-green-50 rounded-xl p-4 md:p-6 border border-lime-100">
            {/* Poll Header */}
            <div className="mb-4">
                <h3 className="font-bold text-gray-900 text-lg md:text-xl mb-1">
                    {pollContent.title}
                </h3>
                {pollContent.description && (
                    <p className="text-gray-600 text-sm">{pollContent.description}</p>
                )}
            </div>

            {/* Poll Meta */}
            <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{pollContent.total_votes} votes</span>
                </div>
                <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span className={pollContent.has_expired ? "text-red-500" : ""}>
                        {formatTimeLeft(timeLeft)}
                    </span>
                </div>
                <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full">
                    <span className="text-xs font-medium text-[#8BC342]">
                        {pollContent.poll_type === 'single' ? 'Single choice' : 'Multiple choice'}
                    </span>
                </div>
            </div>

            {/* Poll Options */}
            <div className="space-y-3 mb-4" onClick={(e) => e.stopPropagation()}>
                {pollContent.options.map((option) => {
                    const isSelected = selectedOptions.includes(option.id);
                    const isWinner = pollContent.analytics?.options_breakdown?.find(
                        o => o.id === option.id
                    )?.is_winner;

                    return (
                        <button
                            key={option.id}
                            onClick={() => handleOptionClick(option.id)}
                            disabled={pollContent.has_expired || isVoting}
                            className={`w-full relative overflow-hidden rounded-lg border-2 transition-all duration-200 ${isSelected
                                ? "border-[#8BC342] bg-lime-50"
                                : "border-gray-200 bg-white hover:border-lime-300"
                                } ${pollContent.has_expired ? "cursor-default" : "cursor-pointer"}`}
                        >
                            {/* Progress bar background */}
                            {showResults && (
                                <div
                                    className={`absolute inset-0 transition-all duration-500 ${isWinner ? "bg-green-100" : "bg-gray-100"
                                        }`}
                                    style={{ width: `${option.vote_share}%` }}
                                />
                            )}

                            <div className="relative flex items-center justify-between p-3 md:p-4">
                                <div className="flex items-center gap-3">
                                    {/* Checkbox/Radio indicator */}
                                    <div className={`w-5 h-5 rounded-${pollContent.poll_type === 'single' ? 'full' : 'md'} border-2 flex items-center justify-center ${isSelected || option.has_voted
                                        ? "border-[#8BC342] bg-[#8BC342]"
                                        : "border-gray-300"
                                        }`}>
                                        {(isSelected || option.has_voted) && (
                                            <Check className="w-3 h-3 text-white" />
                                        )}
                                    </div>
                                    <span className={`font-medium ${option.has_voted ? "text-[#8BC342]" : "text-gray-800"}`}>
                                        {option.text}
                                    </span>
                                    {isWinner && (
                                        <Trophy className="w-4 h-4 text-yellow-500" />
                                    )}
                                </div>

                                {showResults && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-gray-700">
                                            {option.vote_share.toFixed(1)}%
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            ({option.vote_count})
                                        </span>
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Vote Button */}
            {!pollContent.has_expired && (
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    {!hasVoted ? (
                        <button
                            onClick={handleVote}
                            disabled={selectedOptions.length === 0 || isVoting}
                            className="flex-1 bg-[#8BC342] text-white py-2.5 px-4 rounded-lg font-medium hover:bg-[#6fa332] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isVoting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Voting...
                                </>
                            ) : (
                                "Vote"
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={handleUnvote}
                            disabled={isVoting}
                            className="flex-1 bg-gray-100 text-gray-600 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                            {isVoting ? "Removing..." : "Remove Vote"}
                        </button>
                    )}
                </div>
            )}

            {/* Analytics section for expired polls */}
            {pollContent.has_expired && pollContent.analytics && (
                <div className="mt-4 pt-4 border-t border-lime-200">
                    <div className="flex items-center gap-2 text-sm">
                        {pollContent.analytics.has_winner && pollContent.analytics.winner && (
                            <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1.5 rounded-full">
                                <Trophy className="w-4 h-4" />
                                <span className="font-medium">
                                    Winner: {pollContent.analytics.winner.text}
                                </span>
                            </div>
                        )}
                        {pollContent.analytics.is_tie && (
                            <div className="bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-full font-medium">
                                It's a tie!
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
