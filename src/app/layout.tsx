import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: {
        default: "BowlersNetwork",
        template: "%s | BowlersNetwork"
    },
    description: "A platform for bowlers to track their progress and connect with others",
    keywords: ["bowling", "bowlers", "network", "amateur", "professional", "tournaments", "stats", "connect", "social"],
    authors: [{ name: "BowlersNetwork Team" }],
    creator: "BowlersNetwork",
    publisher: "BowlersNetwork",
    metadataBase: new URL('https://bowlersnetwork.com'),
    openGraph: {
        title: "BowlersNetwork",
        description: "A platform for bowlers to track their progress and connect with others",
        url: 'https://bowlersnetwork.com',
        siteName: 'BowlersNetwork',
        images: [
            {
                url: '/logo/logo.png',
                width: 800,
                height: 800,
                alt: 'BowlersNetwork Logo',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'BowlersNetwork',
        description: 'A platform for bowlers to track their progress and connect with others',
        images: ['/logo/logo.png'],
    },
    icons: {
        icon: '/logo/logo.png',
        shortcut: '/logo/logo.png',
        apple: '/logo/logo.png',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <ClientLayout>
                    {children}
                </ClientLayout>
            </body>
        </html>
    );
}
