"use client";

import { useState } from "react";
import { Loader2, UserPlus, UserCheck } from "lucide-react";
import { api } from "@/lib/api";

interface FollowButtonProps {
    authorId: number;
    initialIsFollowing: boolean;
    isFollowable: boolean;
    onFollowChange?: (isFollowing: boolean) => void;
    className?: string;
}

export default function FollowButton({
    authorId,
    initialIsFollowing,
    isFollowable,
    onFollowChange,
    className = "",
}: FollowButtonProps) {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
    const [isLoading, setIsLoading] = useState(false);

    if (!isFollowable) return null;

    const handleFollow = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isLoading) return;

        const previousState = isFollowing;
        const newState = !isFollowing;

        // Optimistic update
        setIsFollowing(newState);
        setIsLoading(true);

        try {
            const response = await api.get(`/api/follow/${authorId}`);

            // Validate response matches our optimistic update
            // The API returns { is_following: boolean, ... }
            if (response.data.is_following !== newState) {
                // If API returns different state, correct it
                setIsFollowing(response.data.is_following);
            }

            if (onFollowChange) {
                onFollowChange(response.data.is_following);
            }
        } catch (error) {
            console.error("Error toggling follow:", error);
            // Revert to previous state on error
            setIsFollowing(previousState);
            // Optional: Show toast or alert here
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleFollow}
            disabled={isLoading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${isFollowing
                    ? "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:text-red-500 hover:border-red-200"
                    : "bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:border-green-300"
                } ${className}`}
        >
            {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : isFollowing ? (
                <UserCheck className="w-3.5 h-3.5" />
            ) : (
                <UserPlus className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">{isFollowing ? "Following" : "Follow"}</span>
        </button>
    );
}
