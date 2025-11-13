# Threat Model - AI Calendar Agent

## Overview

This document identifies potential security threats to the AI Calendar Agent platform, analyzes their likelihood and impact, and documents mitigation strategies.

## Methodology

We use the STRIDE threat modeling framework:
- **S**poofing: Impersonating a user or system
- **T**ampering: Modifying data or code
- **R**epudiation: Denying actions taken
- **I**nformation Disclosure: Exposing information to unauthorized parties
- **D**enial of Service: Making system unavailable
- **E**levation of Privilege: Gaining unauthorized permissions

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                          Internet                            │
└────────────────┬────────────────────────────────────────────┘
                 │
       ┌─────────▼──────────┐
       │   Vercel Edge      │  ← Rate limiting, DDoS protection
       │   (CDN/WAF)        │
       └─────────┬──────────┘
                 │
       ┌─────────▼──────────┐
       │  Next.js App       │  ← Authentication, Authorization
       │  (App Router)      │  ← Input validation
       └─────────┬──────────┘
                 │
      ┌──────────┼──────────┐
      │          │           │
┌─────▼──────┐ ┌▼───────┐  ┌▼──────────┐
│ Supabase   │ │ Upstash│  │  Google   │
│ PostgreSQL │ │ Redis  │  │  OAuth    │
│ (Database) │ │(Cache) │  │ Calendar  │
└────────────┘ └────────┘  └───────────┘
```

## Assets

### Critical Assets
1. **User Credentials**: OAuth tokens, session tokens
2. **Personal Data**: Email, name, calendar events
3. **Calendar Data**: Appointments, tasks, schedules
4. **API Keys**: Google OAuth, OpenAI, third-party services
5. **Database**: User data, application state

### Classification
- **Public**: Marketing content, documentation
- **Internal**: Code, configurations, logs
- **Confidential**: User PII, calendar data
- **Secret**: Credentials, API keys, encryption keys

## Threat Analysis

### 1. Authentication Threats

#### THREAT-001: OAuth Token Theft
**Category**: Spoofing, Information Disclosure
**Description**: Attacker steals OAuth access/refresh tokens

**Attack Vectors**:
- XSS attack stealing tokens from memory
- Man-in-the-middle attack intercepting tokens
- Database breach exposing tokens
- Compromised logging exposing tokens

**Likelihood**: Medium
**Impact**: Critical (full account takeover)

**Mitigations**:
- ✅ Tokens stored server-side only (never sent to client)
- ✅ Tokens encrypted at rest in database
- ✅ HTTPS enforced (TLS 1.3)
- ✅ httpOnly cookies prevent JavaScript access
- ✅ Tokens never logged
- ⚠️ TODO: Token rotation on use
- ⚠️ TODO: Monitor for unusual token usage patterns

**Residual Risk**: Low

---

#### THREAT-002: Session Hijacking
**Category**: Spoofing
**Description**: Attacker steals session cookie to impersonate user

**Attack Vectors**:
- XSS stealing session cookie
- Network sniffing (if HTTP used)
- Session fixation
- Cross-site request forgery

**Likelihood**: Medium
**Impact**: High (account takeover)

**Mitigations**:
- ✅ httpOnly cookies (XSS protection)
- ✅ Secure flag (HTTPS only)
- ✅ SameSite=Lax (CSRF protection)
- ✅ Session tokens cryptographically random
- ✅ Session expiration (30 days)
- ⚠️ TODO: IP address validation
- ⚠️ TODO: User-agent validation
- ⚠️ TODO: Login notifications

**Residual Risk**: Low

---

#### THREAT-003: Brute Force Login
**Category**: Spoofing
**Description**: Attacker attempts to guess credentials

**Attack Vectors**:
- Automated login attempts
- Credential stuffing (leaked passwords)
- Dictionary attacks

**Likelihood**: High (common attack)
**Impact**: High (account compromise)

**Mitigations**:
- ✅ OAuth only (no passwords to brute force)
- ⚠️ TODO: Rate limiting on auth endpoints (5 req/15min per IP)
- ⚠️ TODO: CAPTCHA after failed attempts
- ⚠️ TODO: Account lockout after suspicious activity
- ⚠️ TODO: Alert on multiple failed attempts

**Residual Risk**: Medium (before mitigations implemented)

---

### 2. Authorization Threats

#### THREAT-004: Broken Object Level Authorization (BOLA)
**Category**: Elevation of Privilege, Information Disclosure
**Description**: User accesses another user's data by changing IDs

**Attack Vectors**:
- Modifying task ID in API request
- Changing user ID in query parameters
- Accessing calendar events of other users

**Likelihood**: High (common vulnerability)
**Impact**: Critical (data breach)

**Mitigations**:
- ⚠️ TODO: Always verify userId matches session in queries
- ⚠️ TODO: Workspace-level data isolation
- ⚠️ TODO: Row-level security in database
- ⚠️ TODO: Return 404 (not 403) for unauthorized resources
- ⚠️ TODO: Automated tests for authorization checks
- ⚠️ TODO: Code review checklist enforces authorization

**Residual Risk**: Medium (critical to implement)

---

#### THREAT-005: Privilege Escalation
**Category**: Elevation of Privilege
**Description**: Regular user gains admin privileges

**Attack Vectors**:
- Modifying role in API request
- SQL injection to update user role
- Exploiting admin endpoints

**Likelihood**: Low
**Impact**: Critical (full system compromise)

**Mitigations**:
- ✅ Role stored in database (not client-side)
- ✅ Prisma ORM prevents SQL injection
- ⚠️ TODO: Separate admin routes with strict checks
- ⚠️ TODO: Whitelist updatable user fields
- ⚠️ TODO: Audit log for admin actions
- ⚠️ TODO: 2FA required for admin accounts

**Residual Risk**: Low

---

### 3. Data Protection Threats

#### THREAT-006: Data Breach
**Category**: Information Disclosure
**Description**: Unauthorized access to database exposing user data

**Attack Vectors**:
- SQL injection
- Database credential leak
- Misconfigured database permissions
- Insider threat
- Cloud provider breach

**Likelihood**: Medium
**Impact**: Critical (GDPR breach, reputation damage)

**Mitigations**:
- ✅ Encryption at rest (Supabase default)
- ✅ Encryption in transit (TLS)
- ✅ Prisma ORM (parameterized queries)
- ✅ Database credentials in environment variables
- ⚠️ TODO: Database access auditing
- ⚠️ TODO: Principle of least privilege
- ⚠️ TODO: Regular security audits
- ⚠️ TODO: Data backup encryption

**Residual Risk**: Medium

---

#### THREAT-007: Data Tampering
**Category**: Tampering
**Description**: Attacker modifies data in database or in transit

**Attack Vectors**:
- SQL injection
- Man-in-the-middle attack
- Compromised admin account
- API manipulation

**Likelihood**: Low
**Impact**: High (data integrity loss)

**Mitigations**:
- ✅ HTTPS enforced (prevents MITM)
- ✅ Prisma ORM (SQL injection prevention)
- ✅ Input validation (Zod)
- ⚠️ TODO: Database audit logs
- ⚠️ TODO: Data integrity checks
- ⚠️ TODO: Immutable audit trail

**Residual Risk**: Low

---

#### THREAT-008: Calendar Data Exposure
**Category**: Information Disclosure
**Description**: Calendar events exposed to unauthorized parties

**Attack Vectors**:
- BOLA vulnerability
- Insecure API endpoints
- Logging calendar events
- Caching sensitive data client-side

**Likelihood**: Medium
**Impact**: High (privacy breach)

**Mitigations**:
- ⚠️ TODO: Authorization checks on calendar endpoints
- ⚠️ TODO: Never log calendar event details
- ⚠️ TODO: Encrypt calendar data in cache
- ⚠️ TODO: Short cache TTL for calendar data
- ⚠️ TODO: Minimal data sent to client

**Residual Risk**: Medium

---

### 4. API Security Threats

#### THREAT-009: API Abuse / DoS
**Category**: Denial of Service
**Description**: Attacker overwhelms API with requests

**Attack Vectors**:
- Automated request spam
- Expensive query exploitation
- No rate limiting
- Large payload attacks

**Likelihood**: High
**Impact**: High (service unavailable)

**Mitigations**:
- ⚠️ TODO: Rate limiting (Upstash Redis)
  - Public: 100 req/min per IP
  - Authenticated: 1000 req/min per user
  - Auth: 5 req/15min per IP
- ⚠️ TODO: Request payload size limits
- ⚠️ TODO: Query complexity limits
- ⚠️ TODO: Pagination enforced
- ⚠️ TODO: CloudFlare DDoS protection
- ⚠️ TODO: API usage monitoring

**Residual Risk**: Medium (before implementation)

---

#### THREAT-010: Injection Attacks
**Category**: Tampering, Elevation of Privilege
**Description**: SQL injection, NoSQL injection, command injection

**Attack Vectors**:
- SQL injection via user input
- Command injection in integrations
- XSS injection in stored data

**Likelihood**: Medium
**Impact**: Critical (database compromise)

**Mitigations**:
- ✅ Prisma ORM (parameterized queries)
- ⚠️ TODO: Input validation with Zod (all endpoints)
- ✅ React auto-escaping (XSS prevention)
- ⚠️ TODO: Content Security Policy headers
- ⚠️ TODO: Never use `$queryRawUnsafe`
- ⚠️ TODO: Sanitize rich text input

**Residual Risk**: Low

---

#### THREAT-011: CSRF (Cross-Site Request Forgery)
**Category**: Spoofing, Tampering
**Description**: Attacker tricks user into making unwanted requests

**Attack Vectors**:
- Malicious link clicked by authenticated user
- Embedded form on malicious site
- Image tag with API endpoint

**Likelihood**: Medium
**Impact**: Medium (unauthorized actions)

**Mitigations**:
- ✅ NextAuth.js CSRF protection
- ✅ SameSite=Lax cookies
- ⚠️ TODO: Origin header validation
- ⚠️ TODO: Referer header validation
- ⚠️ TODO: Double submit cookie pattern

**Residual Risk**: Low

---

### 5. Client-Side Threats

#### THREAT-012: XSS (Cross-Site Scripting)
**Category**: Tampering, Information Disclosure
**Description**: Attacker injects malicious JavaScript

**Attack Vectors**:
- Stored XSS (malicious task description)
- Reflected XSS (URL parameters)
- DOM-based XSS (client-side JS)

**Likelihood**: Medium
**Impact**: High (session hijacking, phishing)

**Mitigations**:
- ✅ React auto-escaping
- ⚠️ TODO: Content Security Policy
- ⚠️ TODO: Input sanitization (Zod)
- ⚠️ TODO: No `dangerouslySetInnerHTML` without sanitization
- ⚠️ TODO: httpOnly cookies (can't be stolen by JS)

**Residual Risk**: Low

---

#### THREAT-013: Client-Side Data Exposure
**Category**: Information Disclosure
**Description**: Sensitive data stored in browser

**Attack Vectors**:
- Tokens in localStorage
- Sensitive data in cookies (not httpOnly)
- Debug logs in console
- Sensitive data in Redux DevTools

**Likelihood**: Medium
**Impact**: Medium (token theft)

**Mitigations**:
- ✅ No tokens in localStorage
- ✅ httpOnly cookies for sessions
- ⚠️ TODO: Remove console.logs in production
- ⚠️ TODO: Disable Redux DevTools in production
- ⚠️ TODO: Minimal data in client state

**Residual Risk**: Low

---

### 6. Infrastructure Threats

#### THREAT-014: Secrets Exposure
**Category**: Information Disclosure
**Description**: API keys, credentials leaked

**Attack Vectors**:
- Committed to Git
- Exposed in logs
- Visible in error messages
- Hardcoded in source code

**Likelihood**: High (common mistake)
**Impact**: Critical (full compromise)

**Mitigations**:
- ✅ `.env.local` gitignored
- ✅ Environment variables in Vercel
- ⚠️ TODO: Pre-commit hooks to detect secrets
- ⚠️ TODO: Never log secrets
- ⚠️ TODO: Rotate secrets quarterly
- ⚠️ TODO: Use secret scanning (GitGuardian)

**Residual Risk**: Medium

---

#### THREAT-015: Dependency Vulnerabilities
**Category**: Varies (depends on vulnerability)
**Description**: Vulnerable npm packages

**Attack Vectors**:
- Known CVEs in dependencies
- Supply chain attacks
- Malicious packages
- Typosquatting

**Likelihood**: High (npm ecosystem)
**Impact**: Varies (Low to Critical)

**Mitigations**:
- ✅ Dependabot enabled
- ⚠️ TODO: `npm audit` in CI/CD
- ⚠️ TODO: Snyk vulnerability scanning
- ⚠️ TODO: Lock file committed
- ⚠️ TODO: Review dependencies before adding
- ⚠️ TODO: Keep dependencies updated

**Residual Risk**: Medium

---

#### THREAT-016: Compromised CI/CD Pipeline
**Category**: Tampering
**Description**: Attacker modifies build/deployment process

**Attack Vectors**:
- Compromised GitHub account
- Malicious PR merged
- Compromised Vercel account
- Modified environment variables

**Likelihood**: Low
**Impact**: Critical (malicious code deployed)

**Mitigations**:
- ✅ 2FA on GitHub required
- ⚠️ TODO: 2FA on Vercel required
- ⚠️ TODO: Branch protection rules
- ⚠️ TODO: Required code reviews
- ⚠️ TODO: Signed commits
- ⚠️ TODO: Audit logs reviewed

**Residual Risk**: Low

---

### 7. Third-Party Integration Threats

#### THREAT-017: Google Calendar API Compromise
**Category**: Information Disclosure
**Description**: Attacker accesses user's Google Calendar

**Attack Vectors**:
- Stolen OAuth tokens
- Over-privileged scopes
- Token not revoked on logout
- Tokens logged or cached

**Likelihood**: Medium
**Impact**: High (calendar access)

**Mitigations**:
- ✅ Minimal scopes requested
- ⚠️ TODO: Revoke tokens on logout
- ⚠️ TODO: Token encryption in database
- ⚠️ TODO: Never log tokens
- ⚠️ TODO: Audit calendar access
- ⚠️ TODO: User consent for each scope

**Residual Risk**: Medium

---

#### THREAT-018: OpenAI API Abuse
**Category**: Denial of Service, Elevation of Privilege
**Description**: Attacker abuses AI API (cost, data exfiltration)

**Attack Vectors**:
- Unlimited AI requests
- Prompt injection
- Data poisoning
- Cost exploitation

**Likelihood**: Medium
**Impact**: Medium (high costs, data leak)

**Mitigations**:
- ⚠️ TODO: Rate limit AI requests
- ⚠️ TODO: Cost limits and monitoring
- ⚠️ TODO: Sanitize prompts
- ⚠️ TODO: Validate AI responses
- ⚠️ TODO: No sensitive data in prompts
- ⚠️ TODO: Audit AI usage

**Residual Risk**: Medium

---

### 8. Compliance & Privacy Threats

#### THREAT-019: GDPR Violation
**Category**: Repudiation, Information Disclosure
**Description**: Non-compliance with data protection regulations

**Attack Vectors**:
- Data breach not reported in 72 hours
- User data not deleted on request
- No consent for data processing
- Data processed outside EU without safeguards

**Likelihood**: Medium (if not careful)
**Impact**: Critical (fines up to 4% revenue)

**Mitigations**:
- ⚠️ TODO: User can delete account (and all data)
- ⚠️ TODO: User can export data
- ⚠️ TODO: Clear privacy policy
- ⚠️ TODO: Consent management
- ⚠️ TODO: Data minimization
- ⚠️ TODO: Incident response plan (72h notification)
- ⚠️ TODO: Data processing records

**Residual Risk**: Medium

---

## Risk Matrix

| Threat ID | Threat | Likelihood | Impact | Risk Score | Priority |
|-----------|--------|------------|--------|------------|----------|
| THREAT-001 | OAuth Token Theft | Medium | Critical | 12 | P0 |
| THREAT-002 | Session Hijacking | Medium | High | 9 | P1 |
| THREAT-003 | Brute Force Login | High | High | 12 | P0 |
| THREAT-004 | BOLA | High | Critical | 15 | P0 |
| THREAT-005 | Privilege Escalation | Low | Critical | 9 | P1 |
| THREAT-006 | Data Breach | Medium | Critical | 12 | P0 |
| THREAT-007 | Data Tampering | Low | High | 6 | P2 |
| THREAT-008 | Calendar Data Exposure | Medium | High | 9 | P1 |
| THREAT-009 | API Abuse / DoS | High | High | 12 | P0 |
| THREAT-010 | Injection Attacks | Medium | Critical | 12 | P0 |
| THREAT-011 | CSRF | Medium | Medium | 6 | P2 |
| THREAT-012 | XSS | Medium | High | 9 | P1 |
| THREAT-013 | Client-Side Data Exposure | Medium | Medium | 6 | P2 |
| THREAT-014 | Secrets Exposure | High | Critical | 15 | P0 |
| THREAT-015 | Dependency Vulnerabilities | High | Medium | 9 | P1 |
| THREAT-016 | CI/CD Compromise | Low | Critical | 9 | P1 |
| THREAT-017 | Google Calendar Compromise | Medium | High | 9 | P1 |
| THREAT-018 | OpenAI API Abuse | Medium | Medium | 6 | P2 |
| THREAT-019 | GDPR Violation | Medium | Critical | 12 | P0 |

**Risk Score**: Likelihood (1-5) × Impact (1-5)
- **P0 (Critical)**: Risk score 12-15 - Address immediately
- **P1 (High)**: Risk score 9-12 - Address in Sprint 1
- **P2 (Medium)**: Risk score 6-9 - Address in Sprint 2-3
- **P3 (Low)**: Risk score 1-6 - Address when feasible

## Priority Security Work

### Sprint 1 (P0 - Must Have)

1. **THREAT-004: Implement Authorization Checks**
   - Add userId/workspaceId checks to all queries
   - Code review checklist
   - Automated tests

2. **THREAT-009: Implement Rate Limiting**
   - Upstash Redis integration
   - Rate limits on all endpoints
   - Monitoring and alerts

3. **THREAT-010: Input Validation**
   - Zod schemas for all API routes
   - Validation middleware
   - Error handling

4. **THREAT-014: Secrets Management**
   - Verify no secrets in Git
   - Pre-commit hooks
   - Secret rotation plan

5. **THREAT-003: Brute Force Protection**
   - Rate limit auth endpoints
   - CAPTCHA consideration
   - Login monitoring

6. **THREAT-006: Data Protection**
   - Verify encryption at rest
   - Row-level security
   - Database audit logging

### Sprint 2-3 (P1 - Should Have)

7. **THREAT-002: Enhanced Session Security**
   - IP address validation
   - User-agent checks
   - Login notifications

8. **THREAT-012: XSS Prevention**
   - Content Security Policy
   - Input sanitization review
   - No dangerouslySetInnerHTML

9. **THREAT-015: Dependency Management**
   - npm audit in CI/CD
   - Snyk integration
   - Update policy

10. **THREAT-017: OAuth Token Security**
    - Token encryption
    - Revocation on logout
    - Usage monitoring

### Future (P2-P3)

11. **THREAT-018: AI API Security**
12. **THREAT-019: GDPR Compliance**
13. **THREAT-007: Data Integrity**
14. **THREAT-013: Client Security Hardening**

## Security Testing

### Threat-Based Test Cases

For each threat, create automated tests:

```typescript
// THREAT-004: BOLA test
describe('Authorization', () => {
  it('prevents accessing other users tasks', async () => {
    const user1 = await createUser();
    const user2 = await createUser();
    const task = await createTask(user1);

    const response = await authenticatedRequest(user2, `/api/tasks/${task.id}`);
    expect(response.status).toBe(404); // Not 403
  });
});

// THREAT-009: Rate limiting test
describe('Rate Limiting', () => {
  it('blocks after 100 requests', async () => {
    const requests = Array(101).fill(null).map(() => fetch('/api/tasks'));
    const responses = await Promise.all(requests);
    expect(responses.filter(r => r.status === 429).length).toBeGreaterThan(0);
  });
});
```

## Monitoring & Detection

### Security Metrics

- Failed login attempts per hour
- 401/403 errors per hour
- Rate limit hits per hour
- SQL injection attempts detected
- XSS attempts detected
- Unusual API usage patterns
- Database access patterns

### Alerts

- 10+ failed logins from same IP in 1 minute
- 100+ 403 errors in 5 minutes
- Secrets detected in logs
- Dependency with critical CVE
- Unusual geographic login
- Admin action performed

## Review & Updates

This threat model should be:
- Reviewed quarterly
- Updated when architecture changes
- Updated when new features added
- Updated after security incidents
- Used in code reviews
- Referenced in security training

---

**Last Updated**: 2025-11-12
**Next Review**: 2026-02-12
**Owner**: Security Team
**Contributors**: Full Stack Dev, Tech Lead
