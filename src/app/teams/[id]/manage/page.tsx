'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Search, MessageCircle, Plus, X, Trash2 } from 'lucide-react';
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

interface AvailableMember {
    user_id: number;
    username: string;
    name: string;
    first_name: string;
    last_name: string;
    email: string;
    profile_picture_url: string;
}

export default function TeamManagePage() {
    const router = useRouter();
    const params = useParams();
    const teamId = params.id as string;

    const [team, setTeam] = useState<TeamDetails | null>(null);
    const [availableMembers, setAvailableMembers] = useState<AvailableMember[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isInviting, setIsInviting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showInviteSection, setShowInviteSection] = useState(false);

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

    // Fetch available members to invite
    const fetchAvailableMembers = async () => {
        try {
            const response = await api.get('/api/user-data');
            setAvailableMembers(response.data);
        } catch (error) {
            console.error('Error fetching available members:', error);
        }
    };

    useEffect(() => {
        if (teamId) {
            fetchTeamDetails();
            fetchAvailableMembers();
        }
    }, [teamId]);

    const filteredMembers = availableMembers.filter(member =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !team?.members.members.some(teamMember => teamMember.member.user_id === member.user_id)
    );

    const handleMemberToggle = (userId: number) => {
        setSelectedMembers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleInviteMembers = async () => {
        if (selectedMembers.length === 0 || !team) return;

        try {
            setIsInviting(true);
            await Promise.all(
                selectedMembers.map(userId =>
                    api.post('/api/user/teams/invite', {
                        team_id: team.team_id,
                        invited_user_id: userId
                    })
                )
            );

            // Refresh team details
            await fetchTeamDetails();

            // Reset form
            setSelectedMembers([]);
            setSearchQuery('');
            setShowInviteSection(false);
            alert(`Successfully sent ${selectedMembers.length} invitation(s)!`);
        } catch (error) {
            console.error('Error sending invitations:', error);
            alert('Error sending invitations. Please try again.');
        } finally {
            setIsInviting(false);
        }
    };

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

    const handleDeleteTeam = async () => {
        if (!team || !confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
            return;
        }

        try {
            await api.delete(`/api/user/teams/${team.team_id}/delete`);
            router.push('/teams');
        } catch (error) {
            console.error('Error deleting team:', error);
            alert('Error deleting team. Please try again.');
        }
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
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden">
                                    {team.logo_url ? (
                                        <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                                            <span className="text-white text-lg font-bold">
                                                {team.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
                                    <p className="text-gray-600">Team Management</p>
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
                                aria-label="Delete team"
                                onClick={handleDeleteTeam}
                                className="w-full sm:w-auto px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 transition-colors text-sm md:text-base"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span className="hidden sm:inline">Delete Team</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-3 md:px-6 py-8">
                {/* Members Management */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
                        <button
                            onClick={() => setShowInviteSection(!showInviteSection)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Invite Members
                        </button>
                    </div>

                    {/* Invite Section */}
                    {showInviteSection && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-3">Invite New Members</h4>

                            {/* Search */}
                            <div className="relative mb-3">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search members to invite..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>

                            {/* Available Members */}
                            <div className="max-h-48 overflow-y-auto space-y-2 mb-4">
                                {filteredMembers.map((member) => (
                                    <div
                                        key={member.user_id}
                                        className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-gray-50 cursor-pointer"
                                        onClick={() => handleMemberToggle(member.user_id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full overflow-hidden">
                                                {member.profile_picture_url ? (
                                                    <img src={member.profile_picture_url} alt={member.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                        <span className="text-gray-500 text-sm">👤</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{member.name}</p>
                                                <p className="text-sm text-gray-600">@{member.username}</p>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={selectedMembers.includes(member.user_id)}
                                            onChange={() => handleMemberToggle(member.user_id)}
                                            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                        />
                                    </div>
                                ))}
                                {filteredMembers.length === 0 && (
                                    <p className="text-gray-500 text-center py-4">No available members to invite</p>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleInviteMembers}
                                    disabled={selectedMembers.length === 0 || isInviting}
                                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors"
                                >
                                    {isInviting ? 'Sending...' : `Send ${selectedMembers.length} Invitation${selectedMembers.length !== 1 ? 's' : ''}`}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowInviteSection(false);
                                        setSelectedMembers([]);
                                        setSearchQuery('');
                                    }}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Current Members */}
                    <div className="space-y-3 pr-6">
                        {team.members.members.map((member) => (
                            <div key={member.member_id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg overflow-hidden">
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
