export interface Topic {
    id: number;
    topic: string;
    description: string;
}

export interface Author {
    user_id: number;
    username: string;
    name: string;
    first_name: string;
    last_name: string;
    email: string;
    profile_picture_url: string;
}

export interface Opinion {
    opinion_id: number;
    opinion: string;
    created: string;
    edited: string;
    is_edited: boolean;
    is_upvoted_by_the_pros: boolean;
    point: number;
    point_str: string;
    author: Author;
    viewer_is_author: boolean;
    viewer_vote: boolean | null;
}

export interface Discussion {
    discussion_id: number;
    uid: string;
    title: string;
    description: string;
    created: string;
    edited: string;
    is_upvoted_by_the_pros: boolean;
    point: number;
    point_str: string;
    author: Author;
    opinions: Opinion[];
    viewer_is_author: boolean;
    viewer_vote: boolean | null;
}
