'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Calendar, Film, Play } from 'lucide-react';

type ShortcutItem = {
    href: string;
    label: string;
    Icon: React.ComponentType<{ className?: string }>;
    exact?: boolean;
    showDot?: boolean;
    tab?: string;
};

const shortcuts: ShortcutItem[] = [
    { href: '/media?tab=videos', label: 'Video', Icon: Play, tab: 'videos' },
    { href: '/media?tab=splits', label: 'Splits', Icon: Film, tab: 'splits' },
    { href: '/events', label: 'Events', Icon: Calendar, showDot: false },
];

const isItemActive = (
    pathname: string,
    href: string,
    exact?: boolean,
    tab?: string,
    activeTab?: string
) => {
    if (tab) {
        return pathname === href.split('?')[0] && activeTab === tab;
    }

    if (exact) {
        return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
};

export default function TopShortcutNav() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const activeTab = searchParams?.get('tab') ?? undefined;

    return (
        <div className="border-b border-gray-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
            <div className="mx-auto flex h-16 max-w-4xl items-center justify-start overflow-x-auto sm:justify-center">
                {shortcuts.map((item) => {
                    const active = isItemActive(pathname, item.href, item.exact, item.tab, activeTab);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={item.label}
                            className="relative flex h-16 min-w-[88px] flex-1 items-center justify-center px-4 sm:min-w-[120px] sm:max-w-[132px]"
                        >
                            <div className="relative">
                                <item.Icon className={`h-5 w-5 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
                                {item.showDot && (
                                    <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border border-white bg-red-500" />
                                )}
                            </div>
                            {active && <span className="absolute bottom-0 left-0 h-1 w-full bg-blue-600" />}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
