This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Connect Spotify

The `/music` page reads Spotify data on the server. The client ID, client secret,
and refresh token are never sent to the browser.

1. Create an app in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Add `http://127.0.0.1:8888/callback` to the app's Redirect URIs.
3. Copy `.env.example` to `.env.local` and add the client ID and client secret.
4. Run `bun run spotify:auth`, approve the three read-only scopes, and copy the
   printed `SPOTIFY_REFRESH_TOKEN` into `.env.local`.
5. Restart the development server. Add the same three environment variables to
   the production deployment.

The helper requests only:

- `user-read-currently-playing` for the live playback card
- `user-read-recently-played` for the short recent list and aggregated rhythm
- `user-top-read` for the three approximate taste windows

If Spotify was already connected before the taste profile was added, run
`bun run spotify:auth` again and replace the refresh token. Existing refresh
tokens do not automatically gain the new `user-top-read` scope.

### Spotify platform limits

- Development-mode app owners need an active Premium subscription. New apps are
  limited to one development Client ID and up to five allowlisted users.
- User refresh tokens have a six-month lifetime for new apps. Spotify begins the
  same enforcement for existing apps on July 20, 2026. A refresh returns
  `invalid_grant` after expiry; rerun `bun run spotify:auth` and replace the token.
  Refreshing an access token does not extend that six-month lifetime.
- Spotify's top-item windows are calculated affinity ranges: approximately four
  weeks, six months, and one year. They are rankings, not play counts.
- Recently played is only a rolling API history. The page requests the latest 50
  plays, aggregates them into UTC buckets on the server, and does not describe
  the sample as a monthly or complete listening history. No database is used.

The API layer coalesces requests, keeps separate short-lived playback and
hourly taste caches, honors Spotify's `Retry-After` response, and can serve a
stale snapshot during a brief upstream failure. See Spotify's
[February 2026 migration guide](https://developer.spotify.com/documentation/web-api/tutorials/february-2026-migration-guide),
[top-items reference](https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks),
[recently-played reference](https://developer.spotify.com/documentation/web-api/reference/get-recently-played),
and [refresh-token expiration notice](https://developer.spotify.com/blog/2026-06-18-refresh-token-expiration)
for the current rules and data definitions.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
