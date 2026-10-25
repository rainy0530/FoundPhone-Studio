# Security

## Current security boundary

FoundPhone Studio is a static, browser-side story player and local development editor. It currently has **no real account login, authentication server, authorization API, session service, OAuth flow, JWT handling, or application-issued access/refresh tokens**. Do not describe the device lock screen or narrative content passwords as account security.

The player loads public story data from static JSON files, validates the structure in the browser, and stores progress in browser IndexedDB. These are product features, not a security boundary.

## Important limitations

- The device passcode is included in the compiled public work data and compared in client-side code. A visitor can inspect or modify client files and bypass the lock. It is a role-play / story interaction only, not a way to protect private data.
- Story content passwords and hidden-content rules are also client-side. They can control the intended narrative path, but they cannot keep content secret from someone who can download the published story data.
- IndexedDB saves are local to the browser profile and origin; they are not encrypted account storage and are not linked to a verified user identity.
- Never place API keys, provider credentials, private user data, session tokens, JWTs, refresh tokens, or passwords in story JSON, client bundles, public environment variables, URLs, or browser storage.
- No arbitrary imported JavaScript or raw HTML is intentionally executed. Continue validating imported story data and media; this does not remove the need to review parser and resource-limit risks.

## Required design if real login is added

Real authentication cannot be securely implemented solely in this static client. Add a trusted backend or backend-for-frontend before introducing accounts or protected resources.

1. Verify credentials and enforce authorization on the server for every protected operation; never trust a client-side `locked`, role, user ID, or story flag.
2. Store passwords only as salted, adaptive password hashes (prefer Argon2id where available); never log or return plaintext passwords.
3. Prefer opaque server-managed sessions in cookies with `HttpOnly; Secure; SameSite=Lax` (or `Strict` where compatible), narrow scope, rotation after login/privilege changes, server-enforced idle/absolute expiry, and server-side revocation. Add CSRF protection for cookie-authenticated state-changing requests.
4. Keep provider secrets and signing keys only in the server-side secret manager / deployment secrets. Never ship them through Vite `VITE_*` variables or any other client bundle.
5. Do not store access, refresh, or session tokens in `localStorage`, `sessionStorage`, IndexedDB, URLs, or logs. If an external OAuth provider is added, use a vetted authorization-code flow with PKCE and validate state/nonce/redirect URI on the trusted side.
6. Add rate limiting, generic login errors, safe account recovery, audit events that exclude credentials, and automated tests for unauthorized access, expired/revoked sessions, CSRF, and brute-force controls.

## CI and reporting

The Pages workflow runs type, lint, unit, story validation, story tests, and production build checks. Dependency audit is also required in CI. These checks are useful safeguards, not a guarantee of a comprehensive security review.

Please do not publish private story content or credentials in public issues. Use GitHub's private vulnerability reporting / Security Advisory workflow when it is available for this repository. ZIP decompression hardening, richer schema constraints, and resource-limit fuzzing remain follow-up areas.
