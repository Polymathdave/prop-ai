import { Skeleton } from "@/components/ui/skeleton";

export function PropertyCardSkeleton() {
  return (
    <div className="rounded-2xl shadow-md">
      {/* Image Skeleton */}
      <Skeleton className="h-64 w-full rounded-t-2xl" />

      {/* Content Skeleton */}
      <div className="py-3 px-4 space-y-3">
        {/* Property Type */}
        <Skeleton className="h-4 w-20" />

        {/* Price */}
        <Skeleton className="h-8 w-32" />

        {/* Property Metadata */}
        <div className="flex gap-3">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-16" />
        </div>

        {/* Address */}
        <Skeleton className="h-5 w-full" />
      </div>
    </div>
  );
}

