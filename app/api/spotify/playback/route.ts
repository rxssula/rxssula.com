import {
    getSpotifyPlayback,
    isSpotifyAuthorizationError,
    isSpotifyConfigured,
} from "@/lib/spotify";

export const runtime = "nodejs";

export async function GET() {
    if (!isSpotifyConfigured()) {
        return Response.json(
            {
                configured: false,
                message: "Spotify is not connected yet.",
            },
            {
                status: 503,
                headers: { "Cache-Control": "no-store" },
            },
        );
    }

    try {
        const playback = await getSpotifyPlayback();

        return Response.json(playback, {
            headers: {
                "Cache-Control":
                    "public, s-maxage=15, stale-while-revalidate=30",
            },
        });
    } catch (error) {
        console.error("Unable to load Spotify playback", error);

        const reauthorizationRequired = isSpotifyAuthorizationError(error);

        return Response.json(
            {
                configured: true,
                error: reauthorizationRequired
                    ? "Spotify access needs attention. Reconnect it with the current read-only scopes."
                    : "Spotify is taking a short intermission.",
                reauthorizationRequired,
            },
            {
                status: reauthorizationRequired ? 503 : 502,
                headers: { "Cache-Control": "no-store" },
            },
        );
    }
}
