"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import SpotifyMark from "@/components/SpotifyMark";
import type {
    RecentlyPlayedItem,
    SpotifyPlayback,
    SpotifyPlaybackResponse,
} from "@/lib/spotify-types";

const REFRESH_INTERVAL_MS = 30_000;
const REQUEST_TIMEOUT_MS = 10_000;

function formatTime(milliseconds: number) {
    const totalSeconds = Math.max(0, Math.floor(milliseconds / 1_000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function relativeTime(date: string, now: number) {
    const deltaSeconds = Math.round((new Date(date).getTime() - now) / 1_000);
    const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

    if (Math.abs(deltaSeconds) < 60) return formatter.format(deltaSeconds, "second");

    const deltaMinutes = Math.round(deltaSeconds / 60);
    if (Math.abs(deltaMinutes) < 60) return formatter.format(deltaMinutes, "minute");

    const deltaHours = Math.round(deltaMinutes / 60);
    if (Math.abs(deltaHours) < 24) return formatter.format(deltaHours, "hour");

    return formatter.format(Math.round(deltaHours / 24), "day");
}

function SpotifyLink({ href }: { href: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="music-spotify-link inline-flex items-center gap-2 rounded-full bg-[#1ed760] px-3 py-2 text-xs font-semibold text-black"
        >
            <SpotifyMark className="h-4 w-4" />
            open in Spotify
        </a>
    );
}

function PlaybackCard({ playback, now }: { playback: SpotifyPlayback; now: number }) {
    const { item } = playback;
    const elapsedSinceFetch = playback.isPlaying
        ? Math.max(0, now - playback.fetchedAt)
        : 0;
    const progress = item
        ? Math.min(playback.progressMs + elapsedSinceFetch, item.durationMs)
        : 0;
    const progressPercentage = item?.durationMs
        ? Math.min(100, (progress / item.durationMs) * 100)
        : 0;
    const statusLabel = {
        playing: "listening now",
        paused: "paused",
        recent: "last played",
        idle: "nothing playing",
    }[playback.status];

    if (!item) {
        return (
            <section className="music-panel flex min-h-64 items-center justify-center rounded-2xl border border-black/10 p-8 text-center dark:border-white/10">
                <div>
                    <p className="text-sm opacity-55">nothing playing right now</p>
                    <p className="mt-2 max-w-sm leading-7 opacity-80">
                        The headphones are having a quiet moment. Check back soon.
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="music-panel relative overflow-hidden rounded-2xl border border-black/10 p-4 sm:p-6 dark:border-white/10">
            <div className="relative grid gap-5 sm:grid-cols-[11rem_minmax(0,1fr)] sm:items-center sm:gap-7">
                <a
                    href={item.spotifyUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open ${item.title} by ${item.artists.join(", ")} in Spotify`}
                    className="music-cover relative aspect-square w-full max-w-64 overflow-hidden rounded-xl bg-black/5 shadow-[0_18px_50px_rgba(0,0,0,0.16)] sm:max-w-none dark:bg-white/5"
                >
                    {item.imageUrl ? (
                        <Image
                            src={item.imageUrl}
                            alt={`${item.album} cover`}
                            fill
                            priority
                            sizes="(max-width: 640px) 256px, 176px"
                            className="object-cover"
                        />
                    ) : (
                        <span className="flex h-full items-center justify-center text-5xl opacity-35">
                            ♪
                        </span>
                    )}
                </a>

                <div className="min-w-0">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                        <p className="flex items-center gap-2 text-xs opacity-65">
                            <span
                                className={`h-2 w-2 rounded-full ${playback.isPlaying ? "bg-[#1ed760]" : "bg-[#f54703]"}`}
                            />
                            {statusLabel}
                        </p>
                        <SpotifyLink href={item.spotifyUrl} />
                    </div>

                    <h2 className="truncate text-xl font-semibold sm:text-2xl">
                        {item.title}
                    </h2>
                    <p className="mt-2 truncate text-sm opacity-75 sm:text-base">
                        {item.artists.join(", ")}
                    </p>
                    <p className="mt-1 truncate text-xs opacity-45">{item.album}</p>

                    {playback.status !== "recent" && (
                        <div className="mt-6">
                            <div className="h-1 overflow-hidden rounded-full bg-black/10 dark:bg-white/15">
                                <div
                                    className="music-progress h-full origin-left rounded-full bg-[#f54703]"
                                    style={{ transform: `scaleX(${progressPercentage / 100})` }}
                                />
                            </div>
                            <div className="mt-2 flex justify-between text-[11px] opacity-45">
                                <span>{formatTime(progress)}</span>
                                <span>{formatTime(item.durationMs)}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

function RecentTrack({ track, now }: { track: RecentlyPlayedItem; now: number }) {
    return (
        <a
            href={track.spotifyUrl}
            target="_blank"
            rel="noreferrer"
            className="music-recent-item grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-3 rounded-xl p-2 sm:gap-4 sm:p-3"
        >
            <span className="relative aspect-square overflow-hidden rounded-lg bg-black/5 dark:bg-white/5">
                {track.imageUrl ? (
                    <Image
                        src={track.imageUrl}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover"
                    />
                ) : (
                    <span className="flex h-full items-center justify-center opacity-35">♪</span>
                )}
            </span>
            <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{track.title}</span>
                <span className="mt-1 block truncate text-xs opacity-55">
                    {track.artists.join(", ")}
                </span>
            </span>
            <span className="whitespace-nowrap text-[11px] opacity-40">
                {relativeTime(track.playedAt, now)}
            </span>
        </a>
    );
}

function LoadingState() {
    return (
        <div
            className="music-panel rounded-2xl border border-black/10 p-4 sm:p-6 dark:border-white/10"
            role="status"
            aria-label="Loading Spotify playback"
            aria-busy="true"
        >
            <div className="grid animate-pulse gap-5 sm:grid-cols-[11rem_minmax(0,1fr)] sm:items-center sm:gap-7">
                <div className="aspect-square w-full max-w-64 rounded-xl bg-black/10 sm:max-w-none dark:bg-white/10" />
                <div>
                    <div className="h-3 w-24 rounded-full bg-black/10 dark:bg-white/10" />
                    <div className="mt-8 h-6 w-4/5 rounded-full bg-black/10 dark:bg-white/10" />
                    <div className="mt-3 h-4 w-2/5 rounded-full bg-black/10 dark:bg-white/10" />
                </div>
            </div>
        </div>
    );
}

export default function SpotifyNowPlaying() {
    const [response, setResponse] = useState<SpotifyPlaybackResponse | null>(null);
    const [now, setNow] = useState(0);

    useEffect(() => {
        let active = true;
        let playbackTimer: number | undefined;
        let requestController: AbortController | null = null;

        async function loadPlayback() {
            const controller = new AbortController();
            const timeoutTimer = window.setTimeout(
                () => controller.abort(),
                REQUEST_TIMEOUT_MS,
            );
            requestController = controller;

            try {
                const result = await fetch("/api/spotify/playback", {
                    signal: controller.signal,
                });
                const data = (await result.json()) as SpotifyPlaybackResponse;
                if (active && requestController === controller) {
                    setNow(Date.now());
                    setResponse(data);
                }
            } catch {
                if (active && requestController === controller) {
                    setResponse({
                        configured: true,
                        error: "Spotify is taking a short intermission.",
                    });
                }
            } finally {
                window.clearTimeout(timeoutTimer);

                if (requestController === controller) {
                    requestController = null;
                }

                if (active) {
                    playbackTimer = window.setTimeout(
                        loadPlayback,
                        REFRESH_INTERVAL_MS,
                    );
                }
            }
        }

        void loadPlayback();
        const clockTimer = window.setInterval(() => setNow(Date.now()), 1_000);

        return () => {
            active = false;
            requestController?.abort();
            if (playbackTimer !== undefined) {
                window.clearTimeout(playbackTimer);
            }
            window.clearInterval(clockTimer);
        };
    }, []);

    const content = useMemo(() => {
        if (!response) return <LoadingState />;

        if (!response.configured) {
            return (
                <div
                    className="music-panel rounded-2xl border border-black/10 p-8 text-center dark:border-white/10"
                    role="status"
                >
                    <p className="text-sm text-[#f54703]">not connected yet</p>
                    <p className="mx-auto mt-3 max-w-md leading-7 opacity-75">
                        This page is ready for Spotify; it just needs its private
                        credentials and refresh token.
                    </p>
                </div>
            );
        }

        if ("error" in response) {
            return (
                <div
                    className="music-panel rounded-2xl border border-black/10 p-8 text-center dark:border-white/10"
                    role="status"
                >
                    <p className="text-sm text-[#f54703]">intermission</p>
                    <p className="mt-3 opacity-75">{response.error}</p>
                </div>
            );
        }

        return (
            <>
                <PlaybackCard playback={response} now={now} />
                {response.recent.length > 0 && (
                    <section className="mt-9 sm:mt-12">
                        <div className="mb-3 flex items-end justify-between gap-4 px-2 sm:px-3">
                            <h2 className="text-sm font-semibold">recently played</h2>
                            <span className="text-[11px] opacity-40">updates live</span>
                        </div>
                        <div className="space-y-1">
                            {response.recent.map((track) => (
                                <RecentTrack key={`${track.id}-${track.playedAt}`} track={track} now={now} />
                            ))}
                        </div>
                    </section>
                )}
            </>
        );
    }, [now, response]);

    return <div>{content}</div>;
}
