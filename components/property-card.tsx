"use client";
import Image from "next/image";
import { Property } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { getPropertyTypeLabel } from "@/lib/utils";

interface PropertyCardProps {
  property: Property;
  dashboard?: boolean;
}

export function PropertyCard({
  property,
  dashboard = false,
}: PropertyCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Get featured image or first image from the images array
  const displayImage =
    property.images?.find((img) => img.featured)?.url ||
    property.images?.[0]?.url ||
    "/placeholder-property.jpg";

  return (
    <Link
      href={
        dashboard
            ? `/properties/${property.id}/edit`
          : `/properties/${property.id}`
      }
    >
      <div className="rounded-2xl  shadow-md hover:shadow-lg ">
        <div className="relative h-64 overflow-hidden">
          <Image
            src={displayImage}
            width={500}
            height={500}
            alt="Property Image"
            className="size-full"
          />
          {/* Badge Overlay */}
          <div className="absolute top-3 left-3">
            <Badge
              variant={
                property.listingType === "rent" ? "default" : "secondary"
              }
              className="font-semibold"
            >
              {property.listingType === "rent" ? "For Rent" : "For Sale"}
            </Badge>
          </div>
        </div>

        <div className="py-3 px-4">
          {/* Property Type */}
          <div className="text-sm mb-1  text-foreground">
            {getPropertyTypeLabel(property.type)}
          </div>

          {/* Price */}
          <div className="text-2xl font-bold tracking-tight text-balance text-foreground">
            {formatPrice(property.price)}
          </div>

          {/* Property Metadata */}
          <ul className="flex flex-wrap items-center gap-3 text-foreground text-base my-1">
            {property.bedrooms && (
              <li className="items-center flex">
                <span className="font-bold mr-1">{property.bedrooms}</span>bed
              </li>
            )}

            {property.bathrooms && (
              <li className="items-center flex">
                <span className="font-bold mr-1">{property.bathrooms}</span>bath
              </li>
            )}

            {property.size && (
              <li className="items-center flex">
                <span className="font-bold mr-1">{property.size}</span>
              </li>
            )}
          </ul>

          {/* Address */}
          <div className="text-base text-foreground">
            {property.city}, {property.state}
          </div>
        </div>
      </div>
    </Link>
  );
}
