# US-001: Google Sign-In

**Epic:** Auth
**Persona:** User
**Status:** Draft

## Story

As a user, I want to sign in with my Google account so that I can access the app without creating a separate username and password.

## Acceptance Criteria

- [ ] A "Sign in with Google" button is displayed on the login page
- [ ] Clicking the button initiates Google OAuth 2.0 authentication
- [ ] On successful authentication, the user is redirected to the app dashboard
- [ ] On authentication failure, a clear error message is shown distinguishing at least: network error, user cancelled, and server error
- [ ] A first-time user is automatically provisioned with a default workspace named "[First name]'s Workspace" (using the Google profile given name)
- [ ] The default workspace is created with the three default statuses (To Do, In Progress, Completed) per US-004
- [ ] An existing user is taken directly to their last-used workspace, persisted in localStorage
- [ ] If an existing user has no accessible workspaces (all removed or deleted), they see an empty state with a "Create a workspace" CTA
- [ ] The user's name and avatar (from Google profile) are displayed in the app header
- [ ] If the Google profile has no avatar, the user's initials are displayed instead
- [ ] Unauthenticated users cannot access any app routes; they are redirected to the login page
- [ ] When a user's session expires mid-use, they are redirected to the login page with a "Session expired" message
- [ ] The user can sign out, which clears the local session; the Google OAuth token is not revoked
- [ ] A user may belong to a maximum of 10 workspaces

## Notes

- Only Google Auth is in scope for MVP; no email/password registration
- ADR required for the authentication library/provider choice before implementation
- The "default workspace" is created automatically on first login so the user can start creating tasks immediately
- Sign-out clears the local session only; it does not revoke the Google token (re-authentication is seamless)