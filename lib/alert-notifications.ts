import { db } from "@/db";
import { propertyAlerts, users, properties } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Check if a property matches alert criteria
 */
function propertyMatchesAlert(
  property: {
    type: string;
    listingType: string;
    price: number;
    bedrooms: number | null;
    city: string;
    state: string;
  },
  alert: {
    type: string | null;
    listingType: string | null;
    minPrice: number | null;
    maxPrice: number | null;
    bedrooms: number | null;
    city: string | null;
    state: string | null;
  }
): boolean {
  // Check property type
  if (alert.type && property.type !== alert.type) {
    return false;
  }

  // Check listing type
  if (alert.listingType && property.listingType !== alert.listingType) {
    return false;
  }

  // Check min price
  if (alert.minPrice && property.price < alert.minPrice) {
    return false;
  }

  // Check max price
  if (alert.maxPrice && property.price > alert.maxPrice) {
    return false;
  }

  // Check bedrooms
  if (alert.bedrooms && property.bedrooms !== alert.bedrooms) {
    return false;
  }

  // Check city (case-insensitive)
  if (alert.city && property.city.toLowerCase() !== alert.city.toLowerCase()) {
    return false;
  }

  // Check state (case-insensitive)
  if (alert.state && property.state.toLowerCase() !== alert.state.toLowerCase()) {
    return false;
  }

  return true;
}

/**
 * Find users who should be notified about a new property
 * Returns array of user emails and their alert preferences
 */
export async function findMatchingAlerts(propertyId: string) {
  try {
    // Get the property details
    const property = await db
      .select()
      .from(properties)
      .where(eq(properties.id, propertyId))
      .limit(1);

    if (!property || property.length === 0) {
      console.error("Property not found:", propertyId);
      return [];
    }

    const propertyData = property[0];

    // Get all active alerts
    const activeAlerts = await db
      .select({
        alert: propertyAlerts,
        user: users,
      })
      .from(propertyAlerts)
      .innerJoin(users, eq(propertyAlerts.userId, users.id))
      .where(eq(propertyAlerts.isActive, true));

    // Filter alerts that match the property
    const matchingAlerts = activeAlerts.filter(({ alert }) =>
      propertyMatchesAlert(propertyData, alert)
    );

    // Format the results
    return matchingAlerts.map(({ alert, user }) => ({
      email: user.email,
      name: user.name,
      alertId: alert.id,
      notificationMethod: alert.notificationMethod,
      property: {
        id: propertyData.id,
        type: propertyData.type,
        listingType: propertyData.listingType,
        price: propertyData.price,
        bedrooms: propertyData.bedrooms,
        city: propertyData.city,
        state: propertyData.state,
        address: propertyData.address,
      },
    }));
  } catch (error) {
    console.error("Error finding matching alerts:", error);
    return [];
  }
}

/**
 * Send email notification to users about a matching property
 * This is a placeholder - you'll need to implement actual email sending
 * using a service like Resend, SendGrid, or AWS SES
 */
export async function sendAlertNotifications(propertyId: string) {
  const matches = await findMatchingAlerts(propertyId);

  if (matches.length === 0) {
    console.log("No matching alerts for property:", propertyId);
    return;
  }

  console.log(`Found ${matches.length} matching alerts for property:`, propertyId);

  // TODO: Implement actual email sending
  // For now, just log the notifications
  for (const match of matches) {
    console.log(`Would send email to: ${match.email}`);
    console.log(`Property: ${match.property.type} in ${match.property.city}`);
    console.log(`Price: ₦${match.property.price.toLocaleString()}`);
    
    // Example email content structure:
    /*
    await sendEmail({
      to: match.email,
      subject: `New Property Alert: ${match.property.type} in ${match.property.city}`,
      html: `
        <h1>New Property Matching Your Alert!</h1>
        <p>Hi ${match.name},</p>
        <p>A new property has been listed that matches your alert criteria:</p>
        <ul>
          <li>Type: ${match.property.type}</li>
          <li>Location: ${match.property.city}, ${match.property.state}</li>
          <li>Price: ₦${match.property.price.toLocaleString()}</li>
          <li>Bedrooms: ${match.property.bedrooms || 'N/A'}</li>
        </ul>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/properties/${match.property.id}">
          View Property
        </a>
      `,
    });
    */
  }

  return matches;
}

