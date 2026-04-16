import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { propertyAlerts } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, desc } from "drizzle-orm";

/**
 * GET /api/user/alerts
 * 
 * Fetch all property alerts for the authenticated user
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const alerts = await db
      .select()
      .from(propertyAlerts)
      .where(eq(propertyAlerts.userId, session.user.id))
      .orderBy(desc(propertyAlerts.createdAt));

    return NextResponse.json({
      success: true,
      alerts,
    });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/alerts
 * 
 * Create a new property alert
 * 
 * Request Body:
 * {
 *   type?: string
 *   listingType?: string
 *   minPrice?: number
 *   maxPrice?: number
 *   bedrooms?: number
 *   city?: string
 *   state?: string
 *   notificationMethod?: "email" | "sms" | "both"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      type,
      listingType,
      minPrice,
      maxPrice,
      bedrooms,
      city,
      state,
      notificationMethod = "email",
    } = body;

    // Validate at least one criteria is provided
    if (!type && !listingType && !minPrice && !maxPrice && !bedrooms && !city && !state) {
      return NextResponse.json(
        { success: false, error: "At least one search criteria is required" },
        { status: 400 }
      );
    }

    // Create the alert
    const newAlert = await db.insert(propertyAlerts).values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      type: type || null,
      listingType: listingType || null,
      minPrice: minPrice || null,
      maxPrice: maxPrice || null,
      bedrooms: bedrooms || null,
      city: city || null,
      state: state || null,
      isActive: true,
      notificationMethod: notificationMethod as "email" | "sms" | "both",
    }).returning();

    return NextResponse.json({
      success: true,
      alert: newAlert[0],
    });
  } catch (error) {
    console.error("Error creating alert:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create alert" },
      { status: 500 }
    );
  }
}

