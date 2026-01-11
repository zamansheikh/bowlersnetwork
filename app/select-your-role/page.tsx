'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";

// Define the role interface
interface Role {
  id: string;
  title: string;
  description: string;
  badge: string;
  badgeColor: string;
}

export default function SelectYourRole() {
  const [selectedRole, setSelectedRole] = useState<string>('amateur');
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [comingSoonRole, setComingSoonRole] = useState<string>('');
  const router = useRouter();

  const roles: Role[] = [
    {
      id: "amateur",
      title: "Amateur",
      description:
        "The Amateur Player is a standard user role designed for recreational and league bowlers. This role emphasizes engagement, progression, and community interaction through XP-based activities and trading card customization.",
      badge: "Free",
      badgeColor: "bg-green-100 text-green-800",
    },
    {
      id: "pro-player",
      title: "Pro Player",
      description:
        "The Amateur Player is a standard user role designed for recreational and league bowlers. This role emphasizes engagement, progression, and community interaction through XP-based activities and trading card customization.",
      badge: "Premium",
      badgeColor: "bg-blue-100 text-blue-800",
    },
    {
      id: "bowling-center",
      title: "Bowling Center",
      description:
        "The Amateur Player is a standard user role designed for recreational and league bowlers. This role emphasizes engagement, progression, and community interaction through XP-based activities and trading card customization.",
      badge: "Premium",
      badgeColor: "bg-blue-100 text-blue-800",
    },
    {
      id: "manufacturer",
      title: "Manufacturer",
      description:
        "The Amateur Player is a standard user role designed for recreational and league bowlers. This role emphasizes engagement, progression, and community interaction through XP-based activities and trading card customization.",
      badge: "Premium",
      badgeColor: "bg-blue-100 text-blue-800",
    },
  ];

  const handleContinue = () => {
    if (selectedRole) {
      if (selectedRole === 'amateur') {
        // Redirect to external beta site
        window.location.href = 'https://beta.bowlersnetwork.com/signin';
      } else if (selectedRole === 'pro-player') {
        // Redirect to another website in the same tab
        window.location.href = 'https://pros.bowlersnetwork.com/';
      } else if (selectedRole === 'bowling-center') {
        setComingSoonRole('Bowling Center');
        setShowComingSoon(true);
      } else if (selectedRole === 'manufacturer') {
        setComingSoonRole('Manufacturer');
        setShowComingSoon(true);
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 relative">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="flex flex-col items-center justify-center mb-8 md:mb-12">
          <Link href="/" className="mb-6 md:mb-8">
            <Image
              src="/logo/logo.png"
              alt="Logo"
              width={80}
              height={80}
              unoptimized
              className="w-16 h-16 md:w-20 md:h-20"
            />
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 text-center">
            Select Your Role
          </h1>
          <p className="text-sm md:text-base text-gray-600 text-center">
            Choose your account type to get started
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12">
          {roles.map((role) => (
            <div
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`
                relative p-6 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-lg
                ${selectedRole === role.id 
                  ? "border-green-500 bg-white ring-1 ring-green-500" 
                  : "border-gray-200 bg-white hover:border-green-300"
                }
              `}
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${role.badgeColor}`}>
                  {role.badge}
                </span>
                <div className={`
                  w-6 h-6 rounded-full border-2 flex items-center justify-center
                  ${selectedRole === role.id ? "border-green-500" : "border-gray-300"}
                `}>
                  {selectedRole === role.id && (
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  )}
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{role.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{role.description}</p>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            className="w-full md:w-auto px-12 py-4 bg-green-500 text-white font-bold rounded-full text-lg shadow-lg hover:bg-green-600 transition-colors transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedRole}
          >
            Continue
          </button>
        </div>
      </div>

      {/* Coming Soon Modal */}
      {showComingSoon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowComingSoon(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">🚀</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Coming Soon!</h3>
            <p className="text-gray-600 mb-6">
              The <span className="font-semibold text-gray-900">{comingSoonRole}</span> portal is currently under development. Stay tuned for updates!
            </p>
            <button
              onClick={() => setShowComingSoon(false)}
              className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
