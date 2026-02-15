// Shared types for posts across the application

export interface FeedPost {
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
        is_following: boolean;
        viewer_is_author: boolean;
    };
    likes: [{
        total: number;
        likers: Array<{
            user_id: number;
            name: string;
            profile_picture_url: string;
        }>;
    }];
    comments: [{
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
    }];
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

export interface UserPost {
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
    likes: [{
        total: number;
        likers: Array<{
            user_id: number;
            name: string;
            profile_picture_url: string;
        }>;
    }];
    comments: [{
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
    }];
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

// Comment and reply types for better type safety
export interface Comment {
    comment_id: number;
    user: {
        user_id: number;
        name: string;
        profile_picture_url: string;
    };
    text: string;
    pics: string[];
    replies: Reply[];
}

export interface Reply {
    reply_id: number;
    user: {
        user_id: number;
        name: string;
        profile_picture_url: string;
    };
    text: string;
    pics: string[];
}
