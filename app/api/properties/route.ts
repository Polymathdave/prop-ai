import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { properties, users } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, sql } from "drizzle-orm";
import { sendAlertNotifications } from "@/lib/alert-notifications";

/**
 * GET /api/properties
 * 
 * Fetch properties from the database with optional filtering
 * 
 * Query Parameters:
 * - id: string - Fetch a single property by ID
 * - listingType: "rent" | "sell" - Filter by listing type
 * - state: string - Filter by state (case-insensitive)
 * - limit: number - Limit the number of results (default: 100)
 * - userId: string - Filter by user ID (for dashboard)
 * 
 * Response:
 * {
 *   success: boolean
 *   data?: { properties: Property[], count: number }
 *   error?: string
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const listingType = searchParams.get("listingType");
    const state = searchParams.get("state");
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "100");


    // Build the SQL query
    let query = "SELECT * FROM property WHERE 1=1";
    
    // Filter by listing type if provided
    if (listingType && (listingType === "rent" || listingType === "sell")) {
      query += ` AND "listingType" = '${listingType}'`;
    }
    
    // Filter by state if provided (case-insensitive, SQL injection safe)
    if (state) {
      const safeState = state.replace(/'/g, "''");
      query += ` AND LOWER(state) = LOWER('${safeState}')`;
    }
    
    // Filter by user ID if provided
    if (userId) {
      query += ` AND "listedBy" = '${userId}'`;
    }
    
    // Add ordering and limit
    query += ` ORDER BY id DESC LIMIT ${limit}`;

    // Execute the query
    const result = await db.execute(sql.raw(query));
    const propertyList = result.rows || [];

    // Return successful response
    return NextResponse.json({
      success: true,
      data: {
        properties: propertyList,
        count: propertyList.length,
      },
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch properties. Please try again.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/properties
 * 
 * Create a new property listing (requires authentication)
 * Only agents and landlords can create properties
 * 
 * Request Body:
 * {
 *   type: "detached_duplex" | "semi_detached_duplex" | "terrace" | "flat" | "apartment" | "penthouse" | "bungalow" | "mansion" | "mini_flat" | "room_and_parlour" | "single_room" | "shop" | "office" | "warehouse" | "land" | "event_center" | "hotel" | "guest_house"
 *   listingType: "rent" | "sell"
 *   price: number
 *   bedrooms?: number
 *   bathrooms?: number
 *   parking?: number
 *   size: string
 *   images: MediaFile[] // Array of property images with featured flag
 *   videos?: MediaFile[] // Array of property videos
 *   description: string
 *   address?: string
 *   city: string
 *   state: string
 *   coordinates?: { lat: number, lng: number }
 * }
 * 
 * Response:
 * {
 *   success: boolean
 *   data?: { property: Property }
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
          error: "Unauthorized. Please sign in to list properties.",
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

    // Check if user has permission to list properties
    if (dbUser.role !== "landlord" && dbUser.role !== "agent") {
      return NextResponse.json(
        {
          success: false,
          error: "Only landlords and agents can list properties.",
        },
        { status: 403 }
      );
    }

    // Parse the request body
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ["type", "listingType", "price", "size", "images", "description", "city", "state"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          {
            success: false,
            error: `Missing required field: ${field}`,
          },
          { status: 400 }
        );
      }
    }

    // Validate images array
    if (!Array.isArray(body.images) || body.images.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "At least one image is required",
        },
        { status: 400 }
      );
    }

    // Validate videos array if provided
    if (body.videos && !Array.isArray(body.videos)) {
      return NextResponse.json(
        {
          success: false,
          error: "Videos must be an array",
        },
        { status: 400 }
      );
    }

    // Create the property
    const newProperty = {
      id: crypto.randomUUID(),
      type: body.type,
      listingType: body.listingType,
      price: parseInt(body.price),
      bedrooms: body.bedrooms ? parseInt(body.bedrooms) : null,
      bathrooms: body.bathrooms ? parseInt(body.bathrooms) : null,
      parking: body.parking ? parseInt(body.parking) : null,
      size: body.size,
      images: body.images, // Array of MediaFile objects
      videos: body.videos || [], // Array of MediaFile objects, default to empty
      description: body.description,
      address: body.address || null,
      city: body.city,
      state: body.state,
      coordinates: body.coordinates || null,
      listedBy: session.user.id,
    };

    // Insert into database
    await db.insert(properties).values(newProperty);

    // Send alert notifications to users with matching criteria (async, don't await)
    sendAlertNotifications(newProperty.id).catch((err) => {
      console.error("Error sending alert notifications:", err);
    });

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        property: newProperty,
      },
    });
  } catch (error) {
    console.error("Error creating property:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create property. Please try again.",
      },
      { status: 500 }
    );
  }
}



