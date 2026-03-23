# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build    # Compile TypeScript with tsup → dist/ (ESM + type declarations)
```

There are no test or lint scripts configured.

The package publishes to a private Nexus registry at `nexus.tatai.es`. The `preinstall` script auto-generates `.npmrc` pointing to that registry.

## Architecture

This is a browser-only OAuth2/OpenID Connect library. It assumes `localStorage` and `window.location` are available — it is not compatible with Node.js or SSR environments.

The flow connects three layers:

1. **`AuthenticationService`** (`src/services/authentication.service.ts`) — thin wrapper around a backend auth service. Makes unauthenticated POST requests to three endpoints: `/login` (get redirect URL), `/code` (exchange auth code for tokens), `/logout` (invalidate refresh token), `/refresh` (refresh access token).

2. **`token.ts`** (`src/services/token.ts`) — pure localStorage read/write. Stores four keys: `access_token`, `refresh_token`, `expires_at`, `refresh_expires_at`. No expiry checking at read time — `isAuthenticated()` only checks for token presence.

3. **`AuthenticatedHttpClient`** (`src/services/authenticate-http-client.ts`) — Axios instance with two interceptors:
   - **Request**: injects `Authorization: Bearer <access_token>` on every request.
   - **Response (error)**: on 401, retries the original request once after refreshing tokens. If the refresh call itself returns 401, redirects to the login page.

**`Authentication`** (`src/index.ts`) is the public facade that composes `AuthenticationService` and `AuthenticatedHttpClient`, and exposes `authenticateWithCode`, `logout`, and `goToLoginPage`.

Public exports: `Authentication` class, `AuthenticatedHttpClient` class, `isAuthenticated` function.

## Code style

- All control flow statements (`if`, `else`, `for`, `while`, etc.) **must always use curly braces**, even when the body is a single line.
- The opening brace goes on the same line as the statement; the closing brace goes on its own line.

```ts
// Correct
if (condition) {
    doSomething();
}

// Wrong
if (condition) doSomething();
```

## Key design notes

- `isAuthenticated()` is purely a localStorage presence check — it does not validate token expiry.
- Token refresh is triggered reactively (on 401 response), not proactively before expiry.
- The `loginRedirectUrl` passed to the `Authentication` constructor is forwarded as `redirectUri` in backend requests — it is the OAuth callback URL, not the login page URL itself (the login page URL is returned by the backend `/login` endpoint).
- Built with `tsup` targeting ESM only (`--format esm`). No CJS output.
