"use client";

import { useRouter } from "next/navigation";
import { FeedV3Post, isDefaultContent, isPollContent } from "@/types/feedv3";
import MediaGallery from "../MediaGallery";

interface SharedPostPreviewProps {
    originalPost: FeedV3Post;
}

export default function SharedPostPreview({ originalPost }: SharedPostPreviewProps) {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/post/${originalPost.uid}`);
    };

    const renderOriginalContent = () => {
        const content = originalPost.content;

        if (isDefaultContent(content)) {
            return (
                <>
                    {content.text && (
                        <p className="text-gray-700 text-sm line-clamp-3 mb-2">
                            {content.text}
                        </p>
                    )}
                    {content.media_urls && content.media_urls.length > 0 && (
                        <div className="rounded-lg overflow-hidden mt-2">
                            <MediaGallery
                                media={content.media_urls}
                                enableLightbox={false}
                                maxHeight="300px"
                            />
                        </div>
                    )}
                </>
            );
        }

        if (isPollContent(content)) {
            return (
                <div className="bg-lime-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[#8BC342]">📊</span>
                        <span className="font-medium text-gray-800 text-sm">Poll</span>
                    </div>
                    <p className="text-gray-700 text-sm font-medium">{content.title}</p>
                    <p className="text-gray-500 text-xs mt-1">
                        {content.options.length} options • {content.total_votes} votes
                    </p>
                </div>
            );
        }

        return null;
    };

    return (
        <div
            onClick={handleClick}
            className="cursor-pointer border border-gray-200 rounded-xl p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
            {/* Original Author Info */}
            <div className="flex items-center gap-2 mb-3">
                <img
                    src={originalPost.author.profile_picture_url}
                    alt={originalPost.author.name}
                    className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">
                        {originalPost.author.name}
                    </p>
                    <p className="text-xs text-gray-500">{originalPost.created}</p>
                </div>
            </div>

            {/* Original Content */}
            {renderOriginalContent()}

            {/* Interaction counts */}
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                <span>❤️ {originalPost.likes_count}</span>
                <span>💬 {originalPost.comments_count}</span>
                <span>🔄 {originalPost.shares_count}</span>
            </div>
        </div>
    );
}
