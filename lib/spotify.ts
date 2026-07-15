import "server-only";

import type {
    RecentlyPlayedItem,
    RecentListeningSummary,
    SpotifyArtistItem,
    SpotifyMusicItem,
    SpotifyPlayback,
    SpotifyTasteProfile,
    SpotifyTasteRange,
    SpotifyTimeRange,
} from "@/lib/spotify-types";

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const API_BASE_URL = "https://api.spotify.com/v1";
const PLAYBACK_FRESH_MS = 12_000;
const PLAYBACK_STALE_MS = 2 * 60_000;
const TASTE_FRESH_MS = 60 * 60_000;
const TASTE_STALE_MS = 24 * 60 * 60_000;
const FETCH_TIMEOUT_MS = 10_000;

type SpotifyImage = {
    url: string;
};

type SpotifyTrack = {
    id: string | null;
    name: string;
    duration_ms: number;
    type?: string;
    artists: Array<{ name: string }>;
    album?: {
        name: string;
        images: SpotifyImage[];
    };
    external_urls: {
        spotify?: string;
    };
};

type SpotifyArtist = {
    id: string;
    name: string;
    images: SpotifyImage[];
    external_urls: {
        spotify?: string;
    };
};

type CurrentlyPlayingResponse = {
    is_playing: boolean;
    progress_ms: number | null;
    item: SpotifyTrack | null;
};

type RecentlyPlayedResponse = {
    items: Array<{
        played_at: string;
        track: SpotifyTrack;
    }>;
};

type TopItemsResponse<T> = {
    items: T[];
};

type AccessTokenResponse = {
    access_token: string;
    expires_in: number;
    refresh_token?: string;
};

type SpotifyErrorResponse = {
    error?: string | { status?: number; message?: string };
    error_description?: string;
};

type SharedCache<T> = {
    value: T;
    freshUntil: number;
    staleUntil: number;
};

export class SpotifyReauthorizationError extends Error {
    constructor() {
        super("Spotify must be reauthorized.");
        this.name = "SpotifyReauthorizationError";
    }
}

export class SpotifyAccessError extends Error {
    constructor() {
        super("Spotify access was denied.");
        this.name = "SpotifyAccessError";
    }
}

export function isSpotifyAuthorizationError(error: unknown) {
    return (
        error instanceof SpotifyReauthorizationError ||
        error instanceof SpotifyAccessError
    );
}

let accessToken: { value: string; expiresAt: number } | null = null;
let tokenRefresh: Promise<string> | null = null;
let activeRefreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
let reauthorizationRequired = false;
let rateLimitedUntil = 0;
let playbackCache: SharedCache<SpotifyPlayback> | null = null;
let playbackRequest: Promise<SpotifyPlayback> | null = null;
let tasteCache: SharedCache<SpotifyTasteProfile> | null = null;
let tasteRequest: Promise<SpotifyTasteProfile> | null = null;

export function isSpotifyConfigured() {
    return Boolean(
        process.env.SPOTIFY_CLIENT_ID &&
            process.env.SPOTIFY_CLIENT_SECRET &&
            activeRefreshToken,
    );
}

async function readJson<T>(response: Response): Promise<T> {
    return (await response.json()) as T;
}

async function fetchWithTimeout(input: string | URL, init?: RequestInit) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
        return await fetch(input, { ...init, signal: controller.signal });
    } finally {
        clearTimeout(timeout);
    }
}

async function refreshAccessToken() {
    if (reauthorizationRequired) {
        throw new SpotifyReauthorizationError();
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret || !activeRefreshToken) {
        throw new Error("Spotify credentials are not configured.");
    }

    const response = await fetchWithTimeout(TOKEN_ENDPOINT, {
        method: "POST",
        headers: {
            Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: activeRefreshToken,
        }),
        cache: "no-store",
    });

    if (!response.ok) {
        const error: SpotifyErrorResponse = await readJson<SpotifyErrorResponse>(
            response,
        ).catch(() => ({}));

        if (response.status === 400 && error.error === "invalid_grant") {
            reauthorizationRequired = true;
            accessToken = null;
            throw new SpotifyReauthorizationError();
        }

        throw new Error(`Spotify token refresh failed (${response.status}).`);
    }

    const token = await readJson<AccessTokenResponse>(response);

    if (token.refresh_token) {
        activeRefreshToken = token.refresh_token;
    }

    accessToken = {
        value: token.access_token,
        expiresAt: Date.now() + token.expires_in * 1_000,
    };

    return token.access_token;
}

async function getAccessToken() {
    if (accessToken && accessToken.expiresAt > Date.now() + 30_000) {
        return accessToken.value;
    }

    if (!tokenRefresh) {
        tokenRefresh = refreshAccessToken().finally(() => {
            tokenRefresh = null;
        });
    }

    return tokenRefresh;
}

function noteRateLimit(response: Response) {
    const retryAfter = Number(response.headers.get("Retry-After") ?? "30");
    const retryAfterMs = Number.isFinite(retryAfter)
        ? Math.max(1, Math.min(retryAfter, 3_600)) * 1_000
        : 30_000;

    rateLimitedUntil = Math.max(rateLimitedUntil, Date.now() + retryAfterMs);
}

async function spotifyFetch(path: string, retryUnauthorized = true) {
    if (Date.now() < rateLimitedUntil) {
        throw new Error("Spotify rate limit is cooling down.");
    }

    const token = await getAccessToken();
    const response = await fetchWithTimeout(`${API_BASE_URL}${path}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
    });

    if (response.status === 429) {
        noteRateLimit(response);
    }

    if (response.status === 401 && retryUnauthorized) {
        accessToken = null;
        return spotifyFetch(path, false);
    }

    return response;
}

async function spotifyJson<T>(path: string, requestName: string) {
    const response = await spotifyFetch(path);

    if (response.status === 403) {
        throw new SpotifyAccessError();
    }

    if (!response.ok) {
        throw new Error(`${requestName} failed (${response.status}).`);
    }

    return readJson<T>(response);
}

function toMusicItem(track: SpotifyTrack): SpotifyMusicItem | null {
    const spotifyUrl = track.external_urls.spotify;

    if (
        !track.id ||
        !spotifyUrl ||
        !track.album ||
        (track.type && track.type !== "track")
    ) {
        return null;
    }

    return {
        id: track.id,
        title: track.name,
        artists: track.artists.map((artist) => artist.name),
        album: track.album.name,
        imageUrl: track.album.images[0]?.url ?? null,
        spotifyUrl,
        durationMs: track.duration_ms,
    };
}

function toArtistItem(artist: SpotifyArtist): SpotifyArtistItem | null {
    const spotifyUrl = artist.external_urls.spotify;

    if (!spotifyUrl) return null;

    return {
        id: artist.id,
        name: artist.name,
        imageUrl: artist.images[0]?.url ?? null,
        spotifyUrl,
    };
}

async function getCurrentlyPlaying() {
    const response = await spotifyFetch("/me/player/currently-playing");

    if (response.status === 204) {
        return null;
    }

    if (response.status === 403) {
        throw new SpotifyAccessError();
    }

    if (!response.ok) {
        throw new Error(
            `Spotify currently-playing request failed (${response.status}).`,
        );
    }

    return readJson<CurrentlyPlayingResponse>(response);
}

async function getRecentlyPlayed(limit: number) {
    const data = await spotifyJson<RecentlyPlayedResponse>(
        `/me/player/recently-played?limit=${limit}`,
        "Spotify recently-played request",
    );

    return data.items.flatMap(({ track, played_at }) => {
        const item = toMusicItem(track);

        return item ? [{ ...item, playedAt: played_at }] : [];
    });
}

async function loadPlayback(): Promise<SpotifyPlayback> {
    const [playback, recentlyPlayed] = await Promise.all([
        getCurrentlyPlaying(),
        getRecentlyPlayed(6),
    ]);
    const item = playback?.item ? toMusicItem(playback.item) : null;
    const recent = recentlyPlayed
        .filter((track, index, tracks) => {
            if (track.id === item?.id) return false;
            return tracks.findIndex((candidate) => candidate.id === track.id) === index;
        })
        .slice(0, 5);

    return {
        configured: true,
        status: item
            ? playback?.is_playing
                ? "playing"
                : "paused"
            : recentlyPlayed[0]
              ? "recent"
              : "idle",
        isPlaying: item ? (playback?.is_playing ?? false) : false,
        progressMs: item ? (playback?.progress_ms ?? 0) : 0,
        fetchedAt: Date.now(),
        item: item ?? recentlyPlayed[0] ?? null,
        recent,
    };
}

async function getTopRange(range: SpotifyTimeRange): Promise<SpotifyTasteRange> {
    const query = `time_range=${range}&limit=10`;
    const [artistData, trackData] = await Promise.all([
        spotifyJson<TopItemsResponse<SpotifyArtist>>(
            `/me/top/artists?${query}`,
            `Spotify ${range} top-artists request`,
        ),
        spotifyJson<TopItemsResponse<SpotifyTrack>>(
            `/me/top/tracks?${query}`,
            `Spotify ${range} top-tracks request`,
        ),
    ]);

    return {
        id: range,
        artists: artistData.items.flatMap((artist) => {
            const item = toArtistItem(artist);
            return item ? [item] : [];
        }),
        tracks: trackData.items.flatMap((track) => {
            const item = toMusicItem(track);
            return item ? [item] : [];
        }),
    };
}

function summarizeRecentListening(
    items: RecentlyPlayedItem[],
): RecentListeningSummary {
    const timeBuckets = [
        "00–02",
        "03–05",
        "06–08",
        "09–11",
        "12–14",
        "15–17",
        "18–20",
        "21–23",
    ].map((label) => ({ label, count: 0 }));
    const days = new Map<string, number>();

    for (const item of items) {
        const playedAt = new Date(item.playedAt);

        if (Number.isNaN(playedAt.getTime())) continue;

        timeBuckets[Math.floor(playedAt.getUTCHours() / 3)].count += 1;
        const date = playedAt.toISOString().slice(0, 10);
        days.set(date, (days.get(date) ?? 0) + 1);
    }

    return {
        sampleSize: items.length,
        windowStartDateUtc: items.at(-1)?.playedAt.slice(0, 10) ?? null,
        windowEndDateUtc: items[0]?.playedAt.slice(0, 10) ?? null,
        timeOfDayUtc: timeBuckets,
        daysUtc: Array.from(days, ([label, count]) => ({ label, count })).sort(
            (a, b) => a.label.localeCompare(b.label),
        ),
    };
}

async function loadTasteProfile(): Promise<SpotifyTasteProfile> {
    const ranges: SpotifyTimeRange[] = [
        "short_term",
        "medium_term",
        "long_term",
    ];
    const [topRanges, recentlyPlayed] = await Promise.all([
        Promise.all(ranges.map(getTopRange)),
        getRecentlyPlayed(50),
    ]);

    return {
        configured: true,
        fetchedAt: Date.now(),
        ranges: topRanges,
        recentListening: summarizeRecentListening(recentlyPlayed),
    };
}

async function getSharedValue<T>(
    cache: SharedCache<T> | null,
    inFlight: Promise<T> | null,
    load: () => Promise<T>,
    freshFor: number,
    staleFor: number,
    updateCache: (value: SharedCache<T>) => void,
    updateRequest: (value: Promise<T> | null) => void,
) {
    const now = Date.now();

    if (cache && cache.freshUntil > now) return cache.value;
    if (inFlight) return inFlight;

    const request = load()
        .then((value) => {
            const loadedAt = Date.now();
            updateCache({
                value,
                freshUntil: loadedAt + freshFor,
                staleUntil: loadedAt + staleFor,
            });
            return value;
        })
        .catch((error: unknown) => {
            if (isSpotifyAuthorizationError(error)) throw error;
            if (cache && cache.staleUntil > Date.now()) return cache.value;
            throw error;
        })
        .finally(() => updateRequest(null));

    updateRequest(request);
    return request;
}

export async function getSpotifyPlayback() {
    return getSharedValue(
        playbackCache,
        playbackRequest,
        loadPlayback,
        PLAYBACK_FRESH_MS,
        PLAYBACK_STALE_MS,
        (value) => {
            playbackCache = value;
        },
        (value) => {
            playbackRequest = value;
        },
    );
}

export async function getSpotifyTasteProfile() {
    return getSharedValue(
        tasteCache,
        tasteRequest,
        loadTasteProfile,
        TASTE_FRESH_MS,
        TASTE_STALE_MS,
        (value) => {
            tasteCache = value;
        },
        (value) => {
            tasteRequest = value;
        },
    );
}
