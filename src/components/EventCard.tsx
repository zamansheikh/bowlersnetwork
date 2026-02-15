import { Calendar, Clock, MapPin, Users, DollarSign, Trophy, ArrowRight } from 'lucide-react';
import { Tournament } from '@/types';
import { format } from 'date-fns';
import Link from 'next/link';

interface EventCardProps {
    tournament: Tournament;
}

export default function EventCard({ tournament }: EventCardProps) {
    const getFormatColor = (format: string) => {
        switch (format) {
            case 'Singles': return 'bg-blue-100 text-blue-800';
            case 'Doubles': return 'bg-green-100 text-green-800';
            case 'Teams': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getFormatIcon = (format: string) => {
        switch (format) {
            case 'Singles': return '👤';
            case 'Doubles': return '👥';
            case 'Teams': return '🏆';
            default: return '🎯';
        }
    };

    const isUpcoming = new Date(tournament.reg_deadline) > new Date();
    const isRegistered = (tournament.already_enrolled ?? 0) > 0;

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200 hover:border-green-200">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="text-lg">{getFormatIcon(tournament.format)}</div>
                    <div>
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">
                            {tournament.name}
                        </h3>
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getFormatColor(tournament.format)}`}>
                            {tournament.format}
                        </span>
                    </div>
                </div>
                {isRegistered && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        Registered
                    </span>
                )}
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-600 text-xs">
                    <Calendar className="w-3 h-3" />
                    <span>{format(new Date(tournament.start_date), 'MMM dd, yyyy')}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600 text-xs">
                    <Clock className="w-3 h-3" />
                    <span>{format(new Date(tournament.start_date), 'h:mm a')}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600 text-xs">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{tournament.address || 'Location TBD'}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600 text-xs">
                    <DollarSign className="w-3 h-3" />
                    <span>${tournament.reg_fee}</span>
                </div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>
                        {isUpcoming
                            ? `Register by ${format(new Date(tournament.reg_deadline), 'MMM dd')}`
                            : 'Registration closed'
                        }
                    </span>
                </div>

                <Link
                    href={`/tournaments/${tournament.id}`}
                    className="flex items-center gap-1 text-green-600 hover:text-green-700 font-medium text-xs transition-colors"
                >
                    View Details
                    <ArrowRight className="w-3 h-3" />
                </Link>
            </div>
        </div>
    );
}