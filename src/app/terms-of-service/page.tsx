'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/logo/logo.png"
                            alt="BowlersNetwork Logo"
                            width={32}
                            height={32}
                            className="w-8 h-8"
                            unoptimized
                        />
                        <span className="text-xl font-black text-gray-900 tracking-tight hidden md:block">
                            BowlersNetwork
                        </span>
                    </Link>
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-[#8BC342] transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-16">
                <div className="mb-12 text-center">
                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">
                        Terms, Conditions &<br className="md:hidden" /> Community Guidelines
                    </h1>
                    <p className="text-gray-600 font-medium">
                        Effective Date: February 15, 2026
                    </p>
                </div>

                <div className="space-y-12 text-gray-800 leading-relaxed">
                    {/* Introduction */}
                    <section className="bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-100">
                        <p className="font-medium text-lg mb-4">
                            Governing Jurisdiction: State of North Dakota, USA
                        </p>
                        <p>
                            By registering for, accessing, or utilizing the <strong>BowlersNetwork</strong> platform—including its mobile applications, websites, media content, and digital services (collectively "the Platform")—you ("User") irrevocably agree to be bound by the following terms. This agreement is designed to protect the community, the sport of bowling, and the legal interests of BowlersNetwork and its affiliates.
                        </p>
                    </section>

                    {/* Section 1 */}
                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#8BC342] text-white text-sm">1</span>
                            MINOR SAFETY & "BEST EFFORTS" MIRROR PROTOCOL
                        </h2>
                        <ul className="space-y-4 pl-4 border-l-2 border-gray-200 ml-3">
                            <li className="pl-4">
                                <strong>Mandatory Guardian Oversight:</strong> No person under the age of 18 ("Minor") is permitted to use the Platform without an account linked to a verified Parent or Legal Guardian account.
                            </li>
                            <li className="pl-4">
                                <strong>Best Efforts Communication Mirroring:</strong> BowlersNetwork utilizes a proprietary protocol intended to tag and copy communications involving a Minor to the Parent/Guardian’s dashboard. <strong>This feature is provided on a "best efforts" basis only.</strong> Users acknowledge that technical limitations, service interruptions, or software bugs may occur. BowlersNetwork makes <strong>no guarantee</strong> of 100% mirroring uptime and shall not be held liable for any failure of this system.
                            </li>
                            <li className="pl-4">
                                <strong>Audit & Investigation Disclosure:</strong> To protect both Minors and Adults from allegations or accusations, all users agree that BowlersNetwork may, at its sole discretion, provide a full audit trail of communications to the <strong>USBC</strong>, SafeSport, or legal authorities upon request or in the event of internal safety flags.
                            </li>
                        </ul>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#8BC342] text-white text-sm">2</span>
                            MANDATORY COACH DISCLOSURE & PROFESSIONAL INTEGRITY
                        </h2>
                        <ul className="space-y-4 pl-4 border-l-2 border-gray-200 ml-3">
                            <li className="pl-4">
                                <strong>Status Disclosure:</strong> Any user who is a <strong>USBC Certified Coach</strong> (or holds any professional athletic certification) is <strong>required</strong> to disclose this status at the time of registration.
                            </li>
                            <li className="pl-4">
                                <strong>Sanctions for Omission:</strong> If a user fails to disclose their coaching status and it is later determined they held such status at or after registration, BowlersNetwork reserves the right to <strong>immediately suspend or terminate</strong> the account. You agree that this omission and any related platform data may be shared with the <strong>USBC</strong> or relevant governing bodies.
                            </li>
                        </ul>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#8BC342] text-white text-sm">3</span>
                            DATA USAGE, ANONYMIZATION, & ANALYTICS
                        </h2>
                        <ul className="space-y-4 pl-4 border-l-2 border-gray-200 ml-3">
                            <li className="pl-4">
                                <strong>Platform-Wide Data Sharing:</strong> Upon registration and use of the Platform, you agree that your anonymized data—including location, bowling averages, hand dominance, and equipment preferences—may be used and shared across the Platform and with third-party partners (manufacturers, centers, pro shops, associations, and tournament directors).
                            </li>
                            <li className="pl-4">
                                <strong>Technical Tracking Tools:</strong> BowlersNetwork may employ technical tools, including behavioral analytics, to understand user habits and feature utilization.
                            </li>
                            <li className="pl-4">
                                <strong>Anonymity Standards:</strong> All shared data is tied to a unique <strong>User ID</strong>. BowlersNetwork <strong>does not</strong> share your legal name, email, or private contact information with these business partners. We share demographic and behavioral trends, not private identities.
                            </li>
                        </ul>
                    </section>

                    {/* Section 4 */}
                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#8BC342] text-white text-sm">4</span>
                            COMMUNITY STANDARDS & CONDUCT
                        </h2>
                        <ul className="space-y-4 pl-4 border-l-2 border-gray-200 ml-3">
                            <li className="pl-4">
                                <strong>Focus of Discussion:</strong> This Platform is a sanctuary for <strong>bowling and sports-related activities ONLY</strong>.
                            </li>
                            <li className="pl-4">
                                <strong>Religion & Charity:</strong> Discussions regarding religion are permitted <em>only</em> if they are kind, helpful, and non-hateful (e.g., coordinating a faith-based charity tournament). Any religious discussion that becomes divisive, hateful, or aggressive will be removed.
                            </li>
                            <li className="pl-4">
                                <strong>Politics:</strong> Discussion of political candidates, parties, or campaigns is strictly prohibited.
                            </li>
                            <li className="pl-4">
                                <strong>Zero-Tolerance Policy:</strong> Hate speech, bullying, intimidation, and offensive language are banned.
                            </li>
                            <li className="pl-4">
                                <strong>Erasure Rights:</strong> BowlersNetwork reserves the right to erase any inappropriate language, images, video, or audio at its sole discretion. Users violating these standards may be banned permanently without notice or refund.
                            </li>
                        </ul>
                    </section>

                    {/* Section 5 */}
                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#8BC342] text-white text-sm">5</span>
                            INTELLECTUAL PROPERTY & NON-DUPLICATION
                        </h2>
                        <ul className="space-y-4 pl-4 border-l-2 border-gray-200 ml-3">
                            <li className="pl-4">
                                <strong>Proprietary Model:</strong> Users agree not to copy, duplicate, or attempt to reverse-engineer the BowlersNetwork business model, its specific coaching integration, or its parental protection features.
                            </li>
                            <li className="pl-4">
                                <strong>Non-Circumvention:</strong> Professional users agree not to use the Platform to solicit or divert members to private, off-platform communication or payment systems.
                            </li>
                        </ul>
                    </section>

                    {/* Section 6 */}
                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#8BC342] text-white text-sm">6</span>
                            MAXIMUM LEGAL PROTECTION & INDEMNIFICATION
                        </h2>
                        <ul className="space-y-4 pl-4 border-l-2 border-gray-200 ml-3">
                            <li className="pl-4">
                                <strong>Hold Harmless & Indemnity:</strong> All users agree to <strong>fully indemnify, defend, and hold harmless</strong> BowlersNetwork and its owners—specifically <strong>Norm Duke, Liz Johnson, Carolyn Dorin-Ballard, Parker Bohn III, Chuck Gardner, Jay Fettig, and Marshall Kent</strong>—as well as all <strong>staff players under current contract</strong>, employees, and independent contractors acting on behalf of BowlersNetwork, from any and all claims, damages, or legal costs.
                            </li>
                            <li className="pl-4">
                                <strong>Third-Party & Sponsor Release:</strong> Users acknowledge that BowlersNetwork may have sponsorship or media agreements (e.g., BEK Communications). Users agree that BowlersNetwork and its owners are <strong>not responsible</strong> for the products, services, or actions of these third parties.
                            </li>
                            <li className="pl-4">
                                <strong>No-Sue Agreement & Class Action Waiver:</strong> You agree that you will not initiate or participate in any lawsuit, class action, or arbitration against the owners, staff players, or the Platform. All dispute resolutions will be conducted on an <strong>individual basis only</strong>.
                            </li>
                            <li className="pl-4">
                                <strong>"As-Is" / Best Efforts:</strong> You acknowledge that the Platform is provided "as-is." We are striving to provide a service that does not currently exist today, but we make no warranties regarding its performance or the conduct of other users.
                            </li>
                        </ul>
                    </section>

                    {/* Section 7 */}
                    <section>
                        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#8BC342] text-white text-sm">7</span>
                            GENERAL PROVISIONS
                        </h2>
                        <ul className="space-y-4 pl-4 border-l-2 border-gray-200 ml-3">
                            <li className="pl-4">
                                <strong>Force Majeure:</strong> BowlersNetwork is not liable for failures resulting from causes beyond its reasonable control (tech failures, internet outages, etc.).
                            </li>
                            <li className="pl-4">
                                <strong>Governing Law:</strong> This agreement is governed by the laws of the <strong>State of North Dakota</strong>.
                            </li>
                            <li className="pl-4">
                                <strong>Right to Modify:</strong> BowlersNetwork reserves the right to modify these terms at any time for any reason upon notification. Continued use constitutes acceptance of the modified terms.
                            </li>
                        </ul>
                    </section>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-50 border-t border-gray-200 py-12">
                <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} BowlersNetwork. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <Link href="/" className="text-gray-500 hover:text-[#8BC342] text-sm font-medium transition-colors">
                            Home
                        </Link>
                        <Link href="/signin" className="text-gray-500 hover:text-[#8BC342] text-sm font-medium transition-colors">
                            Sign In
                        </Link>
                        <Link href="/signup" className="text-gray-500 hover:text-[#8BC342] text-sm font-medium transition-colors">
                            Sign Up
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
