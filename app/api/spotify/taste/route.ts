import {
    getSpotifyTasteProfile,
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
        const profile = await getSpotifyTasteProfile();

        return Response.json(profile, {
            headers: {
                "Cache-Control":
                    "public, s-maxage=3600, stale-while-revalidate=21600",
            },
        });
    } catch (error) {
        console.error("Unable to load Spotify taste profile", error);

        const reauthorizationRequired = isSpotifyAuthorizationError(error);

        return Response.json(
            {
                configured: true,
                error: reauthorizationRequired
                    ? "Spotify access needs attention. Reauthorize with the latest read-only scopes and check the development-mode account."
                    : "Spotify could not load the listening snapshot.",
                reauthorizationRequired,
            },
            {
                status: reauthorizationRequired ? 503 : 502,
                headers: { "Cache-Control": "no-store" },
            },
        );
    }
}
