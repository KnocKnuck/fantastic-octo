# Security Incident Response Plan

## Overview

This document outlines the procedures for responding to security incidents affecting AI Calendar Agent. The goal is to quickly detect, contain, and remediate security issues while maintaining transparency with affected users.

## Incident Response Team

### Roles & Responsibilities

**Incident Commander**
- Overall incident coordination
- Decision making authority
- External communications
- Contact: security@aicalendaragent.com

**Technical Lead**
- Technical investigation
- Remediation implementation
- System recovery
- Contact: tech-lead@aicalendaragent.com

**Communications Lead**
- User communications
- Status page updates
- Social media responses
- Contact: communications@aicalendaragent.com

**Legal/Compliance Officer**
- Regulatory compliance (GDPR, CCPA)
- Legal implications
- Breach notifications
- Contact: legal@aicalendaragent.com

## Incident Severity Levels

### Critical (P0)
**Impact**: Significant data breach, complete service outage, active attack

**Examples**:
- Database breach with user data exposed
- OAuth tokens compromised
- Active ransomware attack
- Complete application unavailability

**Response Time**: Immediate (within 15 minutes)
**Notification**: CEO, CTO, all teams
**Communication**: Public status update within 1 hour

### High (P1)
**Impact**: Partial data exposure, security vulnerability exploitation, degraded service

**Examples**:
- Single user account compromised
- XSS vulnerability actively exploited
- API keys exposed in public repository
- Service degradation affecting authentication

**Response Time**: Within 1 hour
**Notification**: Security team, engineering leads
**Communication**: Affected users notified within 4 hours

### Medium (P2)
**Impact**: Security vulnerability discovered, no active exploitation

**Examples**:
- Security vulnerability in dependency
- Misconfigured security setting
- Suspicious activity detected
- Failed intrusion attempt

**Response Time**: Within 4 hours
**Notification**: Security team
**Communication**: Internal only unless necessary

### Low (P3)
**Impact**: Minor security issue, no immediate risk

**Examples**:
- Outdated dependency (no known CVE)
- Minor security misconfiguration
- False positive security alert

**Response Time**: Within 24 hours
**Notification**: Security team
**Communication**: None required

## Incident Response Process

### Phase 1: Detection & Identification (0-15 minutes)

**1.1 Incident Detection**
- Monitor Sentry for unusual errors
- Check security logs for anomalies
- Review user reports of suspicious activity
- Automated alerts from monitoring systems

**1.2 Initial Assessment**
- Confirm security incident (not false positive)
- Determine severity level
- Identify affected systems/data
- Estimate scope of impact

**1.3 Incident Declaration**
- Create incident ticket (Jira/Linear)
- Notify incident response team
- Start incident timeline log
- Activate war room (Slack channel)

**Documentation Template**:
```
INCIDENT ID: SEC-2025-001
DETECTED: 2025-11-12 14:30 UTC
SEVERITY: P1 (High)
SUMMARY: Unauthorized access attempt detected
AFFECTED SYSTEMS: Authentication API
REPORTER: monitoring-system@aicalendaragent.com
STATUS: Investigating
```

### Phase 2: Containment (15 minutes - 2 hours)

**2.1 Immediate Actions**
- Stop the bleeding (isolate affected systems)
- Prevent further damage
- Preserve evidence for investigation

**2.2 Short-term Containment**

For compromised credentials:
```bash
# Revoke OAuth tokens
$ prisma studio
# Or via API
$ curl -X DELETE /api/admin/sessions/revoke-all?userId=...

# Rotate API keys
$ vercel env rm API_KEY
$ vercel env add API_KEY [new-value]

# Force password reset (future feature)
$ npm run admin:force-password-reset --userId=...
```

For service compromise:
```bash
# Scale down affected service
$ vercel scale [deployment-url] 0

# Or rollback to previous deployment
$ vercel rollback
```

For database breach:
```bash
# Enable audit logging
$ psql -c "ALTER DATABASE ai_calendar SET log_statement = 'all';"

# Block malicious IPs (at Vercel/Cloudflare level)
$ vercel firewall:block --ip 192.0.2.1
```

**2.3 Preserve Evidence**
- Capture system logs
- Screenshot error messages
- Export relevant database records
- Save network traffic logs
- Document all actions taken

### Phase 3: Investigation (2-24 hours)

**3.1 Root Cause Analysis**

Questions to answer:
- How did the attacker gain access?
- What vulnerabilities were exploited?
- When did the breach occur?
- What data was accessed/exfiltrated?
- How many users are affected?
- Is the attacker still in the system?

**3.2 Investigation Checklist**
- [ ] Review authentication logs
- [ ] Analyze database query logs
- [ ] Check API access logs
- [ ] Review recent code changes
- [ ] Examine error logs (Sentry)
- [ ] Check for backdoors or malware
- [ ] Interview team members
- [ ] Timeline reconstruction

**3.3 Data Collection**

```bash
# Export authentication logs
$ npm run logs:export --type=auth --start="2025-11-01" --end="2025-11-12"

# Export database queries
$ psql -c "SELECT * FROM pg_stat_statements WHERE query LIKE '%users%' ORDER BY calls DESC;"

# Export API logs
$ vercel logs [deployment-url] --since 24h > incident-logs.txt

# Export Sentry events
$ sentry-cli events list --project ai-calendar-agent --query "level:error"
```

### Phase 4: Eradication (4-48 hours)

**4.1 Remove Threat**
- Patch vulnerabilities
- Remove malware/backdoors
- Close security holes
- Update dependencies

**4.2 Credential Rotation**

```bash
# Rotate all secrets
$ vercel env rm DATABASE_URL
$ vercel env add DATABASE_URL [new-secure-connection-string]

$ vercel env rm NEXTAUTH_SECRET
$ vercel env add NEXTAUTH_SECRET $(openssl rand -base64 32)

$ vercel env rm GOOGLE_CLIENT_SECRET
# Create new OAuth client in Google Cloud Console
$ vercel env add GOOGLE_CLIENT_SECRET [new-secret]
```

**4.3 Code Changes**
- Fix vulnerable code
- Add additional security controls
- Improve input validation
- Strengthen authentication

**4.4 Deploy Fix**
```bash
# Run tests
$ npm run test
$ npm run test:security

# Deploy to staging
$ vercel --prod=false

# Verify fix works
$ npm run test:e2e -- --env=staging

# Deploy to production
$ vercel --prod
```

### Phase 5: Recovery (24-72 hours)

**5.1 Restore Services**
- Bring systems back online
- Monitor for issues
- Verify security controls
- Test all functionality

**5.2 Verification**
- [ ] All vulnerabilities patched
- [ ] No unauthorized access detected
- [ ] All secrets rotated
- [ ] Monitoring alerts configured
- [ ] Backups verified
- [ ] Service fully functional

**5.3 Enhanced Monitoring**
- Increase log verbosity temporarily
- Set up additional alerts
- Monitor for reoccurrence
- Daily security reviews for 1 week

### Phase 6: Post-Incident (1-2 weeks)

**6.1 Post-Mortem Report**

Template:
```markdown
# Security Incident Post-Mortem

**Incident ID**: SEC-2025-001
**Date**: 2025-11-12
**Severity**: P1 (High)
**Duration**: 6 hours

## Summary
[Brief description of what happened]

## Timeline
- 14:30 UTC: Incident detected
- 14:35 UTC: Team notified
- 14:45 UTC: Containment actions started
- 16:00 UTC: Root cause identified
- 18:00 UTC: Fix deployed
- 20:30 UTC: Incident resolved

## Root Cause
[Detailed explanation of vulnerability]

## Impact
- Users affected: 127
- Data exposed: Email addresses
- Downtime: 15 minutes
- Financial impact: $0

## What Went Well
- Quick detection (5 minutes)
- Effective team coordination
- Comprehensive logging

## What Went Wrong
- Missing rate limiting on endpoint
- Insufficient input validation
- Delayed external communication

## Action Items
1. [ACTION-001] Add rate limiting to all API endpoints (P0, due: 2025-11-15)
2. [ACTION-002] Implement additional input validation (P0, due: 2025-11-15)
3. [ACTION-003] Improve security monitoring (P1, due: 2025-11-20)
4. [ACTION-004] Security training for team (P2, due: 2025-12-01)

## Lessons Learned
- Always validate user input
- Rate limiting is critical
- Communication is key
```

**6.2 Improvements**
- Implement preventive measures
- Update security documentation
- Conduct security training
- Improve detection systems

**6.3 Follow-up**
- Track action items to completion
- Review with team in 30 days
- Update incident response plan
- Share lessons learned

## Communication Guidelines

### Internal Communication

**War Room** (Slack channel: #incident-response)
- Real-time updates during incident
- Technical discussions
- Action item tracking
- Status updates every 30 minutes

**Team Updates** (email)
- Initial notification
- Major milestones
- Resolution announcement
- Post-mortem sharing

### External Communication

**Status Page** (status.aicalendaragent.com)
- Initial incident report within 1 hour (P0/P1)
- Updates every 2 hours
- Resolution announcement
- Post-mortem (sanitized)

**Email to Affected Users**
- Send within 4 hours for P1 incidents
- Within 24 hours for P2 incidents
- Include: what happened, impact, actions taken
- No technical jargon
- Provide support contact

**Email Template**:
```
Subject: Security Notice - AI Calendar Agent

Dear [Name],

We're writing to inform you of a security incident that may have affected your account.

WHAT HAPPENED:
On [date], we detected [brief description]. We immediately took action to secure our systems.

WHAT INFORMATION WAS INVOLVED:
[Specific data types, e.g., email addresses, no passwords]

WHAT WE'RE DOING:
- Fixed the vulnerability
- Enhanced security monitoring
- [Other actions]

WHAT YOU SHOULD DO:
- No action required (or specific actions if needed)
- Review your account activity
- Contact support if you notice anything unusual

We take security seriously and apologize for any concern this may cause. If you have questions, please contact security@aicalendaragent.com.

Sincerely,
AI Calendar Agent Security Team
```

**Social Media**
- Tweet/post for P0 incidents only
- Link to status page
- Keep messaging consistent

### Legal Notification

**GDPR** (EU users)
- Notify supervisory authority within 72 hours
- Notify affected users "without undue delay"
- Document breach in records

**CCPA** (California users)
- Notify if unencrypted PII exposed
- Notification within timeframe specified by law

**Other Jurisdictions**
- Follow local data breach notification laws
- Consult legal team

## Incident Types & Specific Procedures

### Data Breach

1. Identify what data was accessed
2. Determine number of affected users
3. Preserve evidence (logs, backups)
4. Contain breach (revoke access)
5. Notify legal team immediately
6. Prepare user notifications
7. Notify authorities if required (GDPR: 72 hours)

### Account Compromise

1. Lock affected account(s)
2. Revoke all sessions
3. Reset credentials
4. Notify user via verified email
5. Review account activity logs
6. Check for unauthorized changes
7. Enable additional security (2FA)

### DDoS Attack

1. Activate DDoS mitigation (Cloudflare)
2. Scale infrastructure if needed
3. Block malicious IPs
4. Contact hosting provider
5. Monitor resource usage
6. Communicate downtime if significant

### Ransomware

1. Isolate affected systems immediately
2. Do NOT pay ransom
3. Restore from clean backups
4. Scan all systems for malware
5. Change all credentials
6. Report to law enforcement
7. Conduct forensic analysis

### Insider Threat

1. Preserve evidence
2. Revoke access immediately
3. Notify legal/HR
4. Change credentials for affected systems
5. Review audit logs
6. Interview if appropriate
7. Law enforcement if warranted

## Tools & Resources

### Monitoring & Detection
- **Sentry**: Error monitoring
- **Vercel Logs**: API logs
- **Prisma Logs**: Database queries
- **Google Cloud Monitoring**: OAuth activity

### Investigation
- **Prisma Studio**: Database inspection
- **Vercel CLI**: Deployment logs
- **Git History**: Code changes
- **Sentry Dashboard**: Error patterns

### Communication
- **Slack**: #incident-response channel
- **Status Page**: status.aicalendaragent.com
- **Email**: Resend API
- **Twitter**: @aicalendaragent

### Contacts

**Emergency**
- Incident Commander: +1-XXX-XXX-XXXX
- Technical Lead: +1-XXX-XXX-XXXX
- On-call rotation: PagerDuty

**Vendors**
- Vercel Support: support@vercel.com
- Supabase Support: support@supabase.com
- Google Cloud Support: (from console)
- Legal Counsel: [law firm contact]

## Testing & Drills

### Quarterly Security Drills

Simulate incidents to test response:
- Q1: Account compromise drill
- Q2: Data breach drill
- Q3: DDoS simulation
- Q4: Full incident response test

### Drill Process
1. Schedule drill (don't announce exact time)
2. Inject simulated incident
3. Team responds as if real
4. Debrief and document lessons
5. Update response plan

## Compliance Requirements

### GDPR (EU)
- Notify supervisory authority within 72 hours
- Document all data breaches
- Notify affected users without delay
- Maintain records of processing activities

### CCPA (California)
- Notify if unencrypted PII compromised
- Provide free credit monitoring (if financial data)
- Maintain reasonable security practices

### SOC 2 (Future)
- Incident response plan required
- Annual review and testing
- Documentation of all incidents

## Appendix

### Incident Response Checklist

**Immediate (0-15 min)**
- [ ] Confirm incident is real
- [ ] Determine severity
- [ ] Notify incident response team
- [ ] Create incident ticket
- [ ] Start incident log

**Containment (15 min - 2 hours)**
- [ ] Stop the attack
- [ ] Isolate affected systems
- [ ] Preserve evidence
- [ ] Begin investigation
- [ ] Update stakeholders

**Investigation (2-24 hours)**
- [ ] Determine root cause
- [ ] Identify affected data/users
- [ ] Timeline reconstruction
- [ ] Document findings
- [ ] Plan remediation

**Eradication (4-48 hours)**
- [ ] Fix vulnerability
- [ ] Remove attacker access
- [ ] Rotate credentials
- [ ] Deploy security patches
- [ ] Verify fix

**Recovery (24-72 hours)**
- [ ] Restore services
- [ ] Verify functionality
- [ ] Enhanced monitoring
- [ ] User communications
- [ ] Legal notifications (if required)

**Post-Incident (1-2 weeks)**
- [ ] Write post-mortem
- [ ] Create action items
- [ ] Conduct team review
- [ ] Update documentation
- [ ] Security improvements

### Contact List

| Role | Contact | Phone | Email |
|------|---------|-------|-------|
| Incident Commander | [Name] | +1-XXX-XXX-XXXX | security@... |
| Technical Lead | [Name] | +1-XXX-XXX-XXXX | tech-lead@... |
| Communications | [Name] | +1-XXX-XXX-XXXX | comms@... |
| Legal/Compliance | [Name] | +1-XXX-XXX-XXXX | legal@... |
| CEO | [Name] | +1-XXX-XXX-XXXX | ceo@... |

### Incident Log Template

```
INCIDENT LOG: SEC-2025-001

| Timestamp | Event | Action Taken | Actor |
|-----------|-------|--------------|-------|
| 14:30 | Unusual login activity detected | Alert generated | System |
| 14:32 | Alert reviewed | Confirmed as incident | Security Engineer |
| 14:35 | Team notified | Created Slack channel | Incident Commander |
| 14:40 | User account locked | Revoked sessions | Technical Lead |
| ... | ... | ... | ... |
```

---

**Last Updated**: 2025-11-12
**Owner**: Security Team
**Review Cycle**: Quarterly
**Next Drill**: 2026-01-15
