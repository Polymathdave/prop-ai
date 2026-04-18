import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { properties, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Building, Plus } from "lucide-react";
import Link from "next/link";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { PropertyCard } from "@/components/property-card";
import { Separator } from "@/components/ui/separator";

export default async function PropertiesPage() {
  // Get session on server side
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Check if user is authenticated
  if (!session?.user) {
    redirect("/login?redirect=/dashboard/properties");
  }

  // Fetch full user data from database to check role
  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!dbUser) {
    redirect("/login?redirect=/dashboard/properties");
  }

  // Only landlords and agents can access this page
  if (dbUser.role !== "landlord" && dbUser.role !== "agent") {
    redirect("/dashboard");
  }

  // Fetch user's properties
  const userProperties = await db
    .select()
    .from(properties)
    .where(eq(properties.listedBy, session.user.id))
    .orderBy(properties.id);

  return (
    <>
     

      {userProperties.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Building />
            </EmptyMedia>
            <EmptyTitle>No properties yet</EmptyTitle>
            <EmptyDescription>
              Get started by listing your first property
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/properties/new">List Property</Link>
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="px-4 lg:px-6 flex flex-1 flex-col gap-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                My Properties
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage and edit your property listings
              </p>
            </div>
            <Button asChild>
              <Link href="/properties/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Link>
            </Button>
          </div>

          <Separator  />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {userProperties.map((property) => {
              return <PropertyCard key={property.id} property={property} dashboard={true} />;
            })}
          </div>
        </div>
      )}
    </>
  );
}
