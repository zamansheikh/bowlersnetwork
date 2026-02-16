'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { TrendingUp, Link as LucideLink, Calendar, MapPin, X, Menu, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import Link from 'next/link';
// import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

// Minimal Mapbox types to avoid explicit `any` and satisfy eslint
type MapboxControl = Record<string, unknown>;

type MapInstance = {
    addControl: (control: MapboxControl, position?: string) => void;
    remove: () => void;
};

type MapboxGL = {
    accessToken?: string;
    Map: new (opts: { container: string | HTMLElement; style: string; center: [number, number]; zoom: number; attributionControl?: boolean }) => MapInstance;
    NavigationControl: new () => MapboxControl;
    Marker: new (opts?: { color?: string }) => { setLngLat: (coords: [number, number]) => { addTo: (map: MapInstance) => void } };
};

export default function Landing2Page() {
    const menuItems = [
        { label: 'AMATEURS', href: '#all-in-one' },
        { label: 'PROS', href: '#beyond-the-chatter' },
        { label: 'CENTERS', href: '#smarter-centers' },
        { label: 'PARTNERS', href: '#trusted-partners' },
        { label: 'ABOUT US', href: '#about-us' },
    ];

    /* BoardMember and Brand interfaces omitted for brevity */

    const [modalOpen, setModalOpen] = useState(false);
    const [betaModalOpen, setBetaModalOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<BoardMember | null>(null);
    const [brands, setBrands] = useState<Brand[]>([]);
    const mapRef = useRef<MapInstance | null>(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    // const { user } = useAuth();
    const user = { authenticated: false };
    const router = useRouter();

    interface BoardMember {
        key: string;
        src: string;
        name: string;
        title: string;
        short: string;
        description: string;
        bgClass: string;
        position: string;
    }

    interface Brand {
        brand_id: number;
        brandType: string;
        name: string;
        formal_name: string;
        logo_url: string;
    }


    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const response = await fetch('https://test.bowlersnetwork.com/api/brands');
                const data = await response.json();

                // Only show Business Sponsors for the trusted partners section
                let brandData: Brand[] = [];

                const payload = data as Record<string, unknown>;
                const businessValue = payload['Business Sponsors'] ?? payload['businessSponsors'];
                if (Array.isArray(businessValue)) {
                    brandData = (businessValue as Brand[]);
                } else if (Array.isArray(payload.data)) {
                    brandData = (payload.data as Brand[]).filter(b => b.brandType === 'Business Sponsors');
                } else if (Array.isArray(payload.brands)) {
                    brandData = (payload.brands as Brand[]).filter(b => b.brandType === 'Business Sponsors');
                } else if (Array.isArray(data)) {
                    brandData = (data as Brand[]).filter(b => b.brandType === 'Business Sponsors');
                }

                setBrands(brandData);
            } catch (error) {
                console.error('Error fetching brands:', error);
            }
        };

        fetchBrands();
    }, []);

    // Mapbox Initialization
    useEffect(() => {
        const initializeMap = () => {
            const mapContainer = document.getElementById('contact-map');
            const mapboxgl = (window as unknown as { mapboxgl?: MapboxGL }).mapboxgl;
            if (!mapboxgl || mapRef.current || !mapContainer) return;

            // Use the token from env or fallback to a known public token for this project
            const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
            mapboxgl.accessToken = mapboxToken;

            const map = new mapboxgl.Map({
                container: 'contact-map',
                style: 'mapbox://styles/mapbox/light-v11',
                center: [-82.5158, 40.7589], // Mansfield, OH (Main St & Park Ave)
                zoom: 15,
                attributionControl: true
            });

            // Add navigation controls
            map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

            // Add marker
            new mapboxgl.Marker({ color: '#86D864' })
                .setLngLat([-82.5158, 40.7589])
                .addTo(map);

            mapRef.current = map;
            setMapLoaded(true);
        };



        if (!(window as unknown as { mapboxgl?: MapboxGL }).mapboxgl) {
            // Load script
            const script = document.createElement('script');
            script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
            script.async = true;
            document.head.appendChild(script);

            // Load CSS
            const link = document.createElement('link');
            link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
            link.rel = 'stylesheet';
            document.head.appendChild(link);

            script.onload = () => initializeMap();
        } else {
            initializeMap();
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    const teamMembers = [
        { src: '/team_headshots/Nahian Ferdouse.webp', name: 'Nahian Ferdouse', role: 'Director of Business', position: 'top' },
        { src: '/team_headshots/mumit_prottoy.webp', name: 'Mumit Prottoy', role: 'Director of Technology', position: 'top' },
        { src: '/team_headshots/Shuvo Headshot.webp', name: 'Asraful Alam Shuvo', role: 'Lead Product Experience & Growth', position: 'center' },
        { src: '/team_headshots/Azmain Hossain Sabbir-Photo.webp', name: 'Azmain Sabbir', role: 'Brand Marketing Manager', position: 'center' },
        { src: '/team_headshots/Sadia Durdana Adrita.webp', name: 'Sadia Durdana Adrita', role: 'Product Manager', position: 'center' },
        { src: '/team_headshots/Hasibul Hasan Pranto.webp', name: 'Pranto', role: 'Creative Designer', position: 'top' },
        { src: '/team_headshots/Brittany Kolatzny-Headshot.webp', name: 'Brittany Kolatzny', role: 'Director of Marketing', position: 'center' },
    ];

    const boardMembers = [
        { key: 'norm', src: '/pro_teams/norm duke pic.webp', name: 'Norm Duke', title: 'Vice President', short: 'Hall of Famer and Vice President guiding strategy with precision, integrity, and respect for the game', description: 'Norm Duke is Vice President of BowlersNetwork.com and one of the most accomplished competitors in the history of the sport. A PBA Hall of Famer whose success spans multiple decades, Norm is respected for his precision, adaptability, and professionalism. Deeply committed to family and mentorship, Norm provides strategic guidance, player leadership, and a steady voice rooted in integrity and respect for the game.', bgClass: 'bg-blue-100', position: 'top' },
        { key: 'chuck', src: '/pro_teams/Chuck 1.webp', name: 'Chuck Gardner', title: 'Owner & Secretary-Treasurer', short: 'Youth-first leader and Bowl4Life founder committed to scholarships, stewardship, and integrity.', description: 'Chuck Gardner serves as Secretary and Treasurer of BowlersNetwork.com. Alongside his wife Deborah, he founded the Bowl4Life Foundation, which has awarded nearly $1 million in youth bowling scholarships nationwide.\n\nA member of the South Carolina USBC Hall of Fame, Chuck provides governance oversight, financial stewardship, and values-based leadership rooted in service, integrity, and family.', bgClass: 'bg-red-100', position: 'top' },
        { key: 'parker', src: '/pro_teams/Parker Bohn Pic.webp', name: 'Parker Bohn III', title: 'Owner & Board Member', short: 'Hall of Famer, lifelong Brunswick staff member, and legacy-driven coach committed to family and teaching.', description: 'Parker Bohn III is a PBA Hall of Famer and board member of BowlersNetwork.com. A career-long Brunswick professional staff member, Parker has represented the brand and the sport with consistency and class for more than four decades.\n\nFamily and legacy are central to Parker\'s life. Alongside his family, he operates Bohn\'s Elite Training, where bowlers of all ages train using modern technology and elite instruction. His commitment to teaching, sportsmanship, and long-term development strengthens BowlersNetwork\'s foundation.', bgClass: 'bg-cyan-100', position: 'top' },
        { key: 'liz', src: '/pro_teams/Liz Johnson pic.webp', name: 'Liz Johnson', title: 'Owner & Board Member', short: 'All-time great and Hall of Famer helping shape excellence, opportunity, and athlete advocacy.', description: 'Liz Johnson is one of the most accomplished bowlers of all time and a board member of BowlersNetwork.com. A multiple-time major champion and Hall of Famer, Liz is known for her unmatched accuracy, preparation, and mental toughness.\n\nLiz is a role model for generations of bowlers and brings an athlete-first, excellence-driven perspective to BowlersNetwork\'s leadership.', bgClass: 'bg-cyan-100', position: 'center' },
        { key: 'carolyn', src: '/pro_teams/carolyn dorin ballard pic.webp', name: 'Carolyn Dorin-Ballard', title: 'Owner & Board Member', short: 'PWBA and USBC Hall of Famer dedicated to faith, family, coaching, and raising the standard of competition.', description: 'Carolyn Dorin-Ballard is a PWBA and USBC Hall of Famer and board member of BowlersNetwork.com. Her career has been defined by championship success, professionalism, and leadership.\n\nGrounded in her faith and family, Carolyn, together with her husband, Del Ballard Jr., operates Ballards Bowling Academy and multiple pro shops. Their work focuses on teaching fundamentals, confidence, and character while growing the game at the grassroots level.', bgClass: 'bg-red-100', position: 'top' },
        { key: 'marshall', src: '/pro_teams/marshall kent pic.webp', name: 'Marshall Kent', title: 'Co-Founder & Board Member', short: 'PBA champion and co-founder bringing the athlete\'s voice into platform leadership and long-term growth.', description: 'Marshall Kent is a world-class professional bowler and co-founder of BowlersNetwork.com. A multiple-time PBA Tour champion and major winner, Marshall brings the athlete\'s perspective directly into the leadership of the platform. His role ensures BowlersNetwork is built by bowlers, for bowlers—creating new opportunities for professionals to build lasting income, visibility, and relevance beyond competition', bgClass: 'bg-blue-100', position: 'top' },
    ];

    const jayFettig = {
        key: 'jay',
        src: '/ceo/jay_fettig.webp',
        name: 'JAY FETTIG',
        title: 'Founder & CEO',
        short: 'Jay Fettig is the Founder and CEO of BowlersNetwork.com and co-founder of JMar Entertainment. A lifelong bowler and entrepreneur, Jay created BowlersNetwork with a singular vision: to unify the bowling industry under one modern digital platform that empowers athletes, strengthens local centers, and delivers measurable value to sponsors and fans.',
        description: 'Jay Fettig is the Founder and CEO of BowlersNetwork.com and co-founder of JMar Entertainment. A lifelong bowler and entrepreneur, Jay created BowlersNetwork with a singular vision: to unify the bowling industry under one modern digital platform that empowers athletes, strengthens local centers, and delivers measurable value to sponsors and fans.\n\nJay’s leadership is driven by faith, family, and purpose. He has been married to his wife, Wendy, for over 30 years and is a proud father and grandfather. Throughout his career, Jay has owned and operated multiple businesses, some highly successful, others that fell short, but each experience reinforced a core belief: when passion drives the mission, the likelihood of success increases dramatically. Today, that philosophy fuels BowlersNetwork, where a team of deeply passionate people is aligned around one common goal growing the sport of bowling the right way, together.',
        bgClass: 'bg-blue-100',
        position: 'top'
    };

    const openModal = (member: BoardMember) => { setSelectedMember(member); setModalOpen(true); };
    const closeModal = () => { setModalOpen(false); setSelectedMember(null); };
    const openBetaModal = () => { setBetaModalOpen(true); };
    const closeBetaModal = () => { setBetaModalOpen(false); };

    const handleProfileClick = () => {
        if (user?.authenticated) {
            router.push('/feedv3');
        } else {
            router.push('/select-your-role');
        }
    };

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                closeModal();
                closeBetaModal();
            }
        }
        if (modalOpen || betaModalOpen) window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [modalOpen, betaModalOpen]);

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation Header */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-[100]">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-6">
                    <div className="flex items-center justify-between w-full">
                        {/* Logo and Brand Name - Desktop and Mobile */}
                        <div className="flex items-center gap-2 md:gap-3">
                            {/* Logo Image */}
                            <Image
                                src="/logo/logo.png"
                                alt="BowlersNetwork Logo"
                                width={40}
                                height={40}
                                className="w-8 h-8 md:w-10 md:h-10"
                                priority
                                unoptimized
                            />
                            {/* Brand Text */}
                            <span className="text-lg md:text-2xl font-black text-gray-900 tracking-tight">
                                BowlersNetwork
                            </span>
                        </div>

                        {/* Mobile Menu Toggle - Positioned right on mobile */}
                        <div className="md:hidden absolute right-4">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="text-gray-900 focus:outline-none"
                            >
                                {isMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
                            </button>
                        </div>

                        {/* Desktop Menu Items */}
                        <div className="hidden md:flex items-center gap-8 ml-auto mr-8">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="text-xs md:text-sm font-semibold text-gray-700 hover:text-[#86D864] transition-colors"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>

                        {/* Desktop Login Button */}
                        <div className="hidden md:flex items-center gap-4">
                            <button
                                onClick={handleProfileClick}
                                className="px-6 py-2 font-bold text-sm text-white rounded-full transition-all hover:shadow-lg"
                                style={{ backgroundColor: '#86D864' }}
                            >
                                LOGIN
                            </button>
                            <Link
                                href="/signup"
                                className="px-6 py-2 font-bold text-sm text-[#86D864] border-2 border-[#86D864] rounded-full transition-all hover:bg-[#86D864] hover:text-white"
                            >
                                SIGN UP
                            </Link>
                        </div>
                    </div>

                    {/* Mobile Menu Content - Expanded */}
                    {isMenuOpen && (
                        <div className="md:hidden mt-8 pb-4 flex flex-col items-center animate-in fade-in slide-in-from-top-5 duration-300">
                            {/* Links in a centered grid-like layout */}
                            <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-4 px-6 mb-6">
                                {menuItems.map((item) => (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="text-[11px] font-bold text-gray-900 hover:text-[#86D864] tracking-widest"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>

                            <div className="flex flex-col gap-3 w-full px-6">
                                <button
                                    onClick={handleProfileClick}
                                    className="w-full px-6 py-2 font-bold text-sm text-white rounded-full transition-all shadow-lg hover:shadow-xl"
                                    style={{ backgroundColor: '#86D864' }}
                                >
                                    LOGIN
                                </button>
                                <Link
                                    href="/signup"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="w-full px-6 py-2 font-bold text-sm text-[#86D864] border-2 border-[#86D864] rounded-full transition-all hover:bg-[#86D864] hover:text-white text-center"
                                >
                                    SIGN UP
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative h-screen flex items-start overflow-hidden">
                {/* Right Side: Image (50% width on desktop, full on mobile) */}
                <div className="absolute right-0 top-0 md:top-0 w-full md:w-1/2 h-full md:h-screen min-h-[620px] opacity-20 md:opacity-100">
                    <Image
                        src="/land2_opt/hero_section.webp"
                        alt="Hero Section Background"
                        fill
                        className="object-cover object-center md:object-right"
                        style={{ objectPosition: 'right 25%' }}
                        unoptimized
                        priority
                        aria-hidden
                    />
                </div>

                {/* Content Container - Overlaps onto image */}
                <div className="relative z-10 w-full px-6 md:px-16 pt-20 md:pt-32 flex flex-col items-start">
                    {/* Main Heading */}
                    <div className="mb-8 md:mb-12">
                        <h1 className="text-4xl md:text-6xl font-black leading-[1.1] mb-0" style={{ color: '#86D864' }}>
                            JOIN THE ULTIMATE
                        </h1>
                        <h2 className="text-5xl md:text-8xl font-black leading-[1.1] text-black">
                            BOWLING
                        </h2>
                        <h2 className="text-5xl md:text-8xl font-black leading-[1.1] text-black">
                            NETWORK
                        </h2>
                    </div>

                    {/* Description Box */}
                    <div className="mb-8 md:mb-10 bg-white/95 backdrop-blur-sm p-5 w-full md:w-fit max-w-md rounded-lg md:rounded-none shadow-sm md:shadow-none">
                        <p className="text-xs font-bold text-gray-800 leading-relaxed uppercase">
                            Connect with bowlers, pros, centers, and shops. Share your passion, improve your game, and access exclusive resources.
                        </p>
                    </div>

                    {/* Register Button */}
                    <Link
                        href="/signup"
                        className="text-white font-black text-xs md:text-sm px-8 md:px-10 py-3 rounded-full transition-all flex items-center gap-2 shadow-md hover:shadow-lg w-full md:w-auto justify-center md:justify-start"
                        style={{ backgroundColor: '#86D864' }}
                    >
                        <span className="w-2.5 h-2.5 bg-white rounded-full"></span>
                        REGISTER NOW
                    </Link>
                </div>
            </section>

            {/* Built for Every Bowler Section */}
            <section className="py-12 md:py-16 px-4 md:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    {/* Section Content */}
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
                        {/* Left: Images Grid */}
                        <div className="flex-1 w-full order-2 md:order-1">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                                {/* Item 1: Amateurs (Row 1 Mobile) */}
                                <div className="row-span-1 order-1">
                                    <div className="rounded-t-2xl overflow-hidden h-48 md:h-64">
                                        <Image
                                            src="/land2_opt/amateurs.webp"
                                            alt="Amateurs"
                                            width={200}
                                            height={260}
                                            unoptimized
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="rounded-b-1xl text-white text-center py-2 font-bold text-xs md:text-sm" style={{ backgroundColor: '#86D864' }}>
                                        Amateurs
                                    </div>
                                </div>

                                {/* Item 4: Centers (Row 1 Mobile) */}
                                <div className="row-span-1 order-2 md:order-3">
                                    <div className="rounded-t-2xl overflow-hidden h-48 md:h-64">
                                        <Image
                                            src="/land2_opt/centers.webp"
                                            alt="Centers"
                                            width={200}
                                            height={260}
                                            unoptimized
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="rounded-b-1xl text-white text-center py-2 font-bold text-xs md:text-sm" style={{ backgroundColor: '#86D864' }}>
                                        Centers
                                    </div>
                                </div>

                                {/* Item 3: Middle Unknown (Row 2 Mobile, Tall in Desktop Center) */}
                                <div className="col-span-2 md:col-span-1 row-span-1 md:row-span-2 order-3 md:order-2">
                                    <div className="rounded-2xl overflow-hidden h-64 md:h-148">
                                        <Image
                                            src="/land2_opt/middle_unknown.webp"
                                            alt="Experience"
                                            width={200}
                                            height={400}
                                            unoptimized
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>

                                {/* Item 2: Pros (Row 3 Mobile) */}
                                <div className="row-span-1 order-4">
                                    <div className="rounded-t-2xl overflow-hidden h-48 md:h-64">
                                        <Image
                                            src="/land2_opt/pros.webp"
                                            alt="Pros"
                                            width={200}
                                            height={260}
                                            unoptimized
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="rounded-b-1xl text-white text-center py-2 font-bold text-xs md:text-sm" style={{ backgroundColor: '#86D864' }}>
                                        Pros
                                    </div>
                                </div>

                                {/* Item 5: Shops (Row 3 Mobile) */}
                                <div className="row-span-1 order-5">
                                    <div className="rounded-t-2xl overflow-hidden h-48 md:h-64">
                                        <Image
                                            src="/land2_opt/shops.webp"
                                            alt="Shops"
                                            width={200}
                                            height={260}
                                            unoptimized
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="rounded-b-1xl text-white text-center py-2 font-bold text-xs md:text-sm" style={{ backgroundColor: '#86D864' }}>
                                        Shops
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Text Content */}
                        <div className="flex-1 flex flex-col justify-start pt-4 w-full text-center md:text-left">
                            <h2 className="text-4xl md:text-6xl font-black leading-tight text-black mb-6 md:mb-8">
                                Built for<br />Every<br />Bowler
                            </h2>
                            <p className="text-sm md:text-base font-semibold text-gray-800 leading-relaxed">
                                Whether you&apos;re rolling your first ball, chasing a pro title, running a center, or stocking the shelves — BowlersNetwork connects the whole bowling world.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* All-in-OneBowling Experience Section */}
            <section id="all-in-one" className="py-12 md:py-20 px-4 md:px-8 bg-white scroll-mt-24">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-3xl md:text-5xl font-black text-black">
                        All-in-One Bowling Experience
                    </h2>
                    <p className="mt-4 text-base md:text-xl text-gray-700 max-w-2xl mx-auto">
                        From casual play to pro competition — every feature you need, in one
                        connected platform.
                    </p>

                    <div className="mt-8 rounded-2xl overflow-hidden mx-auto max-w-5xl">
                        <Image
                            src="/land2_opt/all_in_one.webp"
                            alt="All-in-One Bowling Experience"
                            width={1400}
                            height={600}
                            unoptimized
                            className="w-full h-auto object-cover"
                        />
                    </div>
                </div>
            </section>

            {/* Bowl Collect Compete Section */}
            <section className="py-12 md:py-24 px-4 md:px-8 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    {/* Grid layout: 1 col mobile, 3 cols desktop */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 items-stretch">
                        {/* Left column - 2 boxes */}
                        <div className="flex flex-col gap-6 order-2 md:order-1 h-full">
                            {/* Box 1: Earn and Trade */}
                            <div className="bg-gray-100/60 rounded-3xl p-8 md:p-10 flex flex-col items-start flex-1 min-h-[280px]">
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-auto" style={{ backgroundColor: '#86D864' }}>
                                    <TrendingUp className="w-8 h-8 text-white" />
                                </div>
                                <div className="mt-8">
                                    <p className="text-gray-700 text-lg leading-snug">
                                        <span className="font-black text-gray-950 text-[20px] block md:inline mb-1 md:mb-0 mr-2">Earn and Trade</span>
                                        <span className="text-gray-600 font-medium">Exclusive digital bowling cards</span>
                                    </p>
                                </div>
                            </div>

                            {/* Box 2: Connect */}
                            <div className="bg-gray-100/60 rounded-3xl p-8 md:p-10 flex flex-col items-start flex-1 min-h-[280px]">
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-auto" style={{ backgroundColor: '#86D864' }}>
                                    <LucideLink className="w-8 h-8 text-white" />
                                </div>
                                <div className="mt-8">
                                    <p className="text-gray-700 text-lg leading-snug">
                                        <span className="font-black text-gray-950 text-[20px] block md:inline mb-1 md:mb-0 mr-2">Connect</span>
                                        <span className="text-gray-600 font-medium">and chat with fellow bowlers</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Center column - heading, button, image */}
                        <div className="flex flex-col items-start text-left gap-8 order-1 md:order-2 mb-12 md:mb-0">
                            <h3 className="text-6xl md:text-[50px] font-black leading-tight text-gray-900 tracking-tight">
                                Bowl<br />Collect<br />Compete
                            </h3>
                            <button onClick={openBetaModal} className="inline-flex items-center gap-3 bg-[#86D864] text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl hover:shadow-2xl transition-all uppercase tracking-wider">
                                <span className="w-3 h-3 rounded-full bg-white"></span>
                                EXPLORE THE FEATURES
                            </button>

                            <div className="w-full rounded-3xl overflow-hidden mt-4 relative h-[320px] md:h-full">
                                <Image
                                    src="/land2_opt/15.webp"
                                    alt="Bowling Experience"
                                    width={600}
                                    height={500}
                                    unoptimized
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Right column - 2 boxes */}
                        <div className="flex flex-col gap-6 order-3 md:order-3 h-full">
                            {/* Box 3: Enter */}
                            <div className="bg-gray-100/60 rounded-3xl p-8 md:p-10 flex flex-col items-start flex-1 min-h-[280px]">
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-auto" style={{ backgroundColor: '#86D864' }}>
                                    <Calendar className="w-8 h-8 text-white" />
                                </div>
                                <div className="mt-8">
                                    <p className="text-gray-700 text-lg leading-snug">
                                        <span className="font-black text-gray-950 text-[20px] block md:inline mb-1 md:mb-0 mr-2">Enter</span>
                                        <span className="text-gray-600 font-medium">members-only tournaments and events</span>
                                    </p>
                                </div>
                            </div>

                            {/* Box 4: Track */}
                            <div className="bg-gray-100/60 rounded-3xl p-8 md:p-10 flex flex-col items-start flex-1 min-h-[280px]">
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-auto" style={{ backgroundColor: '#86D864' }}>
                                    <MapPin className="w-8 h-8 text-white" />
                                </div>
                                <div className="mt-8">
                                    <p className="text-gray-700 text-lg leading-snug">
                                        <span className="font-black text-gray-950 text-[20px] block md:inline mb-1 md:mb-0 mr-2">Track</span>
                                        <span className="text-gray-600 font-medium">your stats, milestones, and progress</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Every Bowler Is a Card Section */}
            <section className="relative flex items-center justify-center py-0 px-0 min-h-[520px] bg-transparent overflow-hidden md:overflow-visible">
                {/* Green Card Background */}
                <div className="absolute left-1/2 -translate-x-1/2 top-0 w-full md:w-[90vw] max-w-6xl h-full md:h-[520px] rounded-none md:rounded-3xl overflow-hidden z-0">
                    <Image
                        src="/land2_opt/background_green.webp"
                        alt="Background"
                        unoptimized
                        fill
                        className="object-cover"
                    />
                </div>

                {/* Content Layout */}
                <div className="relative z-10 w-full max-w-6xl flex flex-col md:flex-row items-center justify-between px-6 md:px-12 py-16 md:py-16 gap-8 md:gap-0">
                    {/* Left Side: Text Content */}
                    <div className="flex flex-col items-center md:items-start justify-center w-full md:w-1/2 pl-4 md:pl-12 lg:pl-20 pr-4 md:pr-8 text-center md:text-left">
                        <h2 className="text-4xl md:text-6xl font-medium text-white leading-tight mb-4 tracking-tight">
                            Every Bowler Creates a<br /> Trading Card
                        </h2>
                        <p className="text-sm md:text-base text-white/90 mb-6 leading-relaxed max-w-sm md:max-w-md">
                            Your stats. Your journey. Your legacy — collected, traded, and showcased.
                        </p>
                        <button onClick={openBetaModal} className="inline-flex items-center gap-2 bg-[#A3E635] text-white px-5 py-2.5 rounded-full font-bold text-sm shadow-md hover:bg-[#92d02e] transition-colors uppercase tracking-wide">
                            <span className="w-2.5 h-2.5 rounded-full bg-white"></span>
                            CREATE YOUR CARD &rarr;
                        </button>
                    </div>

                    {/* Right Side: Mobile Mockup Overlapping */}
                    <div className="relative flex items-center justify-center md:justify-end w-full md:w-1/2">
                        <div className="relative md:absolute right-auto md:-right-90 top-auto md:-top-82 w-full md:w-[1220px] pointer-events-none">
                            <Image
                                src="/land2_opt/mobile_phone_mockup.webp"
                                alt="Mobile Phone Mockup"
                                width={1400}
                                height={1400}
                                unoptimized
                                priority
                                className="w-full h-auto drop-shadow-2xl"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Trading Cards For Every Bowler Section */}
            <section className="py-12 md:py-20 px-4 md:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
                        {/* Left Side: Text Content */}
                        <div className="order-2 md:order-1">
                            <h2 className="text-3xl md:text-6xl font-bold text-gray-900 leading-tight mb-6 md:mb-8 text-center md:text-left">
                                Trading Cards For<br />Every Bowler
                            </h2>
                            <p className="text-sm md:text-base text-gray-700 mb-6 leading-relaxed text-center md:text-left">
                                Amateur or professional, your journey lives on a dynamic trading card that evolves with your game.
                            </p>

                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <span className="text-green-600 font-bold text-lg">•</span>
                                    <div>
                                        <span className="font-bold text-gray-900">Dynamic Profiles:</span>
                                        <span className="text-gray-700"> High scores, analytics, levels, points, and followers — updated in real time.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-green-600 font-bold text-lg">•</span>
                                    <div>
                                        <span className="font-bold text-gray-900">Brand Connections:</span>
                                        <span className="text-gray-700"> Favorite brands and gear tied directly to your card.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-green-600 font-bold text-lg">•</span>
                                    <div>
                                        <span className="font-bold text-gray-900">Beyond Following:</span>
                                        <span className="text-gray-700"> Don&apos;t just follow... collect, trade, and showcase cards in the community.</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-green-600 font-bold text-lg">•</span>
                                    <div>
                                        <span className="font-bold text-gray-900">Amateur Spotlight:</span>
                                        <span className="text-gray-700"> Weekend players get the same recognition as the pros.</span>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {/* Right Side: Trading Card Image */}
                        <div className="flex justify-center">
                            <Image
                                src="/land2_opt/trading_card_section.webp"
                                alt="Trading Cards"
                                width={600}
                                height={500}
                                unoptimized
                                className="w-full h-auto"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Beyond the Chatter — Build Your Brand Section */}
            <section id="beyond-the-chatter" className="py-12 md:py-20 px-4 md:px-8 bg-gray-50 scroll-mt-24">
                <div className="max-w-7xl mx-auto text-center">
                    <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
                        Beyond the Chatter — Build Your Brand
                    </h2>
                    <p className="text-base md:text-lg text-gray-700 max-w-3xl mx-auto mb-8 md:mb-12">
                        Turn every game, every fan interaction, and every sponsor connection into lasting value.
                    </p>

                    {/* Center Image */}
                    <div className="mb-12 md:mb-16">
                        <Image
                            src="/land2_opt/beyond_the_chatter_section.webp"
                            alt="Beyond the Chatter"
                            width={1000}
                            height={600}
                            unoptimized
                            className="w-full h-auto mx-auto rounded-2xl"
                        />
                    </div>

                    {/* Feature Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
                        {/* Card 1: Manage Your Pro Profile */}
                        <div className="bg-white rounded-2xl p-6 md:p-8 text-left shadow-sm">
                            <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                Manage Your Profile
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Showcase your story, stats, and highlights.
                            </p>
                        </div>

                        {/* Card 2: Advanced Dashboards */}
                        <div className="bg-white rounded-2xl p-6 md:p-8 text-left shadow-sm">
                            <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                Advanced Dashboards
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Track analytics, audience growth, and performance.
                            </p>
                        </div>

                        {/* Card 3: Fan Challenges */}
                        <div className="bg-white rounded-2xl p-6 md:p-8 text-left shadow-sm">
                            <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                Fan Challenges
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Engage your audience with interactive competitions.
                            </p>
                        </div>

                        {/* Card 4: Global Reach */}
                        <div className="bg-white rounded-2xl p-6 md:p-8 text-left shadow-sm">
                            <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                Global Reach
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Connect with sponsors and fans worldwide.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Smarter Centers Section */}
            <section id="smarter-centers" className="relative py-12 md:py-24 px-4 md:px-8 overflow-hidden rounded-3xl mx-4 md:mx-8 mb-8 md:mb-12 scroll-mt-24">
                {/* Background Image */}
                <div className="absolute inset-0 z-0 rounded-3xl overflow-hidden">
                    <Image
                        src="/land2_opt/smarter_center_section.webp"
                        alt="Bowling Center"
                        unoptimized
                        fill
                        className="object-cover"
                    />
                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-black/30"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-stretch gap-8 md:gap-12">
                        {/* Left Side: Text Content */}
                        <div className="flex-1 flex flex-col justify-center">
                            <p className="text-sm font-bold tracking-widest mb-4" style={{ color: '#86D864' }}>
                                RUN SMARTER. ENGAGE DEEPER.
                            </p>
                            <h2 className="text-4xl md:text-7xl font-black text-white leading-tight mb-8 md:mb-0">
                                Smarter Centers.<br />Stronger Engagement.
                            </h2>
                        </div>

                        {/* Right Side: Text & Buttons */}
                        <div className="flex-1 bg-white rounded-3xl p-6 md:p-10 flex flex-col justify-center shadow-xl">
                            <p className="text-gray-700 text-lg leading-relaxed mb-10">
                                Streamline your center&apos;s operations and elevate the bowler experience with tools built to drive efficiency and growth.
                            </p>

                            <div className="flex flex-col gap-4">
                                <button onClick={openBetaModal} className="px-8 py-4 text-center font-bold text-lg border-2 border-gray-900 text-gray-900 rounded-full hover:bg-gray-50 transition-colors">
                                    JOIN THE NETWORK
                                </button>
                                <button onClick={openBetaModal} className="px-8 py-4 text-center font-bold text-lg text-white rounded-full shadow-lg hover:shadow-xl transition-shadow" style={{ backgroundColor: '#86D864' }}>
                                    <span className="w-3 h-3 rounded-full bg-white inline-block mr-3"></span>
                                    REQUEST A DEMO
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Streamline Section */}
            <section className="py-12 md:py-24 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-16">
                        {/* Left Side: Dashboard Image */}
                        <div className="flex-1 relative w-full">
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                <Image
                                    src="/land2_opt/streamline_section_main.webp"
                                    alt="Streamline Dashboard"
                                    width={800}
                                    unoptimized
                                    height={600}
                                    className="w-full h-auto object-cover"
                                />
                            </div>
                        </div>

                        {/* Right Side: Content */}
                        <div className="flex-1 w-full">
                            <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-8 md:mb-12 text-center lg:text-right">
                                STREAMLINE YOUR CENTER.<br />
                                SUCCEED TOGETHER.
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Left large image */}
                                <div className="relative h-[250px] md:h-[400px] rounded-2xl overflow-hidden shadow-lg">
                                    <Image
                                        src="/land2_opt/smarter_center_section.webp"
                                        alt="Smarter Center"
                                        fill
                                        unoptimized
                                        className="object-cover"
                                    />
                                </div>

                                {/* Right column with 2 images */}
                                <div className="flex flex-col gap-4 h-[250px] md:h-[400px]">
                                    <div className="relative flex-1 rounded-2xl overflow-hidden shadow-lg">
                                        <Image
                                            src="/land2_opt/4.webp"
                                            alt="Feature 1"
                                            fill
                                            unoptimized
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="relative flex-1 rounded-2xl overflow-hidden shadow-lg">
                                        <Image
                                            src="/land2_opt/5.webp"
                                            alt="Feature 2"
                                            unoptimized
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Partnership Section */}
            <section className="py-12 md:py-20 px-4 md:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    {/* Container with Background Image - Top Section */}
                    <div
                        className="relative rounded-3xl overflow-hidden mb-8 min-h-[500px] md:min-h-[600px]"
                        style={{
                            backgroundImage: 'url(/land2_opt/1.webp)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    >
                        {/* Dark Overlay */}
                        <div className="absolute inset-0 bg-black/40"></div>

                        {/* Content Container - Top Section */}
                        <div className="relative z-10 p-6 md:p-12 flex flex-col md:flex-row justify-between items-start gap-8 h-full min-h-[500px] md:min-h-[600px]">
                            {/* Left: Heading Box */}
                            <div className="bg-gradient-to-r from-[#86D864] to-[#7ac85a] rounded-xl p-6 md:p-10 w-full md:max-w-xl md:mt-4 shadow-xl">
                                <h2 className="text-3xl md:text-5xl font-black leading-tight text-white">
                                    Reach Bowlers.<br />
                                    Drive Demand.<br />
                                    Build Partnerships.
                                </h2>
                                <p className="text-white/95 text-sm md:text-base mt-4 font-medium opacity-90">
                                    Showcase your products, run targeted promotions, and connect directly with centers and pros through the BowlersNetwork ecosystem.
                                </p>
                            </div>

                            {/* Right: Feature Products Box - Moved to bottom right */}
                            <div className="bg-gradient-to-r from-[#86D864] to-[#7ac85a] rounded-xl p-6 md:p-8 w-full md:max-w-md md:self-end md:mb-4 shadow-xl">
                                <div className="flex items-start gap-4">
                                    <div className="text-white mt-1">
                                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-white font-black text-lg mb-2">Feature Products</h3>
                                        <p className="text-white/95 text-sm">
                                            Highlight gear and apparel in a curated shopping experience.
                                        </p>
                                        <div className="mt-3 flex gap-1">
                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                            <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section - Form and Image */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-stretch mt-8">
                        {/* Left: Partnership Form */}
                        <div className="flex flex-col">
                            <form className="bg-white rounded-lg p-6 md:p-8 shadow-lg flex-1">
                                <div className="mb-6">
                                    <label className="block text-gray-800 font-bold text-sm mb-2">Name</label>
                                    <input
                                        type="text"
                                        placeholder="Your Name"
                                        className="w-full px-4 py-3 border border-[#86D864] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#86D864] focus:border-transparent placeholder-gray-400"
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="block text-gray-800 font-bold text-sm mb-2">Company Name</label>
                                    <input
                                        type="text"
                                        placeholder="Your Company"
                                        className="w-full px-4 py-3 border border-[#86D864] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#86D864] focus:border-transparent placeholder-gray-400"
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="block text-gray-800 font-bold text-sm mb-2">Email</label>
                                    <input
                                        type="email"
                                        placeholder="you@email.com"
                                        className="w-full px-4 py-3 border border-[#86D864] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#86D864] focus:border-transparent placeholder-gray-400"
                                    />
                                </div>

                                <div className="mb-8">
                                    <label className="block text-gray-800 font-bold text-sm mb-2">Message</label>
                                    <textarea
                                        placeholder="Tell us about your partnership goals"
                                        rows={4}
                                        className="w-full px-4 py-3 border border-[#86D864] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#86D864] focus:border-transparent placeholder-gray-400 resize-none"
                                    ></textarea>
                                </div>

                                <button
                                    type="button"
                                    onClick={openBetaModal}
                                    className="w-full text-white font-black text-sm px-6 py-3 rounded-full transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:scale-105"
                                    style={{ backgroundColor: '#86D864' }}
                                >
                                    <span className="w-2.5 h-2.5 bg-white rounded-full"></span>
                                    PARTNER WITH US
                                </button>
                            </form>
                        </div>

                        {/* Right: Product Mockup Image */}
                        <div className="relative h-[400px] md:h-auto min-h-[400px] overflow-hidden rounded-xl">
                            <Image
                                src="/land2_opt/7.webp"
                                unoptimized
                                alt="Partnership Features"
                                fill
                                className="object-contain w-full h-full"
                                style={{ objectPosition: 'center' }}
                            />
                        </div>
                    </div>
                </div>
            </section>



            {/* Be Seen Where The Bowling World Connects Section */}
            <section
                className="relative py-16 md:py-32 px-4 md:px-8 rounded-3xl mx-4 md:mx-8 mb-8 md:mb-12 overflow-hidden"
                style={{
                    backgroundImage: 'url(/land2_opt/19.webp)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            >
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/40"></div>

                {/* Content */}
                <div className="relative z-10 max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-6xl font-black text-white leading-tight mb-4 md:mb-6">
                        Be Seen Where The Bowling<br />World Connects
                    </h2>
                    <p className="text-lg md:text-xl text-white/95 mb-6 md:mb-8">
                        Engage players, fans, and brands with authentic, community-driven activations.
                    </p>
                    <button onClick={openBetaModal} className="px-8 py-3 bg-[#86D864] text-white font-black rounded-full hover:shadow-lg transition-shadow flex items-center gap-2 mx-auto">
                        <span className="w-2.5 h-2.5 bg-white rounded-full"></span>
                        PARTNER WITH US
                    </button>
                </div>
            </section>

            {/* Why Partner With Us Section */}
            <section className="py-12 md:py-20 px-4 md:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-center">
                        {/* Left: Content */}
                        <div className="md:col-span-5">
                            <h2 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight mb-6">
                                Why Partner With Us?
                            </h2>
                            <p className="text-lg text-gray-700 mb-8">
                                Reach 67M+ bowlers through TV, OTT, podcasts, social, and live events.
                            </p>

                            {/* Features List */}
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <span className="text-[#86D864] font-bold text-xl mt-1">•</span>
                                    <span className="text-gray-700">
                                        Access a massive, loyal audience across digital and physical touchpoints.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-[#86D864] font-bold text-xl mt-1">•</span>
                                    <span className="text-gray-700">
                                        Integrate into broadcasts, podcasts, events, and trading cards.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-[#86D864] font-bold text-xl mt-1">•</span>
                                    <span className="text-gray-700">
                                        Build authentic connections with a community-driven sport.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-[#86D864] font-bold text-xl mt-1">•</span>
                                    <span className="text-gray-700">
                                        Drive measurable ROI with attribution + analytics built in.
                                    </span>
                                </li>
                            </ul>
                        </div>

                        {/* Right: Image */}
                        <div className="md:col-span-7 relative h-[300px] md:h-[470px]">
                            <Image
                                src="/land2_opt/20.webp"
                                unoptimized
                                alt="Analytics Dashboard"
                                fill
                                className="object-contain md:object-cover rounded-2xl"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Driven by Passion Section */}
            <section className="py-12 md:py-20 px-4 md:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                        {/* Left: Image */}
                        <div className="relative h-64 md:h-full min-h-[300px] md:min-h-[500px] rounded-2xl overflow-hidden shadow-lg">
                            <Image
                                src="/land2_opt/22.webp"
                                unoptimized
                                alt="Bowling Center Community"
                                fill
                                className="object-cover"
                            />
                        </div>

                        {/* Right: Content */}
                        <div>
                            {/* Heading */}
                            <h2 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight mb-6">
                                Driven by Passion.<br />Built for Bowlers.
                            </h2>

                            {/* Subheading */}
                            <p className="text-base md:text-lg text-gray-600 mb-8">
                                We&apos;re on a mission to unite the bowling world — from amateurs and pros to centers and brands — through technology, community, and innovation.
                            </p>

                            {/* Mission and Vision Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                {/* Our Mission */}
                                <div className="bg-green-50 rounded-xl p-6">
                                    <h3 className="text-gray-900 font-black text-lg mb-3">Our Mission</h3>
                                    <p className="text-gray-700 text-sm mb-4">
                                        Founded by passionate bowlers, BowlersNetwork began with a simple vision: to transform every lane into a connected experience.
                                    </p>
                                    <a href="#" className="text-[#86D864] font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                                        Read More <span>›</span>
                                    </a>
                                </div>

                                {/* Our Vision */}
                                <div className="bg-blue-50 rounded-xl p-6">
                                    <h3 className="text-gray-900 font-black text-lg mb-3">Our Vision</h3>
                                    <p className="text-gray-700 text-sm mb-4">
                                        Founded by passionate bowlers, BowlersNetwork began with a simple vision: to transform every lane into a connected experience.
                                    </p>
                                    <a href="#" className="text-[#86D864] font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                                        Read More <span>›</span>
                                    </a>
                                </div>
                            </div>

                            {/* Our Story */}
                            <div className="bg-gray-100 rounded-xl p-6">
                                <h3 className="text-gray-900 font-black text-lg mb-3">Our Story</h3>
                                <p className="text-gray-700 text-sm mb-4">
                                    Founded by passionate bowlers, BowlersNetwork began with a simple vision: to transform every lane into a connected experience. What started with a single lane and a big dream has grown into a platform that brings together players, centers, pros, and brands.
                                </p>
                                <a href="#" className="text-[#86D864] font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                                    Read More <span>›</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>



            {/* Contact Section */}
            <section className="bg-gray-100 py-12 md:py-20 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
                        {/* Left: Contact Info */}
                        <div>
                            <h2 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight mb-4">
                                Reach Out Anytime
                            </h2>
                            <p className="text-gray-700 text-lg mb-8 md:mb-12">
                                Our team is here to support, collaborate, and create meaningful connections in the bowling community.
                            </p>

                            {/* Email */}
                            <div className="mb-8">
                                <p className="text-gray-900 font-black text-xs mb-2 tracking-widest">EMAIL</p>
                                <a href="mailto:contact@company.com" className="text-gray-600 hover:text-[#86D864] transition-colors">
                                    info@bowlersnetwork.com
                                </a>
                            </div>

                            {/* Phone */}
                            {/* <div className="mb-8">
                                <p className="text-gray-900 font-black text-xs mb-2 tracking-widest">PHONE</p>
                                <a href="tel:+11234567890" className="text-gray-600 hover:text-[#86D864] transition-colors">
                                    (123) 456-7890
                                </a>
                            </div> */}

                            {/* Address */}
                            {/* <div className="mb-8 md:mb-12">
                                <p className="text-gray-900 font-black text-xs mb-2 tracking-widest">LOCATION</p>
                                <p className="text-gray-600">
                                    Main St & Park Ave<br />
                                    Mansfield, OH 44902
                                </p>
                            </div> */}

                            {/* Map */}
                            {/* <div className="mb-8 md:mb-12 relative h-64 rounded-xl overflow-hidden shadow-inner border-2 border-[#86D864]/20 bg-gray-50">
                                <div id="contact-map" className="w-full h-full" />
                                {!mapLoaded && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                                        <div className="w-8 h-8 border-4 border-[#86D864] border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div> */}

                            {/* Social Links */}
                            <div className="mb-8 md:mb-0">
                                <p className="text-gray-900 font-black text-xs mb-4 tracking-widest">FOLLOW US</p>
                                <div className="flex items-center gap-6">
                                    <a
                                        href="https://www.facebook.com/BowlersNetwork"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-900 hover:text-[#86D864] transition-colors"
                                    >
                                        <Facebook size={24} />
                                    </a>
                                    <a
                                        href="https://www.instagram.com/bowlers_network"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-900 hover:text-[#86D864] transition-colors"
                                    >
                                        <Instagram size={24} />
                                    </a>
                                    <a
                                        href="https://x.com/bowlersnetwork"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-900 hover:text-[#86D864] transition-colors"
                                    >
                                        <Twitter size={24} />
                                    </a>
                                    <a
                                        href="https://youtube.com/@bowlersnetworkinc"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-900 hover:text-[#86D864] transition-colors"
                                    >
                                        <Youtube size={24} />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Right: Contact Form */}
                        <div className="bg-white rounded-2xl p-6 md:p-8">
                            <form className="space-y-6">
                                <div>
                                    <label className="block text-gray-900 font-black text-sm mb-2">Name</label>
                                    <input
                                        type="text"
                                        placeholder="Your Name"
                                        className="w-full px-4 py-3 border-2 border-[#86D864] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#86D864] focus:border-transparent placeholder-gray-400"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-900 font-black text-sm mb-2">Email</label>
                                    <input
                                        type="email"
                                        placeholder="you@email.com"
                                        className="w-full px-4 py-3 border-2 border-[#86D864] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#86D864] focus:border-transparent placeholder-gray-400"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-900 font-black text-sm mb-2">Message</label>
                                    <textarea
                                        placeholder="Tell us about your partnership goals"
                                        rows={5}
                                        className="w-full px-4 py-3 border-2 border-[#86D864] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#86D864] focus:border-transparent placeholder-gray-400 resize-none"
                                    ></textarea>
                                </div>

                                <button
                                    type="button"
                                    onClick={openBetaModal}
                                    className="w-full py-4 bg-[#86D864] text-white font-black rounded-lg hover:shadow-lg transition-shadow"
                                >
                                    SEND MESSAGE
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-300 mt-16 pt-8">
                        <div className="flex items-center justify-between">
                            <p className="text-gray-600 text-sm">
                                @ BowlersNetwork 2025
                            </p>
                            <div className="flex items-center gap-8">
                                <a href="#" className="text-[#86D864] hover:text-[#7ac85a] text-sm font-semibold transition-colors">
                                    Privacy Policy
                                </a>
                                <Link href="/terms-of-service" className="text-[#86D864] hover:text-[#7ac85a] text-sm font-semibold transition-colors">
                                    Terms of Service
                                </Link>
                                <a href="#" className="text-[#86D864] hover:text-[#7ac85a] text-sm font-semibold transition-colors">
                                    Contact
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trusted Partners Section */}
            <section id="trusted-partners" className="py-12 md:py-20 px-4 md:px-8 bg-white scroll-mt-24">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-4">
                            Our Trusted Partners
                        </h2>
                        <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                            Proudly collaborating with leading brands and organizations to grow the bowling community.
                        </p>
                    </div>

                    {/* Partners Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                        {brands.length > 0 ? (
                            brands.map((brand) => (
                                <div key={brand.brand_id} className="bg-gray-50 rounded-2xl p-4 md:p-8 flex items-center justify-center h-20 md:h-24 hover:shadow-lg transition-shadow">
                                    <div className="relative w-full h-full">
                                        <Image
                                            src={brand.logo_url}
                                            alt={brand.name}
                                            fill
                                            className="object-contain"
                                            unoptimized
                                        />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <>
                                {/* Fallback/Loading placeholders */}
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                    <div key={i} className="bg-gray-50 rounded-2xl p-8 flex items-center justify-center h-24 animate-pulse">
                                        <div className="w-24 h-8 bg-gray-200 rounded"></div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* The People Behind The Network Section */}
            <section id="about-us" className="py-12 md:py-20 px-4 md:px-8 bg-white scroll-mt-24">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-4">
                            The People Behind The Network
                        </h2>
                        <p className="text-base md:text-lg text-gray-600">
                            United by our love for bowling, innovation, and connecting players worldwide.
                        </p>
                    </div>

                    {/* Team Member Card */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center max-w-5xl mx-auto">
                        {/* Left: Team Member Image */}
                        <div className="h-[340px] md:h-[420px] flex justify-center md:justify-end">
                            <Image
                                src={jayFettig.src}
                                alt={jayFettig.name}
                                unoptimized
                                width={600}
                                height={800}
                                className="h-full w-auto rounded-2xl object-cover"
                                style={{ objectPosition: jayFettig.position || 'center' }}
                            />
                        </div>

                        {/* Right: Team Member Info */}
                        <div>
                            <h3 className="text-[#86D864] font-black text-4xl md:text-5xl mb-4 leading-tight">{jayFettig.name}</h3>

                            <div className="inline-block bg-[#86D864] text-white font-black px-4 py-1.5 rounded-lg mb-8 text-sm md:text-base">
                                {jayFettig.title}
                            </div>

                            <p className="text-gray-700 leading-relaxed mb-6 text-sm">
                                {jayFettig.short}
                            </p>

                            <a
                                href="#"
                                onClick={(e) => { e.preventDefault(); openModal(jayFettig); }}
                                className="inline-flex items-center gap-2 border-2 border-[#86D864] text-[#86D864] font-bold px-6 py-3 rounded-lg hover:bg-[#86D864] hover:text-white transition-all"
                            >
                                Read More <span>›</span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Board of Directors Section */}
            <section className="py-12 md:py-20 px-4 md:px-8 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start mb-12 md:mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight">
                            Executive Leadership & Board of Directors
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            Executive Leadership represents the operational and fiduciary backbone of BowlersNetwork, balancing innovation, athlete advocacy, and responsible governance.
                        </p>
                    </div>

                    {/* Board Members Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                        {boardMembers.map((member) => (
                            <div key={member.key}>
                                <div className="h-64 flex justify-center mb-4">
                                    <div className="relative h-full">
                                        <Image
                                            src={member.src}
                                            unoptimized
                                            alt={member.name}
                                            width={400}
                                            height={400}
                                            className="h-full w-auto rounded-2xl object-cover"
                                            style={{ objectPosition: member.position || 'center' }}
                                        />
                                    </div>
                                </div>
                                <h3 className="text-gray-900 font-black text-lg mb-2">{member.name}</h3>
                                <div className="mb-3">
                                    <span className="bg-[#86D864] text-white font-black text-xs px-3 py-1 rounded-full">
                                        {member.title}
                                    </span>
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed mb-3">{member.short}</p>
                                <a href="#" onClick={(e) => { e.preventDefault(); openModal(member); }} className="text-[#86D864] font-semibold text-sm hover:underline">
                                    Read More...
                                </a>
                            </div>
                        ))}
                    </div>

                    {/* Modal */}
                    {modalOpen && selectedMember && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 md:p-4">
                            <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={closeModal}></div>
                            <div className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] md:max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                                {/* Close Button - Always on top and fixed */}
                                <button
                                    onClick={closeModal}
                                    className="absolute top-4 right-4 text-gray-500 bg-white/90 backdrop-blur-sm rounded-full p-2.5 shadow-xl hover:bg-white hover:text-gray-900 transition-all z-[210] border border-gray-100"
                                >
                                    <X className="w-6 h-6" />
                                </button>

                                <div className="overflow-y-auto flex-1 h-full scrollbar-hide">
                                    <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                                        <div className="relative h-[450px] md:h-auto bg-gray-100 order-1 md:order-2">
                                            <Image
                                                src={selectedMember.src}
                                                alt={selectedMember.name}
                                                unoptimized
                                                fill
                                                className="object-cover"
                                                style={{ objectPosition: selectedMember.position || 'center' }}
                                                priority
                                            />
                                            {/* Gradient overlay for mobile picture to make close button visible if needed */}
                                            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent md:hidden pointer-events-none"></div>
                                        </div>
                                        <div className="p-6 md:p-12 flex flex-col order-2 md:order-1">
                                            <div className="mb-8">
                                                <h3 className="text-4xl md:text-5xl font-black text-[#86D864] mb-4 leading-tight">{selectedMember.name}</h3>
                                                <div className="inline-block bg-[#86D864] text-white font-black px-5 py-2 rounded-xl text-sm md:text-base shadow-md">
                                                    {selectedMember.title}
                                                </div>
                                            </div>
                                            <div className="prose prose-sm md:prose-base max-w-none">
                                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedMember.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Our People, Our Power Section */}
            <section className="py-12 md:py-20 px-4 md:px-8 bg-white">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-4">
                            Our People, Our Power
                        </h2>
                        <p className="text-base md:text-lg text-gray-600">
                            Dedicated professionals bringing innovation, passion, and teamwork to every roll.
                        </p>
                    </div>

                    {/* Team Members Grid - Asymmetric Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* Left: First team member taking up 2 rows */}
                        <div key={teamMembers[0].src} className="md:row-span-2 rounded-2xl overflow-hidden shadow-lg flex flex-col h-full">
                            <div className="flex-1 h-96 md:h-full flex justify-center bg-gray-100">
                                <Image
                                    src={teamMembers[0].src}
                                    alt={teamMembers[0].name}
                                    width={300}
                                    height={500}
                                    unoptimized
                                    className="h-full w-full object-cover"
                                    style={{ objectPosition: teamMembers[0].position || 'center' }}
                                />
                            </div>
                            <div className="bg-[#86D864] text-white p-5 flex-shrink-0">
                                <h3 className="font-black text-base md:text-lg">{teamMembers[0].name}</h3>
                                <p className="text-xs md:text-sm font-semibold">{teamMembers[0].role ?? 'Team Member'}</p>
                            </div>
                        </div>


                        {/* Right: 3 columns grid for remaining team members */}
                        {teamMembers.slice(1).map((member) => (
                            <div key={member.src} className="rounded-xl overflow-hidden shadow-lg">
                                <div className="h-64 flex justify-center">
                                    <Image
                                        src={member.src}
                                        alt={member.name}
                                        width={400}
                                        height={400}
                                        unoptimized
                                        className="h-full w-auto rounded-xl object-cover"
                                        style={{ objectPosition: member.position || 'center' }}
                                    />
                                </div>
                                <div className="bg-[#86D864] text-white p-4">
                                    <h3 className="font-black text-lg">{member.name}</h3>
                                    <p className="text-sm font-semibold">{member.role ?? 'Team Member'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Beta Popup Modal */}
            {betaModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-md"
                        onClick={closeBetaModal}
                    ></div>
                    <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 md:p-10 animate-in zoom-in-95 duration-200 flex flex-col items-center text-center">
                        {/* Close Button */}
                        <button
                            onClick={closeBetaModal}
                            className="absolute top-4 right-4 text-gray-500 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white hover:text-gray-900 transition-all z-[210] border border-gray-100"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Success Icon */}
                        <div className="mb-6 mt-4">
                            <div className="w-16 h-16 bg-[#86D864]/20 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-[#86D864]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>

                        {/* Message */}
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">
                            Thanks for Your Interest!
                        </h2>

                        <p className="text-gray-700 text-base leading-relaxed mb-8">
                            Thanks for your interest in joining our platform! We&apos;re currently in beta testing and will be opening access to everyone very soon.
                        </p>

                        {/* Action Buttons */}
                        <div className="w-full flex flex-col gap-3">
                            <button
                                onClick={closeBetaModal}
                                className="w-full py-3 bg-[#86D864] text-white font-black rounded-lg hover:shadow-lg transition-shadow"
                            >
                                Got It!
                            </button>
                            <button
                                onClick={closeBetaModal}
                                className="w-full py-3 bg-gray-100 text-gray-900 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
