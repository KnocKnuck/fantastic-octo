# Security Policy

## Overview

Security is a top priority for AI Calendar Agent. This document outlines our security practices, policies, and procedures to ensure the safety and privacy of our users' data.

## Reporting Security Vulnerabilities

If you discover a security vulnerability, please report it responsibly:

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead:
1. Email security@aicalendaragent.com with details
2. Include steps to reproduce the vulnerability
3. Allow 48 hours for initial response
4. We'll acknowledge your report and provide a timeline for resolution

We appreciate responsible disclosure and will credit researchers who report valid vulnerabilities.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Security Measures

### Authentication & Authorization

- **OAuth 2.0**: Google OAuth for user authentication
- **Session Management**: Secure session tokens stored in httpOnly cookies
- **CSRF Protection**: Enabled on all state-changing operations
- **Protected Routes**: Middleware enforces authentication on sensitive endpoints
- **Session Expiration**: 30-day automatic expiration with secure token rotation

### Data Protection

- **Encryption at Rest**: All data encrypted in PostgreSQL database (Supabase)
- **Encryption in Transit**: TLS 1.3 for all connections (enforced by Vercel)
- **Secrets Management**: Environment variables, never committed to version control
- **Sensitive Data**: OAuth tokens encrypted, never logged or exposed to client
- **Multi-tenancy**: Workspace-level data isolation with row-level security

### API Security

- **Rate Limiting**: Upstash Redis-based rate limiting on all endpoints
  - Public endpoints: 100 req/min per IP
  - Authenticated endpoints: 1000 req/min per user
  - Auth endpoints: 5 req/min per IP
- **Input Validation**: Zod schemas validate all user inputs
- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **XSS Prevention**: React auto-escaping, CSP headers
- **CORS**: Strict origin validation

### Infrastructure Security

- **Principle of Least Privilege**: Minimal database permissions per service
- **2FA Required**: On all production service accounts
- **Dependency Scanning**: Automated vulnerability scanning with Dependabot
- **Secret Rotation**: Quarterly rotation of API keys and secrets
- **Monitoring**: Sentry for error tracking, anomaly detection

### Compliance

- **GDPR**: User data deletion, data export, consent management
- **Data Minimization**: Collect only essential user data
- **Privacy by Design**: Privacy considerations in all features
- **Audit Logging**: All sensitive operations logged securely

## Security Best Practices for Developers

### Code Reviews

All code changes must pass security review checklist:
- [ ] No secrets in code or config files
- [ ] Input validation on all user inputs
- [ ] Authentication required on protected endpoints
- [ ] Authorization checks (user can only access their data)
- [ ] No sensitive data in logs
- [ ] Error messages don't leak system information
- [ ] Dependencies up to date, no known vulnerabilities

### Environment Variables

Never commit:
- API keys
- Database credentials
- OAuth secrets
- Encryption keys
- Any tokens or passwords

Use `.env.local` for local development (gitignored).

### Database Security

- Always use workspace/tenant scoping: `WHERE workspaceId = ?`
- Use Prisma parameterized queries (never raw SQL unless necessary)
- Validate user IDs match session user before data access
- Use database transactions for multi-step operations

### Authentication

- Never create custom auth logic - use NextAuth.js
- Always check session on server-side
- Don't trust client-side authentication state
- Use middleware for route protection
- Invalidate sessions on logout

### Error Handling

- Catch all exceptions in API routes
- Return generic error messages to clients
- Log detailed errors to Sentry (without sensitive data)
- Never expose stack traces to users

## Security Checklist

Before deploying to production, verify:

- [ ] All environment variables set correctly
- [ ] HTTPS enforced (Vercel default)
- [ ] Session cookies: httpOnly, secure, sameSite=lax
- [ ] CSRF protection enabled
- [ ] Rate limiting configured
- [ ] Input validation on all endpoints
- [ ] Authentication middleware on protected routes
- [ ] Database row-level security (workspaceId checks)
- [ ] Error monitoring (Sentry) configured
- [ ] Dependency vulnerabilities resolved
- [ ] Security headers configured (CSP, HSTS, etc.)
- [ ] No secrets in codebase
- [ ] OAuth redirect URIs whitelisted

## Incident Response

In case of a security incident:

1. **Detect**: Monitor Sentry, logs, user reports
2. **Assess**: Determine scope and severity
3. **Contain**: Disable affected systems if needed
4. **Investigate**: Root cause analysis
5. **Remediate**: Fix vulnerability, patch systems
6. **Notify**: Inform affected users (GDPR requirement)
7. **Document**: Post-mortem report
8. **Improve**: Update security measures

See [Incident Response Plan](docs/security/incident-response.md) for details.

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NextAuth.js Security](https://next-auth.js.org/configuration/options#security)
- [Vercel Security](https://vercel.com/docs/security/secure-by-default)
- [Prisma Security](https://www.prisma.io/docs/guides/security)

## Security Contact

For security concerns: security@aicalendaragent.com

For general support: support@aicalendaragent.com

---

**Last Updated**: 2025-11-12
**Version**: 1.0
**Review Cycle**: Quarterly
