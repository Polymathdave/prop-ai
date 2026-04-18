"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Property, MediaFile } from "@/db/schema";

type PropertyWithOwner = Property & {
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  ownerRole?: string;
};
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { getPropertyTypeLabel } from "@/lib/utils";
import {
  MapPin,
  Bed,
  Bath,
  Car,
  Maximize,
  Phone,
  Mail,
  Calendar,
  Video,
  ImageIcon,
} from "lucide-react";

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<PropertyWithOwner | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>("");

  useEffect(() => {
    async function fetchProperty() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/properties/${propertyId}`);
        const data = await response.json();

        if (data.success && data.data.properties.length > 0) {
          const prop = data.data.properties[0];
          setProperty(prop);
          // Set the featured image or first image as selected
          const featuredImg =
            prop.images?.find((img: MediaFile) => img.featured)?.url ||
            prop.images?.[0]?.url;
          setSelectedImage(featuredImg || "");
        } else {
          toast.error("Property not found");
          router.push("/");
        }
      } catch (error) {
        console.error("Error fetching property:", error);
        toast.error("Failed to load property details");
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProperty();
  }, [propertyId, router]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowVideoPlayer(false);
  };

  const handleVideoClick = (videoUrl: string) => {
    setCurrentVideoUrl(videoUrl);
    setShowVideoPlayer(true);
  };

  const handleWhatsAppClick = () => {
    if (!property?.ownerPhone) {
      toast.error("Phone number not available", {
        description: "The property owner hasn't provided a phone number.",
      });
      return;
    }

    const message = `Hi! I'm interested in the property at ${property.address || property.city}, ${property.state}. Could you please provide more details?`;
    const whatsappUrl = `https://wa.me/${property.ownerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handlePhoneClick = () => {
    if (!property?.ownerPhone) {
      toast.error("Phone number not available", {
        description: "The property owner hasn't provided a phone number.",
      });
      return;
    }

    window.open(`tel:${property.ownerPhone}`, '_self');
  };

  const handleEmailClick = () => {
    if (!property?.ownerEmail) {
      toast.error("Email not available", {
        description: "The property owner hasn't provided an email address.",
      });
      return;
    }

    const subject = `Inquiry about property in ${property.city}, ${property.state}`;
    const body = `Hi ${property.ownerName || 'there'},

I'm interested in the property you've listed:
- Location: ${property.address || property.city}, ${property.state}
- Price: ${formatPrice(property.price)}
- Type: ${getPropertyTypeLabel(property.type)}

Could you please provide more information about this property?

Best regards`;

    const mailtoUrl = `mailto:${property.ownerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, '_self');
  };

  if (isLoading) {
    return (
      <>
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-[500px] w-full rounded-xl" />
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-lg" />
                ))}
              </div>
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="lg:col-span-1">
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
          </>
    );
  }

  if (!property) {
    return null;
  }

  return (

        <div className="px-4 lg:px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image/Video Display */}
              <div className="relative h-[500px] rounded-xl overflow-hidden bg-muted">
                {showVideoPlayer && currentVideoUrl ? (
                  <video
                    src={currentVideoUrl}
                    controls
                    className="w-full h-full object-cover"
                    autoPlay
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : selectedImage ? (
                  <Image
                    src={selectedImage}
                    alt="Property"
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon className="h-24 w-24 text-muted-foreground" />
                  </div>
                )}

                {/* Listing Type Badge */}
                <div className="absolute top-4 left-4">
                  <Badge
                    variant={
                      property.listingType === "rent" ? "default" : "secondary"
                    }
                    className="text-base px-4 py-2 font-semibold"
                  >
                    {property.listingType === "rent" ? "For Rent" : "For Sale"}
                  </Badge>
                </div>
              </div>

              {/* Thumbnails */}
              <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                {property.images?.map((image: MediaFile, index: number) => (
                  <button
                    key={image.id}
                    onClick={() => handleImageClick(image.url)}
                    className={`relative h-20 md:h-24 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === image.url && !showVideoPlayer
                        ? "border-primary ring-2 ring-primary"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={`Property image ${index + 1}`}
                          width={500}
                          height={500}
                      className="object-cover"
                    />
                    {image.featured && (
                      <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded">
                        Featured
                      </div>
                    )}
                  </button>
                ))}

                {/* Video Thumbnails */}
                {property.videos?.map((video: MediaFile, index: number) => (
                  <button
                    key={video.id}
                    onClick={() => handleVideoClick(video.url)}
                    className={`relative h-20 md:h-24 rounded-lg overflow-hidden border-2 transition-all bg-black ${
                      showVideoPlayer && currentVideoUrl === video.url
                        ? "border-primary ring-2 ring-primary"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Video className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                      Video {index + 1}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl mb-2">
                      {formatPrice(property.price)}
                      {property.listingType === "rent" && (
                        <span className="text-lg font-normal text-muted-foreground">
                          {" "}
                          / year
                        </span>
                      )}
                    </CardTitle>
                    <p className="text-lg text-muted-foreground">
                      {getPropertyTypeLabel(property.type)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Property Features */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {property.bedrooms !== null && property.bedrooms !== undefined && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                      <Bed className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-2xl font-bold">{property.bedrooms}</p>
                        <p className="text-sm text-muted-foreground">
                          Bedroom{property.bedrooms !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  )}

                  {property.bathrooms !== null && property.bathrooms !== undefined && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                      <Bath className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-2xl font-bold">{property.bathrooms}</p>
                        <p className="text-sm text-muted-foreground">
                          Bathroom{property.bathrooms !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  )}

                  {property.parking !== null && property.parking !== undefined && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                      <Car className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-2xl font-bold">{property.parking}</p>
                        <p className="text-sm text-muted-foreground">
                          Parking
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                    <Maximize className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-2xl font-bold">{property.size}</p>
                      <p className="text-sm text-muted-foreground">Size</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Description */}
                <div>
                  <h3 className="text-xl font-semibold mb-3">Description</h3>
                  <p className="text-base text-foreground leading-relaxed whitespace-pre-wrap">
                    {property.description}
                  </p>
                </div>

                <Separator />

                {/* Location */}
                <div>
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location
                  </h3>
                  <div className="space-y-2">
                    {property.address && (
                      <p className="text-base text-foreground">
                        <span className="font-medium">Address:</span>{" "}
                        {property.address}
                      </p>
                    )}
                    <p className="text-base text-foreground">
                      <span className="font-medium">City:</span> {property.city}
                    </p>
                    <p className="text-base text-foreground">
                      <span className="font-medium">State:</span>{" "}
                      {property.state}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Listing Date */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Listed on {formatDate(property.createdAt)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Side */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Contact Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact {property.ownerRole === 'agent' ? 'Agent' : 'Landlord'}</CardTitle>
                  {property.ownerName && (
                    <p className="text-sm text-muted-foreground">
                      {property.ownerName}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Interested in this property? Get in touch with the {property.ownerRole === 'agent' ? 'listing agent' : 'property owner'}.
                  </p>
                  
                  <div className="space-y-3">
                    {/* WhatsApp Button */}
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      size="lg"
                      onClick={handleWhatsAppClick}
                      disabled={!property.ownerPhone}
                    >
                      <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                      </svg>
                      WhatsApp
                    </Button>
                    
                    {/* Phone Call Button */}
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handlePhoneClick}
                      disabled={!property.ownerPhone}
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      Call 
                    </Button>
                    
                    {/* Email Button */}
                    <Button
                      variant="secondary"
                      className="w-full"
                      size="lg"
                      onClick={handleEmailClick}
                      disabled={!property.ownerEmail}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Email
                    </Button>
                  </div>

                 
                </CardContent>
              </Card>

             
            </div>
          </div>
        </div>

  );
}

