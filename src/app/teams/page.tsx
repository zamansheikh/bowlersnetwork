'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Search, MessageCircle, Upload } from 'lucide-react';
import { api } from '@/lib/api';

interface Team {
    team_id: number;
    name: string;
    logo_url: string;
    created_by: {
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
    };
    created_at: string;
    team_chat_room_id: number;
    member_count?: number;
}

interface Member {
    user_id: number;
    username: string;
    name: string;
    first_name: string;
    last_name: string;
    email: string;
    profile_picture_url: string;
}

interface TeamMember {
    member_id: number;
    member: Member;
    is_creator: boolean;
}

interface Invitation {
    invitation_id: number;
    invited_user: Member;
    team: Team;
}

interface InvitationsResponse {
    received: Invitation[];
    sent: Invitation[];
}

export default function TeamsPage() {
    const router = useRouter();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'teams' | 'pending' | 'sent'>('teams');
    const [teamName, setTeamName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSelectingMembers, setIsSelectingMembers] = useState(false);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [teams, setTeams] = useState<Team[]>([]);
    const [availableMembers, setAvailableMembers] = useState<Member[]>([]);
    const [invitations, setInvitations] = useState<InvitationsResponse>({ received: [], sent: [] });

    // Handle team chat navigation
    const handleTeamChat = (team: Team) => {
        if (team.team_chat_room_id) {
            router.push(`/messages?room=${team.team_chat_room_id}`);
        }
    };

    // Fetch teams data
    const fetchTeams = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/user/teams');
            const teamsWithMembers = await Promise.all(
                response.data.my_teams.map(async (team: Team) => {
                    try {
                        const membersResponse = await api.get(`/api/user/teams/${team.team_id}/members`);
                        return {
                            ...team,
                            member_count: membersResponse.data.members.member_count
                        };
                    } catch (error) {
                        console.error(`Error fetching members for team ${team.team_id}:`, error);
                        return { ...team, member_count: 0 };
                    }
                })
            );
            setTeams(teamsWithMembers);
        } catch (error) {
            console.error('Error fetching teams:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch available members
    const fetchMembers = async () => {
        try {
            const response = await api.get('/api/profile/all');
            setAvailableMembers(response.data);
        } catch (error) {
            console.error('Error fetching members:', error);
        }
    };

    // Fetch invitations
    const fetchInvitations = async () => {
        try {
            const response = await api.get('/api/user/teams/invitations');
            setInvitations(response.data);
        } catch (error) {
            console.error('Error fetching invitations:', error);
        }
    };

    useEffect(() => {
        fetchTeams();
        fetchMembers();
        fetchInvitations();
    }, []);

    const filteredMembers = availableMembers.filter(member =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreateTeam = async () => {
        if (!teamName.trim()) return;

        try {
            setCreating(true);
            const response = await api.post('/api/user/teams', {
                name: teamName
            });

            if (response.status === 200 || response.status === 201) {
                // Send invitations to selected members
                if (selectedMembers.length > 0) {
                    await Promise.all(
                        selectedMembers.map(userId =>
                            api.post('/api/user/teams/invite', {
                                team_id: response.data.team_id,
                                invited_user_id: userId
                            })
                        )
                    );
                }

                // Refresh teams list
                await fetchTeams();
                await fetchInvitations();

                // Reset form
                setIsCreateModalOpen(false);
                setTeamName('');
                setSelectedMembers([]);
                setIsSelectingMembers(false);
                setSearchQuery('');
            }
        } catch (error) {
            console.error('Error creating team:', error);
        } finally {
            setCreating(false);
        }
    };

    const handleMemberToggle = (userId: number) => {
        setSelectedMembers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSelectMemberClick = () => {
        setIsSelectingMembers(true);
    };

    const handleAcceptInvitation = async (invitationId: number) => {
        try {
            await api.post('/api/user/teams/invitations', {
                invitation_id: invitationId,
                is_accepted: true
            });
            await fetchTeams();
            await fetchInvitations();
        } catch (error) {
            console.error('Error accepting invitation:', error);
        }
    };

    const handleRejectInvitation = async (invitationId: number) => {
        try {
            await api.post('/api/user/teams/invitations', {
                invitation_id: invitationId,
                is_accepted: false
            });
            await fetchInvitations();
        } catch (error) {
            console.error('Error rejecting invitation:', error);
        }
    };

    const handleWithdrawInvitation = async (invitationId: number) => {
        try {
            await api.delete('/api/user/teams/invitations', {
                data: { invitation_id: invitationId }
            });
            await fetchInvitations();
        } catch (error) {
            console.error('Error withdrawing invitation:', error);
        }
    };

    const handleDeleteTeam = async (teamId: number) => {
        if (confirm('Are you sure you want to delete this team?')) {
            try {
                await api.delete(`/api/user/teams/${teamId}/delete`);
                await fetchTeams();
            } catch (error) {
                console.error('Error deleting team:', error);
            }
        }
    };

    const handleManageTeam = (team: Team) => {
        router.push(`/teams/${team.team_id}/manage`);
    };

    return (
        <div className="p-3 md:p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-4 md:mb-6 relative h-32 md:h-48 rounded-2xl overflow-hidden shadow-lg">
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-lime-600 via-lime-500 to-lime-400"></div>
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                {/* Geometric design elements */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-lime-500 opacity-20 transform -skew-x-12 -translate-x-20 -translate-y-20"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-lime-400 opacity-20 transform skew-x-12 translate-x-20 -translate-y-20"></div>
                {/* Content */}
                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between h-full px-4 md:px-8 py-3 md:py-0">
                    <div className="mb-2 md:mb-0">
                        <h1 className="text-xl md:text-2xl font-bold text-white">My Teams</h1>
                        <p className="text-gray-100 text-xs md:text-sm mt-0.5 md:mt-1 hidden md:block">
                            Communications from bowling centers, manufacturers, and BowlersNetwork
                        </p>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-initial md:w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search teams..."
                                className="w-full pl-10 pr-3 py-1.5 md:py-2 border border-transparent rounded-lg text-xs md:text-sm focus:ring-2 focus:ring-lime-300 focus:border-transparent bg-white bg-opacity-90 text-gray-900 placeholder-gray-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabbed Interface */}
            <div className="mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {/* Tab Headers */}
                    <div className="bg-gradient-to-r from-lime-600 to-lime-700 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <MessageCircle className="w-5 h-5" />
                                    Team Management
                                </h2>
                                <p className="text-green-100 text-sm mt-1">
                                    Manage your teams and invitations
                                </p>
                            </div>
                            {activeTab === 'teams' && (
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="bg-white text-lime-600 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors hover:bg-lime-50"
                                >
                                    <Plus className="w-4 h-4" />
                                    Create Team
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6" aria-label="Tabs">
                            <button
                                onClick={() => setActiveTab('teams')}
                                className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors ${activeTab === 'teams'
                                    ? 'border-green-500 text-green-600'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                            >
                                Teams ({teams.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('pending')}
                                className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors ${activeTab === 'pending'
                                    ? 'border-green-500 text-green-600'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                            >
                                Pending ({invitations.received.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('sent')}
                                className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors ${activeTab === 'sent'
                                    ? 'border-green-500 text-green-600'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                            >
                                Sent ({invitations.sent.length})
                            </button>
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {/* Teams Tab */}
                        {activeTab === 'teams' && (
                            <div>
                                {loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                                    </div>
                                ) : teams.length > 0 ? (
                                    <div className="space-y-3">
                                        {teams.map((team) => (
                                            <div key={team.team_id} className="bg-gray-50 rounded-lg p-3 md:p-4 hover:bg-gray-100 transition-colors">
                                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
                                                    <div
                                                        className="flex items-center gap-3 md:gap-4 flex-1 cursor-pointer"
                                                        onClick={() => router.push(`/teams/${team.team_id}`)}
                                                    >
                                                        <div className="w-10 md:w-12 h-10 md:h-12 rounded-full flex-shrink-0 overflow-hidden">
                                                            {team.logo_url ? (
                                                                <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                                    <span className="text-gray-500 text-sm md:text-lg">👥</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h3 className="text-base md:text-lg font-semibold text-gray-900 hover:text-green-600 transition-colors truncate">{team.name}</h3>
                                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs md:text-sm text-gray-500">
                                                                <span className="text-lime-600 font-medium">{team.member_count || 0} Members</span>
                                                                <span className="hidden sm:inline">•</span>
                                                                <span className="hidden sm:inline">Created {team.created_at}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 md:gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleTeamChat(team);
                                                            }}
                                                            className="px-2 md:px-3 py-1.5 md:py-2 bg-lime-600 hover:bg-lime-700 text-white text-xs md:text-sm font-medium rounded-lg transition-colors flex items-center gap-1 md:gap-2 whitespace-nowrap"
                                                        >
                                                            <MessageCircle className="w-3 md:w-4 h-3 md:h-4" />
                                                            <span className="hidden sm:inline">Chat</span>
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleManageTeam(team);
                                                            }}
                                                            className="px-2 md:px-3 py-1.5 md:py-2 bg-green-600 hover:bg-green-700 text-white text-xs md:text-sm font-medium rounded-lg transition-colors flex items-center gap-1 md:gap-2 whitespace-nowrap"
                                                        >
                                                            <span>⚙️</span>
                                                            <span className="hidden sm:inline">Manage</span>
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteTeam(team.team_id);
                                                            }}
                                                            className="w-9 md:w-10 h-9 md:h-10 bg-gray-100 hover:bg-red-100 rounded-full flex items-center justify-center transition-colors group flex-shrink-0"
                                                        >
                                                            <span className="text-gray-600 group-hover:text-red-600 text-base md:text-lg">🗑️</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <span className="text-gray-400 text-2xl">👥</span>
                                        </div>
                                        <p className="text-gray-500 font-medium">No teams yet</p>
                                        <p className="text-gray-400 text-sm mb-4">Create your first team to get started!</p>
                                        <button
                                            onClick={() => setIsCreateModalOpen(true)}
                                            className="bg-lime-600 hover:bg-lime-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors mx-auto"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Create Team
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Pending Invitations Tab */}
                        {activeTab === 'pending' && (
                            <div>
                                {invitations.received.length > 0 ? (
                                    <div className="space-y-4">
                                        {invitations.received.map((invitation) => (
                                            <div key={invitation.invitation_id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 hover:bg-yellow-100 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-yellow-300">
                                                            {invitation.team.logo_url ? (
                                                                <img src={invitation.team.logo_url} alt={invitation.team.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center">
                                                                    <span className="text-white text-lg font-bold">
                                                                        {invitation.team.name.charAt(0).toUpperCase()}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">
                                                                <span className="text-yellow-700 font-semibold">{invitation.team.created_by.name}</span> invited you to join
                                                            </p>
                                                            <p className="text-lg font-bold text-gray-800">{invitation.team.name}</p>
                                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                                <span>📅</span>
                                                                Invited on {new Date(invitation.team.created_at).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleAcceptInvitation(invitation.invitation_id)}
                                                            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm"
                                                        >
                                                            <span>✓</span>
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectInvitation(invitation.invitation_id)}
                                                            className="px-4 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2"
                                                        >
                                                            <span>✕</span>
                                                            Decline
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <span className="text-yellow-500 text-2xl">📨</span>
                                        </div>
                                        <p className="text-gray-500 font-medium">No pending invitations</p>
                                        <p className="text-gray-400 text-sm">You&apos;ll see team invitations here when someone invites you!</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Sent Invitations Tab */}
                        {activeTab === 'sent' && (
                            <div>
                                {invitations.sent.length > 0 ? (
                                    <div className="space-y-4">
                                        {invitations.sent.map((invitation) => (
                                            <div key={invitation.invitation_id} className="bg-lime-50 border border-lime-200 rounded-lg p-4 hover:bg-lime-100 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-lime-300">
                                                            {invitation.invited_user.profile_picture_url ? (
                                                                <img src={invitation.invited_user.profile_picture_url} alt={invitation.invited_user.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full bg-gradient-to-br from-lime-400 to-lime-500 flex items-center justify-center">
                                                                    <span className="text-white text-lg font-bold">
                                                                        {invitation.invited_user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-600">You invited</p>
                                                            <p className="text-lg font-bold text-gray-800">{invitation.invited_user.name}</p>
                                                            <p className="text-sm text-lime-700 font-medium">
                                                                to join <span className="font-bold">{invitation.team.name}</span>
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                                                                <p className="text-xs text-gray-500">Waiting for response</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <button
                                                            onClick={() => handleWithdrawInvitation(invitation.invitation_id)}
                                                            className="px-4 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2 mb-2"
                                                        >
                                                            <span>↶</span>
                                                            Withdraw
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-lime-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <span className="text-lime-600 text-2xl">📤</span>
                                        </div>
                                        <p className="text-gray-500 font-medium">No sent invitations</p>
                                        <p className="text-gray-400 text-sm">Invitations you send to team members will appear here!</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>



            {/* Create Team Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Create New Team</h2>
                            <button
                                onClick={() => {
                                    setIsCreateModalOpen(false);
                                    setTeamName('');
                                    setSelectedMembers([]);
                                    setIsSelectingMembers(false);
                                    setSearchQuery('');
                                }}
                                className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors"
                            >
                                <X className="w-4 h-4 text-red-600" />
                            </button>
                        </div>

                        {/* Team Name */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Team Name
                            </label>
                            <input
                                type="text"
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                placeholder="Team Name"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>

                        {/* Select Member */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Members (Optional)
                            </label>

                            {!isSelectingMembers ? (
                                <button
                                    onClick={handleSelectMemberClick}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left text-gray-500 hover:bg-gray-50 transition-colors flex items-center justify-between"
                                >
                                    <span>Select bowlers to invite...</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            ) : (
                                <div className="border border-gray-300 rounded-lg p-3">
                                    {/* Search */}
                                    <div className="relative mb-3">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="search bowler..."
                                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>

                                    {/* Members List */}
                                    <div className="max-h-48 overflow-y-auto space-y-2">
                                        {filteredMembers.map((member) => (
                                            <div
                                                key={member.user_id}
                                                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
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
                                                    <span className="text-gray-900">{member.name}</span>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedMembers.includes(member.user_id)}
                                                    onChange={() => handleMemberToggle(member.user_id)}
                                                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Selected Members Display */}
                        {selectedMembers.length > 0 && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Selected Members ({selectedMembers.length})
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {availableMembers
                                        .filter(member => selectedMembers.includes(member.user_id))
                                        .map((member) => (
                                            <div
                                                key={member.user_id}
                                                className="flex items-center gap-2 bg-green-100 border border-green-300 rounded-full px-3 py-1.5"
                                            >
                                                <div className="w-6 h-6 rounded-full overflow-hidden">
                                                    {member.profile_picture_url ? (
                                                        <img src={member.profile_picture_url} alt={member.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                                            <span className="text-gray-600 text-xs">👤</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-sm text-gray-800 font-medium">{member.name}</span>
                                                <button
                                                    onClick={() => handleMemberToggle(member.user_id)}
                                                    className="ml-1 text-green-600 hover:text-red-600 transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}

                        {/* Upload Image */}
                        {/* <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Upload Image
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-gray-500 text-sm">Click to upload or drag and drop</p>
                            </div>
                        </div> */}

                        {/* Create Button */}
                        <button
                            onClick={handleCreateTeam}
                            disabled={!teamName.trim() || creating}
                            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors"
                        >
                            {creating ? 'Creating...' : 'Create Team'}
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}
