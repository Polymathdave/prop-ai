import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { propertyAlerts } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";

type RouteParams = {
  params: Promise<{ id: string }>;
};

/**
 * PUT /api/user/alerts/[id]
 * 
 * Update a property alert
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
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
    } = body;

    // Validate at least one criteria is provided
    if (!type && !listingType && !minPrice && !maxPrice && !bedrooms && !city && !state) {
      return NextResponse.json(
        { success: false, error: "At least one search criteria is required" },
        { status: 400 }
      );
    }

    // Update the alert (only if it belongs to the user)
    const updatedAlert = await db
      .update(propertyAlerts)
      .set({
        type: type || null,
        listingType: listingType || null,
        minPrice: minPrice || null,
        maxPrice: maxPrice || null,
        bedrooms: bedrooms || null,
        city: city || null,
        state: state || null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(propertyAlerts.id, id),
          eq(propertyAlerts.userId, session.user.id)
        )
      )
      .returning();

    if (!updatedAlert.length) {
      return NextResponse.json(
        { success: false, error: "Alert not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      alert: updatedAlert[0],
    });
  } catch (error) {
    console.error("Error updating alert:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update alert" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/alerts/[id]
 * 
 * Toggle alert active status
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
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
    const { isActive } = body;

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { success: false, error: "isActive must be a boolean" },
        { status: 400 }
      );
    }

    // Toggle the alert status (only if it belongs to the user)
    const updatedAlert = await db
      .update(propertyAlerts)
      .set({
        isActive,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(propertyAlerts.id, id),
          eq(propertyAlerts.userId, session.user.id)
        )
      )
      .returning();

    if (!updatedAlert.length) {
      return NextResponse.json(
        { success: false, error: "Alert not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      alert: updatedAlert[0],
    });
  } catch (error) {
    console.error("Error toggling alert:", error);
    return NextResponse.json(
      { success: false, error: "Failed to toggle alert" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/alerts/[id]
 * 
 * Delete a property alert
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Delete the alert (only if it belongs to the user)
    const deletedAlert = await db
      .delete(propertyAlerts)
      .where(
        and(
          eq(propertyAlerts.id, id),
          eq(propertyAlerts.userId, session.user.id)
        )
      )
      .returning();

    if (!deletedAlert.length) {
      return NextResponse.json(
        { success: false, error: "Alert not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Alert deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting alert:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete alert" },
      { status: 500 }
    );
  }
}
