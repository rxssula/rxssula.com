export type SpotifyMusicItem = {
    id: string;
    title: string;
    artists: string[];
    album: string;
    imageUrl: string | null;
    spotifyUrl: string;
    durationMs: number;
};

export type RecentlyPlayedItem = SpotifyMusicItem & {
    playedAt: string;
};

export type SpotifyPlayback = {
    configured: true;
    status: "playing" | "paused" | "recent" | "idle";
    isPlaying: boolean;
    progressMs: number;
    fetchedAt: number;
    item: SpotifyMusicItem | null;
    recent: RecentlyPlayedItem[];
};

export type SpotifyPlaybackResponse =
    | SpotifyPlayback
    | {
          configured: false;
          message: string;
      }
    | {
          configured: true;
          error: string;
          reauthorizationRequired?: boolean;
      };

export type SpotifyTimeRange =
    | "short_term"
    | "medium_term"
    | "long_term";

export type SpotifyArtistItem = {
    id: string;
    name: string;
    imageUrl: string | null;
    spotifyUrl: string;
};

export type SpotifyTasteRange = {
    id: SpotifyTimeRange;
    artists: SpotifyArtistItem[];
    tracks: SpotifyMusicItem[];
};

export type ListeningBucket = {
    label: string;
    count: number;
};

export type RecentListeningSummary = {
    sampleSize: number;
    windowStartDateUtc: string | null;
    windowEndDateUtc: string | null;
    timeOfDayUtc: ListeningBucket[];
    daysUtc: ListeningBucket[];
};

export type SpotifyTasteProfile = {
    configured: true;
    fetchedAt: number;
    ranges: SpotifyTasteRange[];
    recentListening: RecentListeningSummary;
};

export type SpotifyTasteResponse =
    | SpotifyTasteProfile
    | {
          configured: false;
          message: string;
      }
    | {
          configured: true;
          error: string;
          reauthorizationRequired?: boolean;
      };
