'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";

// Define the role interface
interface Role {
    id: string;
    title: string;
    description: string;
}

export default function SelectYourRole() {
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [showComingSoon, setShowComingSoon] = useState(false);
    const [comingSoonRole, setComingSoonRole] = useState<string>('');
    const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (redirectUrl) {
            // Use window.location for external redirects or full reloads if needed, 
            // otherwise router.push could be better for internal. 
            // The original code used window.location.href for what looks like external subdomains.
            window.location.href = redirectUrl;
        }
    }, [redirectUrl]);

    const roles: Role[] = [
        {
            id: "amateur",
            title: "Amateur",
            description:
                "The standard user role for recreational and league bowlers. Track your progress, connect with the community, and build your digital presence through XP and trading cards."
        },
        {
            id: "pro-player",
            title: "Pro Player",
            description:
                "Exclusive role for professional bowlers. Manage your fan base, showcase your tournament schedule, share professional insights, and engage with the bowling community at a higher level."
        },
        {
            id: "bowling-center",
            title: "Bowling Center",
            description:
                "For owners and operators. Increase center visibility, manage tournaments and events, host lane exchanges, and offer exclusive perks to players who visit your facility."
        },
        {
            id: "manufacturer",
            title: "Manufacturer",
            description:
                "For bowling equipment brands. Showcase your latest products, manage staff players, sponsor tournaments, and connect directly with players looking for the best gear."
        },
    ];

    const handleRoleSelect = (roleId: string) => {
        setSelectedRole(roleId);
        if (roleId === 'amateur') {
            router.push('/signin');
        } else if (roleId === 'pro-player') {
            // Set redirect URL to be handled by useEffect
            setRedirectUrl('https://pros.bowlersnetwork.com/signin');
        } else if (roleId === 'bowling-center') {
            setComingSoonRole('Bowling Center');
            setShowComingSoon(true);
        } else if (roleId === 'manufacturer') {
            setComingSoonRole('Manufacturer');
            setShowComingSoon(true);
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
                            onClick={() => handleRoleSelect(role.id)}
                            className={`
                relative p-6 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-lg
                ${selectedRole === role.id
                                    ? "border-green-500 bg-white ring-1 ring-green-500"
                                    : "border-gray-200 bg-white hover:border-green-300"
                                }
              `}
                        >
                            <div className="flex justify-end items-start mb-4">
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
