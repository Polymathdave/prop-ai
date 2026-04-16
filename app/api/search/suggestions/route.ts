import { NextResponse } from "next/server";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { sql } from "drizzle-orm";

/**
 * GET /api/search/suggestions
 * 
 * Returns dynamic search suggestions based on actual property data
 * Aggregates popular cities, property types, and bedroom counts
 * 
 * Response:
 * {
 *   success: boolean
 *   suggestions: string[] - Array of natural language search suggestions
 * }
 */
export async function GET() {
  try {
    // Aggregate top cities by property count
    const topCities = await db
      .select({
        city: properties.city,
        count: sql<number>`count(*)::int`,
      })
      .from(properties)
      .groupBy(properties.city)
      .orderBy(sql`count(*) DESC`)
      .limit(5);

    // Aggregate common property types
    const topTypes = await db
      .select({
        type: properties.type,
        count: sql<number>`count(*)::int`,
      })
      .from(properties)
      .groupBy(properties.type)
      .orderBy(sql`count(*) DESC`)
      .limit(5);

    // Aggregate listing types by city
    const listingsByCity = await db
      .select({
        city: properties.city,
        listingType: properties.listingType,
        count: sql<number>`count(*)::int`,
      })
      .from(properties)
      .groupBy(properties.city, properties.listingType)
      .orderBy(sql`count(*) DESC`)
      .limit(5);

    // Aggregate bedroom counts
    const bedroomCounts = await db
      .select({
        bedrooms: properties.bedrooms,
        count: sql<number>`count(*)::int`,
      })
      .from(properties)
      .where(sql`${properties.bedrooms} IS NOT NULL`)
      .groupBy(properties.bedrooms)
      .orderBy(sql`count(*) DESC`)
      .limit(3);

    // Build natural language suggestions
    const suggestions: string[] = [];

    // Format property type names for display
    const formatPropertyType = (type: string): string => {
      return type
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    // Add city-based suggestions
    if (topCities.length > 0 && topCities[0]) {
      const city = topCities[0].city;
      suggestions.push(`Properties in ${city}`);
    }

    // Add bedroom + city suggestions
    if (bedroomCounts.length > 0 && bedroomCounts[0] && topCities.length > 0 && topCities[0]) {
      const bedrooms = bedroomCounts[0].bedrooms;
      const city = topCities[0].city;
      if (bedrooms && bedrooms > 0) {
        suggestions.push(`${bedrooms}-bedroom apartment in ${city}`);
      }
    }

    // Add property type + city suggestions
    if (topTypes.length > 0 && topTypes[0] && topCities.length > 1 && topCities[1]) {
      const type = formatPropertyType(topTypes[0].type);
      const city = topCities[1].city;
      suggestions.push(`${type} in ${city}`);
    }

    // Add listing type + city suggestions
    if (listingsByCity.length > 0 && listingsByCity[0]) {
      const { city, listingType } = listingsByCity[0];
      const action = listingType === 'rent' ? 'for rent' : 'for sale';
      suggestions.push(`Properties ${action} in ${city}`);
    }

    // Add bedroom + type + city combination
    if (
      bedroomCounts.length > 1 && bedroomCounts[1] &&
      topTypes.length > 1 && topTypes[1] &&
      topCities.length > 2 && topCities[2]
    ) {
      const bedrooms = bedroomCounts[1].bedrooms;
      const type = formatPropertyType(topTypes[1].type);
      const city = topCities[2].city;
      if (bedrooms && bedrooms > 0) {
        suggestions.push(`${bedrooms}-bedroom ${type} in ${city}`);
      }
    }

    // Add affordable option suggestion
    if (topCities.length > 0 && topCities[0]) {
      const city = topCities[0].city;
      suggestions.push(`Affordable properties in ${city}`);
    }

    // Add luxury option if we have mansion/penthouse data
    const luxuryType = topTypes.find(t => t.type === 'penthouse' || t.type === 'mansion');
    if (luxuryType && topCities.length > 0 && topCities[0]) {
      const type = formatPropertyType(luxuryType.type);
      const city = topCities[0].city;
      suggestions.push(`Luxury ${type} in ${city}`);
    }

    // If we don't have enough suggestions, add some generic fallbacks
    const fallbackSuggestions = [
      "3-bedroom apartment with parking",
      "Properties for rent",
      "Affordable flats under ₦5M",
      "Modern duplex with security",
      "Office space in business district",
    ];

    // Add fallbacks if needed to reach at least 5 suggestions
    while (suggestions.length < 5 && fallbackSuggestions.length > 0) {
      const fallback = fallbackSuggestions.shift();
      if (fallback && !suggestions.includes(fallback)) {
        suggestions.push(fallback);
      }
    }

    // Return top 10 unique suggestions
    const uniqueSuggestions = [...new Set(suggestions)].slice(0, 10);

    return NextResponse.json({
      success: true,
      suggestions: uniqueSuggestions,
    });
  } catch (error) {
    console.error("Error generating search suggestions:", error);
    
    // Return fallback suggestions on error
    return NextResponse.json({
      success: true,
      suggestions: [
        "3-bedroom apartment with parking",
        "Properties for rent",
        "Affordable flats under ₦5M",
        "Modern duplex with security",
        "Office space in business district",
      ],
    });
  }
}

// OPTIONS handler for CORS (if needed)
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}

