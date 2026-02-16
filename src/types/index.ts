// Types for the BowlersNetwork Pro Player platform
export interface ProPlayer {
    id: string;
    name: string;
    username: string;
    avatar: string;
    coverImage: string;
    bio: string; stats: {
        averageScore: number;
        tournaments: number;
        wins: number;
        pbaRank: number;
        // New fields from API
        average_score?: number;
        high_game?: number;
        high_series?: number;
        experience?: number;
    };
    weightedIndex: {
        percentage: number;
        freeUsers: number;
        premiumUsers: number;
        engagement: number;
    };
}

export interface Schedule {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    type: 'tournament' | 'clinic' | 'appearance';
    description?: string;
}

export interface Challenge {
    id: string;
    title: string;
    description: string;
    createdBy: string;
    createdAt: string;
    endDate: string;
    prize: string;
    participants: number;
    leaderboard: Participant[];
}

export interface Participant {
    id: string;
    name: string;
    score: number;
    avatar: string;
}

export interface BlogPost {
    id: string;
    title: string;
    content: string;
    author: string;
    createdAt: string;
    tags: string[];
    likes: number;
    comments: Comment[];
}

export interface Comment {
    id: string;
    author: string;
    content: string;
    createdAt: string;
    avatar: string;
}

export interface TradingCard {
    id: string;
    playerName: string;
    cardType: 'common' | 'rare' | 'legendary';
    progress: number;
    unlocked: boolean;
    requirements: string[];
}

export interface Message {
    id: string;
    from: string;
    to: string;
    content: string;
    timestamp: string;
    read: boolean;
    avatar: string;
}

export interface Sponsor {
    id: string;
    name: string;
    logo: string;
    website: string;
    products: string[];
}

export interface Notification {
    id: string;
    type: 'message' | 'challenge' | 'milestone' | 'system';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
}

export interface BowlingCenter {
    id: number;
    name: string;
    logo: string;
    lanes: number;
    address_str: string;
    lat: string;
    long: string;
    zipcode: string;
    website_url: string;
    email: string;
    phone_number: string;
    admin: string | null;
}

export interface PerformanceMetrics {
    totalUsers: number;
    freeUsers: number;
    premiumUsers: number;
    engagement: {
        likes: number;
        comments: number;
        shares: number;
        videoViews: number;
        challengeParticipation: number;
    };
    referralConversion: number;
    weeklyGrowth: number;
}

// Feed Post type
export interface FeedComment {
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

export interface FeedPost {
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
    comments?: FeedComment[];
}

// Comment user type for video comments
export interface VideoCommentUser {
    user_id: number;
    username: string;
    name: string;
    first_name: string;
    last_name: string;
    email: string;
    profile_picture_url: string;
}

// Video comment type
export interface VideoComment {
    large_video_id: number;
    comment_id: number;
    comment: string;
    user: VideoCommentUser;
    created: string;
}

//Enum Video Types
export type VideoType = 'Large' | 'Split';

// Pro Player Video type
export interface ProVideo {
    id: number;
    uid: string;
    video_type: VideoType;
    title: string;
    description: string;
    url: string;
    thumbnail_url: string | null;
    duration_str: string;
    uploaded: string;
    is_public: boolean;
    likes_count?: number;
    is_liked?: boolean;
    viewer_liked?: boolean;
    comments?: VideoComment[];
}

// ======== BOWLING GAME TYPES ========

// Enum Types
export type GameType = 'practice' | 'tournament';
export type HandPreference = 'left' | 'right';
export type LaneCondition = 'oily' | 'dry' | 'medium';
export type OilPattern = 'house' | 'sport' | 'challenge';

// Display names for enums
export const GameTypeDisplay: Record<GameType, string> = {
    practice: 'Practice',
    tournament: 'Tournament',
};

export const HandPreferenceDisplay: Record<HandPreference, string> = {
    left: 'Left Handed',
    right: 'Right Handed',
};

export const LaneConditionDisplay: Record<LaneCondition, string> = {
    oily: 'Oily Lane',
    dry: 'Dry Lane',
    medium: 'Medium Oil',
};

export const LaneConditionDescription: Record<LaneCondition, string> = {
    oily: 'Less slide, more backend',
    dry: 'Ball hooks earlier',
    medium: 'Balanced reaction',
};

export const OilPatternDisplay: Record<OilPattern, string> = {
    house: 'House Pattern',
    sport: 'Sport Pattern',
    challenge: 'Challenge Pattern',
};

export const OilPatternDescription: Record<OilPattern, string> = {
    house: 'Easy pocket hit, more forgiving',
    sport: 'Challenging, less forgiving',
    challenge: 'Most difficult pattern',
};

// Throw Entity - represents a single throw
export interface ThrowEntity {
    knockedPins: Set<number>;
    isFoul: boolean;
}

// For JSON serialization/storage
export interface ThrowData {
    knockedPins: number[];
    isFoul: boolean;
}

// Frame Entity - represents a single frame (1-10)
export interface FrameEntity {
    number: number;
    throws: ThrowEntity[];
    isPocketHit: boolean;
}

// For JSON serialization/storage
export interface FrameData {
    number: number;
    throws: ThrowData[];
    isPocketHit: boolean;
}

// Bowling Game Entity - represents a complete game
export interface BowlingGameEntity {
    id: string;
    frames: FrameEntity[];
    totalScore: number;
    date: Date;
    isComplete: boolean;
    handPreference: HandPreference;
    oilPattern: OilPattern;
    laneCondition: LaneCondition;
    gameType: GameType;
    laneNumber?: string;
}

// For JSON serialization/storage
export interface BowlingGameData {
    id: string;
    frames: FrameData[];
    totalScore: number;
    date: string;
    isComplete: boolean;
    handPreference: HandPreference;
    oilPattern: OilPattern;
    laneCondition: LaneCondition;
    gameType: GameType;
    laneNumber?: string;
}

// Game Setup Data - for creating new games
export interface GameSetupData {
    oilPattern: OilPattern;
    laneCondition: LaneCondition;
    gameType: GameType;
    laneNumber?: string;
}

// Add Score State - for the scoring UI
export interface AddScoreState {
    frames: FrameEntity[];
    currentFrame: number;
    currentThrow: number;
    remainingPins: Set<number>;
    currentKnockedPins: Set<number>;
    currentIsFoul: boolean;
    cumulativeScores: number[];
    canGoPrevious: boolean;
    canGoNext: boolean;
    completionScore: number | null;
    gameSaved: boolean;
    gameSettings: GameSetupData;
}

// Analytics Stats
export interface AnalyticsStats {
    strikes: number;
    spares: number;
    splits: number;
    splitConversions: number;
    openFrames: number;
    completedFrames: number;
    avgFirstBallPins: number;
    pocketHits: number;
    totalPocketOpportunities: number;
}

// ======== USER & AUTH TYPES ========

export interface UserInfo {
    dob?: string;
    age?: number;
    gender?: string;
    address_str?: string;
    zipcode?: string;
    lat?: string;
    long?: string;
    home_center?: string;
    handedness?: string;
    thumb_style?: string;
    is_youth?: boolean;
    is_coach?: boolean;
    usbcCardNumber?: string;
    parentFirstName?: string;
    parentLastName?: string;
    parentEmail?: string;
}

export interface Brand {
    brand_id: number;
    brandType: string;
    name: string;
    formal_name: string;
    logo_url: string;
    is_fav?: boolean;
}

export interface UserStats {
    id: number;
    is_added: boolean;
    user_id: number;
    average_score: number;
    high_game: number;
    high_series: number;
    experience: number;
}

export interface User {
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
    xp: number;
    level: number;
    contact_info: {
        email: string;
        is_public: boolean;
        is_added: boolean;
    };
    gender_data: {
        role: string;
        is_public: boolean;
        is_added: boolean;
    };
    bio: {
        content: string;
        is_public: boolean;
        is_added: boolean;
    };
    birthdate_data: {
        date: string;
        age: number;
        is_public: boolean;
        is_added: boolean;
    };
    address_data: {
        address_str: string;
        zipcode: string;
        is_public: boolean;
        is_added: boolean;
    };
    profile_media: {
        profile_picture_url: string;
        cover_picture_url: string;
        intro_video_url: string;
    };
    home_center_data: {
        center: {
            id: number;
            name: string;
            logo: string;
            lanes: number;
            address_str: string;
            lat: string;
            long: string;
            zipcode: string;
            website_url: string;
            email: string;
            phone_number: string;
            admin: any;
        } | null;
        is_public: boolean;
        is_added: boolean;
    };
    ball_handling_style: {
        description: string;
        is_public: boolean;
        is_added: boolean;
        handedness?: string;
        ball_carry?: string;
    };
    follow_info: {
        follwers: number;
        followings: number;
    };
    favorite_brands: Brand[];
    intro_video_url?: string;

    // Client-side auth fields
    authenticated?: boolean;
    access_token?: string;
    is_complete?: boolean;

    // Legacy fields for compatibility (optional)
    id?: number;
    is_pro?: boolean;
    profile_picture_url?: string;
    cover_photo_url?: string;
    card_theme?: string;
    stats?: UserStats;
    info?: UserInfo;
    follower_count?: number;
    following_count?: number;
}

export interface Tournament {
    id: number;
    name: string;
    start_date: string;
    reg_deadline: string;
    format: string;
    reg_fee: number;
    address?: string;
    description?: string;
    max_participants?: number;
    prize_pool?: number;
    access_type?: string;
    already_enrolled?: number;
}

export interface TournamentTeam {
    display_name: string;
    profile_picture: string;
    players: Array<{
        user_id: number;
        name: string;
        profile_picture_url: string;
        level: number;
    }>;
}

export interface MetricCardProps {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    color?: 'green' | 'blue' | 'red';
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

export interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    signin: (username: string, password: string) => Promise<{ success: boolean; profileComplete?: boolean }>;
    privateLogin: (privateKey: string) => Promise<{ success: boolean; error?: string }>;
    validatePrivateKey: (privateKey: string) => Promise<{ success: boolean; error?: string }>;
    betaPrivateSignup: (privateKey: string, userData: any) => Promise<{ success: boolean; error?: string }>;
    signup: (userData: {
        signup_data: {
            first_name: string;
            last_name: string;
            username: string;
            email: string;
            password: string;
        };
        post_signup_data?: {
            dob: {
                date: string;
                is_underage: boolean;
                parent_email: string | null;
                is_public: boolean;
            };
            critical_info: {
                is_coach: boolean;
            };
            address: {
                address_str: string;
                zipcode: string;
                lat: string;
                long: string;
            };
            fav_brands: number[];
        };
        verification_code: string | null;
    }) => Promise<boolean>;
    signout: () => void;
    refreshUser: () => Promise<void>;
}