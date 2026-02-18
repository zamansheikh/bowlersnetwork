import axios from 'axios';

// API base URL
const API_BASE = 'https://test.bowlersnetwork.com';

// Create axios instance
export const api = axios.create({
    baseURL: API_BASE,
    timeout: 90000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                // Check if we're on a public pro route - don't redirect
                const currentPath = window.location.pathname;
                const isProRoute = currentPath.startsWith('/pro/');

                if (!isProRoute) {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('user');
                    window.location.href = '/signin';
                }
            }
        }
        return Promise.reject(error);
    }
);

// Authentication API functions
export const authApi = {
    login: async (username: string, password: string) => {
        const response = await api.post('/api/auth/login/amateurs', {
            username,
            password
        });
        return response.data;
    },

    signup: async (userData: {
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
    }) => {
        const response = await api.post('/api/auth/signup', userData);
        return response.data;
    },

    validateSignupData: async (validationData: {
        first_name: string;
        last_name: string;
        username: string;
        email: string;
        password: string;
    }) => {
        const response = await api.post('/api/access/validate/signup-data', validationData);
        return response.data;
    },

    betaPrivateSignup: async (privateKey: string, userData: { username: string; password: string }) => {
        const response = await api.post(`/api/beta-private-signup/${privateKey}`, userData);
        return response.data;
    },

    sendVerificationCode: async (email: string) => {
        const response = await api.post('/api/access/send-verification-code', { email });
        return response.data;
    }
};

// API functions
export const userApi = {
    getProfile: async () => {
        const response = await api.get('/api/profile/data');
        const data = response.data;

        // Return the data as is, but add legacy fields for compatibility
        return {
            ...data,
            // Legacy fields mapping
            id: data.user_id,
            is_pro: data.roles?.is_pro || false,
            profile_picture_url: data.profile_media?.profile_picture_url,
            cover_photo_url: data.profile_media?.cover_picture_url,
            intro_video_url: data.profile_media?.intro_video_url,
            follower_count: data.follow_info?.follwers || 0,
            following_count: data.follow_info?.followings || 0,

            // Map info object for components still using user.info
            info: {
                dob: data.birthdate_data?.date,
                age: data.birthdate_data?.age,
                gender: data.gender_data?.role,
                address_str: data.address_data?.address_str,
                zipcode: data.address_data?.zipcode,
                home_center: data.home_center_data?.center?.name,
                // Simple parsing for handedness
                handedness: data.ball_handling_style?.description?.toLowerCase().includes('right') ? 'right' :
                    data.ball_handling_style?.description?.toLowerCase().includes('left') ? 'left' : '',
                thumb_style: data.ball_handling_style?.description?.toLowerCase().includes('two handed') ? 'no-thumb' : 'thumb',
            }
        };
    },

    updateProfile: async (data: Record<string, unknown>) => {
        const response = await api.put('/api/user/profile', data);
        return response.data;
    },

    updateFavoriteBrands: async (brandIDs: number[]) => {
        const response = await api.patch('/api/user/brands/favorites', { brandIDs });
        return response.data;
    },

    updateUserInfo: async (data: Record<string, unknown>) => {
        const response = await api.post('/api/user/info', data);
        return response.data;
    }
};

// Tournament API functions
export const tournamentApi = {
    getTournaments: async () => {
        const response = await api.get('/api/tournaments');
        return response.data;
    },

    createTournament: async (tournamentData: {
        name: string;
        start_date: string;
        reg_deadline: string;
        reg_fee: string;
        participants_count: number;
        address: string;
        access_type: string;
    }) => {
        const response = await api.post('/api/tournaments', tournamentData);
        return response.data;
    },

    // Singles tournament registration
    registerSingles: async (tournamentId: number, playerId: number) => {
        const response = await api.post(`/api/tournament/${tournamentId}/add-singles-member/${playerId}`);
        return response.data;
    },

    // Doubles/Teams tournament registration
    registerWithTeam: async (tournamentId: number, teamId: number) => {
        const response = await api.post(`/api/tournament/${tournamentId}/add-teams-member/${teamId}`);
        return response.data;
    },

    registerForTournament: async (tournamentId: number) => {
        const response = await api.post(`/api/tournaments/${tournamentId}/register`);
        return response.data;
    },

    unregisterFromTournament: async (tournamentId: number) => {
        const response = await api.delete(`/api/tournaments/${tournamentId}/register`);
        return response.data;
    },

    getTournamentTeams: async (tournamentId: number) => {
        const response = await api.get(`/api/tournament/${tournamentId}/teams`);
        return response.data;
    }
};

// Teams API functions
export const teamsApi = {
    getUserTeams: async () => {
        const response = await api.get('/api/user/teams');
        return response.data;
    },

    getTeamMembers: async (teamId: number) => {
        const response = await api.get(`/api/user/teams/${teamId}/members`);
        return response.data;
    }
};

// Games API functions
import { ApiGameListResponse, ApiGameDetail, ApiGameStats, ApiCareerStats, ApiScoreTrend, ApiLeaderboardEntry } from '@/types';

export const gamesApi = {
    // 1. List Games
    listGames: async (params?: {
        page?: number;
        per_page?: number;
        game_type?: 'practice' | 'league' | 'tournament';
        oil_pattern?: 'house' | 'sport' | 'custom';
        is_complete?: boolean;
        search?: string;
    }) => {
        const response = await api.get<ApiGameListResponse>('/api/games/', { params });
        return response.data;
    },

    // 2. Create (Ingest) a Game
    createGame: async (gameData: any) => {
        const response = await api.post<ApiGameDetail>('/api/games/', gameData);
        return response.data;
    },

    // 3. Get Game Detail
    getGame: async (id: number | string) => {
        const response = await api.get<ApiGameDetail>(`/api/games/${id}/`);
        return response.data;
    },

    // 4. Update Game
    updateGame: async (id: number | string, data: { name?: string; game_type?: string }) => {
        const response = await api.patch<ApiGameDetail>(`/api/games/${id}/`, data);
        return response.data;
    },

    // 5. Delete Game
    deleteGame: async (id: number | string) => {
        await api.delete(`/api/games/${id}/`);
    },

    // 6. Game Stats & Insights
    getGameStats: async (id: number | string) => {
        const response = await api.get<ApiGameStats>(`/api/games/${id}/stats/`);
        return response.data;
    },

    // 7. Career Stats
    getCareerStats: async () => {
        const response = await api.get<ApiCareerStats>('/api/stats/');
        return response.data;
    },

    // 8. Score Trends
    getScoreTrends: async (limit: number = 10) => {
        const response = await api.get<ApiScoreTrend>('/api/stats/trends/', {
            params: { last: limit }
        });
        return response.data;
    },

    // 9. Leaderboard
    getLeaderboard: async (params?: {
        game_type?: 'practice' | 'league' | 'tournament';
        limit?: number;
    }) => {
        const response = await api.get<ApiLeaderboardEntry[]>('/api/leaderboard/', { params });
        return response.data;
    }
};
