import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { properties, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/**
 * GET /api/properties/[id]
 * 
 * Fetch a single property from the database by ID
 * 
 * Query Parameters:
 * - id: string - Fetch a single property by ID

 * 
 * Response:
 * {
 *   success: boolean
 *   data?: { properties: Property[], count: number }
 *   error?: string
 * }
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {

    const { id } = await params
  

    // If fetching by ID, return single property with owner details
      const propertyWithOwner = await db
        .select({
          id: properties.id,
          type: properties.type,
          listingType: properties.listingType,
          price: properties.price,
          bedrooms: properties.bedrooms,
          bathrooms: properties.bathrooms,
          parking: properties.parking,
          size: properties.size,
          images: properties.images,
          videos: properties.videos,
          description: properties.description,
          address: properties.address,
          city: properties.city,
          state: properties.state,
          coordinates: properties.coordinates,
          listedBy: properties.listedBy,
          createdAt: properties.createdAt,
          updatedAt: properties.updatedAt,
          // Owner details
          ownerName: users.name,
          ownerEmail: users.email,
          ownerPhone: users.phone,
          ownerRole: users.role,
        })
        .from(properties)
        .leftJoin(users, eq(properties.listedBy, users.id))
        .where(eq(properties.id, id))
        .limit(1);

      return NextResponse.json({
        success: true,
        data: {
          properties: propertyWithOwner,
          count: propertyWithOwner.length,
        },
      });
    }

    

    /**
 * PUT /api/properties/[id]
 * 
 * Update an existing property (requires authentication and ownership)
 * 
 * Request Body: Same as POST but all fields optional. 
 * MediaFile objects should have: { id: string, url: string, type: "image" | "video", name: string, featured?: boolean }
 * 
 * Response:
 * {
 *   success: boolean
 *   data?: { property: Property }
 *   error?: string
 * }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

      // Fetch user from database to check role
      const [dbUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, session.user.id))
        .limit(1);

      if (!dbUser) {
        return NextResponse.json(
          {
            success: false,
            error: "User not found.",
          },
          { status: 404 }
        );
      }

      // Check if user has permission to update properties
      if (dbUser.role !== "landlord" && dbUser.role !== "agent") {
        return NextResponse.json(
          {
            success: false,
            error: "Only landlords and agents can update properties.",
          },
          { status: 403 }
        );
      }
  
      // Get property ID from route params
      const { id: propertyId } = await params;
  
      // Check if property exists and user owns it
      const existingProperty = await db
        .select()
        .from(properties)
        .where(eq(properties.id, propertyId))
        .limit(1);
  
      if (!existingProperty || existingProperty.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Property not found",
          },
          { status: 404 }
        );
      }
  
      // Check ownership
      if (existingProperty[0].listedBy !== session.user.id) {
        return NextResponse.json(
          {
            success: false,
            error: "You can only update your own properties",
          },
          { status: 403 }
        );
      }
  
      // Parse the request body
      const body = await request.json();
  
      // Validate images array if provided
      if (body.images !== undefined) {
        if (!Array.isArray(body.images) || body.images.length === 0) {
          return NextResponse.json(
            {
              success: false,
              error: "At least one image is required",
            },
            { status: 400 }
          );
        }
      }
  
      // Validate videos array if provided
      if (body.videos !== undefined && !Array.isArray(body.videos)) {
        return NextResponse.json(
          {
            success: false,
            error: "Videos must be an array",
          },
          { status: 400 }
        );
      }
  
      // Build update object with only provided fields
      const updateData: Partial<typeof properties.$inferInsert> = {};
      if (body.type) updateData.type = body.type;
      if (body.listingType) updateData.listingType = body.listingType;
      if (body.price) updateData.price = parseInt(body.price);
      if (body.bedrooms !== undefined) updateData.bedrooms = body.bedrooms ? parseInt(body.bedrooms) : null;
      if (body.bathrooms !== undefined) updateData.bathrooms = body.bathrooms ? parseInt(body.bathrooms) : null;
      if (body.parking !== undefined) updateData.parking = body.parking ? parseInt(body.parking) : null;
      if (body.size) updateData.size = body.size;
      if (body.images !== undefined) updateData.images = body.images;
      if (body.videos !== undefined) updateData.videos = body.videos;
      if (body.description) updateData.description = body.description;
      if (body.address !== undefined) updateData.address = body.address || null;
      if (body.city) updateData.city = body.city;
      if (body.state) updateData.state = body.state;
      if (body.coordinates !== undefined) updateData.coordinates = body.coordinates || null;
  
      // Update the property
      const updatedProperty = await db
        .update(properties)
        .set(updateData)
        .where(eq(properties.id, propertyId))
        .returning();
  
      return NextResponse.json({
        success: true,
        data: {
          property: updatedProperty[0],
        },
      });
    } catch (error) {
      console.error("Error updating property:", error);
      
      return NextResponse.json(
        {
          success: false,
          error: "Failed to update property. Please try again.",
        },
        { status: 500 }
      );
    }
  }
  
  /**
   * DELETE /api/properties/[id]
   * 
   * Delete a property (requires authentication and ownership)
   * 
   * Response:
   * {
   *   success: boolean
   *   message?: string
   *   error?: string
   * }
   */
  export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) {
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
  
      // Get property ID from route params
      const { id: propertyId } = await params;
  
      // Check if property exists and user owns it
      const existingProperty = await db
        .select()
        .from(properties)
        .where(eq(properties.id, propertyId))
        .limit(1);
  
      if (!existingProperty || existingProperty.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Property not found",
          },
          { status: 404 }
        );
      }
  
      // Check ownership
      if (existingProperty[0].listedBy !== session.user.id) {
        return NextResponse.json(
          {
            success: false,
            error: "You can only delete your own properties",
          },
          { status: 403 }
        );
      }
  
      // Delete the property
      await db
        .delete(properties)
        .where(eq(properties.id, propertyId));
  
      return NextResponse.json({
        success: true,
        message: "Property deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting property:", error);
      
      return NextResponse.json(
        {
          success: false,
          error: "Failed to delete property. Please try again.",
        },
        { status: 500 }
      );
    }
  }
