"use client";

import { useState, useEffect } from "react";
import TextareaAutosize from "react-textarea-autosize";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";
import { toast } from "sonner";
import { properties } from "@/db/schema";
import { Search } from "lucide-react";

type Property = typeof properties.$inferSelect;

interface PropertySearchInputProps {
  onSearchResults?: (results: Property[], filters: PropertyFilters) => void;
  onLoadingChange?: (isLoading: boolean) => void;
  onClearSearch?: () => void;
  hasActiveSearch?: boolean;
}

type PropertyFilters = {
  type?: string;
  listingType?: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  parking?: number;
  size?: string;
  address?: string | null | undefined;
  city?: string;
  state?: string;
};

// Fallback suggestions in case API fails
const FALLBACK_SUGGESTIONS = [
  "3-bedroom apartment with parking",
  "Properties for rent",
  "Affordable flats under ₦5M",
  "Modern duplex with security",
  "Office space in business district",
];

export function PropertySearchInput({
  onSearchResults,
  onLoadingChange,
  onClearSearch,
  hasActiveSearch = false,
}: PropertySearchInputProps) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(FALLBACK_SUGGESTIONS);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>(FALLBACK_SUGGESTIONS);

  // Fetch and cache suggestions on mount
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        // Check cache first
        const cached = localStorage.getItem('property-suggestions');
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          // Cache valid for 24 hours
          if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
            setSuggestions(data);
            setFilteredSuggestions(data);
            return;
          }
        }

        // Fetch fresh suggestions
        const response = await fetch('/api/search/suggestions');
        const result = await response.json();
        
        if (result.success && result.suggestions) {
          setSuggestions(result.suggestions);
          setFilteredSuggestions(result.suggestions);
          
          // Cache the suggestions
          localStorage.setItem('property-suggestions', JSON.stringify({
            data: result.suggestions,
            timestamp: Date.now(),
          }));
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        // Silently fail and use fallback suggestions
      }
    };

    fetchSuggestions();
  }, []);

  // Filter suggestions based on query
  useEffect(() => {
    if (!query.trim()) {
      setFilteredSuggestions(suggestions);
    } else {
      const filtered = suggestions.filter(s =>
        s.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    }
  }, [query, suggestions]);

  const handleSearch = async () => {
    const trimmedQuery = query.trim();
    
    if (!trimmedQuery) {
      toast.error("Please enter a search query");
      return;
    }

    if (trimmedQuery.length > 500) {
      toast.error("Query is too long (max 500 characters)");
      return;
    }

    try {
      setIsSearching(true);
      onLoadingChange?.(true);

      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: trimmedQuery }),
      });

      const data = await response.json();

      if (data.success) {
        onSearchResults?.(data.data.properties, data.data.filters);
        
        // Show success toast with filter info
        const filterCount = Object.keys(data.data.filters).filter(
          key => data.data.filters[key] !== undefined && data.data.filters[key] !== null
        ).length;
        
        toast.success(
          `Found ${data.data.count} ${data.data.count === 1 ? "property" : "properties"}`,
          {
            description: filterCount > 0 
              ? `Applied ${filterCount} ${filterCount === 1 ? "filter" : "filters"} from your search`
              : "Showing all matching properties"
          }
        );
      } else {
        toast.error("Search failed", {
          description: data.error || "Please try again",
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Search failed", {
        description: "Unable to process your search. Please try again.",
      });
    } finally {
      setIsSearching(false);
      onLoadingChange?.(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleClear = () => {
    setQuery("");
    onClearSearch?.();
    toast.info("Search cleared", {
      description: "Showing all available properties",
    });
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setIsFocused(false);
  };

  // Show suggestions when focused AND there are filtered results to show
  const showSuggestions = isFocused && filteredSuggestions.length > 0;

  return (
    <div className="relative grid w-full max-w-4xl mx-auto gap-6">
      <InputGroup>
        <TextareaAutosize
          data-slot="input-group-control"
          className="flex field-sizing-content min-h-16 w-full resize-none rounded-md bg-transparent px-3 py-2.5 text-base transition-[color,box-shadow] outline-none md:text-sm"
          placeholder="Type here...."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          disabled={isSearching}
          maxRows={6}
        />
        <InputGroupAddon align="block-end">
          <div className="flex gap-2 ml-auto">
            {hasActiveSearch && (
              <InputGroupButton 
                size="sm" 
                variant="secondary"
                onClick={handleClear}
                disabled={isSearching}
              >
                Clear
              </InputGroupButton>
            )}
            <InputGroupButton 
              size="sm" 
              variant="default"
              onClick={handleSearch}
              disabled={isSearching || !query.trim()}
            >
              {isSearching ? "Searching..." : "Search"}
            </InputGroupButton>
          </div>
        </InputGroupAddon>
      </InputGroup>

      {showSuggestions && (
          <div className="p-2 space-y-1">
            {filteredSuggestions.slice(0, 5).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Search className="h-4 w-4 text-primary flex-shrink-0" />
                <span>{suggestion}</span>
              </button>
            ))}
          </div>
      )}
    </div>
  );
}

