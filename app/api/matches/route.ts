import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's preferences
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { preferences: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get potential matches based on preferences
    const potentialMatches = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: user.id } },
          { age: { gte: user.preferences?.ageRange[0] || 18 } },
          { age: { lte: user.preferences?.ageRange[1] || 100 } },
          { gender: { in: user.preferences?.gender || [] } },
        ],
      },
      select: {
        id: true,
        name: true,
        age: true,
        gender: true,
        profileImage: true,
        bio: true,
      },
    });

    // Calculate match scores and reasons
    const matches = await Promise.all(
      potentialMatches.map(async (match) => {
        const matchScore = calculateMatchScore(user, match);
        const matchReason = generateMatchReason(user, match, matchScore);

        return {
          id: match.id,
          user1Id: user.id,
          user2Id: match.id,
          matchScore,
          matchReason,
          isAccepted: false,
          user: {
            name: match.name,
            age: match.age,
            gender: match.gender,
            profileImage: match.profileImage,
          },
        };
      })
    );

    // Sort matches by score
    const sortedMatches = matches.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({ matches: sortedMatches });
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

function calculateMatchScore(user: any, match: any): number {
  let score = 0.5; // Base score

  // Age compatibility
  const ageDiff = Math.abs(user.age - match.age);
  score -= ageDiff * 0.01;

  // Gender preference
  if (user.preferences?.gender.includes(match.gender)) {
    score += 0.2;
  }

  // Location (if available)
  if (user.location && match.location && user.location === match.location) {
    score += 0.1;
  }

  // Normalize score between 0 and 1
  return Math.max(0, Math.min(1, score));
}

function generateMatchReason(user: any, match: any, score: number): string {
  const reasons = [];

  if (Math.abs(user.age - match.age) <= 2) {
    reasons.push("You are close in age");
  }

  if (user.preferences?.gender.includes(match.gender)) {
    reasons.push("You share gender preferences");
  }

  if (user.location && match.location && user.location === match.location) {
    reasons.push("You live in the same area");
  }

  if (reasons.length === 0) {
    return "You might be a good match!";
  }

  return reasons.join(" and ") + "!";
}
