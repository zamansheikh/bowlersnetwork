"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  ChevronLeft,
  Share2,
  ThumbsUp,
  User,
  ExternalLink,
  FileText,
  Loader2,
  Shield,
  Trophy
} from "lucide-react";

interface EventLocation {
  location_id?: number;
  address_str: string;
  zipcode?: string;
  lat: string;
  long: string;
}

interface EventUser {
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
  cover_picture_url?: string;
  is_followable: boolean;
  is_following: boolean;
  follower_count: number;
}

interface EventDetails {
  event_id: number;
  title: string;
  description: string;
  event_datetime: string;
  location: EventLocation;
  total_interested: number;
  is_interested: boolean;
  flyer_url?: string;
  user: EventUser;
}

export default function EventDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [interestLoading, setInterestLoading] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchEventDetails();
    }
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/events/v1/details/${id}`);
      setEvent(response.data);
    } catch (err) {
      console.error("Error fetching event details:", err);
      setError("Failed to load event details. It might have been removed.");
    } finally {
      setLoading(false);
    }
  };

  const handleInterest = async () => {
    if (!event || !user || interestLoading) return;

    // Optimistic UI update
    const previousState = { ...event };
    const newState = !event.is_interested;
    const newCount = newState ? event.total_interested + 1 : Math.max(0, event.total_interested - 1);

    setEvent({
      ...event,
      is_interested: newState,
      total_interested: newCount
    });
    setInterestLoading(true);

    try {
      const response = await api.get(`/api/events/v1/interest/${event.event_id}`);
      // Server returns { is_interested: boolean, total_interested: number }
      setEvent(prev => prev ? {
        ...prev,
        is_interested: response.data.is_interested,
        total_interested: response.data.total_interested
      } : null);
    } catch (err) {
      console.error("Error toggling interest:", err);
      // Revert on error
      setEvent(previousState);
      alert("Failed to update interest status.");
    } finally {
      setInterestLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title,
          text: `Check out this event: ${event?.title}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#8BC342]" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-col items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-500 mb-6">{error || "This event doesn't exist anymore."}</p>
          <button
            onClick={() => router.back()}
            className="text-[#8BC342] font-medium hover:underline flex items-center justify-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  const isPdf = event.flyer_url?.toLowerCase().endsWith('.pdf');
  const eventDate = new Date(event.event_datetime);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

        {/* Flyer / Media */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 relative">
          {event.flyer_url ? (
            isPdf ? (
              <div className="aspect-video bg-gray-100 flex flex-col items-center justify-center gap-4 py-12">
                <FileText className="w-16 h-16 text-gray-400" />
                <div className="text-center">
                  <p className="text-gray-900 font-medium mb-2">Event Flyer (PDF)</p>
                  <a
                    href={event.flyer_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Details
                  </a>
                </div>
              </div>
            ) : (
              <div className="relative aspect-video md:aspect-21/9 bg-gray-100">
                <Image
                  src={event.flyer_url}
                  alt={event.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )
          ) : (
            <div className="aspect-video md:aspect-21/9 bg-gray-100 flex flex-col items-center justify-center">
              <Calendar className="w-16 h-16 text-gray-300 mb-2" />
              <p className="text-gray-400">No event flyer available</p>
            </div>
          )}
        </div>

        {/* Status / Title Block */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          {/* Interested Button */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 text-sm text-[#8BC342] font-semibold tracking-wide uppercase mb-3">
                <span>{format(eventDate, 'EEEE, MMMM do')}</span>
                <span className="w-1 h-1 bg-[#8BC342] rounded-full"></span>
                <span>{format(eventDate, 'h:mm a')}</span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>

              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3 text-gray-600">
                  <MapPin className="w-5 h-5 shrink-0 mt-0.5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{event.location.address_str}</p>
                    <p className="text-sm text-gray-500">
                      Lat: {event.location.lat}, Long: {event.location.long}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-5 flex justify-center shrink-0">
                    <User className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Hosted by</span>
                    <Link href={`/profile/${event.user.username}`} className="font-medium text-gray-900 hover:text-[#8BC342]">
                      {event.user.name}
                    </Link>
                    {event.user.roles.is_pro && <Shield className="w-4 h-4 text-blue-500 fill-blue-500" />}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:w-48 shrink-0">
              <button
                onClick={handleInterest}
                disabled={!user || interestLoading}
                className={`flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-bold transition-all ${event.is_interested
                  ? 'bg-[#8BC342] text-white shadow-lg shadow-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                <ThumbsUp className={`w-5 h-5 ${event.is_interested ? 'fill-white' : ''}`} />
                {event.is_interested ? 'Interested' : 'Interested?'}
              </button>
              <p className="text-center text-sm text-gray-500">
                {event.total_interested} people interested
              </p>

              {/* Invite Button - Only for Owner */}
              {user && user.user_id === event.user.user_id && (
                <button
                  onClick={() => setInviteModalOpen(true)}
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 mt-3"
                >
                  <User className="w-5 h-5" />
                  Invite People
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">About this Event</h3>
          <div className="prose prose-green max-w-none text-gray-600 whitespace-pre-wrap">
            {event.description}
          </div>
        </div>

        {/* Organizer */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Organizer</h3>
          <div className="flex items-center gap-4">
            <Link href={`/profile/${event.user.username}`}>
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                <Image
                  src={event.user.profile_picture_url}
                  alt={event.user.name}
                  fill
                  className="object-cover"
                />
              </div>
            </Link>
            <div>
              <Link href={`/profile/${event.user.username}`}>
                <h4 className="font-bold text-gray-900 hover:underline">{event.user.name}</h4>
              </Link>
              <p className="text-sm text-gray-500">@{event.user.username}</p>
              <div className="flex items-center gap-2 mt-1">
                {event.user.roles.is_pro && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium">
                    <Trophy className="w-3 h-3" /> Pro Player
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Invite Modal */}
      {inviteModalOpen && (
        <InviteModal
          isOpen={inviteModalOpen}
          onClose={() => setInviteModalOpen(false)}
          eventId={event.event_id}
          defaultLat={parseFloat(event.location.lat)}
          defaultLong={parseFloat(event.location.long)}
        />
      )}
    </div>
  );
}

// Invite Modal Component
function InviteModal({ isOpen, onClose, eventId, defaultLat, defaultLong }: {
  isOpen: boolean;
  onClose: () => void;
  eventId: number;
  defaultLat: number;
  defaultLong: number;
}) {
  const [step, setInviteStep] = useState<'filter' | 'confirm'>('filter');
  const [loading, setLoading] = useState(false);

  // Track which filters are enabled
  const [enabledFilters, setEnabledFilters] = useState({
    age: true,
    gender: true,
    bowling_average: true,
    geo_radius: true
  });

  const [inviteFilter, setInviteFilter] = useState({
    age: { min_age: 20, max_age: 30 },
    gender: { role: 'Male' },
    bowling_average: { min_avg: 150, max_avg: 200 },
    geo_radius: { center_lat: defaultLat, center_long: defaultLong, radius: 25 }
  });
  const [filterResult, setFilterResult] = useState<{ total_users: number, result: number[] } | null>(null);

  const handleFilter = async () => {
    try {
      setLoading(true);

      // Dynamically build payload based on enabled filters
      const payload: any = {};

      if (enabledFilters.age) {
        payload.age = {
          min_age: Number(inviteFilter.age.min_age),
          max_age: Number(inviteFilter.age.max_age)
        };
      }

      if (enabledFilters.gender) {
        payload.gender = {
          role: inviteFilter.gender.role
        };
      }

      if (enabledFilters.bowling_average) {
        payload.bowling_average = {
          min_avg: Number(inviteFilter.bowling_average.min_avg),
          max_avg: Number(inviteFilter.bowling_average.max_avg)
        };
      }

      if (enabledFilters.geo_radius) {
        payload.geo_radius = {
          center_lat: Number(inviteFilter.geo_radius.center_lat),
          center_long: Number(inviteFilter.geo_radius.center_long),
          radius: Number(inviteFilter.geo_radius.radius)
        };
      }

      // Validate at least one filter is present
      if (Object.keys(payload).length === 0) {
        alert("Please select at least one filter criterion (Age, Gender, Average, or Location).");
        setLoading(false);
        return;
      }

      const response = await api.post('/api/filter', payload);
      setFilterResult(response.data);
      setInviteStep('confirm');
    } catch (error) {
      console.error("Filter error:", error);
      alert("Failed to filter users.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async () => {
    if (!filterResult || filterResult.result.length === 0) return;

    try {
      setLoading(true);
      const payload = {
        event_id: eventId,
        user_ids: filterResult.result
      };

      await api.post('/api/events/v1/invitations', payload);
      alert(`Successfully invited ${filterResult.total_users} users!`);
      onClose();
    } catch (error) {
      console.error("Invite error:", error);
      alert("Failed to invite users.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">
            {step === 'filter' ? 'Invite Users' : 'Confirm Invitations'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
            <ExternalLink className="w-5 h-5 rotate-45 transform" />
          </button>
        </div>

        <div className="p-6">
          {step === 'filter' ? (
            <div className="space-y-6">
              {/* Age Filter */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Age Range</h3>
                  <input
                    type="checkbox"
                    checked={enabledFilters.age}
                    onChange={(e) => setEnabledFilters(prev => ({ ...prev, age: e.target.checked }))}
                    className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </div>
                {enabledFilters.age && (
                  <div className="flex gap-4">
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      value={inviteFilter.age.min_age}
                      onChange={(e) => setInviteFilter(prev => ({ ...prev, age: { ...prev.age, min_age: parseInt(e.target.value) || 0 } }))}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      value={inviteFilter.age.max_age}
                      onChange={(e) => setInviteFilter(prev => ({ ...prev, age: { ...prev.age, max_age: parseInt(e.target.value) || 0 } }))}
                    />
                  </div>
                )}
              </div>

              {/* Gender Filter */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Gender</h3>
                  <input
                    type="checkbox"
                    checked={enabledFilters.gender}
                    onChange={(e) => setEnabledFilters(prev => ({ ...prev, gender: e.target.checked }))}
                    className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </div>
                {enabledFilters.gender && (
                  <select
                    className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                    value={inviteFilter.gender.role}
                    onChange={(e) => setInviteFilter(prev => ({ ...prev, gender: { ...prev.gender, role: e.target.value } }))}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                )}
              </div>

              {/* Bowling Avg Filter */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Bowling Average</h3>
                  <input
                    type="checkbox"
                    checked={enabledFilters.bowling_average}
                    onChange={(e) => setEnabledFilters(prev => ({ ...prev, bowling_average: e.target.checked }))}
                    className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </div>
                {enabledFilters.bowling_average && (
                  <div className="flex gap-4">
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      value={inviteFilter.bowling_average.min_avg}
                      onChange={(e) => setInviteFilter(prev => ({ ...prev, bowling_average: { ...prev.bowling_average, min_avg: parseInt(e.target.value) || 0 } }))}
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      value={inviteFilter.bowling_average.max_avg}
                      onChange={(e) => setInviteFilter(prev => ({ ...prev, bowling_average: { ...prev.bowling_average, max_avg: parseInt(e.target.value) || 0 } }))}
                    />
                  </div>
                )}
              </div>

              {/* Radius Filter */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Location Radius</h3>
                  <input
                    type="checkbox"
                    checked={enabledFilters.geo_radius}
                    onChange={(e) => setEnabledFilters(prev => ({ ...prev, geo_radius: e.target.checked }))}
                    className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </div>
                {enabledFilters.geo_radius && (
                  <div className="space-y-2">
                    <div className="flex gap-2 text-sm text-gray-500 mb-1">
                      <span>Center:</span>
                      <span>{inviteFilter.geo_radius.center_lat.toFixed(4)}, {inviteFilter.geo_radius.center_long.toFixed(4)}</span>
                    </div>
                    <input
                      type="number"
                      placeholder="Radius in miles"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      value={inviteFilter.geo_radius.radius}
                      onChange={(e) => setInviteFilter(prev => ({ ...prev, geo_radius: { ...prev.geo_radius, radius: parseInt(e.target.value) || 0 } }))}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {filterResult?.total_users} Users Found
              </h3>
              <p className="text-gray-500 max-w-xs mx-auto">
                Do you want to send invitations to these {filterResult?.total_users} users who match your criteria?
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>

          {step === 'filter' ? (
            <button
              onClick={handleFilter}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Find Users'}
            </button>
          ) : (
            <button
              onClick={handleSendInvite}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Invitations'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
