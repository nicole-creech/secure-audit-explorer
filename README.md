# Secure Audit Log Explorer

A full-stack security investigation workspace for analyzing authentication, access, and privilege events across enterprise systems.

## Overview

Secure Audit Log Explorer is a portfolio project designed to simulate the kind of internal tooling used by security, compliance, and operations teams to investigate suspicious activity, review alert history, and analyze high-volume audit events.

The project focuses on secure access, auditability, investigation workflows, and operational visibility.

## Features

- Credential-based authentication
- Role-aware access control for admin, analyst, and viewer workflows
- Session expiration and inactivity auto-logout
- Audit event search and filtering
- Detection rules and alert cases
- Investigation notes and event tagging
- Notification history and alert workflow support
- Security-focused dashboard visualizations
- Production-style password hashing with `bcryptjs`

## Authentication

- User passwords are hashed before storage using `bcryptjs`
- Authentication is handled through a credentials-based auth flow
- Session handling includes both inactivity logout and max session lifetime
- Plaintext passwords should never be used outside local demo/testing scenarios

## Security

- Every API route checks the session and role on the server (`src/lib/authz.ts`): any signed-in role can read; admin, analyst and responder can investigate; admin and analyst can manage detection rules; viewers are read-only
- `src/proxy.ts` redirects signed-out visitors to `/login` before any protected page renders, and sets a strict nonce-based Content-Security-Policy
- Security headers (HSTS, `nosniff`, frame denial, referrer and permissions policies) and `no-store` on API responses
- Sessions expire after 8 hours, plus a 15-minute inactivity logout
- Analyst notes are attributed to the signed-in user
- CI runs `npm audit`, the build, and smoke tests for access control and headers; Dependabot keeps dependencies current

## Demo Users

| Name         | Email             | Password     | Role    |
|--------------|-------------------|--------------|---------|
| Alice Admin  | alice@demo.com    | adminpass    | admin   |
| Bob Analyst  | bob@demo.com      | analystpass  | analyst |
| Vera Viewer  | vera@demo.com     | viewerpass   | viewer  |

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL (Neon)
- NextAuth.js / Auth.js
- bcryptjs
- Recharts

## Local Development

Install dependencies:

```bash
npm install