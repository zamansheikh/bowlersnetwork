"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Play } from "lucide-react";

interface PlayerProfile {
  user_id: number;
  username: string;
  name: string;
  first_name: string;
  last_name: string;
  profile_picture_url: string;
  intro_video_url: string;
  xp: number;
  email: string;
  level: number;
  card_theme: string;
  is_pro: boolean;
  follower_count: number;
  sponsors?: {
    brand_id: number;
    brandType: string;
    name: string;
    formal_name: string;
    logo_url: string;
  }[];
  stats: {
    id: number;
    user_id: number;
    average_score: number;
    high_game: number;
    high_series: number;
    experience: number;
  };
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

interface PlayerCardProps {
  player: PlayerProfile;
}

export default function PlayerCard({ player }: PlayerCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/pro/${player.username}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300"
    >
      {/* Cover Video */}
      <div className="h-40 relative overflow-hidden">
        {player?.intro_video_url ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={player.intro_video_url} type="video/mp4" />
            <div className="w-full h-full bg-gradient-to-r from-green-400 to-blue-500"></div>
          </video>
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-green-400 to-blue-500"></div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <button className="absolute bottom-3 right-3 w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all">
          <Play className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Profile Info */}
      <div className="px-3 pb-4 pt-2">
        {/* Profile Picture and Name Section */}
        <div className="flex items-start gap-2 -mt-6 mb-3">
          {/* Profile Picture */}
          <div className="relative flex-shrink-0">
            <img
              src={player?.profile_picture_url || "/playercard1.png"}
              alt={player?.name}
              className="w-11 h-11 rounded-lg border-2 border-white object-cover shadow-md"
            />
          </div>

          <div className="flex-1">
            {/* Name and Badge Row */}
            <div className="h-8"></div>
            <div className="flex items-start gap-2 mb-1">
              <h1 className="text-sm font-bold text-gray-900 leading-tight flex-1 break-words">
                {player?.name}
              </h1>
              {player?.is_pro && (
                <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </div>
            <p className="text-gray-600 text-xs">
              {player?.is_pro ? "Pro Player" : "Amateur Player"}
            </p>
          </div>
        </div>

        {/* Level, EXP Icons Row */}
        <div className="flex items-center justify-center gap-6 mb-4">
          {/* Level */}
          {/* <div className="flex flex-col items-center">
            <div className="relative w-8 h-8">
              <img
                src="/icons/level.svg"
                alt="Level"
                className="w-full h-full"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-bold text-xs">
                  {player?.level || 0}
                </span>
              </div>
            </div>
            <span className="text-gray-500 text-xs mt-1">Level</span>
          </div> */}

          {/* XP - Hidden for now */}
          {/* <div className="flex flex-col items-center">
            <div className="relative w-8 h-8">
              <img src="/icons/xp.svg" alt="XP" className="w-full h-full" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-bold text-xs">
                  {player?.xp > 999
                    ? Math.floor(player.xp / 1000) + "K"
                    : player?.xp || 0}
                </span>
              </div>
            </div>
            <span className="text-gray-500 text-xs mt-1">XP</span>
          </div> */}

          {/* EXP */}
          {/* <div className="flex flex-col items-center">
            <div className="relative w-8 h-8">
              <img src="/icons/exp.svg" alt="EXP" className="w-full h-full" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-bold text-xs">
                  {player?.stats?.experience > 999
                    ? Math.floor(player.stats.experience / 1000) + "K"
                    : player?.stats?.experience || 0}
                </span>
              </div>
            </div>
            <span className="text-gray-500 text-xs mt-1">EXP</span>
          </div> */}
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between text-center mb-3">
          <div className="flex-1">
            <div className="text-sm font-bold text-gray-900">
              {player?.follower_count?.toLocaleString() || "0"}
            </div>
            <div className="text-xs text-gray-600">Followers</div>
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-gray-900">
              {player?.stats?.high_game?.toLocaleString() || "0"}
            </div>
            <div className="text-xs text-gray-600">High Game</div>
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-gray-900">
              {player?.stats?.high_series?.toLocaleString() || "0"}
            </div>
            <div className="text-xs text-gray-600">High Series</div>
          </div>
        </div>

        {/* Sponsors Section - Only for Pro Players */}
        {player?.is_pro && player?.sponsors && player.sponsors.length > 0 && (
          <div>
            <div className="border-t border-gray-200 mb-3"></div>
            <div className="text-xs text-gray-500 mb-2 text-center">Sponsors</div>
            <div className="flex flex-wrap gap-2 justify-center">
              {player.sponsors.slice(0, 4).map((sponsor) => (
                <div
                  key={sponsor.brand_id}
                  className="flex items-center justify-center bg-gray-50 rounded-full p-2"
                  title={sponsor.formal_name}
                >
                  <Image
                    src={sponsor.logo_url}
                    alt={sponsor.formal_name}
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
              ))}
              {player.sponsors.length > 4 && (
                <div className="flex items-center justify-center bg-gray-100 rounded-full p-2 w-10 h-10">
                  <span className="text-xs text-gray-600 font-medium">+{player.sponsors.length - 4}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Favorite Brands Section - Only for Non-Pro Players */}
        {!player?.is_pro && player?.favorite_brands && player.favorite_brands.length > 0 && (
          <div>
            <div className="text-xs text-gray-500 mb-2 text-center">Favorite Brands</div>
            <div className="flex flex-wrap gap-2 justify-center">
              {player.favorite_brands.slice(0, 4).map((brand) => (
                <div
                  key={brand.brand_id}
                  className="flex items-center justify-center bg-gray-50 rounded-full p-2"
                  title={brand.formal_name}
                >
                  <Image
                    src={brand.logo_url}
                    alt={brand.formal_name}
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
              ))}
              {player.favorite_brands.length > 4 && (
                <div className="flex items-center justify-center bg-gray-100 rounded-full p-2 w-10 h-10">
                  <span className="text-xs text-gray-600 font-medium">+{player.favorite_brands.length - 4}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
