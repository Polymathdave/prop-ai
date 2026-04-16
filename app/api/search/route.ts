import { NextRequest, NextResponse } from "next/server";
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { db } from "@/db";
import { properties } from "@/db/schema";
import { eq, lte, gte, and, desc, sql } from "drizzle-orm";

/**
 * POST /api/search
 * 
 * Protected API route for AI-powered property search
 * Parses natural language queries into structured property filters
 * 
 * Security features:
 * - Input validation
 * - API key protection (OpenAI key never exposed to client)
 * 
 * Request body:
 * {
 *   query: string - Natural language search query
 * }
 * 
 * Response:
 * {
 *   success: boolean
 *   data?: PropertyFilter - Parsed property filters
 *   error?: string - Error message if failed
 * }
 */
export async function POST(request: NextRequest) {
  try {

    // Parse request body
    const body = await request.json();
    const { query } = body;

    // Validate query
    if (!query || typeof query !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Query is required and must be a string",
        },
        { status: 400 }
      );
    }

    // Validate query length
    if (query.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Query cannot be empty",
        },
        { status: 400 }
      );
    }

    if (query.length > 500) {
      return NextResponse.json(
        {
          success: false,
          error: "Query is too long (max 500 characters)",
        },
        { status: 400 }
      );
    }

    // Parse the query using AI


    const { object } = await generateObject({
        model: openai("gpt-4.1"),
        schema: z.object({
            PropertyFilter:z.object({
                type: z
                    .enum([
                        "detached_duplex",
                        "semi_detached_duplex",
                        "terrace",
                        "flat",
                        "apartment",
                        "penthouse",
                        "bungalow",
                        "mansion",
                        "mini_flat",
                        "room_and_parlour",
                        "single_room",
                        "shop",
                        "office",
                        "warehouse",
                        "land",
                        "event_center",
                        "hotel",
                        "guest_house"
                    ])
                    .nullish()
                    .describe("Type of property from the available options"),
                listingType: z
                    .enum(["rent", "sell"])
                    .nullish()
                    .describe("Type of listing: rent or sell"),
                price: z
                    .number()
                    .min(0)
                    .nullish()
                    .describe("Maximum price in Nigerian Naira (₦)"),
                bedrooms: z
                    .number()
                    .int()
                    .min(0)
                    .max(20)
                    .nullish()
                    .describe("Number of bedrooms"),
                bathrooms: z
                    .number()
                    .int()
                    .min(0)
                    .max(20)
                    .nullish()
                    .describe("Number of bathrooms"),
                parking: z
                    .number()
                    .int()
                    .min(0)
                    .nullish()
                    .describe("Number of parking spaces"),
                size: z
                    .string()
                    .nullish()
                    .describe("Size of property (e.g., '120 sqm', '200 sqm')"),
                address: z
                    .string()
                    .nullish()
                    .describe("Street address, area, or specific location (e.g., 'Wuse 2', 'Victoria Island', 'Plot 123')"),
                city: z
                    .string()
                    .nullish()
                    .describe("City in Nigeria (e.g., Lagos, Abuja, Port Harcourt, Kano)"),
                state: z
                    .string()
                    .nullish()
                    .describe("State in Nigeria (e.g., Lagos, Federal Capital Territory, Rivers)"),
            })
        }),
        prompt: `You are an intelligent real estate search assistant for a property platform in Africa (expandable globally). Parse the following natural language property search query into structured filter data.

IMPORTANT Context:
- Users are searching for properties to BUY or RENT
- "buy" searches should match properties listed for "sell"
- "rent" searches should match properties listed for "rent"
- Users CANNOT sell - they can only search for properties listed by agents/landlords

Property Information:
- Property types available:
  * Residential: detached_duplex, semi_detached_duplex, terrace, flat, apartment, penthouse, bungalow, mansion, mini_flat, room_and_parlour, single_room
  * Commercial: shop, office, warehouse, event_center, hotel, guest_house
  * Land: land
- Listing types on platform: rent, sell
- User search intent: buy (looking to purchase), rent (looking to lease)

Price Conversions:
- "1m", "1M", "1 million" → 1,000,000
- "500k", "500K" → 500,000
- "1.5m", "1.5M" → 1,500,000
- "2.3m" → 2,300,000
- "under X" or "< X" means price should be X (as maximum)
- "over X" or "> X" means price should be X (as minimum)
- Handle any currency (₦, $, £, €, etc.)

Size Conversions:
- Extract values like "120 sqm", "200 square meters", "1500 sqft", "2000 sq ft"
- Standardize to format like "120 sqm" or "1500 sqft"

User Query: "${query}"

Instructions:
1. Identify user search intent:
   - "buy", "purchase", "for sale" → listingType should be "sell"
   - "rent", "rental", "lease" → listingType should be "rent"
2. Identify property type from the available options:
   - Map user queries to exact enum values (use underscores, lowercase)
   - Examples: "duplex" or "detached duplex" → detached_duplex
   - "semi detached" → semi_detached_duplex
   - "mini flat" or "self contain" → mini_flat
   - "room and parlor" or "1 bedroom flat" → room_and_parlour
   - "single room" or "self con" → single_room
   - "terrace" or "terraced house" → terrace
   - "flat" → flat (specific property type in Nigerian real estate)
   - "apartment" or "apt" → apartment
   - "penthouse" → penthouse
   - "bungalow" → bungalow
   - "mansion" or "luxury house" → mansion
   - "shop" or "retail space" → shop
   - "office space" → office
   - "warehouse" or "storage facility" → warehouse
   - "land" or "plot" → land
   - "event center" or "event venue" → event_center
   - "hotel" → hotel
   - "guest house" or "guesthouse" → guest_house
3. Parse bedroom, bathroom, and parking counts
4. Convert prices to actual amounts (handle k, m, million, thousand abbreviations)
5. Extract property size if mentioned
6. Identify city, state (focus on African countries, but support global)
7. Extract specific address, area, or neighborhood

Be intelligent about:
- Nigerian/African property terminology (mini flat, room and parlour, duplex, etc.)
- Common abbreviations (e.g., "apt" = apartment, "BR" = bedroom, "BA" = bathroom)
- African cities and areas (Lagos, Nairobi, Accra, Johannesburg, Cairo, etc.)
- Lagos-specific areas (Victoria Island, Lekki, Ikoyi, Yaba, Surulere, Ajah, etc.)
- Area names and neighborhoods (include in address field)
- If no listing type is specified but context suggests one, infer it
- For size, extract and preserve the unit (sqm, sqft, etc.)
- Parking can be mentioned as "2 parking spaces", "parking for 2 cars", "2-car garage"
- Currency handling for various African countries (₦ Naira, KSh Kenyan Shilling, GHS Cedi, ZAR Rand, etc.)
- Self-contained units are typically "mini_flat" or "single_room" depending on context
`,
    });

    // Extract the filters from the AI response
    const filters = object.PropertyFilter;

    // Build Drizzle ORM query with filters
    const whereConditions: ReturnType<typeof eq>[] = [];
    
    // Filter by property type
    if (filters.type) {
      whereConditions.push(eq(properties.type, filters.type));
    }

    // Filter by listing type (rent/sell)
    if (filters.listingType) {
      whereConditions.push(eq(properties.listingType, filters.listingType));
    }

    // Filter by maximum price
    if (filters.price !== null && filters.price !== undefined) {
      whereConditions.push(lte(properties.price, filters.price));
    }

    // Filter by bedrooms
    if (filters.bedrooms !== null && filters.bedrooms !== undefined) {
      whereConditions.push(eq(properties.bedrooms, filters.bedrooms));
    }

    // Filter by bathrooms
    if (filters.bathrooms !== null && filters.bathrooms !== undefined) {
      whereConditions.push(eq(properties.bathrooms, filters.bathrooms));
    }

    // Filter by parking (greater than or equal)
    if (filters.parking !== null && filters.parking !== undefined) {
      whereConditions.push(gte(properties.parking, filters.parking));
    }

    // Filter by city (case-insensitive, trim whitespace)
    if (filters.city) {
      whereConditions.push(sql`LOWER(TRIM(${properties.city})) = LOWER(TRIM(${filters.city}))`);
    }

    // Filter by state (case-insensitive, trim whitespace)
    if (filters.state) {
      whereConditions.push(sql`LOWER(TRIM(${properties.state})) = LOWER(TRIM(${filters.state}))`);
    }

    // Filter by address (partial match, case-insensitive, trim whitespace)
    if (filters.address) {
      whereConditions.push(sql`LOWER(TRIM(${properties.address})) LIKE LOWER(TRIM(${'%' + filters.address + '%'}))`);
    }

    // Execute query using Drizzle ORM
    const propertiesQuery = whereConditions.length > 0
      ? db.select().from(properties).where(and(...whereConditions)).orderBy(desc(properties.id)).limit(100)
      : db.select().from(properties).orderBy(desc(properties.id)).limit(100);
    
    const propertiesResult = await propertiesQuery;
    // Return successful response with properties
    return NextResponse.json({
      success: true,
      data: {
        filters,
        properties: propertiesResult,
        count: propertiesResult.length,
      },
    });
  } catch (error) {
    console.error("Error processing search query:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process search query. Please try again.",
      },
      { status: 500 }
    );
  }
}

// OPTIONS handler for CORS (if needed)
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}

