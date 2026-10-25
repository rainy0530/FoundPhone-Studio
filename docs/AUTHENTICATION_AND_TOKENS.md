# Authentication, Login, and Token Handling

## Summary

FoundPhone Studio currently ships as a static story player, not an account-based service. The repository has no authentication backend, login endpoint, user database, OAuth callback, JWT/session middleware, or app-managed token lifecycle. There is therefore no real user login or bearer-token flow to harden yet. Do not add fake client-side authentication and describe it as secure.

## Existing components and request / data flow

1. `index.html` loads `src/runtime/StoryPlayer.tsx`.
2. `StoryPlayer` fetches one of the static `work.json`, `test-work.json`, or `blank-work.json` assets according to the URL query, then validates it with `validateWork` from `src/schema.ts`.
3. `Phone.tsx` renders the device lock UI. Its passcode comparison happens in the browser against `work.phone.passcode`; successful unlock dispatches a local `password` story event. This is a narrative interaction, not an authenticated identity.
4. Player progress is initialized and updated in `src/Phone.tsx` and persisted through `src/persistence.ts` into IndexedDB (`foundphone-studio`, `saves` table), keyed by story ID. There is no user ID or server-side access-control check.
5. The story compiler (`src/story-engine/compiler.ts`) validates story structure and produces public runtime data. Hidden content and content passwords are evaluated client-side.

The app's network request is currently for static story assets. It does not send a username/password to an authentication server and does not receive an application session token.

## Credential and token handling today

- **Account passwords:** no account login exists, so no account password is collected or verified.
- **Device passcode:** embedded in public compiled story data and compared in client code. Anyone who can fetch the asset or modify the client can discover/bypass it. Use only fictional, non-sensitive passcodes.
- **Story-item password:** part of the public story data and used as a puzzle gate. It does not encrypt or conceal the underlying content.
- **Player saves:** stored in same-origin browser IndexedDB. Treat them as user-controlled local data, not trusted or encrypted server records.
- **Access / refresh / session tokens:** none are currently issued or handled by this app. Do not introduce them into client bundles, story JSON, browser storage, URLs, logs, or public environment variables.
- **GitHub Actions:** the Pages workflow declares narrow workflow permissions for reading source and deploying Pages. GitHub's deployment identity token is workflow infrastructure, not a FoundPhone player token; it must not be copied into runtime assets or logs.

## If real account authentication becomes a product requirement

A static GitHub Pages frontend alone cannot safely verify credentials or enforce access to private data. Add a trusted backend or backend-for-frontend and implement:

- Server-side credential verification and authorization on every protected request.
- Salted adaptive password hashing (prefer Argon2id), generic login errors, rate limiting, and safe account recovery.
- Opaque server-managed sessions in `HttpOnly; Secure; SameSite=Lax` or stricter cookies, session rotation after login and privilege changes, server-enforced expiry/revocation, and CSRF defenses for state-changing cookie-authenticated requests.
- OAuth authorization-code flow with PKCE, validated state/nonce and redirect URIs if third-party identity is added.
- No tokens in `localStorage`, `sessionStorage`, IndexedDB, URL parameters, or logs. Keep provider secrets and signing keys on the server, never in Vite client-exposed `VITE_*` variables.
- Automated tests for unauthenticated access, cross-user authorization, expired/revoked sessions, CSRF, rate limits, and logout.

## References

- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [MDN: Session management](https://developer.mozilla.org/en-US/docs/Web/Security/Authentication/Session_management)
