import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendInvitationEmailParams {
  to: string;
  workspaceName: string;
  inviterName: string;
  invitationToken: string;
}

export async function sendInvitationEmail({
  to,
  workspaceName,
  inviterName,
  invitationToken,
}: SendInvitationEmailParams) {
  const baseUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
  const acceptUrl = `${baseUrl}/invite/${invitationToken}/accept`;

  const { error } = await resend.emails.send({
    from: "TaskApp <noreply@taskapp.dev>",
    to,
    subject: `${inviterName} invited you to join "${workspaceName}" on TaskApp`,
    html: `
      <div style="font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-block; width: 48px; height: 48px; background-color: #0D9488; border-radius: 12px; line-height: 48px; text-align: center;">
            <span style="color: white; font-size: 24px; font-weight: bold;">T</span>
          </div>
        </div>
        <h1 style="font-size: 20px; font-weight: 700; color: #134E4A; margin: 0 0 8px 0; text-align: center;">
          You've been invited to join a workspace
        </h1>
        <p style="font-size: 14px; color: #64748B; text-align: center; margin: 0 0 32px 0;">
          <strong style="color: #134E4A;">${inviterName}</strong> has invited you to join <strong style="color: #0D9488;">${workspaceName}</strong> on TaskApp.
        </p>
        <div style="text-align: center;">
          <a href="${acceptUrl}" style="display: inline-block; background-color: #0D9488; color: white; padding: 12px 32px; border-radius: 12px; font-size: 14px; font-weight: 600; text-decoration: none;">
            Accept Invitation
          </a>
        </div>
        <p style="font-size: 12px; color: #94A3B8; text-align: center; margin: 24px 0 0 0;">
          This invitation expires in 7 days. If you didn't expect this invitation, you can ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;">
        <p style="font-size: 12px; color: #94A3B8; text-align: center; margin: 0;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${acceptUrl}" style="color: #0D9488; word-break: break-all;">${acceptUrl}</a>
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("Failed to send invitation email:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}