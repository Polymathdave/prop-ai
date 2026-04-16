import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

/**
 * PUT /api/user/update-role
 * 
 * Update the user's role after signup
 * 
 * Request Body:
 * {
 *   role: "user" | "landlord" | "agent"
 * }
 * 
 * Response:
 * {
 *   success: boolean
 *   error?: string
 * }
 */
export async function PUT(request: NextRequest) {
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
    const { role } = body;

    // Validate role
    if (!role || !["user", "landlord", "agent"].includes(role)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid role. Must be 'user', 'landlord', or 'agent'.",
        },
        { status: 400 }
      );
    }

    // Update the user's role
    await db
      .update(users)
      .set({ role })
      .where(eq(users.id, session.user.id));

    // Return success response
    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update user role. Please try again.",
      },
      { status: 500 }
    );
  }
}


