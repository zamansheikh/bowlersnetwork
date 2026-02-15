// FeedV3 API Types - Matches /api/newsfeed/v1/ API structure

// User/Author types
export interface FeedV3AuthorRoles {
    is_pro: boolean;
    is_center_admin: boolean;
    is_tournament_director: boolean;
}

export interface FeedV3Author {
    user_id: number;
    name: string;
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    roles: FeedV3AuthorRoles;
    profile_picture_url: string;
    cover_picture_url: string;
    is_followable: boolean;
    is_following: boolean;
    follower_count: number;
}

// Content types for different post types
export interface DefaultContent {
    title?: string;
    description?: string;
    text: string;
    media_urls: string[];
}

export interface PollOption {
    id: number;
    text: string;
    vote_count: number;
    vote_share: number; // Percentage (0-100)
    has_voted: boolean;
}

export interface PollAnalytics {
    total_votes: number;
    has_winner: boolean;
    winner: {
        id: number;
        text: string;
        vote_count: number;
        vote_share: number;
    } | null;
    is_tie: boolean;
    tied_options: Array<{
        id: number;
        text: string;
        vote_count: number;
    }>;
    options_breakdown: Array<{
        id: number;
        text: string;
        vote_count: number;
        vote_share: number;
        is_winner: boolean;
    }>;
}

export interface PollContent {
    title: string;
    description: string;
    poll_type: 'single' | 'multiple';
    expiry_hours: number;
    has_expired: boolean;
    time_left_seconds: number;
    total_votes: number;
    options: PollOption[];
    analytics?: PollAnalytics;
}

export interface SharedContent {
    description: string;
    original: FeedV3Post;
}

// Comment types
export interface FeedV3Comment {
    id: number;
    parent_id: number | null;
    text: string;
    media_url: string | null;
    created_at: string;
    created: string;
    likes_count: number;
    has_liked: boolean;
    is_mine: boolean;
    is_post_author: boolean;
    author: FeedV3Author;
    replies?: FeedV3Comment[];
}

// Main Post type
export type PostType = 'default' | 'poll' | 'shared';

export interface FeedV3Post {
    id: number;
    uid: string;
    post_type: PostType;
    created_at: string;
    created: string;
    is_public: boolean;
    is_mine: boolean;
    author: FeedV3Author;
    likes_count: number;
    comments_count: number;
    shares_count: number;
    has_liked: boolean;
    latest_comments?: FeedV3Comment[];
    content: DefaultContent | PollContent | SharedContent;
}

// Type guards for content types
export function isDefaultContent(content: FeedV3Post['content']): content is DefaultContent {
    return 'text' in content && 'media_urls' in content && !('title' in content) && !('original' in content);
}

export function isPollContent(content: FeedV3Post['content']): content is PollContent {
    return 'title' in content && 'options' in content && 'poll_type' in content;
}

export function isSharedContent(content: FeedV3Post['content']): content is SharedContent {
    return 'original' in content && 'description' in content;
}

// Paginated response type
export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

// API Request/Response types
export interface CreateDefaultPostRequest {
    text?: string;
    media_urls?: string[];
    is_public?: boolean;
}

export interface CreatePollRequest {
    title: string;
    description?: string;
    poll_type?: 'single' | 'multiple';
    expiry_hours?: number;
    options: string[];
    is_public?: boolean;
}

export interface SharePostRequest {
    description?: string;
    is_public?: boolean;
}

export interface VoteRequest {
    option_ids: number[];
}

export interface CreateCommentRequest {
    text: string;
    parent_id?: number;
    media_url?: string;
}

export interface LikeResponse {
    is_liked: boolean;
    likes_count: number;
}

export interface VoteResponse {
    voted: boolean;
    option_ids: number[];
    poll: PollContent;
}

export interface ReportPostRequest {
    reason: string;
}
