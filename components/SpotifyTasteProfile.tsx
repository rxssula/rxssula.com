"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import SpotifyMark from "@/components/SpotifyMark";
import type {
    ListeningBucket,
    SpotifyArtistItem,
    SpotifyMusicItem,
    SpotifyTasteProfile as TasteProfile,
    SpotifyTasteRange,
    SpotifyTasteResponse,
    SpotifyTimeRange,
} from "@/lib/spotify-types";

const RANGE_OPTIONS: Array<{
    id: SpotifyTimeRange;
    label: string;
    detail: string;
}> = [
    { id: "short_term", label: "~4 weeks", detail: "right now" },
    { id: "medium_term", label: "~6 months", detail: "recent era" },
    { id: "long_term", label: "~1 year", detail: "long view" },
];

type InsightItem = {
    id: string;
    label: string;
    detail: string;
    spotifyUrl: string;
};

type Insight = {
    label: string;
    title: string;
    description: string;
    items: InsightItem[];
};

function toTrackInsight(track: SpotifyMusicItem): InsightItem {
    return {
        id: track.id,
        label: track.title,
        detail: track.artists.join(", "),
        spotifyUrl: track.spotifyUrl,
    };
}

function toArtistInsight(artist: SpotifyArtistItem): InsightItem {
    return {
        id: artist.id,
        label: artist.name,
        detail: "artist",
        spotifyUrl: artist.spotifyUrl,
    };
}

function findRange(
    ranges: SpotifyTasteRange[],
    id: SpotifyTimeRange,
): SpotifyTasteRange {
    return (
        ranges.find((range) => range.id === id) ?? {
            id,
            artists: [],
            tracks: [],
        }
    );
}

function buildInsights(ranges: SpotifyTasteRange[]): Insight[] {
    const short = findRange(ranges, "short_term");
    const medium = findRange(ranges, "medium_term");
    const long = findRange(ranges, "long_term");
    const shortArtistIds = new Set(short.artists.map((artist) => artist.id));
    const mediumArtistIds = new Set(medium.artists.map((artist) => artist.id));
    const longArtistIds = new Set(long.artists.map((artist) => artist.id));
    const threeRangeMainstays = long.artists.filter(
        (artist) =>
            shortArtistIds.has(artist.id) && mediumArtistIds.has(artist.id),
    );
    const mainstays = (
        threeRangeMainstays.length > 0
            ? threeRangeMainstays
            : long.artists.filter((artist) => shortArtistIds.has(artist.id))
    ).slice(0, 3);
    const newInMix = short.artists
        .filter((artist) => !longArtistIds.has(artist.id))
        .slice(0, 3);

    return [
        {
            label: "current favorites",
            title: "At the front of the rotation",
            description:
                "The highest-ranked tracks in Spotify’s short-term affinity window.",
            items: short.tracks.slice(0, 3).map(toTrackInsight),
        },
        {
            label: "long-term mainstays",
            title: "Still holding their place",
            description:
                threeRangeMainstays.length > 0
                    ? "Artists present across all three top-ten affinity sets."
                    : "Artists shared by the short- and long-term top-ten sets.",
            items: mainstays.map(toArtistInsight),
        },
        {
            label: "new in the mix",
            title: "Short-term standouts",
            description:
                "High in the ~4-week set but absent from this ~1-year top ten—an affinity shift, not proof of a first listen.",
            items: newInMix.map(toArtistInsight),
        },
    ];
}

function ArtistRow({ artist, rank }: { artist: SpotifyArtistItem; rank: number }) {
    return (
        <a
            href={artist.spotifyUrl}
            target="_blank"
            rel="noreferrer"
            className="music-ranked-item grid grid-cols-[1.5rem_2.75rem_minmax(0,1fr)] items-center gap-3 rounded-xl p-2"
        >
            <span className="text-right text-[11px] tabular-nums opacity-35">
                {rank.toString().padStart(2, "0")}
            </span>
            <span className="relative aspect-square overflow-hidden rounded-full bg-black/5 dark:bg-white/5">
                {artist.imageUrl ? (
                    <Image
                        src={artist.imageUrl}
                        alt=""
                        fill
                        sizes="44px"
                        className="object-cover"
                    />
                ) : (
                    <span className="flex h-full items-center justify-center opacity-35">
                        ♪
                    </span>
                )}
            </span>
            <span className="min-w-0 truncate text-sm font-medium">
                {artist.name}
            </span>
        </a>
    );
}

function TrackRow({ track, rank }: { track: SpotifyMusicItem; rank: number }) {
    return (
        <a
            href={track.spotifyUrl}
            target="_blank"
            rel="noreferrer"
            className="music-ranked-item grid grid-cols-[1.5rem_2.75rem_minmax(0,1fr)] items-center gap-3 rounded-xl p-2"
        >
            <span className="text-right text-[11px] tabular-nums opacity-35">
                {rank.toString().padStart(2, "0")}
            </span>
            <span className="relative aspect-square overflow-hidden rounded-lg bg-black/5 dark:bg-white/5">
                {track.imageUrl ? (
                    <Image
                        src={track.imageUrl}
                        alt=""
                        fill
                        sizes="44px"
                        className="object-cover"
                    />
                ) : (
                    <span className="flex h-full items-center justify-center opacity-35">
                        ♪
                    </span>
                )}
            </span>
            <span className="min-w-0">
                <span className="block truncate text-sm font-medium">
                    {track.title}
                </span>
                <span className="mt-1 block truncate text-[11px] opacity-45">
                    {track.artists.join(", ")}
                </span>
            </span>
        </a>
    );
}

function TimeMachine({ profile }: { profile: TasteProfile }) {
    const [selectedRange, setSelectedRange] =
        useState<SpotifyTimeRange>("short_term");
    const range = findRange(profile.ranges, selectedRange);

    return (
        <section className="mt-14 sm:mt-18" aria-labelledby="taste-time-machine">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-xs text-[#f54703]">taste time machine</p>
                    <h2
                        id="taste-time-machine"
                        className="mt-2 text-xl font-semibold sm:text-2xl"
                    >
                        Three versions of the rotation
                    </h2>
                    <p className="mt-3 max-w-xl text-sm leading-6 opacity-60">
                        Spotify ranks affinity over approximate windows. These are
                        preference rankings, not play counts.
                    </p>
                </div>

                <fieldset className="shrink-0">
                    <legend className="sr-only">Choose a taste time range</legend>
                    <div className="music-range-control grid grid-cols-3 rounded-xl border border-black/10 p-1 dark:border-white/10">
                        {RANGE_OPTIONS.map((option) => {
                            const selected = option.id === selectedRange;

                            return (
                                <button
                                    key={option.id}
                                    type="button"
                                    aria-pressed={selected}
                                    aria-controls="taste-range-results"
                                    onClick={() => setSelectedRange(option.id)}
                                    className={`music-range-option min-w-0 rounded-lg px-3 py-2 text-left ${selected ? "is-selected" : ""}`}
                                >
                                    <span className="block whitespace-nowrap text-xs font-semibold">
                                        {option.label}
                                    </span>
                                    <span className="mt-0.5 hidden text-[10px] opacity-55 sm:block">
                                        {option.detail}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </fieldset>
            </div>

            <div
                id="taste-range-results"
                key={range.id}
                className="music-range-results mt-7 grid gap-6 md:grid-cols-2 md:gap-8"
                aria-live="polite"
            >
                <div>
                    <div className="mb-2 flex items-center justify-between px-2">
                        <h3 className="text-xs font-semibold">top artists</h3>
                        <span className="text-[10px] opacity-35">affinity rank</span>
                    </div>
                    <div className="space-y-1">
                        {range.artists.slice(0, 6).map((artist, index) => (
                            <ArtistRow
                                key={artist.id}
                                artist={artist}
                                rank={index + 1}
                            />
                        ))}
                    </div>
                </div>

                <div>
                    <div className="mb-2 flex items-center justify-between px-2">
                        <h3 className="text-xs font-semibold">top tracks</h3>
                        <span className="text-[10px] opacity-35">affinity rank</span>
                    </div>
                    <div className="space-y-1">
                        {range.tracks.slice(0, 6).map((track, index) => (
                            <TrackRow
                                key={track.id}
                                track={track}
                                rank={index + 1}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function ListeningRecap({ profile }: { profile: TasteProfile }) {
    const insights = useMemo(
        () => buildInsights(profile.ranges),
        [profile.ranges],
    );

    return (
        <section className="mt-14 sm:mt-18" aria-labelledby="listening-recap">
            <p className="text-xs text-[#f54703]">listening recap</p>
            <h2
                id="listening-recap"
                className="mt-2 text-xl font-semibold sm:text-2xl"
            >
                What changed, what stayed
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 opacity-60">
                Comparisons across Spotify’s calculated affinity sets—useful
                signals without pretending they are exact listening statistics.
            </p>

            <div className="mt-7 grid gap-3 lg:grid-cols-3">
                {insights.map((insight) => (
                    <article
                        key={insight.label}
                        className="music-insight-card rounded-2xl border border-black/10 p-5 dark:border-white/10"
                    >
                        <p className="text-[10px] text-[#f54703]">
                            {insight.label}
                        </p>
                        <h3 className="mt-3 text-sm font-semibold leading-5">
                            {insight.title}
                        </h3>
                        <p className="mt-2 text-xs leading-5 opacity-55">
                            {insight.description}
                        </p>
                        {insight.items.length > 0 ? (
                            <ol className="mt-5 space-y-3">
                                {insight.items.map((item, index) => (
                                    <li key={item.id} className="flex min-w-0 gap-3">
                                        <span className="pt-0.5 text-[10px] tabular-nums opacity-30">
                                            {(index + 1).toString().padStart(2, "0")}
                                        </span>
                                        <a
                                            href={item.spotifyUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="music-text-link min-w-0"
                                        >
                                            <span className="block truncate text-xs font-medium">
                                                {item.label}
                                            </span>
                                            <span className="mt-1 block truncate text-[10px] opacity-40">
                                                {item.detail}
                                            </span>
                                        </a>
                                    </li>
                                ))}
                            </ol>
                        ) : (
                            <p className="mt-5 text-xs opacity-35">
                                No clear overlap in this snapshot.
                            </p>
                        )}
                    </article>
                ))}
            </div>
        </section>
    );
}

function BarChart({
    buckets,
    formatLabel,
    label,
}: {
    buckets: ListeningBucket[];
    formatLabel?: (label: string) => string;
    label: string;
}) {
    const maximum = Math.max(...buckets.map((bucket) => bucket.count), 1);

    return (
        <div
            className="music-bars flex h-36 min-w-max items-end gap-1.5"
            role="img"
            aria-label={label}
        >
            {buckets.map((bucket) => (
                <div
                    key={bucket.label}
                    className="flex w-8 flex-col items-center justify-end gap-2"
                    aria-label={`${formatLabel?.(bucket.label) ?? bucket.label}: ${bucket.count} plays in this sample`}
                >
                    <span className="text-[9px] tabular-nums opacity-40">
                        {bucket.count || ""}
                    </span>
                    <span
                        className="music-bar block w-full rounded-md bg-[#f54703]"
                        style={{
                            height: `${Math.max(4, (bucket.count / maximum) * 88)}px`,
                            opacity: bucket.count === 0 ? 0.16 : 0.88,
                        }}
                    />
                    <span className="whitespace-nowrap text-[9px] opacity-40">
                        {formatLabel?.(bucket.label) ?? bucket.label}
                    </span>
                </div>
            ))}
        </div>
    );
}

function formatUtcDate(value: string) {
    return new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
    }).format(new Date(`${value}T00:00:00Z`));
}

function formatWindowDate(value: string | null) {
    if (!value) return null;

    return new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
    }).format(new Date(`${value}T00:00:00Z`));
}

function RecentRhythm({ profile }: { profile: TasteProfile }) {
    const summary = profile.recentListening;
    const start = formatWindowDate(summary.windowStartDateUtc);
    const end = formatWindowDate(summary.windowEndDateUtc);
    const windowLabel = start && end ? `${start}–${end} UTC` : "recent UTC window";

    if (summary.sampleSize === 0) return null;

    return (
        <section className="mt-14 sm:mt-18" aria-labelledby="recent-rhythm">
            <div className="music-panel rounded-2xl border border-black/10 p-5 sm:p-7 dark:border-white/10">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <p className="text-xs text-[#f54703]">recent rhythm</p>
                        <h2
                            id="recent-rhythm"
                            className="mt-2 text-xl font-semibold sm:text-2xl"
                        >
                            When the headphones were on
                        </h2>
                        <p className="mt-3 max-w-xl text-xs leading-5 opacity-55">
                            Aggregated from Spotify’s latest {summary.sampleSize} plays
                            ({windowLabel}). Bars are plays in this rolling sample, not
                            totals or listening time. This chart receives only grouped
                            counts and UTC date bounds.
                        </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-black/5 px-3 py-2 text-[10px] opacity-50 dark:bg-white/5">
                        grouped in UTC
                    </span>
                </div>

                <div className="mt-8 grid gap-8 lg:grid-cols-2">
                    <figure className="min-w-0">
                        <figcaption className="mb-4 text-xs font-semibold">
                            time of day
                        </figcaption>
                        <div className="overflow-x-auto pb-2">
                            <BarChart
                                buckets={summary.timeOfDayUtc}
                                label="Recent plays grouped into three-hour UTC windows"
                            />
                        </div>
                    </figure>

                    <figure className="min-w-0">
                        <figcaption className="mb-4 text-xs font-semibold">
                            days in the sample
                        </figcaption>
                        <div className="overflow-x-auto pb-2">
                            <BarChart
                                buckets={summary.daysUtc}
                                formatLabel={formatUtcDate}
                                label="Recent plays grouped by UTC date"
                            />
                        </div>
                    </figure>
                </div>
            </div>
        </section>
    );
}

function TasteLoading() {
    return (
        <div
            className="mt-14 rounded-2xl border border-black/10 p-5 sm:p-7 dark:border-white/10"
            aria-label="Loading Spotify taste profile"
            aria-busy="true"
        >
            <div className="animate-pulse">
                <div className="h-3 w-28 rounded-full bg-black/10 dark:bg-white/10" />
                <div className="mt-4 h-6 w-3/5 rounded-full bg-black/10 dark:bg-white/10" />
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    {[0, 1, 2].map((item) => (
                        <div
                            key={item}
                            className="h-32 rounded-xl bg-black/5 dark:bg-white/5"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function SpotifyTasteProfile() {
    const [response, setResponse] = useState<SpotifyTasteResponse | null>(null);

    useEffect(() => {
        let active = true;

        async function loadTasteProfile() {
            try {
                const result = await fetch("/api/spotify/taste");
                const data = (await result.json()) as SpotifyTasteResponse;
                if (active) setResponse(data);
            } catch {
                if (active) {
                    setResponse({
                        configured: true,
                        error: "Spotify could not load the listening snapshot.",
                    });
                }
            }
        }

        void loadTasteProfile();

        return () => {
            active = false;
        };
    }, []);

    if (!response) return <TasteLoading />;

    if (!response.configured) return null;

    if ("error" in response) {
        return (
            <div className="mt-14 rounded-2xl border border-black/10 p-6 text-center dark:border-white/10">
                <p className="text-xs text-[#f54703]">taste snapshot unavailable</p>
                <p className="mt-3 text-sm opacity-65">{response.error}</p>
            </div>
        );
    }

    return (
        <div>
            <TimeMachine profile={response} />
            <ListeningRecap profile={response} />
            <RecentRhythm profile={response} />
            <p className="mt-8 flex items-center justify-end gap-2 text-[10px] opacity-35">
                <SpotifyMark className="h-3.5 w-3.5" />
                affinity rankings and listening history provided by Spotify
            </p>
        </div>
    );
}
