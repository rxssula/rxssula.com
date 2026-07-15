import type { Metadata } from "next";
import BackButton from "@/components/BackButton";
import SpotifyNowPlaying from "@/components/SpotifyNowPlaying";
import SpotifyTasteProfile from "@/components/SpotifyTasteProfile";

export const metadata: Metadata = {
    title: "Music · rxssula",
    description: "What Rassul is listening to right now and recently played.",
    alternates: { canonical: "/music" },
    openGraph: {
        title: "Music · rxssula",
        description: "What Rassul is listening to right now and recently played.",
        url: "/music",
    },
};

export default function MusicPage() {
    return (
        <main className="pb-10">
            <div className="motion-section mb-6 sm:mb-8">
                <BackButton href="/" label="back" />
            </div>
            <header
                className="motion-section mb-8 sm:mb-10"
                style={{ animationDelay: "45ms" }}
            >
                <h1 className="text-2xl font-semibold sm:text-3xl">Music</h1>
                <p className="mt-3 max-w-xl leading-7 opacity-80 sm:mt-4">
                    A small window into what is in my headphones.
                </p>
            </header>

            <div className="motion-section" style={{ animationDelay: "90ms" }}>
                <SpotifyNowPlaying />
                <SpotifyTasteProfile />
            </div>
        </main>
    );
}
