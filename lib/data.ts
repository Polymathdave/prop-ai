import { z } from "zod";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";



/**
 * Get user's approximate location using browser Geolocation API
 * This is optional and requires user permission
 * 
 * @returns Location object with city/state or null if denied/unavailable
 */
export async function getUserLocation(): Promise<{ city?: string; state?: string; country?: string } | null> {
    if (typeof window === "undefined" || !navigator.geolocation) {
        return null;
    }

    return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    // Use reverse geocoding API to get city/state from coordinates
                    // You can use services like OpenStreetMap Nominatim (free) or Google Maps Geocoding
                    const { latitude, longitude } = position.coords;

                    // Using OpenStreetMap Nominatim (free, no API key needed)
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
                        {
                            headers: {
                                'User-Agent': 'PropertySearchApp/1.0' // Required by Nominatim
                            }
                        }
                    );

                    if (!response.ok) {
                        resolve(null);
                        return;
                    }

                    const data = await response.json();
                    const address = data.address;

                    resolve({
                        city: address.city || address.town || address.village || address.county,
                        state: address.state || address.region,
                        country: address.country,
                    });
                } catch (error) {
                    console.error("Error getting location details:", error);
                    resolve(null);
                }
            },
            (error) => {
                console.log("Location permission denied or unavailable:", error);
                resolve(null);
            },
            {
                enableHighAccuracy: false, // Faster, less battery
                timeout: 5000, // 5 seconds
                maximumAge: 300000, // Cache for 5 minutes
            }
        );
    });
}

/**
 * Parse natural language query into structured property filters using AI
 * 
 * @param query - Natural language search query (e.g., "Find me a 2-bedroom under ₦1,200,000 in Wuse Abuja")
 * @returns Structured property filters that can be used to query the database
 * 
 * @example
 * ```typescript
 * const filters = await filterListingByUserPrompt("2-bedroom apartment in Lagos under ₦1M");
 * // Returns:
 * // {
 * //   propertyType: "apartment",
 * //   bedrooms: 2,
 * //   city: "Lagos",
 * //   priceRange: { min: 0, max: 1000000 }
 * // }
 * ```
 */
export async function filterListingByUserPrompt(
    query: string
) {

    const { object } = await generateObject({
        model: openai("openai/gpt-4.1"),
        schema: z.object({
            PropertyFilter:z.object({
                type: z
                    .enum(["apartment", "house", "office", "warehouse"])
                    .optional()
                    .describe("Type of property: apartment, house, office, or warehouse"),
                listingType: z
                    .enum(["rent", "sell"])
                    .optional()
                    .describe("Type of listing: rent or sell"),
                price: z
                    .number()
                    .min(0)
                    .optional()
                    .describe("Maximum price in Nigerian Naira (₦)"),
                bedrooms: z
                    .number()
                    .int()
                    .min(0)
                    .max(20)
                    .optional()
                    .describe("Number of bedrooms"),
                bathrooms: z
                    .number()
                    .int()
                    .min(0)
                    .max(20)
                    .optional()
                    .describe("Number of bathrooms"),
                parking: z
                    .number()
                    .int()
                    .min(0)
                    .optional()
                    .describe("Number of parking spaces"),
                size: z
                    .string()
                    .optional()
                    .describe("Size of property (e.g., '120 sqm', '200 sqm')"),
                address: z
                    .string()
                    .optional()
                    .describe("Street address, area, or specific location (e.g., 'Wuse 2', 'Victoria Island', 'Plot 123')"),
                city: z
                    .string()
                    .optional()
                    .describe("City in Nigeria (e.g., Lagos, Abuja, Port Harcourt, Kano)"),
                state: z
                    .string()
                    .optional()
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
- Property types: apartment, house, office, warehouse
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
2. Identify property type (apartment, house, office, warehouse)
3. Parse bedroom, bathroom, and parking counts
4. Convert prices to actual amounts (handle k, m, million, thousand abbreviations)
5. Extract property size if mentioned
6. Identify city, state (focus on African countries, but support global)
7. Extract specific address, area, or neighborhood

Be intelligent about:
- Common abbreviations (e.g., "apt" = apartment, "BR" = bedroom, "BA" = bathroom)
- African cities and areas (Lagos, Nairobi, Accra, Johannesburg, Cairo, etc.)
- Area names and neighborhoods (include in address field)
- If no listing type is specified but context suggests one, infer it
- For size, extract and preserve the unit (sqm, sqft, etc.)
- Parking can be mentioned as "2 parking spaces", "parking for 2 cars", "2-car garage"
- Currency handling for various African countries (₦ Naira, KSh Kenyan Shilling, GHS Cedi, ZAR Rand, etc.)
`,
    });

    console.log({object});
    return object;

}
