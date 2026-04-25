import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "rxssula",
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
