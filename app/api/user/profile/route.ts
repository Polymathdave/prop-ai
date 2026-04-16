import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { userProfiles } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

/**
 * POST /api/user/profile
 * 
 * Create or update user profile (phone number, bio, etc.)
 * Required for landlords and agents during onboarding
 * 
 * Request Body:
 * {
 *   phoneNumber: string (required)
 *   bio?: string
 *   address?: string
 *   city?: string
 *   state?: string
 *   agencyName?: string (for agents)
 *   licenseNumber?: string (for agents)
 * }
 * 
 * Response:
 * {
 *   success: boolean
 *   error?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Get the session from headers
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized. Please sign in.",
        },
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { 
      phoneNumber, 
      bio, 
      address, 
      city, 
      state, 
      agencyName, 
      licenseNumber 
    } = body;

    // Validate phone number (required)
    if (!phoneNumber || typeof phoneNumber !== "string" || phoneNumber.trim().length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: "Phone number is required and must be at least 10 characters.",
        },
        { status: 400 }
      );
    }

    // Check if profile already exists
    const existingProfile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, session.user.id))
      .limit(1);

    if (existingProfile.length > 0) {
      // Update existing profile
      await db
        .update(userProfiles)
        .set({
          phoneNumber,
          bio: bio || existingProfile[0].bio,
          address: address || existingProfile[0].address,
          city: city || existingProfile[0].city,
          state: state || existingProfile[0].state,
          agencyName: agencyName || existingProfile[0].agencyName,
          licenseNumber: licenseNumber || existingProfile[0].licenseNumber,
          updatedAt: new Date(),
        })
        .where(eq(userProfiles.userId, session.user.id));
    } else {
      // Create new profile
      await db.insert(userProfiles).values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        phoneNumber,
        bio: bio || null,
        address: address || null,
        city: city || null,
        state: state || null,
        agencyName: agencyName || null,
        licenseNumber: licenseNumber || null,
        isVerified: false,
      });
    }

    // Return success response
    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error creating/updating user profile:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save profile. Please try again.",
      },
      { status: 500 }
    );
  }
}

