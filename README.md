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
- SQLite
- NextAuth.js / Auth.js
- bcryptjs
- Recharts

## Local Development

Install dependencies:

```bash
npm install