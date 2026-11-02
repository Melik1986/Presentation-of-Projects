# Security Policy

## Implemented Security Measures

### HTTP Security Headers

The project implements comprehensive HTTP security headers via Next.js configuration (`next.config.ts`):

- **Strict-Transport-Security (HSTS)**: Enforces HTTPS connections for 2 years with subdomain inclusion
- **X-Frame-Options**: Prevents clickjacking attacks by restricting iframe embedding
- **X-Content-Type-Options**: Prevents MIME sniffing attacks
- **Content-Security-Policy (CSP)**: Restricts content sources to prevent XSS attacks
- **Referrer-Policy**: Controls referrer information sharing
- **Permissions-Policy**: Restricts browser features like camera, microphone, and geolocation
- **X-XSS-Protection**: Enables browser XSS filtering

### Input Validation

All user inputs and URL parameters are validated and sanitized:

- **Catalog ID validation**: Alphanumeric pattern validation (only `a-z`, `0-9`, `-`) with length limits
- **URL validation**: External resources (YouTube, SoundCloud) are validated before loading
- **String sanitization**: Utility functions to remove dangerous characters and patterns

Implementation:

- `src/shared/lib/catalog-loader.ts`: Validates and sanitizes catalog IDs
- `src/shared/lib/security.ts`: Provides reusable sanitization utilities

### External Scripts

External scripts are loaded with security measures:

- **YouTube IFrame API**:
  - Loaded asynchronously from trusted source
  - Error handling for failed loads
  - Proper cleanup on unmount
  - Protected by CSP whitelist
- **SoundCloud Widget API**:
  - Loaded asynchronously from trusted source
  - Error handling for failed loads
  - Comprehensive logging
  - Protected by CSP whitelist

**Note**: These scripts are loaded without `crossOrigin` attribute as YouTube and SoundCloud APIs don't support CORS. Security is enforced through Content Security Policy which whitelists only these specific trusted sources.

Implementation:

- `src/features/audio/services/youtube-adapter.ts`
- `src/features/audio/services/soundcloud-widget-adapter.ts`

### Content Security Policy

The CSP configuration allows only trusted sources:

- **Script sources**: Self-hosted scripts, YouTube, SoundCloud APIs
- **Style sources**: Self-hosted and inline styles (required for React)
- **Image sources**: Self-hosted, data URIs, HTTPS sources, blobs
- **Font sources**: Self-hosted and data URIs
- **Connection sources**: Self-hosted, YouTube, SoundCloud APIs
- **Frame sources**: YouTube and SoundCloud embeds only
- **Media sources**: Self-hosted, HTTPS sources, blobs
- **Object sources**: Completely blocked
- **Base URI**: Restricted to self
- **Form actions**: Restricted to self
- **Frame ancestors**: Restricted to self
- **Upgrade insecure requests**: All HTTP upgraded to HTTPS

## Security Utilities

The project provides centralized security utilities (`src/shared/lib/security.ts`):

### `sanitizeString(input, maxLength)`

Removes potentially dangerous characters from strings:

- HTML special characters (`<`, `>`, `"`, `'`)
- JavaScript protocol (`javascript:`)
- Event handlers (`onclick=`, `onload=`, etc.)

### `sanitizeUrl(url)`

Validates and sanitizes URLs:

- Only allows `http:` and `https:` protocols
- Rejects other protocols (javascript:, data:, file:, etc.)
- Returns null for invalid URLs

### `validateAlphanumericId(id, maxLength)`

Validates alphanumeric identifiers:

- Allows only letters, numbers, hyphens, underscores
- Enforces maximum length limits
- Returns boolean validation result

## Known Limitations

This is a public portfolio website with specific security considerations:

- **No database**: No SQL injection risk as there's no database backend
- **No authentication**: Public site with no user authentication or authorization
- **No user-generated content**: No storage of user-provided content
- **No sensitive data**: No personal information or credentials stored
- **Static content**: All content is pre-defined in JSON configuration

## Best Practices Applied

1. **Defense in Depth**: Multiple layers of security (headers, validation, CSP)
2. **Principle of Least Privilege**: Restrictive permissions and CSP rules
3. **Input Validation**: All inputs validated before use
4. **Secure Defaults**: Secure configuration by default
5. **Error Handling**: Comprehensive error handling without exposing internals
6. **Logging**: Security events logged for monitoring

## Security Checklist

- [x] HTTP security headers configured
- [x] Content Security Policy implemented
- [x] Input validation for all user inputs
- [x] URL parameters sanitized
- [x] External scripts loaded securely
- [x] XSS protection enabled
- [x] Clickjacking protection enabled
- [x] MIME sniffing protection enabled
- [x] HTTPS enforced via HSTS
- [x] Security utilities documented

## Automated Repository Security

The GitHub repository uses secret-scanning push protection, Dependabot alerts and
security updates, and CodeQL default setup. `.github/dependabot.yml` also schedules
monthly npm and GitHub Actions updates. The Secret Scanning workflow runs Gitleaks
on pushes and pull requests, scanning the repository history.

The repository-level GitHub settings were enabled with
[GitHub Security Lab's `gh-secure`](https://github.com/GitHubSecurityLab/gh-secure).
Install it from the official source with
`gh extension install GitHubSecurityLab/gh-secure`, then inspect its help and
current settings with `gh secure --help` and `gh secure status`. Enabling
features requires an authenticated GitHub CLI session with repository admin
access.

## Accepted Dependency Risk

As of 2026-11-02, `npm audit` reports nine moderate advisory paths for
`minimatch` (`GHSA-g3hv-75wg-m249`, fixed upstream in `11.0.1`). These paths
come from development-only lint dependencies; `npm audit --omit=dev` reports
zero vulnerabilities. The advisory describes excessive CPU and memory use
when processing specially crafted glob patterns. The package is not part of
the production dependency tree, so this issue does not affect requests handled
by the deployed site; it may affect local linting or CI if an attacker can
cause an untrusted pattern to be processed.

No safe automatic fix is currently available. `npm audit fix` requires
`--force` and proposes a breaking downgrade of `@next/eslint-plugin-next`.
The lint dependencies declare `minimatch` 3.x ranges, so forcing the patched
11.x major through a root override would exceed their declared compatibility
and is not considered safe without updating and testing those consumers.
Dependabot remains enabled to notify maintainers when compatible upstream
fixes become available. Reassess this accepted risk by 2027-02-02 or sooner if
the lint toolchain changes.

## Reporting Security Issues

If you discover a security vulnerability, please report it responsibly:

1. **Do not** open a public GitHub issue
2. Contact the maintainers directly at [security contact]
3. Provide detailed information about the vulnerability
4. Allow reasonable time for a fix before public disclosure

## Security Updates

This document is updated whenever security measures are modified or enhanced.

**Last Updated**: December 2024  
**Next Review**: June 2025

---

_This security policy covers the Starlight portfolio project built with React 19, Next.js 16, and TypeScript 7._
