"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Play } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import UserPostCard from "@/components/UserPostCard";

interface ProPlayer {
  user_id: number;
  username: string;
  name: string;
  first_name: string;
  last_name: string;
  profile_picture_url: string;
  intro_video_url: string;
  cover_photo_url: string;
  xp: number;
  email: string;
  level: number;
  card_theme: string;
  is_pro: boolean;
  is_me?: boolean;
  follower_count: number;
  sponsors?: {
    brand_id: number;
    brandType: string;
    name: string;
    formal_name: string;
    logo_url: string;
  }[];
  socials?: {
    pro_player_id: number;
    social_link_id: number;
    social_id: number;
    social: string;
    logo: string;
    url: string;
  }[];
  stats?: {
    id: number;
    user_id: number;
    average_score: number;
    high_game: number;
    high_series: number;
    experience: number;
  } | null;
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  is_followed: boolean;
  favorite_brands?: {
    brand_id: number;
    brandType: string;
    name: string;
    formal_name: string;
    logo_url: string;
  }[];
}

interface PollOption {
  option_id: number;
  content: string;
  vote: number;
  perc: number;
}

interface PollContent {
  id: number;
  uid: string;
  title: string;
  poll_type: string;
  options: PollOption[];
  total_votes?: number;
  viewer_vote?: number;
}

interface FeedPost {
  metadata: {
    id: number;
    uid: string;
    post_privacy: string;
    total_likes: number;
    total_comments: number;
    created_at: string;
    updated_at: string;
    created: string;
    last_update: string;
    has_text: boolean;
    has_media: boolean;
    has_poll: boolean;
    has_event: boolean;
  };
  author: {
    user_id: number;
    name: string;
    profile_picture_url: string;
    is_following: boolean;
    viewer_is_author: boolean;
  };
  likes: {
    total: number;
    likers: Array<{
      user_id: number;
      name: string;
      profile_picture_url: string;
    }>;
  };
  comments: {
    total: number;
    comment_list: Array<{
      comment_id: number;
      user: {
        user_id: number;
        name: string;
        profile_picture_url: string;
      };
      text: string;
      pics: string[];
      replies: Array<{
        reply_id: number;
        user: {
          user_id: number;
          name: string;
          profile_picture_url: string;
        };
        text: string;
        pics: string[];
      }>;
    }>;
  };
  caption: string;
  media: string[];
  poll: PollContent | null;
  event: {
    id: number;
    title: string;
    date: string;
    location?: string;
  } | null;
  tags: string[];
  is_liked_by_me: boolean;
}

export default function PlayerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth(); // Add auth context
  const playerId = params.id as string;

  const [player, setPlayer] = useState<ProPlayer | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get(`/api/user/profile/${playerId}`);
      console.log("Profile response:", response.data);
      setPlayer(response.data);
      setIsFollowing(response.data?.is_followed || false);
      setFollowerCount(response.data?.follower_count || 0);
      if (response.data?.user_id) {
        // Fetch posts only after profile is successfully loaded
        await fetchPosts(response.data?.user_id);
      }
    } catch (err: unknown) {
      console.error("Error fetching player:", err);

      // Handle 401 errors specifically for pro routes (when not authenticated)
      if ((err as { response?: { status?: number } }).response?.status === 401) {
        setError("This profile requires authentication to view full details");
      } else {
        setError("Failed to load player profile");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user posts
  const fetchPosts = async (userId: number | string) => {
    try {
      setPostsLoading(true);

      // Use the playerId instead of hardcoded 55
      const response = await api.get(`/api/user/${userId}/posts`);
      setPosts(response.data);
    } catch (err) {
      console.error("Error fetching posts:", err);
      // setError('Failed to load posts');
    } finally {
      setPostsLoading(false);
    }
  };

  useEffect(() => {
    if (playerId) {
      fetchProfile();
    }
  }, [playerId]);

  const handleFollow = async () => {
    if (!player || !user) {
      // Redirect to login if not authenticated
      router.push("/signin");
      return;
    }

    try {
      const response = await api.post("/api/user/follow", {
        user_id: player.user_id,
      });

      // Check if the API call was successful (status code 200)
      if (response.status === 200) {
        setIsFollowing(!isFollowing);
        setFollowerCount((prev) => (isFollowing ? prev - 1 : prev + 1));
      }
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const handleEditProfile = () => {
    // if (!user || !player) {
    //   // Redirect to login if not authenticated
    //   router.push("/signin");
    //   return;
    // }
    // router.push(`/edit-profile/${player.user_id}`);
  };

  // Get in touch (message user)
  const handleGetInTouch = async () => {
    if (!user) {
      // Redirect to login if not authenticated
      router.push("/signin");
      return;
    }

    if (!player?.username) {
      console.error("Player username not available");
      return;
    }

    try {
      setIsCreatingConversation(true);

      // Call API to create or get existing conversation
      const response = await api.post("/api/chat/rooms", {
        other_username: player.username
      });

      const conversationData = response.data;
      console.log("Conversation response:", conversationData);

      // Navigate to messages page with the room_id as a query parameter
      // This will help the messages page auto-select this conversation
      router.push(`/messages?room_id=${conversationData.room_id}`);

    } catch (error) {
      console.error("Error creating/getting conversation:", error);
      // Still navigate to messages page as fallback
      router.push("/messages");
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const getCardStyle = () => {
    if (!player) return {};

    if (player.card_theme && player.card_theme.startsWith("#")) {
      return {
        background: `linear-gradient(135deg, ${player.card_theme}, ${player.card_theme}dd)`,
      };
    } else if (player.card_theme === "orange") {
      return {
        background: "linear-gradient(135deg, #ea580c, #dc2626)",
      };
    } else {
      return {
        background: "linear-gradient(135deg, #16a34a, #15803d)",
      };
    }
  };

  const getInitials = (name: string) => {
    if (!name) return player?.username?.slice(0, 2).toUpperCase() || "P";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading player profile...</p>
        </div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Player not found"}</p>
          <button
            onClick={() => router.back()}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Header with back button */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>

        {/* Profile Header */}
        <div className="relative">
          {/* Cover Video */}
          <div className="h-64 relative overflow-hidden rounded-lg">
            {player?.is_pro && player?.intro_video_url ? (
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              >
                <source src={player.intro_video_url} type="video/mp4" />
              </video>
            ) : player?.cover_photo_url ? (
              <Image
                src={player.cover_photo_url}
                alt="Cover Photo"
                width={1200}
                height={256}
                className="w-full h-full object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-green-400 to-blue-500"></div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            {player?.is_pro && player?.intro_video_url && (
              <button className="absolute bottom-4 right-4 w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all">
                <Play className="w-6 h-6 text-white" />
              </button>
            )}
          </div>

          {/* Profile Info */}
          <div className="px-6 pb-4 pt-8">
            <div className="flex items-end gap-4 -mt-16">
              {/* Profile Picture */}
              <div className="relative -top-10">
                <div className="w-[160px] h-[160px] rounded-2xl border-2 border-white overflow-hidden flex items-center justify-center bg-gray-100">
                  <Image
                    src={player?.profile_picture_url || "/playercard1.png"}
                    alt={player?.name}
                    width={160}
                    height={160}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="flex-1 mt-16">
                {/* Name, Level, XP, EXP Row */}
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl font-bold text-gray-900">
                        {player?.name}
                      </h1>
                      {player?.is_pro && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600 mb-4">
                      {player?.is_pro ? "Pro Player" : "Amateur Player"}
                    </p>
                  </div>

                  {/* Social Media Section - Only show if socials exist */}
                  {player?.socials && player.socials.length > 0 && (
                    <div className="flex flex-col items-center ml-auto">
                      <p className="text-gray-600 text-sm mb-3">Follow me on</p>
                      <div className="flex items-center gap-3">
                        {player.socials.map((social) => (
                          <a
                            key={social.social_link_id}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-full flex items-center justify-center hover:shadow-lg transition-all"
                            title={`Follow on ${social.social}`}
                            style={{ background: "none" }}
                          >
                            <Image
                              src={social.logo}
                              alt={social.social}
                              width={32}
                              height={32}
                              className="w-10 h-10 object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `<span class='text-gray-700 text-xs font-bold'>${social.social.charAt(
                                    0
                                  )}</span>`;
                                }
                              }}
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Buttons and Stats Row */}
                <div className="flex items-center justify-between">
                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {player?.is_me ? (
                      <button
                        onClick={handleEditProfile}
                        className="px-6 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Edit Profile
                      </button>
                    ) : (
                      <button
                        onClick={handleFollow}
                        className={`px-6 py-2 rounded-full font-medium transition-colors ${isFollowing
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-green-600 text-white hover:bg-green-700"
                          }`}
                      >
                        {isFollowing ? "Following" : "Follow"}
                      </button>
                    )}
                    <button
                      onClick={handleGetInTouch}
                      disabled={isCreatingConversation}
                      className={`px-6 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 ${isCreatingConversation ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                      {isCreatingConversation ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700"></div>
                          <span>Opening...</span>
                        </>
                      ) : (
                        'Get in Touch'
                      )}
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center">
                      <div className="relative w-12 h-12">
                        <img
                          src="/icons/level.svg"
                          alt="Follower Count"
                          className="w-full h-full"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white font-bold text-xs">
                            {player?.follower_count?.toLocaleString() || "0"}
                          </span>
                        </div>
                      </div>
                      <span className="text-gray-600 text-xs mt-1">
                        Followers
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="relative w-12 h-12">
                        <img
                          src="/icons/exp.svg"
                          alt="High Game"
                          className="w-full h-full"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white font-bold text-xs">
                            {player?.stats?.high_game?.toLocaleString() || "0"}
                          </span>
                        </div>
                      </div>
                      <span className="text-gray-600 text-xs mt-1">
                        High Game
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="relative w-12 h-12">
                        <img
                          src="/icons/xp.svg"
                          alt="High Series"
                          className="w-full h-full"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white font-bold text-xs">
                            {player?.stats?.high_series?.toLocaleString() ||
                              "0"}
                          </span>
                        </div>
                      </div>
                      <span className="text-gray-600 text-xs mt-1">
                        High Series
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add Sponsors Section */}
        {player?.is_pro && player?.sponsors && player.sponsors.length > 0 && (
          <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
            {/* <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Sponsors
            </h3> */}
            <div className="flex items-center justify-center gap-6">
              {player.sponsors.map((sponsor) => (
                <Image
                  key={sponsor.brand_id}
                  src={sponsor.logo_url}
                  alt={sponsor.formal_name}
                  width={48}
                  height={48}
                  className="object-contain rounded-md"
                />
              ))}
            </div>
          </div>
        )}

        {/* Add Favorite Brands Section */}
        {!player?.is_pro &&
          player?.favorite_brands &&
          player.favorite_brands.length > 0 && (
            <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Favorite Brands
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {player.favorite_brands.map((brand) => (
                  <div
                    key={brand.brand_id}
                    className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                  >
                    <Image
                      src={brand.logo_url}
                      alt={brand.formal_name}
                      width={32}
                      height={32}
                      className="object-contain rounded-md"
                    />
                    <span className="text-sm text-gray-700 flex-1">
                      {brand.formal_name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Posts Section Header */}
        <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">Posts</h3>
          </div>
        </div>

        {/* Posts Content */}
        <div className="flex-1 bg-gray-50">
          <div className="p-6">
            {/* Posts Grid - Full Width */}
            <div className="w-full">
              {postsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading posts...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg mb-2">No posts yet</p>
                  <p className="text-gray-400">
                    Share your first bowling experience!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[420px]">
                  {posts.map((post) => (
                    <UserPostCard key={post.metadata.id} post={post} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
