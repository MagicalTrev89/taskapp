# US-003: Workspace Membership

**Epic:** Workspaces
**Persona:** User (Owner)
**Status:** Draft

## Story

As a workspace owner, I want to invite other users to my workspace so that we can collaborate on tasks together.

## Acceptance Criteria

- [ ] The workspace owner can invite a user by email address
- [ ] Inviting an email address that is already a member of the workspace shows an error: "This person is already a member"
- [ ] Inviting an email address that has a pending invitation shows an error: "An invitation has already been sent to this email"
- [ ] The invited user receives an email with a link to join the workspace
- [ ] Invitation links expire after 7 days; expired links show an "Invitation expired" message and the owner must resend
- [ ] The invited user can accept the invitation and is added as a Member
- [ ] Invitation acceptance matches by email: the Google account email must match the invited email address
- [ ] If the invited email does not have an account yet, the link takes them through Google Sign-In first, then adds them to the workspace
- [ ] The workspace owner can see a list of workspace members and their roles, including pending invitations
- [ ] The workspace owner can cancel a pending invitation
- [ ] The workspace owner can remove a member from the workspace
- [ ] A member who is removed can no longer access the workspace or its tasks; their access is revoked immediately
- [ ] Tasks and comments created by a removed member remain in the workspace with the member's name preserved
- [ ] Only the workspace owner can invite and remove members
- [ ] Members can see the member list but cannot invite or remove members

## Notes

- For MVP, there is no "decline invitation" flow — accepting the link adds the user
- Role-based permissions beyond invite/remove are post-MVP
- Email delivery requires an ADR for the email provider choice