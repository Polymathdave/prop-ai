"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  CheckCircle
} from "lucide-react";

interface PropertyListingFormProps {
  onSubmit: (propertyData: PropertyFormData) => void;
  onCancel?: () => void;
}

export interface PropertyFormData {
  // Basic Info
  title: string;
  description: string;
  listingType: 'buy' | 'rent' | 'sell';
  propertyType: 'apartment' | 'house' | 'office' | 'warehouse';
  
  // Location
  address: string;
  city: string;
  state: string;
  neighborhood: string;
  
  // Pricing
  price: number;
  priceNegotiable: boolean;
  
  // Property Details
  bedrooms: number;
  bathrooms: number;
  parking: number;
  size: string;
  
  // Features
  features: string[];
  amenities: string[];
  
  // Media
  images: string[];
  
  // Contact
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  
  // Additional
  isFeatured: boolean;
  availableFrom: string;
  petFriendly: boolean;
  furnished: boolean;
}

const nigerianStates = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
  'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

const commonFeatures = [
  'Air Conditioning', 'Balcony', 'Garden', 'Pool', 'Gym', 'Security',
  'Elevator', 'Parking', 'Furnished', 'Unfurnished', 'Pet Friendly',
  'Near School', 'Near Hospital', 'Near Market', 'Near Airport',
  'Gated Community', '24/7 Security', 'Generator', 'Water Supply'
];

const commonAmenities = [
  'Swimming Pool', 'Gymnasium', 'Tennis Court', 'Basketball Court',
  'Children Playground', 'Clubhouse', 'Conference Room', 'Business Center',
  'Laundry Service', 'Cleaning Service', 'Concierge', 'Valet Parking'
];

export function PropertyListingForm({ onSubmit, onCancel }: PropertyListingFormProps) {
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    listingType: 'rent',
    propertyType: 'apartment',
    address: '',
    city: '',
    state: '',
    neighborhood: '',
    price: 0,
    priceNegotiable: false,
    bedrooms: 0,
    bathrooms: 0,
    parking: 0,
    size: '',
    features: [],
    amenities: [],
    images: [],
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    isFeatured: false,
    availableFrom: '',
    petFriendly: false,
    furnished: false
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof PropertyFormData, value: string | number | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'Property title is required';
      if (!formData.description.trim()) newErrors.description = 'Property description is required';
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.state) newErrors.state = 'State is required';
    }

    if (step === 2) {
      if (formData.price <= 0) newErrors.price = 'Price must be greater than 0';
      if (formData.bedrooms < 0) newErrors.bedrooms = 'Bedrooms cannot be negative';
      if (formData.bathrooms < 0) newErrors.bathrooms = 'Bathrooms cannot be negative';
      if (!formData.size.trim()) newErrors.size = 'Property size is required';
    }

    if (step === 3) {
      if (!formData.contactName.trim()) newErrors.contactName = 'Contact name is required';
      if (!formData.contactPhone.trim()) newErrors.contactPhone = 'Contact phone is required';
      if (!formData.contactEmail.trim()) newErrors.contactEmail = 'Contact email is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      onSubmit(formData);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `₦${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `₦${(price / 1000).toFixed(0)}K`;
    }
    return `₦${price.toLocaleString()}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-6 w-6 text-primary" />
            List Your Property
          </CardTitle>
          <div className="flex items-center gap-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {step < currentStep ? <CheckCircle className="h-4 w-4" /> : step}
                </div>
                <span className={`text-sm ${
                  step <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step === 1 && 'Basic Info'}
                  {step === 2 && 'Details'}
                  {step === 3 && 'Contact'}
                  {step === 4 && 'Review'}
                </span>
                {step < 4 && <div className="w-8 h-px bg-border" />}
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Property Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Modern 3-bedroom apartment in Victoria Island"
                    className={errors.title ? 'border-destructive' : ''}
                  />
                  {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="listingType">Listing Type *</Label>
                  <Select value={formData.listingType} onValueChange={(value) => handleInputChange('listingType', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rent">For Rent</SelectItem>
                      <SelectItem value="buy">For Sale</SelectItem>
                      <SelectItem value="sell">Selling</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Property Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your property in detail..."
                  rows={4}
                  className={errors.description ? 'border-destructive' : ''}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="propertyType">Property Type *</Label>
                  <Select value={formData.propertyType} onValueChange={(value) => handleInputChange('propertyType', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="office">Office</SelectItem>
                      <SelectItem value="warehouse">Warehouse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Street address"
                    className={errors.address ? 'border-destructive' : ''}
                  />
                  {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="City"
                    className={errors.city ? 'border-destructive' : ''}
                  />
                  {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                    <SelectTrigger className={errors.state ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {nigerianStates.map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.state && <p className="text-sm text-destructive">{errors.state}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Neighborhood</Label>
                  <Input
                    id="neighborhood"
                    value={formData.neighborhood}
                    onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                    placeholder="e.g., Victoria Island, Ikoyi"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Property Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₦) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                    placeholder="Enter price"
                    className={errors.price ? 'border-destructive' : ''}
                  />
                  {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
                  <p className="text-sm text-muted-foreground">
                    {formData.price > 0 && `Formatted: ${formatPrice(formData.price)}`}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="size">Property Size *</Label>
                  <Input
                    id="size"
                    value={formData.size}
                    onChange={(e) => handleInputChange('size', e.target.value)}
                    placeholder="e.g., 120 sqm, 3 bedrooms"
                    className={errors.size ? 'border-destructive' : ''}
                  />
                  {errors.size && <p className="text-sm text-destructive">{errors.size}</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    min="0"
                    value={formData.bedrooms}
                    onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value) || 0)}
                    className={errors.bedrooms ? 'border-destructive' : ''}
                  />
                  {errors.bedrooms && <p className="text-sm text-destructive">{errors.bedrooms}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    min="0"
                    value={formData.bathrooms}
                    onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value) || 0)}
                    className={errors.bathrooms ? 'border-destructive' : ''}
                  />
                  {errors.bathrooms && <p className="text-sm text-destructive">{errors.bathrooms}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parking">Parking Spaces</Label>
                  <Input
                    id="parking"
                    type="number"
                    min="0"
                    value={formData.parking}
                    onChange={(e) => handleInputChange('parking', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Property Features</Label>
                  <p className="text-sm text-muted-foreground mb-3">Select features that apply to your property</p>
                  <div className="flex flex-wrap gap-2">
                    {commonFeatures.map((feature) => (
                      <Badge
                        key={feature}
                        variant={formData.features.includes(feature) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleFeatureToggle(feature)}
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Community Amenities</Label>
                  <p className="text-sm text-muted-foreground mb-3">Select amenities available in your community</p>
                  <div className="flex flex-wrap gap-2">
                    {commonAmenities.map((amenity) => (
                      <Badge
                        key={amenity}
                        variant={formData.amenities.includes(amenity) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => handleAmenityToggle(amenity)}
                      >
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Contact Information */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="contactName">Contact Name *</Label>
                  <Input
                    id="contactName"
                    value={formData.contactName}
                    onChange={(e) => handleInputChange('contactName', e.target.value)}
                    placeholder="Your full name"
                    className={errors.contactName ? 'border-destructive' : ''}
                  />
                  {errors.contactName && <p className="text-sm text-destructive">{errors.contactName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Phone Number *</Label>
                  <Input
                    id="contactPhone"
                    value={formData.contactPhone}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                    placeholder="+234 123 456 7890"
                    className={errors.contactPhone ? 'border-destructive' : ''}
                  />
                  {errors.contactPhone && <p className="text-sm text-destructive">{errors.contactPhone}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email Address *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  placeholder="your.email@example.com"
                  className={errors.contactEmail ? 'border-destructive' : ''}
                />
                {errors.contactEmail && <p className="text-sm text-destructive">{errors.contactEmail}</p>}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="availableFrom">Available From</Label>
                  <Input
                    id="availableFrom"
                    type="date"
                    value={formData.availableFrom}
                    onChange={(e) => handleInputChange('availableFrom', e.target.value)}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="priceNegotiable"
                      checked={formData.priceNegotiable}
                      onChange={(e) => handleInputChange('priceNegotiable', e.target.checked)}
                    />
                    <Label htmlFor="priceNegotiable">Price is negotiable</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="petFriendly"
                      checked={formData.petFriendly}
                      onChange={(e) => handleInputChange('petFriendly', e.target.checked)}
                    />
                    <Label htmlFor="petFriendly">Pet friendly</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="furnished"
                      checked={formData.furnished}
                      onChange={(e) => handleInputChange('furnished', e.target.checked)}
                    />
                    <Label htmlFor="furnished">Furnished</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      checked={formData.isFeatured}
                      onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                    />
                    <Label htmlFor="isFeatured">Featured listing (premium)</Label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-4">Property Summary</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Title:</strong> {formData.title}
                  </div>
                  <div>
                    <strong>Type:</strong> {formData.propertyType} for {formData.listingType}
                  </div>
                  <div>
                    <strong>Location:</strong> {formData.address}, {formData.city}, {formData.state}
                  </div>
                  <div>
                    <strong>Price:</strong> {formatPrice(formData.price)}
                    {formData.priceNegotiable && ' (Negotiable)'}
                  </div>
                  <div>
                    <strong>Size:</strong> {formData.size}
                  </div>
                  <div>
                    <strong>Bedrooms:</strong> {formData.bedrooms}
                  </div>
                  <div>
                    <strong>Bathrooms:</strong> {formData.bathrooms}
                  </div>
                  <div>
                    <strong>Parking:</strong> {formData.parking}
                  </div>
                </div>
                
                {formData.features.length > 0 && (
                  <div className="mt-4">
                    <strong>Features:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {formData.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {formData.amenities.length > 0 && (
                  <div className="mt-4">
                    <strong>Amenities:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {formData.amenities.map((amenity, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-4">Contact Information</h3>
                <div className="text-sm space-y-1">
                  <div><strong>Name:</strong> {formData.contactName}</div>
                  <div><strong>Phone:</strong> {formData.contactPhone}</div>
                  <div><strong>Email:</strong> {formData.contactEmail}</div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <div>
              {currentStep > 1 && (
                <Button variant="outline" onClick={handlePrevious}>
                  Previous
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              {currentStep < 4 ? (
                <Button onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="bg-primary text-primary-foreground">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit Listing
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
