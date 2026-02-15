"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import Image from "next/image";
import {
  MessageCircle,
  Trophy,
  Users,
  TrendingUp,
  Heart,
  Share,
  Play,
  ArrowRight,
} from "lucide-react";
import PerformanceTrends from "./components/PerformanceTrends";

interface DashboardData {
  user_id: number;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  follower_count: number;
  onboarded_user_count: number;
  free_users: number;
  premium_user_count: number;
  conversion_rate: number;
  weighted_index: number;
}

interface Player {
  id: string;
  name: string;
  username: string;
  avatar: string;
  coverImage: string;
  bio: string;
  stats: {
    averageScore: number;
    tournaments: number;
    wins: number;
    pbaRank: number;
    average_score: number;
    high_game: number;
    high_series: number;
    experience: number;
    id?: number;
    user_id?: number;
  };
  weightedIndex: {
    percentage: number;
    freeUsers: number;
    premiumUsers: number;
    engagement: number;
  };
  user_id?: number;
  first_name?: string;
  last_name?: string;
  profile_picture_url?: string;
  intro_video_url?: string;
  xp?: number;
  email?: string;
  level?: number;
  card_theme?: string;
  is_pro?: boolean;
  follower_count?: number;
  authenticated?: boolean;
  access_token?: string;
  favorite_brands?: FavoriteBrand[];
  sponsors?: Sponsor[];
}

export interface FavoriteBrand {
  brand_id: number;
  brandType: string;
  name: string;
  formal_name: string;
  logo_url: string;
}

export interface Sponsor {
  sponsor_id: number;
  name: string;
  logo_url: string;
}

export interface UserStats {
  id: number;
  user_id: number;
  average_score: number;
  high_game: number;
  high_series: number;
  experience: number;
}

interface Message {
  id: string;
  from: string;
  content: string;
  timestamp: string;
  read: boolean;
}

// Mock data
const mockProPlayer: Player = {
  id: "1",
  name: "Johan Smith",
  username: "@johansmith",
  avatar: "",
  coverImage: "",
  bio: "Professional bowler with 15 years of experience",
  stats: {
    averageScore: 215,
    tournaments: 45,
    wins: 23,
    pbaRank: 12,
    average_score: 215,
    high_game: 300,
    high_series: 850,
    experience: 1200,
  },
  weightedIndex: {
    percentage: 20,
    freeUsers: 0,
    premiumUsers: 0,
    engagement: 19,
  },
};

const mockMessages: Message[] = [
  {
    id: "1",
    from: "fan123",
    content: "Your technique is incredible! Any tips for a beginner?",
    timestamp: "2024-01-17",
    read: false,
  },
  {
    id: "2",
    from: "youngbowler",
    content: "I'm 16 and just started bowling. You're my inspiration!",
    timestamp: "2024-01-17",
    read: false,
  },
  {
    id: "3",
    from: "coachsmith",
    content: "Would love to collaborate on a youth program!",
    timestamp: "2024-01-15",
    read: false,
  },
];

export default function OverviewPage() {
  const { user } = useAuth();
  const [player, setPlayer] = useState<Player | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        if (user && user.authenticated) {
          // Fetch dashboard data from API
          const token = localStorage.getItem("access_token");
          if (token) {
            try {
              const response = await axios.get(
                "https://test.bowlersnetwork.com/api/user/pro-dashboard-data",
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    Accept: "application/json",
                  },
                }
              );

              if (response.data) {
                setDashboardData(response.data);
              }
            } catch (error) {
              console.error("Error fetching dashboard data:", error);
            }
          }

          // Create player data from authenticated user
          const playerData: Player = {
            id: user.username || "1",
            name: user.name,
            username: user.username || "",
            avatar: user.profile_picture_url || "",
            coverImage: "",
            bio: `Professional bowler with ${user.xp || 0} XP points`,
            stats: {
              averageScore: user.stats?.average_score || 0,
              tournaments: 0,
              wins: user.stats?.high_game || 0,
              pbaRank: user.stats?.high_series || 0,
              average_score: user.stats?.average_score || 0,
              high_game: user.stats?.high_game || 0,
              high_series: user.stats?.high_series || 0,
              experience: user.stats?.experience || 0,
            },
            weightedIndex: {
              percentage: 85,
              freeUsers: user.follow_info?.follwers || 0,
              premiumUsers: 0,
              engagement: user.xp || 0,
            },
            favorite_brands: user.favorite_brands || [],
          };
          setPlayer(playerData);
        } else {
          // Use mock data if no user (fallback)
          setPlayer(mockProPlayer);
        }
        setMessages(mockMessages);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-green-600">Loading Dashboard...</div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">Player not found</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Welcome Header */}
      {/* BFK-style header background */}
      <div className="h-36 relative overflow-hidden flex items-center">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#8BC342] via-[#6fa332] to-[#8BC342]" />
        {/* Overlay for depth */}
        <div className="absolute inset-0 bg-black bg-opacity-30" />
        {/* Geometric design elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#8BC342] opacity-20 transform -skew-x-12 -translate-x-20 -translate-y-20" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#6fa332] opacity-20 transform skew-x-12 translate-x-20 -translate-y-20" />
        {/* Content */}
        <div className="relative z-10 flex items-center gap-5 px-8">
          <div className="w-16 h-16 bg-black bg-opacity-80 rounded-full flex items-center justify-center border-4 border-white">
        <Image
          src={player.avatar || "/default-avatar.png"}
          alt={player.name}
          width={56}
          height={56}
          className="rounded-full object-cover"
        />
          </div>
          <div>
        <h1 className="text-3xl font-bold tracking-wider text-white mb-1">
          Overview
        </h1>
        <p className="text-green-100 text-lg font-medium">
          Welcome back, {player.name || "Johan Smith"}
        </p>
          </div>
        </div>
      </div>
      {/* Likes Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white border-b border-gray-200 max-w-7xl mx-auto px-10 py-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-800">
                Favorite Brands
              </h3>
            </div>
            <a
              href="/brands"
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              View All Brands
            </a>
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            {user?.favorite_brands && user.favorite_brands.length > 0 ? (
              user.favorite_brands.map((brand, index) => (
                <div
                  key={brand.brand_id || index}
                  className="flex flex-col items-center bg-gray-50 rounded-lg p-4 w-28 hover:bg-gray-100 transition-colors duration-200 shadow-sm"
                  title={brand.formal_name}
                >
                  <Image
                    src={brand.logo_url}
                    alt={brand.formal_name}
                    width={48}
                    height={48}
                    className="object-contain mb-2"
                  />

                  <span className="text-xs text-gray-600 text-center truncate w-full">
                    {brand.formal_name}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">
                {user?.is_pro ? "No sponsors liked yet" : "No brands liked yet"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Top Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
             {/* Xp Card */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                  <Trophy className="w-4 h-4" />
                  XP
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {player?.xp || 0}
                </div>
                <div className="text-sm text-green-500">
                  +{Math.round((player?.xp || 0) * 0.05)} this week
                </div>
              </div>
            </div>
          </div>
           {/* Level Card */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                  <TrendingUp className="w-4 h-4" />
                  Level
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {player?.level || 0}
                </div>
                <div className="text-sm text-green-500">
                  +{Math.round((player?.level || 0) * 0.05)} this week
                </div>
              </div>
            </div>
          </div>

          {/* Likes Card */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                  <Heart className="w-4 h-4" />
                  Likes
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {dashboardData?.likes || 0}
                </div>
                <div className="text-sm text-green-500">
                  +{Math.round((dashboardData?.likes || 0) * 0.1)} this week
                </div>
              </div>
            </div>
          </div>

          {/* Shares Card */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                  <Share className="w-4 h-4" />
                  Shares
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {dashboardData?.shares || 0}
                </div>
                <div className="text-sm text-green-500">
                  +{Math.round((dashboardData?.shares || 0) * 0.05)} this week
                </div>
              </div>
            </div>
          </div>


          {/* Comments Card */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                  <MessageCircle className="w-4 h-4" />
                  Comments
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {dashboardData?.comments || 0}
                </div>
                <div className="text-sm text-green-500">
                  +{Math.round((dashboardData?.comments || 0) * 0.08)} this week
                </div>
              </div>
            </div>
          </div>

          {/* Total Followers Card */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                  <Users className="w-4 h-4" />
                  Total Followers
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {dashboardData?.follower_count || user?.follow_info?.follwers || 0}
                </div>
                <div className="text-sm text-green-500">
                  +24 new followers this week
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Latest Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Latest Content
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                New videos from BEK TV+
              </p>
            </div>
            <div className="p-6">
              <div className="relative mb-4">
                <div className="w-full h-32 bg-gradient-to-r from-blue-900 to-yellow-600 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  <Play className="w-12 h-12 text-white z-10" />
                  <div className="absolute bottom-2 left-2 text-white text-xs font-medium z-10">
                    Storm
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Learn from the pros how to perfect your hook technique
              </p>
                  <button
                className="w-full text-white py-2.5 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                style={{ background: "#8BC342" }}
              >
                View All Content <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
              <p className="text-sm text-gray-500 mt-1">
                Recent messages from your network
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-gray-600">DL</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 text-sm">
                    Downtown Chatter
                  </div>
                  <p className="text-xs text-gray-500 mb-1">
                    New tournament announced! Register by Friday.
                  </p>
                  <p className="text-xs text-gray-400">1 day ago</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-medium text-gray-600">DL</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 text-sm">
                    Downtown Chatter
                  </div>
                  <p className="text-xs text-gray-500 mb-1">
                    New tournament announced! Register by Friday.
                  </p>
                  <p className="text-xs text-gray-400">1 day ago</p>
                </div>
              </div>

                 <button
                className="w-full text-white py-2.5 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                style={{ background: "#8BC342" }}
              >
                View All Messages <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Upcoming Tournaments */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Upcoming Tournaments
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Tournaments you have registered for
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-900 text-sm">
                    City Championship
                  </div>
                   <span
                    className="text-xs px-2 py-1 rounded-full font-medium"
                    style={{
                      background: "#8BC342",
                      color: "#fff",
                    }}
                  >
                    Registered
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Downtown Chatter • May 15, 2025
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-900 text-sm">
                    Summer Classic
                  </div>
                  <span
                    className="text-xs px-2 py-1 rounded-full font-medium"
                    style={{
                      background: "#8BC342",
                      color: "#fff",
                    }}
                  >
                    Registered
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Sunset Bowling Center • June 10, 2025
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-900 text-sm">
                    Pro-Am Invitational
                  </div>
                   <span
                    className="text-xs px-2 py-1 rounded-full font-medium"
                    style={{
                      background: "#8BC342",
                      color: "#fff",
                    }}
                  >
                    Registered
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Elite Chatter • July 22, 2025
                </p>
              </div>

              <button
                className="w-full text-white py-2.5 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                style={{ background: "#8BC342" }}
              >
                View All Tournaments <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Performance Trends Chart */}
        <div className="p-4">
          <PerformanceTrends />
        </div>
      </div>
    </div>
  );
}
