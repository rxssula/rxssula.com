import { randomBytes } from "node:crypto";
import { spawn } from "node:child_process";
import { createServer } from "node:http";

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const port = 8888;
const redirectUri = `http://127.0.0.1:${port}/callback`;
const state = randomBytes(16).toString("hex");

if (!clientId || !clientSecret) {
    console.error(
        "Add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to .env.local first.",
    );
    process.exit(1);
}

const authorizeUrl = new URL("https://accounts.spotify.com/authorize");
authorizeUrl.search = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    state,
    scope: [
        "user-read-currently-playing",
        "user-read-recently-played",
        "user-top-read",
    ].join(" "),
    show_dialog: "true",
}).toString();

function openBrowser(url) {
    const command =
        process.platform === "darwin"
            ? ["open", url]
            : process.platform === "win32"
              ? ["cmd", "/c", "start", "", url]
              : ["xdg-open", url];

    const child = spawn(command[0], command.slice(1), {
        detached: true,
        stdio: "ignore",
    });
    child.on("error", (error) => {
        console.warn(`Could not open the browser automatically: ${error.message}`);
    });
    child.unref();
}

const server = createServer(async (request, response) => {
    const callbackUrl = new URL(request.url ?? "/", redirectUri);

    if (callbackUrl.pathname !== "/callback") {
        response.writeHead(404).end("Not found");
        return;
    }

    if (callbackUrl.searchParams.get("state") !== state) {
        response.writeHead(400).end("Spotify authorization state did not match.");
        return;
    }

    const code = callbackUrl.searchParams.get("code");
    const authorizationError = callbackUrl.searchParams.get("error");

    if (!code || authorizationError) {
        response
            .writeHead(400, { "Content-Type": "text/plain; charset=utf-8" })
            .end(`Spotify authorization failed: ${authorizationError ?? "missing code"}`);
        server.close();
        return;
    }

    try {
        const tokenResponse = await fetch(
            "https://accounts.spotify.com/api/token",
            {
                method: "POST",
                headers: {
                    Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    grant_type: "authorization_code",
                    code,
                    redirect_uri: redirectUri,
                }),
            },
        );
        const token = await tokenResponse.json();

        if (!tokenResponse.ok || !token.refresh_token) {
            throw new Error(
                token.error_description ??
                    token.error ??
                    `token request failed (${tokenResponse.status})`,
            );
        }

        console.log("\nAdd this value to .env.local:\n");
        console.log(`SPOTIFY_REFRESH_TOKEN=${token.refresh_token}\n`);
        response
            .writeHead(200, { "Content-Type": "text/html; charset=utf-8" })
            .end(
                "<!doctype html><title>Spotify connected</title><style>body{font:16px ui-monospace,monospace;display:grid;place-items:center;min-height:100vh;margin:0;background:#171717;color:white}main{text-align:center;padding:2rem}p{opacity:.7}</style><main><h1>Spotify connected.</h1><p>Three read-only scopes were approved. Your refresh token is waiting in the terminal.</p></main>",
            );
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(`Spotify authorization failed: ${message}`);
        response
            .writeHead(500, { "Content-Type": "text/plain; charset=utf-8" })
            .end("Could not finish Spotify authorization. Check the terminal.");
    } finally {
        server.close();
    }
});

server.listen(port, "127.0.0.1", () => {
    console.log(`Waiting for Spotify at ${redirectUri}`);
    console.log(`If the browser does not open, visit:\n${authorizeUrl.toString()}\n`);
    openBrowser(authorizeUrl.toString());
});
