import { NextResponse } from "next/server";
import { initSocket } from "@/lib/socket";

export async function GET(req: Request, res: any) {
  try {
    initSocket(res);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Socket initialization error:", error);
    return NextResponse.json(
      { error: "Failed to initialize socket" },
      { status: 500 }
    );
  }
}
