import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000");

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: "rxssula",
    alternates: {
        canonical: "/",
    },
    openGraph: {
        title: "rxssula",
        url: "/",
        siteName: "rxssula",
        type: "website",
        images: [
            {
                url: "/og.png",
                width: 1280,
                height: 720,
                alt: "The best engineer",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "rxssula",
        images: ["/og.png"],
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${geistMono.variable} antialiased`}>
            <body className="min-h-screen max-w-3xl mx-auto flex flex-col px-5 sm:px-6 py-6 sm:py-10">
                {children}
                <Analytics />
            </body>
        </html>
    );
}
