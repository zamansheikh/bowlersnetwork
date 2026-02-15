'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, MessageCircle, Settings } from 'lucide-react';
import { api } from '@/lib/api';

interface Member {
    user_id: number;
    username: string;
    name: string;
    first_name: string;
    last_name: string;
    email: string;
    profile_picture_url: string;
    intro_video_url: string;
    cover_photo_url: string;
    xp: number;
    level: number;
    card_theme: string;
}

interface TeamMember {
    member_id: number;
    member: Member;
    is_creator: boolean;
}

interface TeamDetails {
    team_id: number;
    name: string;
    logo_url: string;
    created_by: Member;
    created_at: string;
    team_chat_room_id: number;
    members: {
        member_count: number;
        members: TeamMember[];
    };
}

export default function TeamDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const teamId = params.id as string;

    const [team, setTeam] = useState<TeamDetails | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch team details
    const fetchTeamDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/user/teams/${teamId}/members`);
            setTeam(response.data);
        } catch (error) {
            console.error('Error fetching team details:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (teamId) {
            fetchTeamDetails();
        }
    }, [teamId]);

    const handleTeamChat = () => {
        if (team?.team_chat_room_id) {
            router.push(`/messages?room_id=${team.team_chat_room_id}`);
        }
    };

    const handleMemberChat = async (memberUsername: string) => {
        try {
            const response = await api.post('/api/chat/rooms', {
                other_username: memberUsername
            });

            if (response.data && response.data.room_id) {
                router.push(`/messages?room_id=${response.data.room_id}`);
            }
        } catch (error) {
            console.error('Error creating conversation:', error);
            alert('Failed to start conversation. Please try again.');
        }
    };

    const handleManageTeam = () => {
        router.push(`/teams/${teamId}/manage`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (!team) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Team not found</h2>
                    <button
                        onClick={() => router.push('/teams')}
                        className="text-green-600 hover:text-green-700"
                    >
                        Return to Teams
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-3 md:px-6 py-3 md:py-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div className="flex items-center gap-3 md:gap-4 min-w-0">
                            <button
                                onClick={() => router.push('/teams')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden">
                                    {team.logo_url ? (
                                        <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                                            <span className="text-white text-2xl font-bold">
                                                {team.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">{team.name}</h1>
                                    <p className="text-gray-600">Team Information</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 md:gap-3 w-full md:w-auto md:justify-end">
                            <button
                                aria-label="Open team chat"
                                onClick={handleTeamChat}
                                className="w-full sm:w-auto px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors text-sm md:text-base"
                            >
                                <MessageCircle className="w-4 h-4" />
                                <span className="hidden sm:inline">Open Chat</span>
                            </button>
                            <button
                                aria-label="Manage team"
                                onClick={handleManageTeam}
                                className="w-full sm:w-auto px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors text-sm md:text-base"
                            >
                                <Settings className="w-4 h-4" />
                                <span className="hidden sm:inline">Manage Team</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-3 md:px-6 py-8">
                {/* Team Members */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Team Members</h3>
                    <div className="space-y-4 pr-6">
                        {team.members.members.map((member) => (
                            <div key={member.member_id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors overflow-hidden">
                                <div className="w-12 h-12 rounded-full overflow-hidden">
                                    {member.member.profile_picture_url ? (
                                        <img src={member.member.profile_picture_url} alt={member.member.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                            <span className="text-gray-500 text-lg">👤</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-900">{member.member.name}</h4>
                                    <p className="text-sm text-gray-600">@{member.member.username}</p>
                                    <p className="text-xs text-gray-500">{member.member.email}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {member.is_creator && (
                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Creator</span>
                                    )}
                                    <button
                                        onClick={() => handleMemberChat(member.member.username)}
                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                        title="Start conversation"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                    </button>
                                    <div
                                        className="w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-gray-300"
                                        style={{ backgroundColor: member.member.card_theme }}
                                        title="Card Theme"
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
