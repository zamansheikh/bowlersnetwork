'use client';

import { useState, useEffect } from 'react';
import { Search, Calendar, MapPin, Users, Trophy, Plus, X, Clock, FileText, Trash2, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

// API Base URL
const API_BASE_URL = 'https://test.bowlersnetwork.com';

// Helper function to get auth headers
const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

// Types
interface Tournament {
    id: number;
    name: string;
    date: string;
    time: string;
    director: string;
    center: string;
    centerAddress: string;
    directorNote?: string;
    status: 'upcoming' | 'ongoing' | 'completed' | 'draft';
    events: TournamentEvent[];
    participantsCount: number;
    categories?: string[];
    isNewFormat?: boolean;
    flyer?: string | null;
    publishedType?: 'user-based' | 'location-based' | 'criteria-based';
    publishRadius?: number;
    publishCriteria?: {
        averageMin: number;
        averageMax: number;
        ageMin: number;
        ageMax: number;
        genders: string[];
        minFollowers: number;
    };
    is_published?: boolean;
}

interface TournamentEvent {
    id: number;
    name: string;
    type: 'normal' | 'bracket';
    settings: any;
}

interface BowlingCenter {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
}

interface CreateTournamentForm {
    name: string;
    date: string;
    time: string;
    center: BowlingCenter | null;
    directorNote: string;
}

// Dummy Data
const DUMMY_BOWLING_CENTERS: BowlingCenter[] = [
    { id: 1, name: "Strike Zone Bowling Center", address: "123 Main St", city: "Los Angeles", state: "CA" },
    { id: 2, name: "Lucky Strike Chatter", address: "456 Oak Ave", city: "Chicago", state: "IL" },
    { id: 3, name: "Sunset Bowling Alley", address: "789 Pine Rd", city: "Miami", state: "FL" },
    { id: 4, name: "Thunder Alley", address: "321 Maple Dr", city: "New York", state: "NY" },
    { id: 5, name: "Perfect Game Center", address: "654 Elm St", city: "Houston", state: "TX" },
];

export default function TournamentsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [selectedTournamentDetail, setSelectedTournamentDetail] = useState<Tournament | null>(null);
    const [showTournamentDetail, setShowTournamentDetail] = useState(false);
    const [showCreateNewModal, setShowCreateNewModal] = useState(false);
    const [showAddEventModal, setShowAddEventModal] = useState(false);
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
    const [selectedEventType, setSelectedEventType] = useState<'normal' | 'bracket' | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Function to load tournaments from backend API
    const loadTournaments = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/tournaments/v0`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error('Failed to load tournaments');
            }

            const responseData = await response.json();
            const tournamentsData = Array.isArray(responseData) ? responseData : (responseData.data || responseData);

            // Transform API response to Tournament format
            const transformedTournaments: Tournament[] = tournamentsData.map((item: any) => {
                // Handle both old and new API response formats
                const tournamentData = item.data || item;

                return {
                    id: item.id,
                    name: tournamentData.name,
                    date: tournamentData.startDate,
                    time: tournamentData.time,
                    director: item.director_name || tournamentData.director_name,
                    center: 'Strike Zone Bowling Center', // TODO: Look up from center_id
                    centerAddress: '123 Main St, Los Angeles, CA', // TODO: Look up from center_id
                    directorNote: tournamentData.note,
                    status: 'draft',
                    events: tournamentData.events || [],
                    participantsCount: tournamentData.numberOfParticipants,
                    categories: tournamentData.categories,
                    flyer: item.flyer || null,
                    isNewFormat: true,
                    is_published: item.is_published || false
                };
            });

            setTournaments(transformedTournaments);
        } catch (error) {
            console.error('Error loading tournaments:', error);
            // Keep empty array on error
        } finally {
            setIsLoading(false);
        }
    };

    // Load tournaments on component mount
    useEffect(() => {
        loadTournaments();
    }, []);

    const tabs = [
        { id: 'all', label: 'All Tournaments' },
        { id: 'my', label: 'My Tournaments' },
        { id: 'upcoming', label: 'Upcoming' },
        { id: 'completed', label: 'Completed' }
    ];

    const filteredTournaments = tournaments.filter(tournament => {
        // Safely handle missing properties
        const tournamentName = tournament.name || '';
        const tournamentCenter = tournament.center || '';
        const matchesSearch = tournamentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tournamentCenter.toLowerCase().includes(searchQuery.toLowerCase());

        if (activeTab === 'all') {
            return matchesSearch;
        } else if (activeTab === 'my') {
            return matchesSearch && tournament.director === user?.name;
        } else if (activeTab === 'upcoming') {
            return matchesSearch && tournament.status === 'upcoming';
        } else if (activeTab === 'completed') {
            return matchesSearch && tournament.status === 'completed';
        }
        return matchesSearch;
    });

    const handleDeleteTournament = (id: number) => {
        if (confirm('Are you sure you want to delete this tournament?')) {
            setTournaments(tournaments.filter(t => t.id !== id));
        }
    };

    const handleOpenAddEvent = (tournament: Tournament) => {
        setSelectedTournament(tournament);
        setShowAddEventModal(true);
        setSelectedEventType(null);
    };

    const handlePublish = async () => {
        if (!selectedTournament) return;

        try {
            setIsLoading(true);

            // Call the publish API endpoint (GET)
            const response = await fetch(`${API_BASE_URL}/api/tournaments/v0/publish/${selectedTournament.id}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to publish tournament');
            }

            // Success - close modal and reload tournaments to get updated is_published status
            setShowPublishModal(false);
            setSelectedTournament(null);

            // Reload tournaments to get the updated is_published status
            await loadTournaments();
        } catch (error) {
            console.error('Error publishing tournament:', error);
            alert(error instanceof Error ? error.message : 'Failed to publish tournament');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{ background: 'linear-gradient(to right, #8BC342, #6fa332)' }}>
                                <Trophy className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Tournaments</h1>
                                <p className="text-sm text-gray-500">Manage and participate in tournaments</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowCreateNewModal(true)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Create Tournament
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tabs and Search */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex gap-2">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === tab.id
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <div className="relative flex-1 md:max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search tournaments..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Tournament Cards */}
                {isLoading ? (
                    <div className="col-span-full flex justify-center items-center py-16">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading tournaments...</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredTournaments.map(tournament => (
                            <div key={tournament.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                <div className="p-6 border-b border-gray-100"
                                    style={{ background: 'linear-gradient(to right, rgba(139, 195, 66, 0.1), rgba(111, 163, 50, 0.1))' }}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="text-xl font-bold text-gray-900">{tournament.name}</h3>
                                                {tournament.is_published && (
                                                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 flex items-center gap-1">
                                                        <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                                                        Published
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar className="w-4 h-4" />
                                                <span>{format(new Date(tournament.date), 'MMM dd, yyyy')}</span>
                                                <Clock className="w-4 h-4 ml-2" />
                                                <span>{tournament.time}</span>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${tournament.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                                            tournament.status === 'ongoing' ? 'bg-green-100 text-green-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                            {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-start gap-3">
                                            <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-medium text-gray-900">{tournament.center}</p>
                                                <p className="text-sm text-gray-600">{tournament.centerAddress}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Users className="w-5 h-5 text-green-600" />
                                            <p className="text-gray-700">
                                                <span className="font-medium">{tournament.participantsCount}</span> participants
                                            </p>
                                        </div>
                                        {tournament.directorNote && (
                                            <div className="flex items-start gap-3">
                                                <FileText className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                                <p className="text-sm text-gray-600 italic">{tournament.directorNote}</p>
                                            </div>
                                        )}
                                    </div>

                                    {tournament.events.length > 0 && (
                                        <div className="mb-4">
                                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Events ({tournament.events.length})</h4>
                                            <div className="space-y-2">
                                                {tournament.events.map(event => (
                                                    <div key={event.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2 h-2 rounded-full ${event.type === 'normal' ? 'bg-blue-500' : 'bg-purple-500'
                                                                }`} />
                                                            <span className="text-sm font-medium text-gray-700">{event.name}</span>
                                                            <span className="text-xs text-gray-500 capitalize">({event.type})</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        {tournament.director === user?.name && (
                                            <>
                                                {tournament.is_published ? (
                                                    <button
                                                        disabled
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg cursor-not-allowed opacity-75"
                                                    >
                                                        <span className="w-4 h-4">✓</span>
                                                        Published
                                                    </button>
                                                ) : tournament.isNewFormat ? (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedTournament(tournament);
                                                            setShowPublishModal(true);
                                                        }}
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                        Publish
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleOpenAddEvent(tournament)}
                                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                        Add Event
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteTournament(tournament.id)}
                                                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                        {tournament.director !== user?.name && (
                                            <button
                                                onClick={() => {
                                                    setSelectedTournamentDetail(tournament);
                                                    setShowTournamentDetail(true);
                                                }}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-green-600 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                                <Eye className="w-4 h-4" />
                                                View Details
                                            </button>
                                        )}
                                        {tournament.director === user?.name && (
                                            <button
                                                onClick={() => {
                                                    setSelectedTournamentDetail(tournament);
                                                    setShowTournamentDetail(true);
                                                }}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                                <Eye className="w-4 h-4" />
                                                Details
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!isLoading && filteredTournaments.length === 0 && (
                    <div className="text-center py-16">
                        <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No tournaments found</h3>
                        <p className="text-gray-500 mb-6">
                            {searchQuery ? 'Try adjusting your search' : 'Create your first tournament to get started'}
                        </p>
                    </div>
                )}
            </div>

            {/* Create Tournament Modal - OLD VERSION - COMMENTED OUT */}
            {/*
            {showCreateModal && (
                <CreateTournamentModal
                    createForm={createForm}
                    setCreateForm={setCreateForm}
                    centerSearch={centerSearch}
                    setCenterSearch={setCenterSearch}
                    showCenterDropdown={showCenterDropdown}
                    setShowCenterDropdown={setShowCenterDropdown}
                    filteredCenters={filteredCenters}
                    handleCreateTournament={handleCreateTournament}
                    onClose={() => setShowCreateModal(false)}
                    user={user}
                />
            )}
            */}

            {/* Tournament Details Modal */}
            {showTournamentDetail && selectedTournamentDetail && (
                <TournamentDetailModal
                    tournament={selectedTournamentDetail}
                    onClose={() => {
                        setShowTournamentDetail(false);
                        setSelectedTournamentDetail(null);
                    }}
                    user={user}
                    onFlyerUploadSuccess={loadTournaments}
                />
            )}

            {/* Create New Tournament Modal (3-Step) */}
            {showCreateNewModal && (
                <CreateNewTournamentModal
                    onClose={() => setShowCreateNewModal(false)}
                    user={user}
                    tournaments={tournaments}
                    setTournaments={setTournaments}
                />
            )}

            {/* Add Event Modal */}
            {showAddEventModal && selectedTournament && (
                <AddEventModal
                    tournament={selectedTournament}
                    selectedEventType={selectedEventType}
                    setSelectedEventType={setSelectedEventType}
                    tournaments={tournaments}
                    setTournaments={setTournaments}
                    onClose={() => {
                        setShowAddEventModal(false);
                        setSelectedTournament(null);
                        setSelectedEventType(null);
                    }}
                />
            )}

            {/* Publish Tournament Modal - Simple Confirmation */}
            {showPublishModal && selectedTournament && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">Publish Tournament</h2>
                            <button onClick={() => setShowPublishModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                                    <Trophy className="w-8 h-8 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedTournament.name}</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Are you ready to publish this tournament? Once published, it will be visible to all users.
                                </p>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-sm text-blue-800">
                                    <strong>Status:</strong> Publishing to all users
                                </p>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                            <button
                                onClick={() => setShowPublishModal(false)}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePublish}
                                disabled={isLoading}
                                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
                            >
                                {isLoading ? 'Publishing...' : 'Publish Now'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Add Event Modal Component  
function AddEventModal({ tournament, selectedEventType, setSelectedEventType, tournaments, setTournaments, onClose }: any) {
    // Basic Info
    const [eventName, setEventName] = useState('');
    const [eventShortName, setEventShortName] = useState('');
    const [bowlersPerTeam, setBowlersPerTeam] = useState(1);
    const [entryFee, setEntryFee] = useState(0);
    const [allowOnlineEntry, setAllowOnlineEntry] = useState('yes');

    // Optional Settings for Standings (Normal only)
    const [teamName, setTeamName] = useState('no');
    const [homeTown, setHomeTown] = useState('no');
    const [homeCenter, setHomeCenter] = useState('no');
    const [showPinsBehind200, setShowPinsBehind200] = useState('no');
    const [showPinsBehindLeader, setShowPinsBehindLeader] = useState('no');
    const [showCutLine, setShowCutLine] = useState('0');
    const [showPinsBehindCut, setShowPinsBehindCut] = useState('no');

    // Rules of Play
    const [format, setFormat] = useState(selectedEventType === 'bracket' ? 'Bracket' : 'Normal');
    const [formatNote, setFormatNote] = useState('');
    const [numberOfGames, setNumberOfGames] = useState(selectedEventType === 'bracket' ? 1 : 3);
    const [carryingPins, setCarryingPins] = useState('no');
    const [allowAlibi, setAllowAlibi] = useState('no');

    // Handicap
    const [handicapType, setHandicapType] = useState('Scratch');
    const [handicapPercent, setHandicapPercent] = useState(0);
    const [baseAverage, setBaseAverage] = useState(200);
    const [maxHandicap, setMaxHandicap] = useState('');
    const [maxScoreWithHandicap, setMaxScoreWithHandicap] = useState('');
    const [negativeHandicapPercent, setNegativeHandicapPercent] = useState('');
    const [minHandicap, setMinHandicap] = useState('');
    const [teamHandicapCalc, setTeamHandicapCalc] = useState('Add up bowler handicaps');
    const [seriesHandicapCalc, setSeriesHandicapCalc] = useState('Game handicap times num of games');

    const handleAddEvent = () => {
        if (!eventName || !eventShortName) {
            alert('Please fill in required fields');
            return;
        }

        const newEvent: TournamentEvent = {
            id: tournament.events.length + 1,
            name: eventName,
            type: selectedEventType!,
            settings: {
                eventName,
                eventShortName,
                bowlersPerTeam,
                entryFee,
                allowOnlineEntry,
                teamName,
                homeTown,
                homeCenter,
                showPinsBehind200,
                showPinsBehindLeader,
                showCutLine,
                showPinsBehindCut,
                format,
                formatNote,
                numberOfGames,
                carryingPins,
                allowAlibi,
                handicapType,
                handicapPercent,
                baseAverage,
                maxHandicap,
                maxScoreWithHandicap,
                negativeHandicapPercent,
                minHandicap,
                teamHandicapCalc,
                seriesHandicapCalc
            }
        };

        const updatedTournaments = tournaments.map((t: Tournament) => {
            if (t.id === tournament.id) {
                return { ...t, events: [...t.events, newEvent] };
            }
            return t;
        });

        setTournaments(updatedTournaments);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Add Event to {tournament.name}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {!selectedEventType ? (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Event Type</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => setSelectedEventType('normal')}
                                    className="p-6 border-2 border-gray-300 hover:border-green-600 rounded-lg transition-all hover:shadow-lg group"
                                >
                                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                                        <Trophy className="w-8 h-8 text-blue-600" />
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-900 mb-2">Normal Event</h4>
                                    <p className="text-gray-600 text-sm">Standard tournament format with teams, handicaps, and full settings</p>
                                </button>

                                <button
                                    onClick={() => setSelectedEventType('bracket')}
                                    className="p-6 border-2 border-gray-300 hover:border-green-600 rounded-lg transition-all hover:shadow-lg group"
                                >
                                    <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                                        <Trophy className="w-8 h-8 text-purple-600" />
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-900 mb-2">Bracket Event</h4>
                                    <p className="text-gray-600 text-sm">Single elimination bracket format for quick competitions</p>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">{selectedEventType === 'normal' ? 'Normal' : 'Bracket'} Event Settings</h3>
                                <button onClick={() => setSelectedEventType(null)} className="text-sm text-gray-600 hover:text-gray-900">← Back</button>
                            </div>

                            {/* Basic Information */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-900 mb-4">Basic Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Event Name (full) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={eventName}
                                            onChange={(e) => setEventName(e.target.value)}
                                            placeholder="Tournament name will already be referenced"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Event Short Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={eventShortName}
                                            onChange={(e) => setEventShortName(e.target.value)}
                                            placeholder="4-10 characters is good"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Number of Bowlers on a team
                                        </label>
                                        <select
                                            value={bowlersPerTeam}
                                            onChange={(e) => setBowlersPerTeam(parseInt(e.target.value))}
                                            disabled={selectedEventType === 'bracket'}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                                        >
                                            {selectedEventType === 'bracket' ? (
                                                <option value="1">1 (singles only for Bracket)</option>
                                            ) : (
                                                [1, 2, 3, 4, 5].map(num => <option key={num} value={num}>{num}</option>)
                                            )}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Entry Fee (per team entry)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">$</span>
                                            <input
                                                type="number"
                                                value={entryFee}
                                                onChange={(e) => setEntryFee(parseFloat(e.target.value))}
                                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Allow bowlers to enter online?
                                        </label>
                                        <select
                                            value={allowOnlineEntry}
                                            onChange={(e) => setAllowOnlineEntry(e.target.value)}
                                            disabled={selectedEventType === 'bracket'}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                                        >
                                            {selectedEventType === 'bracket' ? (
                                                <option value="no">Not available for this format</option>
                                            ) : (
                                                <>
                                                    <option value="yes">yes, bowlers can enter</option>
                                                    <option value="no">no</option>
                                                </>
                                            )}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Optional Settings for Standings - Normal Only */}
                            {selectedEventType === 'normal' && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-gray-900 mb-4">Optional settings for standings (display)</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Will teams have a team name?
                                            </label>
                                            <select
                                                value={teamName}
                                                onChange={(e) => setTeamName(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                            >
                                                <option value="no">no, just bowler name(s)</option>
                                                <option value="yes">yes</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Will teams have a home town?
                                            </label>
                                            <select
                                                value={homeTown}
                                                onChange={(e) => setHomeTown(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                            >
                                                <option value="no">no</option>
                                                <option value="yes">yes</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Will teams have a home center?
                                            </label>
                                            <select
                                                value={homeCenter}
                                                onChange={(e) => setHomeCenter(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                            >
                                                <option value="no">no</option>
                                                <option value="yes">yes</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Show pins behind 200 pace?
                                            </label>
                                            <select
                                                value={showPinsBehind200}
                                                onChange={(e) => setShowPinsBehind200(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                            >
                                                <option value="no">no</option>
                                                <option value="yes">yes</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Show pins behind the leader?
                                            </label>
                                            <select
                                                value={showPinsBehindLeader}
                                                onChange={(e) => setShowPinsBehindLeader(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                            >
                                                <option value="no">no</option>
                                                <option value="yes">yes</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Show a cut line on standings?
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    value={showCutLine}
                                                    onChange={(e) => setShowCutLine(e.target.value)}
                                                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                />
                                                <span className="text-sm text-gray-600 self-center">0 for no cut line</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Show pins behind the cut?
                                            </label>
                                            <select
                                                value={showPinsBehindCut}
                                                onChange={(e) => setShowPinsBehindCut(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                            >
                                                <option value="no">no</option>
                                                <option value="yes">yes</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Rules of Play */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-900 mb-4">Rules of Play</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                                        <select
                                            value={format}
                                            onChange={(e) => setFormat(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        >
                                            {selectedEventType === 'bracket' ? (
                                                <option value="Bracket">Bracket</option>
                                            ) : (
                                                <>
                                                    <option value="Normal">Normal</option>
                                                    <option value="Baker">Baker</option>
                                                    <option value="Scotch Doubles">Scotch Doubles</option>
                                                </>
                                            )}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Format note (can leave blank)
                                        </label>
                                        <input
                                            type="text"
                                            value={formatNote}
                                            onChange={(e) => setFormatNote(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Number of Games to bowl
                                        </label>
                                        {selectedEventType === 'bracket' ? (
                                            <select
                                                value={numberOfGames}
                                                onChange={(e) => setNumberOfGames(parseInt(e.target.value))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                            >
                                                <option value="1">1 (rounds)</option>
                                                <option value="2">2 (rounds)</option>
                                                <option value="3">3 (rounds)</option>
                                            </select>
                                        ) : (
                                            <input
                                                type="number"
                                                value={numberOfGames}
                                                onChange={(e) => setNumberOfGames(parseInt(e.target.value))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                            />
                                        )}
                                    </div>
                                    {selectedEventType === 'normal' && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Carrying pins (from a prior event/round)
                                                </label>
                                                <select
                                                    value={carryingPins}
                                                    onChange={(e) => setCarryingPins(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                >
                                                    <option value="no">no, start at zero</option>
                                                    <option value="yes">yes</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Allow alibi entries?
                                                </label>
                                                <select
                                                    value={allowAlibi}
                                                    onChange={(e) => setAllowAlibi(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                >
                                                    <option value="no">no</option>
                                                    <option value="yes">yes</option>
                                                </select>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Handicap */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-900 mb-4">Handicap</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Handicap or scratch?
                                        </label>
                                        <select
                                            value={handicapType}
                                            onChange={(e) => setHandicapType(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        >
                                            <option value="Scratch">Scratch</option>
                                            <option value="Handicap">Handicap</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Handicap Percent (put zero for scratch)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={handicapPercent}
                                                onChange={(e) => setHandicapPercent(parseFloat(e.target.value))}
                                                className="w-full pr-8 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600">%</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Base average for one game (to calculate handicap or cap for scratch)
                                        </label>
                                        <input
                                            type="number"
                                            value={baseAverage}
                                            onChange={(e) => setBaseAverage(parseFloat(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Maximum Handicap (Leave blank for no max)
                                        </label>
                                        <input
                                            type="number"
                                            value={maxHandicap}
                                            onChange={(e) => setMaxHandicap(e.target.value)}
                                            placeholder="Leave blank for no max"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Maximum Score with Handicap (Leave blank for no max)
                                        </label>
                                        <input
                                            type="number"
                                            value={maxScoreWithHandicap}
                                            onChange={(e) => setMaxScoreWithHandicap(e.target.value)}
                                            placeholder="Leave blank for no max"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Percent for Negative Handicap (for bowlers over the base)
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={negativeHandicapPercent}
                                                onChange={(e) => setNegativeHandicapPercent(e.target.value)}
                                                className="w-full pr-8 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600">%</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Minimum Handicap (Probably a negative number or zero for no negative handicap)
                                        </label>
                                        <input
                                            type="number"
                                            value={minHandicap}
                                            onChange={(e) => setMinHandicap(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                    {selectedEventType === 'normal' && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    How should the team handicap be calculated?
                                                </label>
                                                <select
                                                    value={teamHandicapCalc}
                                                    onChange={(e) => setTeamHandicapCalc(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                >
                                                    <option value="Add up bowler handicaps">Add up bowler handicaps</option>
                                                    <option value="Team average">Team average</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    How should the total series handicap be calculated?
                                                </label>
                                                <select
                                                    value={seriesHandicapCalc}
                                                    onChange={(e) => setSeriesHandicapCalc(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                                >
                                                    <option value="Game handicap times num of games">Game handicap times num of games</option>
                                                    <option value="Series handicap">Series handicap</option>
                                                </select>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    onClick={() => setSelectedEventType(null)}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddEvent}
                                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                >
                                    Add Event
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// New 3-Step Tournament Creation Modal
interface NewTournamentData {
    // Step 1: Basic Info
    name: string;
    location: string;
    center: BowlingCenter | null;
    time: string;
    note: string;

    // Step 2: Tournament Settings
    format: 'singles' | 'doubles' | 'teams';
    numberOfParticipants: number;
    startDate: string;
    registrationDeadline: string;
    registrationFee: number;
    tournamentType: 'handicap' | 'scratch';
    average: number;
    percentage: number;
    accessType: 'open' | 'invitational';
    categories: string[];

    // Flyer upload will be done after tournament creation in details view
}

// Tournament Detail Modal Component
function TournamentDetailModal({ tournament, onClose, user, onFlyerUploadSuccess }: { tournament: Tournament; onClose: () => void; user: any; onFlyerUploadSuccess: () => Promise<void> }) {
    const [showFlyerUpload, setShowFlyerUpload] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleFlyerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type - only images and PDFs allowed
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            alert('Only image files (JPG, PNG, GIF) and PDF files are allowed.');
            return;
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('File size must be less than 10MB.');
            return;
        }

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_BASE_URL}/api/tournaments/v0/upload-flyer/${tournament.id}`, {
                method: 'POST',
                headers: {
                    ...(typeof window !== 'undefined' && localStorage.getItem('access_token') && {
                        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                    })
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to upload flyer');
            }

            alert('Flyer uploaded successfully!');
            setShowFlyerUpload(false);

            // Refresh tournaments list
            await onFlyerUploadSuccess();

            // Close the modal
            onClose();
        } catch (error) {
            alert(`Error uploading flyer: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">{tournament.name}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-6 space-y-6">
                    {/* Basic Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tournament Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Director</p>
                                <p className="text-base font-medium text-gray-900">{tournament.director}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Date & Time</p>
                                <p className="text-base font-medium text-gray-900">
                                    {format(new Date(tournament.date), 'MMM dd, yyyy')} at {tournament.time}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Bowling Center</p>
                                <p className="text-base font-medium text-gray-900">{tournament.center}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Status</p>
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${tournament.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                                    tournament.status === 'ongoing' ? 'bg-green-100 text-green-700' :
                                        tournament.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                                            'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Categories</p>
                                <p className="text-base font-medium text-gray-900">{tournament.categories?.join(', ') || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Participants</p>
                                <p className="text-base font-medium text-gray-900">{tournament.participantsCount}</p>
                            </div>
                        </div>
                    </div>

                    {tournament.directorNote && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Note</h3>
                            <p className="text-gray-700">{tournament.directorNote}</p>
                        </div>
                    )}

                    {/* Flyer Section */}
                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Flyer</h3>

                        {/* Display flyer if it exists */}
                        {tournament.flyer ? (
                            <div className="space-y-4">
                                {tournament.flyer.toLowerCase().endsWith('.pdf') ? (
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <FileText className="w-8 h-8 text-red-600 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">Tournament Flyer (PDF)</p>
                                            <a
                                                href={`https://${tournament.flyer}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-green-600 hover:text-green-700 font-medium"
                                            >
                                                Download PDF
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <img
                                            src={`https://${tournament.flyer}`}
                                            alt="Tournament Flyer"
                                            className="w-full h-auto rounded-lg shadow-md max-h-80 object-cover"
                                        />
                                        <a
                                            href={`https://${tournament.flyer}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-block text-sm text-green-600 hover:text-green-700 font-medium"
                                        >
                                            View Full Image
                                        </a>
                                    </div>
                                )}
                                {tournament.director === user?.name && (
                                    <button
                                        onClick={() => setShowFlyerUpload(true)}
                                        className="w-full px-4 py-2 text-sm border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                                    >
                                        Replace Flyer
                                    </button>
                                )}
                            </div>
                        ) : (
                            tournament.director === user?.name && (
                                !showFlyerUpload ? (
                                    <button
                                        onClick={() => setShowFlyerUpload(true)}
                                        className="w-full px-4 py-3 border-2 border-dashed border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Upload Tournament Flyer
                                    </button>
                                ) : (
                                    <div className="space-y-3">
                                        <input
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.gif,.pdf"
                                            onChange={handleFlyerUpload}
                                            disabled={uploading}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                        <p className="text-xs text-gray-500">
                                            Supported formats: JPG, PNG, GIF, PDF (Max 10MB)
                                        </p>
                                        {uploading && <p className="text-sm text-green-600">Uploading...</p>}
                                        <button
                                            onClick={() => setShowFlyerUpload(false)}
                                            className="text-sm text-gray-600 hover:text-gray-900"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )
                            )
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

function CreateNewTournamentModal({ onClose, user, tournaments, setTournaments }: any) {
    const [step, setStep] = useState(1);
    const [centerSearch, setCenterSearch] = useState('');
    const [showCenterDropdown, setShowCenterDropdown] = useState(false);

    const [formData, setFormData] = useState<NewTournamentData>({
        name: '',
        location: '',
        center: null,
        time: '',
        note: '',
        format: 'singles',
        numberOfParticipants: 1,
        startDate: '',
        registrationDeadline: '',
        registrationFee: 0,
        tournamentType: 'handicap',
        average: 0,
        percentage: 0,
        accessType: 'open',
        categories: []
    });

    const filteredCenters = DUMMY_BOWLING_CENTERS.filter(center =>
        center.name.toLowerCase().includes(centerSearch.toLowerCase()) ||
        center.city.toLowerCase().includes(centerSearch.toLowerCase()) ||
        center.state.toLowerCase().includes(centerSearch.toLowerCase())
    );

    const handleStep1Next = () => {
        if (!formData.name || !formData.center || !formData.time || !formData.startDate) {
            alert('Please fill in all required fields in Step 1');
            return;
        }
        if (!formData.registrationDeadline) {
            alert('Please set a registration deadline');
            return;
        }
        if (formData.registrationFee < 0) {
            alert('Registration fee cannot be negative');
            return;
        }
        setStep(2);
    };

    const handleStep2Next = () => {
        if (formData.numberOfParticipants === 0) {
            alert('Please fill in all required fields in Step 2');
            return;
        }
        if (formData.categories.length === 0) {
            alert('Please select at least one category');
            return;
        }
        if (formData.tournamentType === 'handicap' && (formData.average === 0 || formData.percentage === 0)) {
            alert('Please enter Average and Percentage for Handicap tournaments');
            return;
        }
        if (formData.tournamentType === 'scratch' && formData.percentage === 0) {
            alert('Please enter Percentage for Scratch tournaments');
            return;
        }
        // Validation passed - ready to create tournament
        return true;
    };

    const handleCreateTournament = async () => {
        try {
            const tournamentData = {
                name: formData.name,
                startDate: formData.startDate,
                time: formData.time,
                center_id: formData.center?.id || 1,
                note: formData.note,
                format: formData.format,
                numberOfParticipants: formData.numberOfParticipants,
                categories: formData.categories,
                registrationFee: formData.registrationFee,
                registrationDeadline: formData.registrationDeadline,
                tournamentType: formData.tournamentType,
                average: formData.tournamentType === 'handicap' ? formData.average : undefined,
                percentage: formData.percentage,
                minHandicap: formData.tournamentType === 'handicap' ? 0 : undefined,
                maxHandicap: formData.tournamentType === 'handicap' ? 300 : undefined,
                accessType: formData.accessType,
                director_name: user?.name,
                director_user_id: user?.user_id
            };

            // Call API
            const response = await fetch(`${API_BASE_URL}/api/tournaments/v0`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(tournamentData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create tournament');
            }

            const createdTournament = await response.json();

            // Handle both old and new API response formats
            const apiTournamentData = createdTournament.data || createdTournament;

            // Add to tournaments list
            const newTournament: Tournament = {
                id: createdTournament.id,
                name: apiTournamentData.name,
                date: apiTournamentData.startDate,
                time: apiTournamentData.time,
                director: createdTournament.director_name,
                center: 'Strike Zone Bowling Center', // TODO: Look up from center_id
                centerAddress: '123 Main St, Los Angeles, CA', // TODO: Look up from center_id
                directorNote: apiTournamentData.note,
                status: 'draft',
                events: [],
                participantsCount: apiTournamentData.numberOfParticipants,
                categories: apiTournamentData.categories,
                isNewFormat: true
            };

            setTournaments([...tournaments, newTournament]);

            // Reset form
            setStep(1);
            setFormData({
                name: '',
                location: '',
                center: null,
                time: '',
                note: '',
                format: 'singles',
                numberOfParticipants: 1,
                startDate: '',
                registrationDeadline: '',
                registrationFee: 0,
                tournamentType: 'handicap',
                average: 0,
                percentage: 0,
                accessType: 'open',
                categories: []
            });
            onClose();
        } catch (error) {
            alert(`Failed to create tournament: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Create New Tournament</h2>
                        <p className="text-sm text-gray-500 mt-1">Step {step} of 2</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="px-6 py-4">
                    <div className="flex gap-2">
                        {[1, 2].map((s) => (
                            <div key={s} className="flex-1">
                                <div className={`h-2 rounded-full transition-colors ${s <= step ? 'bg-green-600' : 'bg-gray-200'
                                    }`} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 py-6">
                    {/* STEP 1: Basic Information */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Director
                                </label>
                                <input
                                    type="text"
                                    value={user?.name || ''}
                                    disabled
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                                />
                                <p className="text-xs text-gray-500 mt-1">Tournament director is always the current logged-in user</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tournament Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter tournament name"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Bowling Center <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.center ? formData.center.name : centerSearch}
                                        onChange={(e) => {
                                            setCenterSearch(e.target.value);
                                            setFormData({ ...formData, center: null });
                                            setShowCenterDropdown(true);
                                        }}
                                        onFocus={() => setShowCenterDropdown(true)}
                                        placeholder="Search bowling centers..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                    {showCenterDropdown && !formData.center && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-10">
                                            {filteredCenters.map((center: BowlingCenter) => (
                                                <button
                                                    key={center.id}
                                                    onClick={() => {
                                                        setFormData({ ...formData, center });
                                                        setShowCenterDropdown(false);
                                                    }}
                                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                                >
                                                    <p className="font-medium text-gray-900">{center.name}</p>
                                                    <p className="text-sm text-gray-600">{center.address}, {center.city}, {center.state}</p>
                                                </button>
                                            ))}
                                            {filteredCenters.length === 0 && (
                                                <div className="px-4 py-3 text-gray-500 text-sm">No centers found</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {formData.center && (
                                    <div className="mt-2 p-3 bg-green-50 rounded-lg">
                                        <p className="font-medium text-gray-900">{formData.center.name}</p>
                                        <p className="text-sm text-gray-600">{formData.center.address}, {formData.center.city}, {formData.center.state}</p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date &amp; Time <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.startDate ? `${formData.startDate}T${formData.time}` : ''}
                                    onChange={(e) => {
                                        const dateTimeValue = e.target.value;
                                        if (dateTimeValue) {
                                            const [date, time] = dateTimeValue.split('T');
                                            setFormData({ ...formData, startDate: date, time: time });
                                        }
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Note (Optional)
                                </label>
                                <textarea
                                    value={formData.note}
                                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                    placeholder="Any additional information..."
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Registration Fee <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={formData.registrationFee}
                                            onChange={(e) => setFormData({ ...formData, registrationFee: parseFloat(e.target.value) || 0 })}
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600">$</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Registration Deadline <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.registrationDeadline}
                                        onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Tournament Settings */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900">Tournament Settings</h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Format <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: 'singles', label: 'Singles' },
                                        { id: 'doubles', label: 'Doubles' },
                                        { id: 'teams', label: 'Teams' }
                                    ].map((format) => (
                                        <button
                                            key={format.id}
                                            onClick={() => {
                                                const participantCount = format.id === 'singles' ? 1 : format.id === 'doubles' ? 2 : formData.numberOfParticipants;
                                                setFormData({ ...formData, format: format.id as any, numberOfParticipants: participantCount });
                                            }}
                                            className={`p-4 rounded-lg border-2 transition-all ${formData.format === format.id
                                                ? 'border-green-600 bg-green-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <p className="font-semibold text-gray-900">{format.label}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {formData.format === 'teams' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Number of Participants <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.numberOfParticipants}
                                        onChange={(e) => setFormData({ ...formData, numberOfParticipants: parseInt(e.target.value) })}
                                        min="1"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Registration Fee ($) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={formData.registrationFee}
                                    onChange={(e) => setFormData({ ...formData, registrationFee: parseFloat(e.target.value) })}
                                    placeholder="0.00"
                                    step="0.01"
                                    min="0"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Tournament Type <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { id: 'handicap', label: 'Handicap', desc: 'Uses average and handicap system with percentage' },
                                        { id: 'scratch', label: 'Scratch', desc: 'Uses average system only' }
                                    ].map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => setFormData({ ...formData, tournamentType: type.id as any })}
                                            className={`p-4 rounded-lg border-2 transition-all text-left ${formData.tournamentType === type.id
                                                ? 'border-green-600 bg-green-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <p className="font-semibold text-gray-900">{type.label}</p>
                                            <p className="text-sm text-gray-600">{type.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {formData.tournamentType === 'handicap' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Average <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.average}
                                            onChange={(e) => setFormData({ ...formData, average: parseFloat(e.target.value) })}
                                            placeholder="Enter average score"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Percentage <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={formData.percentage}
                                                onChange={(e) => setFormData({ ...formData, percentage: parseFloat(e.target.value) })}
                                                placeholder="Enter percentage"
                                                step="0.1"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600">%</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {formData.tournamentType === 'scratch' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Percentage <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={formData.percentage}
                                            onChange={(e) => setFormData({ ...formData, percentage: parseFloat(e.target.value) })}
                                            placeholder="Enter percentage"
                                            step="0.1"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600">%</span>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Access Type <span className="text-red-500">*</span>
                                </label>
                                <div className="space-y-2">
                                    {[
                                        { id: 'open', label: 'Open', desc: 'Anyone can register' },
                                        { id: 'invitational', label: 'Invitational', desc: 'By invitation only' }
                                    ].map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => setFormData({ ...formData, accessType: type.id as any })}
                                            className={`w-full p-3 rounded-lg border-2 transition-all text-left ${formData.accessType === type.id
                                                ? 'border-green-600 bg-green-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <p className="font-semibold text-gray-900">{type.label}</p>
                                            <p className="text-sm text-gray-600">{type.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Access Level <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { id: 'men', label: 'Men' },
                                        { id: 'women', label: 'Women' },
                                        { id: 'youth', label: 'Youth' },
                                        { id: 'senior', label: 'Senior' },
                                        { id: 'mix', label: 'Mix' }
                                    ].map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() => {
                                                if (category.id === 'mix') {
                                                    // If mix is selected, select all categories
                                                    setFormData({
                                                        ...formData,
                                                        categories: formData.categories.includes('mix')
                                                            ? []
                                                            : ['men', 'women', 'youth', 'senior', 'mix']
                                                    });
                                                } else {
                                                    // Toggle other categories
                                                    const newCategories = formData.categories.includes(category.id)
                                                        ? formData.categories.filter(c => c !== category.id)
                                                        : [...formData.categories, category.id];

                                                    // Remove 'mix' if specific category is added and mix was there
                                                    const filteredCategories = newCategories.filter(c => c !== 'mix');

                                                    setFormData({
                                                        ...formData,
                                                        categories: filteredCategories
                                                    });
                                                }
                                            }}
                                            className={`p-3 rounded-lg border-2 transition-all font-medium ${formData.categories.includes(category.id)
                                                ? 'border-green-600 bg-green-50 text-green-700'
                                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                                }`}
                                        >
                                            {category.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}


                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 px-6 py-4 flex justify-between gap-3">
                    <button
                        onClick={() => {
                            if (step > 1) {
                                setStep(step - 1);
                            } else {
                                onClose();
                            }
                        }}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        {step === 1 ? 'Cancel' : 'Back'}
                    </button>
                    {step === 1 ? (
                        <button
                            onClick={handleStep1Next}
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                if (handleStep2Next()) {
                                    handleCreateTournament();
                                }
                            }}
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        >
                            Create Tournament
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
