"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Video, Eye, Star, MoreVertical } from "lucide-react";
import Image from "next/image";
import { Spinner } from "./ui/spinner";

export interface MediaFile {
  id: string;
  url: string; // Preview URL (blob) or R2 URL (after upload)
  type: "image" | "video";
  name: string;
  file?: File; // File object for upload (only present before upload)
  featured?: boolean; // Mark image as featured for property card display
}

export interface SimplePropertyFormData {
  type:
    | "detached_duplex"
    | "semi_detached_duplex"
    | "terrace"
    | "flat"
    | "apartment"
    | "penthouse"
    | "bungalow"
    | "mansion"
    | "mini_flat"
    | "room_and_parlour"
    | "single_room"
    | "shop"
    | "office"
    | "warehouse"
    | "land"
    | "event_center"
    | "hotel"
    | "guest_house";
  listingType: "rent" | "sell";
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  parking?: number;
  size: string;
  images: MediaFile[]; // Multiple images support
  videos: MediaFile[]; // Video support
  description: string;
  address?: string;
  city: string;
  state: string;
  coordinates?: { lat: number; lng: number };
}

interface SimplePropertyFormProps {
  initialData?: Partial<SimplePropertyFormData>;
  onSubmit: (data: SimplePropertyFormData) => void;
  isSubmitting?: boolean;
}

const nigerianStates = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

const propertyTypes = [
  { value: "detached_duplex", label: "Detached Duplex" },
  { value: "semi_detached_duplex", label: "Semi-Detached Duplex" },
  { value: "terrace", label: "Terrace/Townhouse" },
  { value: "flat", label: "Flat" },
  { value: "apartment", label: "Apartment" },
  { value: "penthouse", label: "Penthouse" },
  { value: "bungalow", label: "Bungalow" },
  { value: "mansion", label: "Mansion" },
  { value: "mini_flat", label: "Mini Flat (Self-Contained)" },
  { value: "room_and_parlour", label: "Room and Parlour" },
  { value: "single_room", label: "Single Room" },
  { value: "shop", label: "Shop" },
  { value: "office", label: "Office Space" },
  { value: "warehouse", label: "Warehouse" },
  { value: "land", label: "Land (Plot)" },
  { value: "event_center", label: "Event Center" },
  { value: "hotel", label: "Hotel" },
  { value: "guest_house", label: "Guest House" },
];

export function SimplePropertyForm({
  initialData,
  onSubmit,
  isSubmitting = false,
}: SimplePropertyFormProps) {
  const [formData, setFormData] = useState<SimplePropertyFormData>({
    type: initialData?.type || "flat",
    listingType: initialData?.listingType || "rent",
    price: initialData?.price || 0,
    bedrooms: initialData?.bedrooms,
    bathrooms: initialData?.bathrooms,
    parking: initialData?.parking,
    size: initialData?.size || "",
    images: initialData?.images || [],
    videos: initialData?.videos || [],
    description: initialData?.description || "",
    address: initialData?.address || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    coordinates: initialData?.coordinates,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewMedia, setPreviewMedia] = useState<MediaFile | null>(null);

  const handleInputChange = (
    field: keyof SimplePropertyFormData,
    value: string | number | MediaFile[] | { lat: number; lng: number } | undefined
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleFileUpload = (
    files: FileList | null,
    type: "image" | "video"
  ) => {
    if (!files || files.length === 0) return;

    const newMedia: MediaFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      if (type === "image" && !file.type.startsWith("image/")) {
        continue;
      }
      if (type === "video" && !file.type.startsWith("video/")) {
        continue;
      }

      // Create preview URL for immediate display
      const url = URL.createObjectURL(file);

      newMedia.push({
        id: `${Date.now()}-${i}`,
        url, // Preview URL (blob)
        type,
        name: file.name,
        file, // Store the actual File object for later upload
      });
    }

    if (type === "image") {
      const updatedImages = [...formData.images, ...newMedia];
      
      // If this is the first image or no image is featured, mark the first one as featured
      const hasFeatured = updatedImages.some(img => img.featured);
      if (!hasFeatured && updatedImages.length > 0) {
        updatedImages[0].featured = true;
      }
      
      setFormData((prev) => ({
        ...prev,
        images: updatedImages,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        videos: [...prev.videos, ...newMedia],
      }));
    }

    // Clear validation errors
    if (errors.images || errors.image) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.images;
        delete newErrors.image;
        return newErrors;
      });
    }
  };

  const handleRemoveMedia = (id: string, type: "image" | "video") => {
    if (type === "image") {
      const updatedImages = formData.images.filter((img) => img.id !== id);

      // Revoke object URL to prevent memory leaks
      const mediaToRemove = formData.images.find((img) => img.id === id);
      if (mediaToRemove?.url.startsWith("blob:")) {
        URL.revokeObjectURL(mediaToRemove.url);
      }

      // If removed image was featured, make the first remaining image featured
      const wasFeatured = mediaToRemove?.featured;
      if (wasFeatured && updatedImages.length > 0) {
        updatedImages[0].featured = true;
      }

      setFormData((prev) => ({
        ...prev,
        images: updatedImages,
      }));
    } else {
      const mediaToRemove = formData.videos.find((vid) => vid.id === id);
      if (mediaToRemove?.url.startsWith("blob:")) {
        URL.revokeObjectURL(mediaToRemove.url);
      }

      setFormData((prev) => ({
        ...prev,
        videos: prev.videos.filter((vid) => vid.id !== id),
      }));
    }
  };

  const handleSetFeaturedImage = (id: string) => {
    const updatedImages = formData.images.map((img) => ({
      ...img,
      featured: img.id === id,
    }));

    setFormData((prev) => ({
      ...prev,
      images: updatedImages,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!formData.state) {
      newErrors.state = "State is required";
    }
    if (formData.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }
    if (!formData.size.trim()) {
      newErrors.size = "Size is required";
    }
    if (formData.images.length === 0) {
      newErrors.images = "At least one property image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Upload files to R2 before submitting
    try {
      const updatedFormData = { ...formData };
      
      // Upload images
      const uploadedImages = await Promise.all(
        formData.images.map(async (media) => {
          if (media.file) {
            // Upload to R2
            const uploadFormData = new FormData();
            uploadFormData.append("file", media.file);
            uploadFormData.append("type", "image");

            const response = await fetch("/api/upload", {
              method: "POST",
              body: uploadFormData,
            });

            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.error || "Image upload failed");
            }

            const data = await response.json();

            // Revoke blob URL to free memory
            URL.revokeObjectURL(media.url);

            return {
              ...media,
              url: data.url,
              file: undefined, // Remove file object after upload
            };
          }
          return media; // Already uploaded
        })
      );

      // Upload videos
      const uploadedVideos = await Promise.all(
        formData.videos.map(async (media) => {
          if (media.file) {
            // Upload to R2
            const uploadFormData = new FormData();
            uploadFormData.append("file", media.file);
            uploadFormData.append("type", "video");

            const response = await fetch("/api/upload", {
              method: "POST",
              body: uploadFormData,
            });

            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.error || "Video upload failed");
            }

            const data = await response.json();

            // Revoke blob URL to free memory
            URL.revokeObjectURL(media.url);

            return {
              ...media,
              url: data.url,
              file: undefined, // Remove file object after upload
            };
          }
          return media; // Already uploaded
        })
      );

      // Update form data with uploaded URLs
      updatedFormData.images = uploadedImages;
      updatedFormData.videos = uploadedVideos;

      // Trim string fields to prevent whitespace issues
      updatedFormData.city = updatedFormData.city.trim();
      updatedFormData.state = updatedFormData.state.trim();
      updatedFormData.description = updatedFormData.description.trim();
      updatedFormData.size = updatedFormData.size.trim();
      if (updatedFormData.address) {
        updatedFormData.address = updatedFormData.address.trim();
      }

      // Submit the form with uploaded URLs
      onSubmit(updatedFormData);
    } catch (error) {
      console.error("Upload error:", error);
      setErrors((prev) => ({
        ...prev,
        images: error instanceof Error ? error.message : "Upload failed",
      }));
    }
  };

  return (
    <div className="  max-w-6xl">
     
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <FieldSet className="grid grid-cols-1 gap-x-8 md:grid-cols-3">
            <div>
              <FieldLegend>Property Details</FieldLegend>
              <FieldDescription>
                Provide basic information about the property
              </FieldDescription>
            </div>

            <FieldGroup className="md:col-span-2">
              {/* Property Type & Listing Type */}
              <div className="grid md:grid-cols-2 gap-6">
                <Field>
                  <FieldLabel htmlFor="type">Property Type</FieldLabel>
                  <Select
                    defaultValue={formData.type}
                    onValueChange={(value) => handleInputChange("type", value)}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {propertyTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel htmlFor="listingType">Listing Type</FieldLabel>
                  <Select
                    defaultValue={formData.listingType}
                    onValueChange={(value) =>
                      handleInputChange("listingType", value)
                    }
                  >
                    <SelectTrigger id="listingType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rent">For Rent</SelectItem>
                      <SelectItem value="sell">For Sale</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              {/* Description */}
              <Field data-invalid={!!errors.description}>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Describe the property..."
                  rows={4}
                  aria-invalid={!!errors.description}
                />
                <FieldDescription>
                  Provide a detailed description of the property
                </FieldDescription>
                {errors.description && (
                  <FieldError>{errors.description}</FieldError>
                )}
              </Field>

              {/* Price & Size */}
              <div className="grid md:grid-cols-2 gap-6">
                <Field data-invalid={!!errors.price}>
                  <FieldLabel htmlFor="price">Price (₦)</FieldLabel>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    value={formData.price || ""}
                    onChange={(e) =>
                      handleInputChange("price", parseInt(e.target.value) || 0)
                    }
                    placeholder="Enter price"
                    aria-invalid={!!errors.price}
                  />
                  {errors.price && <FieldError>{errors.price}</FieldError>}
                </Field>

                <Field data-invalid={!!errors.size}>
                  <FieldLabel htmlFor="size">Size</FieldLabel>
                  <Input
                    id="size"
                    value={formData.size}
                    onChange={(e) => handleInputChange("size", e.target.value)}
                    placeholder="e.g., 120 sqm, 1200 sq ft"
                    aria-invalid={!!errors.size}
                  />
                  <FieldDescription>
                    Specify the property size with units
                  </FieldDescription>
                  {errors.size && <FieldError>{errors.size}</FieldError>}
                </Field>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <Field>
                  <FieldLabel htmlFor="bedrooms">Bedrooms</FieldLabel>
                  <Input
                    id="bedrooms"
                    type="number"
                    min="0"
                    value={formData.bedrooms || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "bedrooms",
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    placeholder="0"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="bathrooms">Bathrooms</FieldLabel>
                  <Input
                    id="bathrooms"
                    type="number"
                    min="0"
                    value={formData.bathrooms || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "bathrooms",
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    placeholder="0"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="parking">Parking Spaces</FieldLabel>
                  <Input
                    id="parking"
                    type="number"
                    min="0"
                    value={formData.parking || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "parking",
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    placeholder="0"
                  />
                </Field>
              </div>
            </FieldGroup>
          </FieldSet>
          <FieldSeparator />
          <FieldSet className="grid grid-cols-1 gap-x-8 md:grid-cols-3">
            <div>
              <FieldLegend>Location</FieldLegend>
              <FieldDescription>
                Specify where the property is located
              </FieldDescription>
            </div>
            <FieldGroup className="md:col-span-2">
              {/* Address */}
              <Field>
                <FieldLabel htmlFor="address">Street Address</FieldLabel>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="123 Main Street"
                />
                <FieldDescription>Optional</FieldDescription>
              </Field>

              {/* City & State */}
              <div className="grid md:grid-cols-2 gap-6">
                <Field data-invalid={!!errors.city}>
                  <FieldLabel htmlFor="city">City</FieldLabel>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="Lagos"
                    aria-invalid={!!errors.city}
                  />
                  {errors.city && <FieldError>{errors.city}</FieldError>}
                </Field>

                <Field data-invalid={!!errors.state}>
                  <FieldLabel htmlFor="state">State</FieldLabel>
                  <Select
                      defaultValue={formData.state}
                    onValueChange={(value) => handleInputChange("state", value)}
                  >
                    <SelectTrigger id="state" aria-invalid={!!errors.state}>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {nigerianStates.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.state && <FieldError>{errors.state}</FieldError>}
                </Field>
              </div>

              {/* Coordinates */}
              <FieldSeparator>Optional Coordinates</FieldSeparator>

              <div className="grid md:grid-cols-2 gap-6">
                <Field>
                  <FieldLabel htmlFor="latitude">Latitude</FieldLabel>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    defaultValue={formData.coordinates?.lat || ""}
                    onChange={(e) =>
                      handleInputChange("coordinates", {
                        ...formData.coordinates,
                        lat: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      } as { lat: number; lng: number })
                    }
                    placeholder="6.5244"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="longitude">Longitude</FieldLabel>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                        defaultValue={formData.coordinates?.lng || ""}
                    onChange={(e) =>
                      handleInputChange("coordinates", {
                        ...formData.coordinates,
                        lng: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      } as { lat: number; lng: number })
                    }
                    placeholder="3.3792"
                  />
                </Field>
              </div>
            </FieldGroup>
          </FieldSet>
          <FieldSeparator />
          <FieldSet className="grid grid-cols-1 gap-x-8 md:grid-cols-3">
            <div>
              <FieldLegend>Media</FieldLegend>
              <FieldDescription>
                Upload images and videos to showcase your property
              </FieldDescription>
            </div>

            <FieldGroup className="md:col-span-2">
              {/* Images Upload */}
              <Field data-invalid={!!errors.images}>
                <FieldLabel>Property Images</FieldLabel>
                <FieldDescription>
                  Upload multiple images (JPEG, PNG, WebP). Click the star icon to set a featured image for property cards.
                </FieldDescription>

                <div>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileUpload(e.target.files, "image")}
                    className="hidden"
                  />

                  {/* Image Grid with Upload Box */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {/* Upload Box */}
                    <Card
                      className="overflow-hidden border-dashed p-1 border hover:border-primary hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() =>
                        document.getElementById("image-upload")?.click()
                      }
                    >
                      <CardContent className="p-0">
                        <div className="relative aspect-square flex flex-col items-center justify-center gap-2">
                          <div className="bg-muted rounded-full p-4">
                            <Upload className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Upload Images
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Uploaded Images */}
                    {formData.images.map((media) => (
                      <Card
                        key={media.id}
                        className={`overflow-hidden p-1 group relative ${
                          media.featured ? "ring-2 ring-primary" : ""
                        }`}
                      >
                        <CardContent className="p-0">
                          <div className="relative aspect-square">
                            <Image
                              src={media.url}
                              alt={media.name}
                              fill
                              className="object-cover rounded-sm"
                            />
                            
                            {/* Featured Badge */}
                            {media.featured && (
                              <div className="absolute top-2 left-2 z-10">
                                <div className="bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-current" />
                                  Featured
                                </div>
                              </div>
                            )}
                            
                            {/* Dropdown Menu */}
                            <div className="absolute top-2 right-2 z-10">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="secondary"
                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => setPreviewMedia(media)}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Preview
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleSetFeaturedImage(media.id)}
                                    disabled={media.featured}
                                  >
                                    <Star className={`h-4 w-4 mr-2 ${media.featured ? "fill-current" : ""}`} />
                                    {media.featured ? "Featured" : "Set as Featured"}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleRemoveMedia(media.id, "image")}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {errors.images && <FieldError>{errors.images}</FieldError>}
              </Field>

              {/* Videos Upload */}
              <Field>
                <FieldLabel>Property Videos</FieldLabel>
                <FieldDescription>
                  Upload videos to give a virtual tour (MP4, WebM, MOV) -
                  Optional
                </FieldDescription>

                <div>
                  <Input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={(e) => handleFileUpload(e.target.files, "video")}
                    className="hidden"
                  />

                  {/* Video Grid with Upload Box */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {/* Upload Box */}
                    <Card
                      className="overflow-hidden border-dashed p-1 border hover:border-primary hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() =>
                        document.getElementById("video-upload")?.click()
                      }
                    >
                      <CardContent className="p-0">
                        <div className="relative aspect-square flex flex-col items-center justify-center gap-2">
                          <div className="bg-muted rounded-full p-4">
                            <Video className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <p className="text-sm font-medium text-muted-foreground">
                            Upload Videos
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Uploaded Videos */}
                    {formData.videos.map((media) => (
                      <Card
                        key={media.id}
                        className="overflow-hidden p-1 group relative"
                      >
                        <CardContent className="p-0">
                          <div className="relative aspect-square bg-black rounded-sm">
                            <video
                              src={media.url}
                              className="w-full h-full object-cover rounded-sm"
                            />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="bg-primary/80 rounded-full p-3">
                                <Video className="h-6 w-6 text-primary-foreground" />
                              </div>
                            </div>
                            
                            {/* Dropdown Menu */}
                            <div className="absolute top-2 right-2 z-10">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="secondary"
                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => setPreviewMedia(media)}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Preview
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleRemoveMedia(media.id, "video")}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </Field>
            </FieldGroup>
          </FieldSet>
          <FieldSeparator />
          {/* Form Actions */}
          <Field
            orientation="horizontal"
            className="flex items-center justify-end "
          >
            <Button type="submit" className="cursor-pointer" disabled={isSubmitting}>
              {isSubmitting && <Spinner />}
              {isSubmitting
                ? "Saving..."
                : initialData
                ? "Update Property"
                : "Create Property"}
            </Button>
          </Field>
        </FieldGroup>
      </form>

      {/* Media Preview Dialog */}
      <Dialog
        open={!!previewMedia}
        onOpenChange={(open) => !open && setPreviewMedia(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{previewMedia?.name}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {previewMedia?.type === "image" ? (
              <div className="relative w-full aspect-video">
                <Image
                  src={previewMedia.url}
                  alt={previewMedia.name}
                  fill
                  className="object-contain"
                />
              </div>
            ) : previewMedia?.type === "video" ? (
              <video
                src={previewMedia.url}
                controls
                className="w-full aspect-video bg-black"
              >
                Your browser does not support the video tag.
              </video>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
