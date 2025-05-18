import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { matchingSystem } from "@/lib/matching";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current user's profile and preferences
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        preferences: true,
        profile: true,
      },
    });

    if (!currentUser || !currentUser.profile || !currentUser.preferences) {
      return NextResponse.json(
        { error: "User profile or preferences not found" },
        { status: 404 }
      );
    }

    // Get potential matches
    const potentialMatches = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: currentUser.id } },
          { profile: { isNot: null } },
          { preferences: { isNot: null } },
        ],
      },
      include: {
        profile: true,
        preferences: true,
      },
      take: 20, // Limit to 20 potential matches
    });

    // Calculate match scores and reasons
    const matches = await Promise.all(
      potentialMatches.map(async (match) => {
        const { score, reason } = await matchingSystem.calculateMatchScore(
          {
            id: currentUser.id,
            age: currentUser.profile.age,
            gender: currentUser.profile.gender,
            location: {
              latitude: currentUser.profile.latitude,
              longitude: currentUser.profile.longitude,
            },
            interests: currentUser.profile.interests,
            relationshipGoals: currentUser.profile.relationshipGoals,
            lifestyle: currentUser.profile.lifestyle,
            bio: currentUser.profile.bio,
            education: currentUser.profile.education,
            occupation: currentUser.profile.occupation,
          },
          {
            id: match.id,
            age: match.profile!.age,
            gender: match.profile!.gender,
            location: {
              latitude: match.profile!.latitude,
              longitude: match.profile!.longitude,
            },
            interests: match.profile!.interests,
            relationshipGoals: match.profile!.relationshipGoals,
            lifestyle: match.profile!.lifestyle,
            bio: match.profile!.bio,
            education: match.profile!.education,
            occupation: match.profile!.occupation,
          },
          {
            ageRange: [
              currentUser.preferences.minAge,
              currentUser.preferences.maxAge,
            ],
            gender: currentUser.preferences.preferredGender,
            location: {
              latitude: currentUser.preferences.latitude,
              longitude: currentUser.preferences.longitude,
            },
            interests: currentUser.preferences.interests,
            relationshipGoals: currentUser.preferences.relationshipGoals,
            lifestyle: {
              smoking: currentUser.preferences.smoking,
              drinking: currentUser.preferences.drinking,
              exercise: currentUser.preferences.exercise,
            },
          }
        );

        return {
          id: match.id,
          name: match.name,
          age: match.profile!.age,
          gender: match.profile!.gender,
          profileImage: match.profile!.profileImage,
          matchScore: score,
          matchReason: reason,
        };
      })
    );

    // Sort matches by score
    const sortedMatches = matches.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({ matches: sortedMatches });
  } catch (error) {
    console.error("Error generating match recommendations:", error);
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
