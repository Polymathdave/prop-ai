"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import {
  SimplePropertyForm,
  SimplePropertyFormData,
} from "@/components/simple-property-form";
import { Property } from "@/db/schema";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`/api/properties/${propertyId}`);
        const data = await response.json();

        if (data.success && data.data.properties.length > 0) {
          setProperty(data.data.properties[0]);
        } else {
          toast.error("Property not found");
          router.push("/dashboard/properties");
        }
      } catch (error) {
        console.error("Error fetching property:", error);
        toast.error("Failed to load property");
        router.push("/dashboard/properties");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId, router]);

  const handleSubmit = async (formData: SimplePropertyFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Property updated successfully! ✨");
        router.push("/dashboard/properties");
        router.refresh();
      } else {
        toast.error(data.error || "Failed to update property");
      }
    } catch (error) {
      console.error("Error updating property:", error);
      toast.error("Failed to update property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this property? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Property deleted successfully");
        router.push("/dashboard/properties");
        router.refresh();
      } else {
        toast.error(data.error || "Failed to delete property");
      }
    } catch (error) {
      console.error("Error deleting property:", error);
      toast.error("Failed to delete property. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading property...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return null;
  }

  return (
    <>

      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              Edit Property
            </h2>
            <p className="text-muted-foreground mt-2">
              Fill in the property details below
            </p>
          </div>
          <Button variant="destructive" onClick={handleDelete}>Delete Property</Button>
        </div>
        <Separator className="my-4" />
        <SimplePropertyForm
          initialData={property as SimplePropertyFormData}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </>
  );
}
