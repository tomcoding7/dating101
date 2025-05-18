import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get active streams
    const streams = await prisma.stream.findMany({
      where: {
        isLive: true,
      },
      include: {
        user: {
          select: {
            name: true,
            profileImage: true,
          },
        },
      },
      orderBy: {
        startedAt: "desc",
      },
    });

    return NextResponse.json({ streams });
  } catch (error) {
    console.error("Error fetching streams:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate unique stream key
    const streamKey = uuidv4();

    // Create stream
    const stream = await prisma.stream.create({
      data: {
        title,
        streamKey,
        isLive: true,
        userId: user.id,
      },
      include: {
        user: {
          select: {
            name: true,
            profileImage: true,
          },
        },
      },
    });

    return NextResponse.json({ stream }, { status: 201 });
  } catch (error) {
    console.error("Error creating stream:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { streamId, isLive } = body;

    if (typeof isLive !== "boolean") {
      return NextResponse.json(
        { error: "isLive must be a boolean" },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update stream
    const stream = await prisma.stream.update({
      where: {
        id: streamId,
        userId: user.id,
      },
      data: {
        isLive,
        ...(isLive ? {} : { endedAt: new Date() }),
      },
      include: {
        user: {
          select: {
            name: true,
            profileImage: true,
          },
        },
      },
    });

    return NextResponse.json({ stream });
  } catch (error) {
    console.error("Error updating stream:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
