import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const baseUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || `${request.nextUrl.origin}`;
  return NextResponse.redirect(new URL(`/api/invitations/${token}/accept`, baseUrl));
}