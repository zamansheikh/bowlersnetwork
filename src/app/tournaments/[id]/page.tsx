'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Calendar, Users, DollarSign, Clock, Trophy, Star } from 'lucide-react';
import { Tournament, TournamentTeam } from '@/types';
import { tournamentApi } from '@/lib/api';
import { format } from 'date-fns';
import Image from 'next/image';

export default function TournamentDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const tournamentId = params.id as string;

    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [teams, setTeams] = useState<TournamentTeam[]>([]);
    const [loading, setLoading] = useState(true);
    const [teamsLoading, setTeamsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTournamentAndTeams = async () => {
            try {
                setLoading(true);

                // Fetch all tournaments to find the specific one
                const allTournaments = await tournamentApi.getTournaments();
                const foundTournament = allTournaments.find((t: Tournament) => t.id.toString() === tournamentId);

                if (foundTournament) {
                    setTournament(foundTournament);
                } else {
                    setError('Tournament not found');
                }

            } catch (err) {
                console.error('Error fetching tournament:', err);
                setError('Failed to load tournament details. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        const fetchTournamentTeams = async () => {
            try {
                setTeamsLoading(true);
                const teamsData = await tournamentApi.getTournamentTeams(parseInt(tournamentId));
                setTeams(teamsData);
            } catch (err) {
                console.error('Error fetching tournament teams:', err);
                // Don't set error here as teams might not exist yet
            } finally {
                setTeamsLoading(false);
            }
        };

        if (tournamentId) {
            fetchTournamentAndTeams();
            fetchTournamentTeams();
        }
    }, [tournamentId]);

    const handleRegistration = async () => {
        if (!tournament) return;

        try {
            if ((tournament.already_enrolled ?? 0) > 0) {
                await tournamentApi.unregisterFromTournament(tournament.id);
                setTournament(prev => prev ? { ...prev, already_enrolled: 0 } : null);
            } else {
                // For now, assume singles registration - you might want to add team selection logic here
                await tournamentApi.registerForTournament(tournament.id);
                setTournament(prev => prev ? { ...prev, already_enrolled: 1 } : null);
            }
        } catch (error) {
            console.error('Registration error:', error);
            setError('Failed to process registration. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-xl text-green-600">Loading tournament details...</div>
            </div>
        );
    }

    if (error || !tournament) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-lg mb-2">Error</div>
                    <p className="text-gray-500 mb-4">{error || 'Tournament not found'}</p>
                    <button
                        onClick={() => router.back()}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-semibold text-gray-900">{tournament.name}</h1>
                        <p className="text-sm text-gray-600 mt-1">Tournament Details</p>
                    </div>
                    {(tournament.already_enrolled ?? 0) > 0 && (
                        <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                            <Trophy className="w-4 h-4" />
                            Registered
                        </span>
                    )}
                </div>
            </div>

            <div className="px-6 py-6 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Tournament Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Main Info Card */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Tournament Information</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Start Date</p>
                                            <p className="font-medium text-gray-900">
                                                {format(new Date(tournament.start_date), 'MMM dd, yyyy • h:mm a')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Users className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Format</p>
                                            <p className="font-medium text-gray-900">{tournament.format}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                            <DollarSign className="w-5 h-5 text-yellow-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Registration Fee</p>
                                            <p className="font-medium text-gray-900">${tournament.reg_fee}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                            <Clock className="w-5 h-5 text-red-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Registration Deadline</p>
                                            <p className="font-medium text-gray-900">
                                                {format(new Date(tournament.reg_deadline), 'MMM dd, yyyy • h:mm a')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <MapPin className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Location</p>
                                            <p className="font-medium text-gray-900">
                                                {tournament.address || 'Location TBD'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <Trophy className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Access Type</p>
                                            <p className="font-medium text-gray-900">{tournament.access_type}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Registered Teams/Players */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">
                                Registered {tournament.format === 'Singles' ? 'Players' : 'Teams'}
                            </h2>

                            {teamsLoading ? (
                                <div className="text-center py-8">
                                    <div className="text-gray-500">Loading registered participants...</div>
                                </div>
                            ) : teams.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {teams.map((team, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="relative">
                                                    <Image
                                                        src={team.profile_picture}
                                                        alt={team.display_name}
                                                        width={48}
                                                        height={48}
                                                        className="rounded-full"
                                                    />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{team.display_name}</h4>
                                                    <p className="text-sm text-gray-600">{team.players.length} player(s)</p>
                                                </div>
                                            </div>

                                            {team.players.length > 0 && (
                                                <div className="space-y-2">
                                                    <p className="text-sm font-medium text-gray-700">Team Members:</p>
                                                    {team.players.map((player) => (
                                                        <div key={player.user_id} className="flex items-center gap-2">
                                                            <Image
                                                                src={player.profile_picture_url}
                                                                alt={player.name}
                                                                width={24}
                                                                height={24}
                                                                className="rounded-full"
                                                            />
                                                            <span className="text-sm text-gray-600">{player.name}</span>
                                                            <div className="flex items-center gap-1 ml-auto">
                                                                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                                                <span className="text-xs text-gray-500">Level {player.level}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Users className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500 mb-2">No participants registered yet</p>
                                    <p className="text-sm text-gray-400">Be the first to join this tournament!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tournament Registration</h3>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Registration Fee</span>
                                    <span className="font-medium text-gray-900">${tournament.reg_fee}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Format</span>
                                    <span className="font-medium text-gray-900">{tournament.format}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Status</span>
                                    <span className={`text-sm font-medium ${(tournament.already_enrolled ?? 0) > 0
                                            ? 'text-green-600'
                                            : 'text-blue-600'
                                        }`}>
                                        {(tournament.already_enrolled ?? 0) > 0 ? 'Registered' : 'Open'}
                                    </span>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <button
                                    onClick={handleRegistration}
                                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${(tournament.already_enrolled ?? 0) > 0
                                            ? 'border-2 border-red-600 text-red-600 hover:bg-red-50'
                                            : 'bg-green-600 hover:bg-green-700 text-white'
                                        }`}
                                >
                                    {(tournament.already_enrolled ?? 0) > 0 ? 'Unregister from Tournament' : 'Register for Tournament'}
                                </button>
                            </div>

                            <div className="mt-4 pt-4 border-t">
                                <p className="text-xs text-gray-500 text-center">
                                    Registration closes on {format(new Date(tournament.reg_deadline), 'MMM dd, yyyy')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
