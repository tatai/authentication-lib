# Authentication Library

Browser-only OAuth2/OpenID Connect library with automatic token refresh and authenticated HTTP client. No external dependencies.

## Installation

```bash
npm install @tatai/authentication-lib
```

## Usage

```typescript
import { Authentication, isAuthenticated } from '@tatai/authentication-lib';

const auth = new Authentication(
  'https://your-auth-service.com',  // backend auth service base URL
  'https://your-app.com/callback'   // OAuth redirect URI
);
```

### Handle OAuth callback

```typescript
const code = new URLSearchParams(window.location.search).get('code');
if (code) {
  await auth.authenticateWithCode(code);
}
```

### Make authenticated requests

```typescript
const response = await auth.authenticatedClient.get('/api/user');
const created = await auth.authenticatedClient.post('/api/items', { name: 'foo' });
```

### Logout

```typescript
await auth.logout();
```

## API

### `Authentication`

| Method / Property | Description |
|---|---|
| `authenticateWithCode(code)` | Exchanges OAuth code for tokens |
| `logout()` | Invalidates refresh token and clears storage |
| `goToLoginPage()` | Redirects to the login page |
| `authenticatedClient` | `AuthenticatedHttpClient` instance |

### `AuthenticatedHttpClient`

All methods return `Promise<{ data: any }>`.

| Method | Signature |
|---|---|
| `get` | `(url, params?, responseType?, headers?)` |
| `post` | `(url, data, headers?)` |
| `put` | `(url, data, headers?)` |
| `patch` | `(url, data, headers?)` |
| `remove` | `(url)` |

Automatically injects `Authorization: Bearer <token>` on every request. On 401, refreshes tokens and retries once. If refresh also fails with 401, redirects to the login page.

### `isAuthenticated(): boolean`

Returns `true` if tokens are present in localStorage. Does not validate expiry.

## Token storage

Uses `localStorage` with four keys: `access_token`, `refresh_token`, `expires_at`, `refresh_expires_at`.

## Requirements

Browser environment with `localStorage` and `window.location`. Not compatible with Node.js or SSR.
