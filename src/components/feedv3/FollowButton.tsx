"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
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
            className={`inline-flex items-center justify-center border border-solid rounded-[33554400px] text-[14px] leading-5 transition-colors duration-200 disabled:opacity-70 ${isFollowing
                    ? "border-[#d1d5db] text-[#4a5565] hover:bg-gray-100"
                    : "border-[#00c950] text-[#00a63e] hover:bg-[#f0fff4]"
                } ${className}`}
        >
            {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
                <span>{isFollowing ? "Following" : "+ Follow"}</span>
            )}
        </button>
    );
}
