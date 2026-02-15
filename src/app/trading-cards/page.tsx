"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Zap,
  Loader2,
  AlertCircle,
  User,
  Star,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";

interface Card {
  metadata: {
    card_id: number;
    user_id: number;
    design: {
      design_id: number;
      name: string;
      code_name: string;
    };
    is_followable: boolean;
    is_collected_by_viewer: boolean;
    is_followed_by_viewer: boolean;
    collections_count: number;
    is_ready: boolean;
  };
  card_html_url: string;
}

interface UserMinimal {
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
  xp: number;
  level: number;
  contact_info: {
    email: string;
    is_public: boolean;
    is_added: boolean;
  };
  gender_data: {
    role: string;
    is_public: boolean;
    is_added: boolean;
  };
  follow_info: {
    follwers: number;
    followings: number;
  };
  profile_picture_url?: string;
  is_followable: boolean;
  is_following: boolean;
}

export default function TradingCardsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'feed' | 'collection'>('feed');
  const [cards, setCards] = useState<Card[]>([]);
  const [collectionCards, setCollectionCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [collectingIds, setCollectingIds] = useState<Record<number, boolean>>(
    {}
  );
  const [userInfo, setUserInfo] = useState<{ [key: number]: UserMinimal }>({});
  const [loadingUsers, setLoadingUsers] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (user) {
      if (activeTab === 'feed') {
        fetchCards();
      } else {
        fetchCollectionCards();
      }
    }
  }, [activeTab, user]);

  const fetchCards = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/api/cards/feed");
      setCards(response.data);
      if (response.data.length > 0) {
        // Set initial index to 2 (or last index if fewer than 3 cards) to show cards on both sides
        setCurrentIndex(Math.min(2, response.data.length - 1));
      }
    } catch (err: any) {
      console.error("Error fetching cards:", err);
      setError("Failed to load trading cards");
    } finally {
      setLoading(false);
    }
  };

  const fetchCollectionCards = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/api/cards/collections");
      setCollectionCards(response.data);
      if (response.data.length > 0) {
        // Set initial index to 2 (or last index if fewer than 3 cards) to show cards on both sides
        setCurrentIndex(Math.min(2, response.data.length - 1));
      }
    } catch (err: any) {
      console.error("Error fetching collection cards:", err);
      setError("Failed to load your collection");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInfo = async (userId: number) => {
    if (userInfo[userId] || loadingUsers[userId]) return;
    try {
      setLoadingUsers((prev) => ({ ...prev, [userId]: true }));
      const response = await axios.get(
        `https://test.bowlersnetwork.com/api/profile/id/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${user?.access_token}`,
          },
        }
      );
      setUserInfo((prev) => ({ ...prev, [userId]: response.data }));
    } catch (err) {
      console.error("Error fetching user info:", err);
    } finally {
      setLoadingUsers((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleCardHover = (cardId: number, userId: number) => {
    setHoveredCard(cardId);
    fetchUserInfo(userId);
  };

  const updateCardCollections = (
    cardId: number,
    isCollected: boolean,
    collectionsCount: number
  ) => {
    const updateList = (list: Card[]) =>
      list.map((card) =>
        card.metadata.card_id === cardId
          ? {
              ...card,
              metadata: {
                ...card.metadata,
                is_collected_by_viewer: isCollected,
                collections_count: collectionsCount,
              },
            }
          : card
      );

    setCards((prev) => updateList(prev));
    setCollectionCards((prev) => updateList(prev));
  };

  const handleCollectToggle = async (
    cardId: number,
    isCurrentlyCollected: boolean
  ) => {
    if (collectingIds[cardId]) return;
    setCollectingIds((prev) => ({ ...prev, [cardId]: true }));
    try {
      const response = await api.get(`/api/cards/collect/${cardId}`);
      const { is_collected, collections_count } = response.data || {};
      if (
        typeof is_collected === "boolean" &&
        typeof collections_count === "number"
      ) {
        updateCardCollections(cardId, is_collected, collections_count);
      }
    } catch (err) {
      console.error("Error collecting card:", err);
    } finally {
      setCollectingIds((prev) => ({ ...prev, [cardId]: false }));
    }
  };

  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const prevCard = () => {
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const getAuthenticatedUrl = (url: string) => {
    if (!url) return "";
    const token =
      user?.access_token ||
      (typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : "");
    const userId = user?.id || user?.user_id;

    if (!token || !userId) return url;

    const separator = url.includes("?") ? "&" : "?";
    return `${url}${separator}access_token=${token}&auth_user_id=${userId}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Trading Cards
                </h1>
                <p className="text-xs text-gray-500">
                  Collect and trade player cards
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/my-cards')}
                className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                My Cards
              </button>
              <button
                onClick={() => router.push('/card-customizer')}
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                Create Your Card
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0">
            <button
              onClick={() => {
                setActiveTab('feed');
                setCurrentIndex(0);
              }}
              className={`px-6 py-4 font-medium text-sm transition-colors border-b-2 ${
                activeTab === 'feed'
                  ? 'text-green-600 border-b-green-600'
                  : 'text-gray-600 border-b-transparent hover:text-gray-900'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => {
                setActiveTab('collection');
                setCurrentIndex(0);
              }}
              className={`px-6 py-4 font-medium text-sm transition-colors border-b-2 ${
                activeTab === 'collection'
                  ? 'text-green-600 border-b-green-600'
                  : 'text-gray-600 border-b-transparent hover:text-gray-900'
              }`}
            >
              My Collection
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-green-600 animate-spin mb-4" />
            <p className="text-gray-500">Loading cards...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Oops! Something went wrong
            </h3>
            <p className="text-gray-500 mb-6">{error}</p>
            <button
              onClick={fetchCards}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition"
            >
              Try Again
            </button>
          </div>
        ) : (activeTab === 'feed' ? cards : collectionCards).length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {activeTab === 'feed' ? 'No Cards Found' : 'No Cards in Your Collection'}
            </h3>
            <p className="text-gray-500 mb-8">
              {activeTab === 'feed'
                ? 'Be the first to create a trading card!'
                : 'Start collecting cards from the feed!'}
            </p>
            {activeTab === 'feed' && (
              <button
                onClick={() => router.push("/trading-cards/generate")}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition"
              >
                Create Your Card
              </button>
            )}
            {activeTab === 'collection' && (
              <button
                onClick={() => setActiveTab('feed')}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition"
              >
                Browse Feed
              </button>
            )}
          </div>
        ) : (
          <div className="relative w-full h-[700px] flex flex-col items-center justify-center">
            {/* Carousel Container */}
            <div className="relative w-full h-full flex items-center justify-center perspective-1000">
              {(activeTab === 'feed' ? cards : collectionCards).map((card, index) => {
                const userMinimal = userInfo[card.metadata.user_id];
                const isHovered = hoveredCard === card.metadata.card_id;

                // Calculate distance from current index
                let offset = index - currentIndex;
                const absOffset = Math.abs(offset);
                const isActive = index === currentIndex;

                // Hide cards that are too far away to improve performance
                if (absOffset > 3) return null;

                return (
                  <div
                    key={card.metadata.card_id}
                    className="absolute transition-all duration-500 ease-out cursor-pointer"
                    style={{
                      transform: `translateX(${offset * 340}px) scale(${
                        1 - absOffset * 0.15
                      }) perspective(1000px) rotateY(${offset * -5}deg)`,
                      zIndex: 50 - absOffset,
                      opacity: absOffset > 2 ? 0 : 1 - absOffset * 0.2,
                      pointerEvents: "auto",
                      filter: isActive
                        ? "drop-shadow(0 0 20px rgba(74, 222, 128, 0.3))"
                        : "none",
                    }}
                    onClick={() => !isActive && setCurrentIndex(index)}
                  >
                    <div
                      className="relative group flex flex-col items-center"
                      style={{ width: "320px" }}
                      onMouseEnter={() =>
                        handleCardHover(
                          card.metadata.card_id,
                          card.metadata.user_id
                        )
                      }
                      onMouseLeave={() => setHoveredCard(null)}
                    >
                      <div className="relative" style={{ width: "320px", height: "450px" }}>
                      {/* Shadow Effect */}
                      <div
                        className={`absolute -inset-3 rounded-3xl bg-gradient-to-br from-green-400/20 to-blue-500/20 blur-2xl transition-all duration-500 pointer-events-none -z-10 ${
                          isHovered ? "opacity-100" : "opacity-0"
                        }`}
                      />

                      {/* Card iframe - main element */}
                      <iframe
                        src={getAuthenticatedUrl(card.card_html_url)}
                        className={`w-full h-full rounded-xl shadow-2xl overflow-hidden cursor-pointer transition-all duration-500 block border-0 ${
                          isHovered ? "scale-105" : "scale-100"
                        }`}
                        title={`Card ${card.metadata.card_id}`}
                        loading="lazy"
                        scrolling="no"
                        style={{ overflow: "hidden" }}
                        sandbox="allow-scripts allow-same-origin allow-forms"
                      />
                      </div>

                      {/* Collect/Uncollect Button */}
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          handleCollectToggle(
                            card.metadata.card_id,
                            card.metadata.is_collected_by_viewer
                          );
                        }}
                        className={`mt-3 px-4 py-2 rounded-full text-xs font-semibold shadow-lg transition ${
                          card.metadata.is_collected_by_viewer
                            ? "bg-gray-900 text-white hover:bg-gray-800"
                            : "bg-green-600 text-white hover:bg-green-700"
                        } ${
                          collectingIds[card.metadata.card_id]
                            ? "opacity-70 cursor-not-allowed"
                            : ""
                        }`}
                        disabled={collectingIds[card.metadata.card_id]}
                      >
                        {collectingIds[card.metadata.card_id]
                          ? "Working..."
                          : card.metadata.is_collected_by_viewer
                            ? "Uncollect"
                            : "Collect"}
                      </button>

                      {/* Top Badge */}
                      {card.metadata.collections_count > 0 && (
                        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 z-10 pointer-events-none">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="text-white text-sm font-bold">
                            {card.metadata.collections_count}
                          </span>
                        </div>
                      )}

                      {/* Hover Overlay with User Info */}
                      {/* <div
                        className={`absolute inset-0 rounded-2xl transition-all duration-500 ${
                          isHovered
                            ? "opacity-100"
                            : "opacity-0 pointer-events-none"
                        }`}
                      >
                        <div
                          className={`absolute inset-x-0 bottom-0 h-auto bg-gradient-to-t from-black via-black/90 to-transparent backdrop-blur-md transition-transform duration-500 rounded-b-2xl ${
                            isHovered ? "translate-y-0" : "translate-y-full"
                          }`}
                        >
                          {userMinimal ? (
                            <div className="p-6 w-full">
                              {/* User Profile * /}
                              <div className="flex items-center gap-4 mb-4">
                                <div className="relative">
                                  {userMinimal.profile_picture_url ? (
                                    <img
                                      src={userMinimal.profile_picture_url}
                                      alt={userMinimal.name}
                                      className="w-16 h-16 rounded-full border-3 border-white shadow-lg object-cover"
                                    />
                                  ) : (
                                    <div className="w-16 h-16 rounded-full border-3 border-white shadow-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                                      <span className="text-2xl font-bold text-white">
                                        {userMinimal.first_name?.[0]}
                                        {userMinimal.last_name?.[0]}
                                      </span>
                                    </div>
                                  )}
                                  {userMinimal.roles.is_pro && (
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                                      <Trophy className="w-3 h-3 text-white" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-white font-bold text-lg flex items-center gap-2">
                                    {userMinimal.name}
                                    {userMinimal.roles.is_pro && (
                                      <svg
                                        className="w-5 h-5 text-green-400"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                      >
                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                      </svg>
                                    )}
                                  </h3>
                                  <p className="text-gray-300 text-sm">
                                    @{userMinimal.username}
                                  </p>
                                </div>
                              </div>

                              {/* Card Stats * /}
                              <div className="flex items-center gap-3 mb-4 text-sm">
                                <div className="flex items-center gap-1.5 text-white/90">
                                  <Star className="w-4 h-4 text-yellow-400" />
                                  <span className="font-medium">
                                    {card.metadata.collections_count}
                                  </span>
                                  <span className="text-gray-300">
                                    Collections
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-white/90">
                                  <User className="w-4 h-4 text-blue-400" />
                                  <span className="font-medium">
                                    {userMinimal.follow_info.follwers}
                                  </span>
                                  <span className="text-gray-300">
                                    Followers
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-white/90">
                                  <Zap className="w-4 h-4 text-purple-400" />
                                  <span className="font-medium">
                                    {userMinimal.xp}
                                  </span>
                                  <span className="text-gray-300">XP</span>
                                </div>
                              </div>

                              {/* Action Button * /}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(
                                    `/profile/${userMinimal.username}`
                                  );
                                }}
                                className="w-full py-2.5 bg-white hover:bg-gray-100 text-gray-900 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                              >
                                <User className="w-4 h-4" />
                                View Profile
                              </button>
                            </div>
                          ) : loadingUsers[card.metadata.user_id] ? (
                            <div className="p-6 flex items-center justify-center h-32">
                              <Loader2 className="w-6 h-6 text-white animate-spin" />
                            </div>
                          ) : null}
                        </div>
                      </div> */}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation Controls */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4 sm:gap-6 lg:gap-8 z-50 w-full px-4 max-w-2xl">
              <button
                onClick={prevCard}
                className="p-2 sm:p-3 rounded-full bg-white/90 shadow-lg hover:bg-white hover:scale-110 transition-all text-gray-800 disabled:opacity-50 flex-shrink-0"
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Indicators - Show text counter and limited dots */}
              <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
                <div className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                  {currentIndex + 1} / {(activeTab === 'feed' ? cards : collectionCards).length}
                </div>
                <div className="flex gap-1 sm:gap-1.5 flex-wrap justify-center w-full">
                  {(activeTab === 'feed' ? cards : collectionCards).length > 7 ? (
                    // Show limited indicator dots (max 7) for large collections
                    Array.from({ length: 7 }).map((_, dotIdx) => {
                      const totalCards = (activeTab === 'feed' ? cards : collectionCards).length;
                      const step = Math.ceil(totalCards / 7);
                      const cardIdx = dotIdx * step;
                      const isActive = currentIndex >= cardIdx && currentIndex < cardIdx + step;
                      
                      return (
                        <button
                          key={dotIdx}
                          onClick={() => setCurrentIndex(Math.min(cardIdx, totalCards - 1))}
                          className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all flex-shrink-0 ${
                            isActive
                              ? "w-4 sm:w-6 bg-green-500"
                              : "bg-gray-300 hover:bg-gray-400"
                          }`}
                        />
                      );
                    })
                  ) : (
                    // Show all dots for small collections
                    (activeTab === 'feed' ? cards : collectionCards).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all flex-shrink-0 ${
                          idx === currentIndex
                            ? "w-4 sm:w-6 bg-green-500"
                            : "bg-gray-300 hover:bg-gray-400"
                        }`}
                      />
                    ))
                  )}
                </div>
              </div>

              <button
                onClick={nextCard}
                className="p-2 sm:p-3 rounded-full bg-white/90 shadow-lg hover:bg-white hover:scale-110 transition-all text-gray-800 disabled:opacity-50 flex-shrink-0"
                disabled={currentIndex === (activeTab === 'feed' ? cards : collectionCards).length - 1}
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
