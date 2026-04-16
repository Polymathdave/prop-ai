"use client";

import { useState, useMemo, useEffect } from "react";
import { PropertyCard } from "@/components/property-card";
import { PropertyCardSkeleton } from "@/components/property-card-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PropertySearchInput } from "@/components/property-search-input";
import { properties } from "@/db/schema";

type Property = typeof properties.$inferSelect;

export default function Page() {
  const [searchResults, setSearchResults] = useState<Property[] | null>(null);
  const [, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch properties based on detected location or all properties
  useEffect(() => {
    async function fetchProperties() {
      try {
        setIsLoading(true);

        const response = await fetch(`/api/properties`);
        const data = await response.json();

        if (data.success) {
          setProperties(data.data.properties);
        } else {
          console.error("Failed to fetch properties:", data.error);
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProperties();
  }, []);

  const filteredProperties = useMemo(() => {
    // Only show properties when a search has been performed
    if (searchResults !== null) {
      return searchResults;
    }

    // Don't show any properties until user searches
    return [];
  }, [searchResults]);

  return (
    <div className="px-4 lg:px-6 h-full">
      <div className="w-full flex flex-col justify-center gap-8 mx-auto h-full">
        {/* Hero Section */}

        <div>
          <h1 className="scroll-m-20 text-center mb-8 text-2xl md:text-3xl font-medium tracking-tight">
            Where and what type of property do you want?
          </h1>

          {/* Search Input */}
          <PropertySearchInput
            onSearchResults={(results) => setSearchResults(results)}
            onLoadingChange={setIsLoading}
            onClearSearch={() => setSearchResults(null)}
            hasActiveSearch={
              searchResults !== null && searchResults.length >= 0
            }
          />
        </div>

        {searchResults !== null && (
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">
                {isLoading
                  ? ""
                  : `${filteredProperties.length} ${
                      filteredProperties.length === 1
                        ? "Property"
                        : "Properties"
                    } Found`}
              </h2>
              {searchResults.length > 0 && (
                <Badge variant="default" className="gap-1.5">
                  AI Search Results
                </Badge>
              )}
            </div>
          </div>
        )}

        {searchResults === null ? null : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <PropertyCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>

            {filteredProperties.length === 0 && (
              <div className="text-center py-16 px-4">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-semibold text-foreground">
                    No properties found
                  </h3>
                  <p className="text-muted-foreground text-base">
                    We couldn&apos;t find any properties matching your search
                    criteria. Try adjusting your search terms.
                  </p>
                  <Button
                    onClick={() => setSearchResults(null)}
                    size="lg"
                    className="mt-4"
                  >
                    Clear Search
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
