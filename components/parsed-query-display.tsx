"use client";

import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ParsedQueryDisplayProps {
  parsedQuery: {
    listingType?: string;
    type?: string;
    bedrooms?: number;
    bathrooms?: number;
    parking?: number;
    city?: string;
    address?: string;
    price?: number;
    size?: string;
  } | null;
  onClear: () => void;
}

export function ParsedQueryDisplay({
  parsedQuery,
  onClear,
}: ParsedQueryDisplayProps) {
  if (!parsedQuery) return null;

  return (
    <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-primary/20">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">
            AI-powered search understood:
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-6 px-2 text-xs hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="h-3 w-3 mr-1" />
          Clear
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {parsedQuery.listingType && (
          <Badge variant="secondary">{parsedQuery.listingType}</Badge>
        )}
        {parsedQuery.type && (
          <Badge variant="secondary">{parsedQuery.type}</Badge>
        )}
        {parsedQuery.bedrooms && (
          <Badge variant="secondary">
            {parsedQuery.bedrooms} bedroom
            {parsedQuery.bedrooms > 1 ? "s" : ""}
          </Badge>
        )}
        {parsedQuery.bathrooms && (
          <Badge variant="secondary">
            {parsedQuery.bathrooms} bathroom
            {parsedQuery.bathrooms > 1 ? "s" : ""}
          </Badge>
        )}
        {parsedQuery.parking && (
          <Badge variant="secondary">
            {parsedQuery.parking} parking space
            {parsedQuery.parking > 1 ? "s" : ""}
          </Badge>
        )}
        {parsedQuery.city && (
          <Badge variant="secondary">{parsedQuery.city}</Badge>
        )}
        {parsedQuery.address && (
          <Badge variant="secondary">{parsedQuery.address}</Badge>
        )}
        {parsedQuery.price && (
          <Badge variant="secondary">
            Under ₦{(parsedQuery.price / 1000).toFixed(0)}K
          </Badge>
        )}
        {parsedQuery.size && (
          <Badge variant="outline">{parsedQuery.size}</Badge>
        )}
      </div>
    </div>
  );
}

