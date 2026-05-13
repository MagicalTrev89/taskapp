# ADR-007: Email Provider

Date: 2026-05-13

## Status

Accepted

## Context

US-003 (Workspace Membership) requires sending invitation emails with links to join a workspace. Requirements:
- Transactional email delivery (invitation links, not marketing)
- Reliable delivery with high inbox placement rate
- Simple API for sending HTML emails from Next.js API routes
- Support for custom sender domain (post-MVP)
- Template support for invitation emails

## Decision

Use **Resend** for transactional email delivery.

## Rationale

Resend is a modern transactional email API built by the team behind React Email:
- Simple REST API — send email with a single function call from API routes
- Built-in React Email support for templating (use JSX for email templates)
- Free tier: 100 emails/day, 3,000/month — more than sufficient for MVP invitation volume
- High deliverability with automated DKIM/SPF configuration
- Webhook support for delivery status tracking (post-MVP)

Alternatives considered:
- **SendGrid**: Established but heavier SDK, more configuration for domain setup, free tier is 100 emails/day but less developer-friendly API
- **AWS SES**: Cheapest at scale but requires AWS account, IAM configuration, and more setup overhead. Violates principle 4 (managed services with minimal ops)
- **Postmark**: Excellent deliverability but limited free tier (100 emails lifetime, not per month)

## Consequences

### Positive
- Minimal setup: API key + one function call per email (principle 4)
- React Email integration means email templates are JSX components, co-located with the codebase
- DKIM records auto-generated for custom domain setup when needed post-MVP
- Generous free tier covers MVP invitation volume

### Negative
- Vendor lock-in for email sending, but the API surface is small — switching is a one-day effort
- No built-in email queue; if sending fails, we retry in the API route (acceptable for MVP volume)
- Free tier limit of 100 emails/day could be hit if a workspace sends bulk invitations — unlikely for MVP

### Security considerations
- Resend API key stored in environment variables, never in source code
- Invitation links contain a token, not a user ID — tokens are single-use and expire after 7 days (US-003)