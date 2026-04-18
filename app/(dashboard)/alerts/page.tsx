"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Bell, Plus, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type PropertyAlert = {
  id: string;
  type?: string;
  listingType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  city?: string;
  state?: string;
  isActive: boolean;
  notificationMethod: string;
  createdAt: string;
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<PropertyAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sheet state
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<PropertyAlert | null>(null);

  // Form state
  const [propertyType, setPropertyType] = useState<string>("any");
  const [listingType, setListingType] = useState<string>("any");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("any");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch("/api/user/alerts");
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || []);
      }
    } catch (err) {
      console.error("Error fetching alerts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setPropertyType("any");
    setListingType("any");
    setMinPrice("");
    setMaxPrice("");
    setBedrooms("any");
    setCity("");
    setState("");
    setError(null);
  };

  const handleEditAlert = (alert: PropertyAlert) => {
    setEditingAlert(alert);
    setPropertyType(alert.type || "any");
    setListingType(alert.listingType || "any");
    setMinPrice(alert.minPrice?.toString() || "");
    setMaxPrice(alert.maxPrice?.toString() || "");
    setBedrooms(alert.bedrooms?.toString() || "any");
    setCity(alert.city || "");
    setState(alert.state || "");
    setEditSheetOpen(true);
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/user/alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type:
            propertyType && propertyType !== "any" ? propertyType : undefined,
          listingType:
            listingType && listingType !== "any" ? listingType : undefined,
          minPrice: minPrice ? parseInt(minPrice) : undefined,
          maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
          bedrooms:
            bedrooms && bedrooms !== "any" ? parseInt(bedrooms) : undefined,
          city: city || undefined,
          state: state || undefined,
          notificationMethod: "email",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to create alert");
        setIsSaving(false);
        return;
      }

      resetForm();
      setCreateSheetOpen(false);
      toast.success("Alert created successfully!");
      fetchAlerts();
    } catch (err) {
      console.error("Error creating alert:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAlert) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/user/alerts/${editingAlert.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type:
            propertyType && propertyType !== "any" ? propertyType : undefined,
          listingType:
            listingType && listingType !== "any" ? listingType : undefined,
          minPrice: minPrice ? parseInt(minPrice) : undefined,
          maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
          bedrooms:
            bedrooms && bedrooms !== "any" ? parseInt(bedrooms) : undefined,
          city: city || undefined,
          state: state || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to update alert");
        setIsSaving(false);
        return;
      }

      resetForm();
      setEditSheetOpen(false);
      setEditingAlert(null);
      toast.success("Alert updated successfully!");
      fetchAlerts();
    } catch (err) {
      console.error("Error updating alert:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/user/alerts/${alertId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Alert deleted");
        fetchAlerts();
      } else {
        toast.error("Failed to delete alert");
      }
    } catch (err) {
      console.error("Error deleting alert:", err);
      toast.error("An error occurred");
    }
  };

  const handleToggleAlert = async (alertId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/user/alerts/${alertId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        toast.success(isActive ? "Alert paused" : "Alert activated");
        fetchAlerts();
      } else {
        toast.error("Failed to update alert");
      }
    } catch (err) {
      console.error("Error toggling alert:", err);
      toast.error("An error occurred");
    }
  };

  const formatAlertCriteria = (alert: PropertyAlert) => {
    const criteria: string[] = [];

    if (alert.type) criteria.push(alert.type.replace(/_/g, " "));
    if (alert.listingType) criteria.push(`for ${alert.listingType}`);
    if (alert.bedrooms)
      criteria.push(`${alert.bedrooms} bed${alert.bedrooms > 1 ? "s" : ""}`);
    if (alert.minPrice || alert.maxPrice) {
      if (alert.minPrice && alert.maxPrice) {
        criteria.push(
          `₦${alert.minPrice.toLocaleString()} - ₦${alert.maxPrice.toLocaleString()}`
        );
      } else if (alert.minPrice) {
        criteria.push(`from ₦${alert.minPrice.toLocaleString()}`);
      } else if (alert.maxPrice) {
        criteria.push(`up to ₦${alert.maxPrice.toLocaleString()}`);
      }
    }
    if (alert.city) criteria.push(alert.city);
    if (alert.state) criteria.push(alert.state);

    return criteria.length > 0 ? criteria.join(" • ") : "Any property";
  };


  return (
    <>

      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Property Alerts</h1>
            <p className="text-muted-foreground mt-2">
              Get notified when properties matching your criteria are listed
            </p>
          </div>

          {/* Create Alert Dialog */}
          <Dialog open={createSheetOpen} onOpenChange={setCreateSheetOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 size-4" />
                Create Alert
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Alert</DialogTitle>
                <DialogDescription>
                  Set up criteria for properties you&apos;re interested in.
                  You&apos;ll receive email notifications when matching
                  properties are listed.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateAlert} className="space-y-4">
                <FieldGroup>
                  <FieldSet className="grid grid-cols-1 gap-4">
                    <Field>
                      <FieldLabel htmlFor="property-type">
                        Property Type
                      </FieldLabel>
                      <Select
                        defaultValue={propertyType}
                        onValueChange={setPropertyType}
                      >
                        <SelectTrigger id="property-type" className="w-full">
                          <SelectValue placeholder="Any type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any type</SelectItem>
                          <SelectItem value="apartment">Apartment</SelectItem>
                          <SelectItem value="flat">Flat</SelectItem>
                          <SelectItem value="detached_duplex">
                            Detached Duplex
                          </SelectItem>
                          <SelectItem value="semi_detached_duplex">
                            Semi-Detached Duplex
                          </SelectItem>
                          <SelectItem value="terrace">Terrace</SelectItem>
                          <SelectItem value="bungalow">Bungalow</SelectItem>
                          <SelectItem value="mansion">Mansion</SelectItem>
                          <SelectItem value="penthouse">Penthouse</SelectItem>
                          <SelectItem value="mini_flat">Mini Flat</SelectItem>
                          <SelectItem value="room_and_parlour">
                            Room and Parlour
                          </SelectItem>
                          <SelectItem value="single_room">
                            Single Room
                          </SelectItem>
                          <SelectItem value="shop">Shop</SelectItem>
                          <SelectItem value="office">Office</SelectItem>
                          <SelectItem value="warehouse">Warehouse</SelectItem>
                          <SelectItem value="land">Land</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="listing-type">
                        Listing Type
                      </FieldLabel>
                      <Select
                        defaultValue={listingType}
                        onValueChange={setListingType}
                      >
                        <SelectTrigger id="listing-type" className="w-full">
                          <SelectValue placeholder="Rent or Sell" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any</SelectItem>
                          <SelectItem value="rent">For Rent</SelectItem>
                          <SelectItem value="sell">For Sale</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>

                    <div className="grid grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel htmlFor="min-price">
                          Min Price (₦)
                        </FieldLabel>
                        <Input
                          id="min-price"
                          type="number"
                          placeholder="e.g., 500000"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor="max-price">
                          Max Price (₦)
                        </FieldLabel>
                        <Input
                          id="max-price"
                          type="number"
                          placeholder="e.g., 2000000"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                        />
                      </Field>
                    </div>

                    <Field>
                      <FieldLabel htmlFor="bedrooms">Bedrooms</FieldLabel>
                      <Select
                        defaultValue={bedrooms}
                        onValueChange={setBedrooms}
                      >
                        <SelectTrigger id="bedrooms" className="w-full">
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any</SelectItem>
                          <SelectItem value="1">1 Bedroom</SelectItem>
                          <SelectItem value="2">2 Bedrooms</SelectItem>
                          <SelectItem value="3">3 Bedrooms</SelectItem>
                          <SelectItem value="4">4 Bedrooms</SelectItem>
                          <SelectItem value="5">5+ Bedrooms</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="city">City</FieldLabel>
                      <Input
                        id="city"
                        placeholder="e.g., Lagos, Abuja"
                        defaultValue={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="state">State</FieldLabel>
                      <Input
                        id="state"
                        placeholder="e.g., Lagos State, FCT"
                        defaultValue={state}
                        onChange={(e) => setState(e.target.value)}
                      />
                    </Field>
                  </FieldSet>

                  {error && <FieldError>{error}</FieldError>}
                </FieldGroup>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Creating..." : "Create Alert"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Alert Dialog */}
        <Dialog open={editSheetOpen} onOpenChange={setEditSheetOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Alert</DialogTitle>
              <DialogDescription>
                Update your alert criteria to receive notifications for
                properties that match.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleUpdateAlert} className="space-y-4">
              <FieldGroup>
                <FieldSet className="grid grid-cols-1 gap-4">
                  <Field>
                    <FieldLabel htmlFor="property-type">
                      Property Type
                    </FieldLabel>
                    <Select
                      defaultValue={propertyType}
                      onValueChange={setPropertyType}
                    >
                      <SelectTrigger id="property-type" className="w-full">
                        <SelectValue placeholder="Any type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any type</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="flat">Flat</SelectItem>
                        <SelectItem value="detached_duplex">
                          Detached Duplex
                        </SelectItem>
                        <SelectItem value="semi_detached_duplex">
                          Semi-Detached Duplex
                        </SelectItem>
                        <SelectItem value="terrace">Terrace</SelectItem>
                        <SelectItem value="bungalow">Bungalow</SelectItem>
                        <SelectItem value="mansion">Mansion</SelectItem>
                        <SelectItem value="penthouse">Penthouse</SelectItem>
                        <SelectItem value="mini_flat">Mini Flat</SelectItem>
                        <SelectItem value="room_and_parlour">
                          Room and Parlour
                        </SelectItem>
                        <SelectItem value="single_room">Single Room</SelectItem>
                        <SelectItem value="shop">Shop</SelectItem>
                        <SelectItem value="office">Office</SelectItem>
                        <SelectItem value="warehouse">Warehouse</SelectItem>
                        <SelectItem value="land">Land</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="listing-type">Listing Type</FieldLabel>
                    <Select
                      defaultValue={listingType}
                      onValueChange={setListingType}
                    >
                      <SelectTrigger id="listing-type" className="w-full">
                        <SelectValue placeholder="Rent or Sell" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="rent">For Rent</SelectItem>
                        <SelectItem value="sell">For Sale</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="min-price">Min Price (₦)</FieldLabel>
                      <Input
                        id="min-price"
                        type="number"
                        placeholder="e.g., 500000"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                      />
                    </Field>

                    <Field>
                      <FieldLabel htmlFor="max-price">Max Price (₦)</FieldLabel>
                      <Input
                        id="max-price"
                        type="number"
                        placeholder="e.g., 2000000"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                      />
                    </Field>
                  </div>

                  <Field>
                    <FieldLabel htmlFor="bedrooms">Bedrooms</FieldLabel>
                    <Select defaultValue={bedrooms} onValueChange={setBedrooms}>
                      <SelectTrigger id="bedrooms" className="w-full">
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="1">1 Bedroom</SelectItem>
                        <SelectItem value="2">2 Bedrooms</SelectItem>
                        <SelectItem value="3">3 Bedrooms</SelectItem>
                        <SelectItem value="4">4 Bedrooms</SelectItem>
                        <SelectItem value="5">5+ Bedrooms</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="city">City</FieldLabel>
                    <Input
                      id="city"
                      placeholder="e.g., Lagos, Abuja"
                      defaultValue={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="state">State</FieldLabel>
                    <Input
                      id="state"
                      placeholder="e.g., Lagos State, FCT"
                      defaultValue={state}
                      onChange={(e) => setState(e.target.value)}
                    />
                  </Field>
                </FieldSet>

                {error && <FieldError>{error}</FieldError>}
              </FieldGroup>

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Updating..." : "Update Alert"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Existing Alerts */}
        <div>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-4 w-64" />
                        </div>
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-9 w-9" />
                        <Skeleton className="h-9 w-20" />
                        <Skeleton className="h-9 w-9" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : alerts.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Bell className="size-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No alerts yet. Create one above to get started!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-4">
              {alerts.map((alert) => (
                <Card key={alert.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant={alert.isActive ? "default" : "secondary"}
                          >
                            {alert.isActive ? "Active" : "Paused"}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatAlertCriteria(alert)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Bell className="size-3" />
                            Email notifications
                          </span>
                          <span>
                            Created{" "}
                            {new Date(alert.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAlert(alert)}
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleToggleAlert(alert.id, alert.isActive)
                          }
                        >
                          {alert.isActive ? "Pause" : "Activate"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAlert(alert.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
