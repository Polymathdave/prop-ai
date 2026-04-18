"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  SimplePropertyForm,
  SimplePropertyFormData,
} from "@/components/simple-property-form";
import { DashboardHeader } from "@/components/dashboard-header";
import { Separator } from "@/components/ui/separator";

export default function NewPropertyPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: SimplePropertyFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Property listed successfully! 🎉");
        router.push("/dashboard/properties");
        router.refresh();
      } else {
        toast.error(data.error || "Failed to list property");
      }
    } catch (error) {
      console.error("Error creating property:", error);
      toast.error("Failed to list property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DashboardHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Properties", href: "/dashboard/properties" },
          { label: "New Property" },
        ]}
      />
      <div className="w-full p-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            List New Property
          </h2>
          <p className="text-muted-foreground mt-2">
            Fill in the property details below
          </p>
        </div>
        <Separator className="my-4" />
        <SimplePropertyForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </>
  );
}
