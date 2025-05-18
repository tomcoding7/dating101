import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { RtcTokenBuilder, RtcRole } from "agora-access-token";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { channelName } = body;

    if (!channelName) {
      return NextResponse.json(
        { error: "Channel name is required" },
        { status: 400 }
      );
    }

    // Generate a random UID for the user
    const uid = Math.floor(Math.random() * 1000000);

    // Calculate privilege expire time (24 hours from now)
    const expirationTimeInSeconds = 24 * 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    // Generate the token
    const token = RtcTokenBuilder.buildTokenWithUid(
      process.env.AGORA_APP_ID!,
      process.env.AGORA_APP_CERTIFICATE!,
      channelName,
      uid,
      RtcRole.PUBLISHER,
      privilegeExpiredTs
    );

    return NextResponse.json({ token, uid });
  } catch (error) {
    console.error("Error generating token:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
