import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import {
  Home, ChevronLeft, AlertCircle, CheckCircle, Upload, X
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import RoleBasedAccess from "@/components/RoleBasedAccess";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

const CITIES = ["Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta"];
const PROPERTY_TYPES = ["Villa", "House", "Apartment", "Penthouse", "Commercial", "Plot", "Farmhouse"];
const STATUSES = ["active", "pending", "sold", "rented", "inactive"];

const PropertyEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [newImage, setNewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [currentImageUrl, setCurrentImageUrl] = useState<string>("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    location: "",
    city: "Lahore",
    type: "Villa",
    price: "",
    status: "pending",
    beds: "",
    baths: "",
    sqft: "",
    description: "",
    badge: ""
  });

  // Load property data
  useEffect(() => {
    const loadProperty = async () => {
      if (!id) {
        toast({
          title: "Error",
          description: "Property ID is missing",
          variant: "destructive"
        });
        navigate('/properties/manage');
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', id)
          .single() as any;

        if (error) throw error;

        if (!data) {
          toast({
            title: "Error",
            description: "Property not found",
            variant: "destructive"
          });
          navigate('/properties/manage');
          return;
        }

        if (data.owner_id && data.owner_id !== profile?.id) {
          toast({
            title: "Unauthorized",
            description: "You don't have permission to edit this property",
            variant: "destructive"
          });
          navigate('/properties/manage');
          return;
        }

        setFormData({
          title: data.title || "",
          location: data.location || "",
          city: data.city || "Lahore",
          type: data.type || "Villa",
          price: data.price?.toString() || "",
          status: data.status || "pending",
          beds: data.beds?.toString() || "",
          baths: data.baths?.toString() || "",
          sqft: data.sqft || "",
          description: data.description || "",
          badge: data.badge || ""
        });

        if (data.image_url) {
          setCurrentImageUrl(data.image_url);
          setImagePreview(data.image_url);
        }
      } catch (error) {
        console.error('Error loading property:', error);
        toast({
          title: "Error",
          description: "Failed to load property",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProperty();
  }, [id, profile, navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Image size should be less than 5MB",
        variant: "destructive"
      });
      return;
    }

    setNewImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setNewImage(null);
    setImagePreview(currentImageUrl);
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!newImage) return currentImageUrl;

    try {
      setIsUploadingImage(true);
      const timestamp = Date.now();
      const fileName = `${id}/${timestamp}.${newImage.name.split('.').pop()}`;

      const { data, error } = await supabase.storage
        .from('property-images')
        .upload(`properties/${fileName}`, newImage, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: publicUrl } = supabase.storage
        .from('property-images')
        .getPublicUrl(`properties/${fileName}`);

      return publicUrl.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveProperty = async () => {
    setIsSaving(true);
    setSubmitStatus('idle');

    try {
      let imageUrl = currentImageUrl;

      if (newImage) {
        const uploadedUrl = await uploadImage();
        if (!uploadedUrl) {
          throw new Error('Image upload failed');
        }
        imageUrl = uploadedUrl;
      }

      const price = parseInt(formData.price) || 0;
      const priceLabel = `PKR ${(price / 10000000).toFixed(2)} Cr`;

      const updateData = {
        title: formData.title,
        location: formData.location,
        city: formData.city,
        type: formData.type,
        price: price,
        price_label: priceLabel,
        badge: formData.badge || null,
        beds: parseInt(formData.beds) || 0,
        baths: parseInt(formData.baths) || 0,
        sqft: formData.sqft,
        sqft_num: parseInt(formData.sqft.replace(/,/g, '')) || 0,
        description: formData.description,
        status: formData.status,
        image_url: imageUrl
      };

      const { error } = await supabase
        .from('properties')
        .update(updateData as any)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Property updated successfully!",
      });

      setSubmitStatus('success');
      setTimeout(() => navigate('/properties/manage'), 2000);
    } catch (error) {
      console.error('Error updating property:', error);
      setSubmitStatus('error');
      toast({
        title: "Error",
        description: "Failed to update property",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const inputClasses = "w-full px-4 py-3.5 bg-input border-2 border-border rounded-lg text-foreground text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 transition-colors";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-6 py-20">
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <RoleBasedAccess allowedRoles={['seller']}>
      <div className="min-h-screen bg-background">
        <Navbar />

        <div className="container mx-auto px-6 py-16 mt-8">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <Button
                variant="ghost"
                onClick={() => navigate('/properties/manage')}
                className="mb-4 flex items-center gap-2"
              >
                <ChevronLeft size={20} />
                Back to Properties
              </Button>
              <h1 className="text-4xl font-bold text-foreground mb-2">Edit Property</h1>
              <p className="text-muted-foreground">Update your property details</p>
            </div>

            <AnimatePresence>
              {submitStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3"
                >
                  <CheckCircle className="text-emerald-500" size={20} />
                  <span className="text-emerald-300">Property updated successfully! Redirecting...</span>
                </motion.div>
              )}
              {submitStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3"
                >
                  <AlertCircle className="text-red-500" size={20} />
                  <span className="text-red-300">Failed to update property. Please try again.</span>
                </motion.div>
              )}
            </AnimatePresence>

            <Card className="border-border/40 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home size={24} className="text-accent" />
                  Property Information
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Image Upload Section */}
                <div>
                  <Label className="text-foreground font-semibold mb-4 block">Property Image</Label>

                  {imagePreview && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative mb-4 rounded-lg overflow-hidden border-2 border-border"
                    >
                      <img
                        src={imagePreview}
                        alt="Property preview"
                        className="w-full h-64 object-cover"
                      />
                      {newImage && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm bg-blue-500 px-4 py-2 rounded">
                            New Image
                          </span>
                        </div>
                      )}
                    </motion.div>
                  )}

                  <div className="flex gap-3">
                    <label className="flex-1">
                      <div className="flex items-center justify-center gap-2 px-4 py-3.5 bg-input border-2 border-dashed border-accent/50 rounded-lg text-accent hover:bg-input/80 transition-all cursor-pointer">
                        <Upload size={20} />
                        <span className="font-semibold text-sm">
                          {newImage ? 'Change Image' : 'Choose Image'}
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        disabled={isUploadingImage}
                      />
                    </label>

                    {newImage && (
                      <Button
                        onClick={handleRemoveImage}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <X size={18} />
                        Remove
                      </Button>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground mt-2">
                    Max file size: 5MB. Supported formats: JPG, PNG, WebP
                  </p>
                </div>

                <div className="border-t border-border pt-6">
                  <h3 className="text-foreground font-semibold mb-4">Details</h3>
                </div>

                {/* Title */}
                <div>
                  <Label className="text-foreground font-semibold mb-2 block">Property Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Modern Villa in DHA"
                    className={inputClasses}
                  />
                </div>

                {/* Location & City */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-foreground font-semibold mb-2 block">Location</Label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., DHA Phase 5"
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <Label className="text-foreground font-semibold mb-2 block">City</Label>
                    <Select value={formData.city} onValueChange={(value) => setFormData({ ...formData, city: value })}>
                      <SelectTrigger className={inputClasses}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CITIES.map((city) => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Type & Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-foreground font-semibold mb-2 block">Property Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger className={inputClasses}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PROPERTY_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-foreground font-semibold mb-2 block">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger className={inputClasses}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Price */}
                <div>
                  <Label className="text-foreground font-semibold mb-2 block">Price (PKR)</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g., 85000000"
                    className={inputClasses}
                  />
                </div>

                {/* Beds, Baths, Sqft */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label className="text-foreground font-semibold mb-2 block">Bedrooms</Label>
                    <Input
                      type="number"
                      value={formData.beds}
                      onChange={(e) => setFormData({ ...formData, beds: e.target.value })}
                      placeholder="0"
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <Label className="text-foreground font-semibold mb-2 block">Bathrooms</Label>
                    <Input
                      type="number"
                      value={formData.baths}
                      onChange={(e) => setFormData({ ...formData, baths: e.target.value })}
                      placeholder="0"
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <Label className="text-foreground font-semibold mb-2 block">Area (Sq Ft)</Label>
                    <Input
                      value={formData.sqft}
                      onChange={(e) => setFormData({ ...formData, sqft: e.target.value })}
                      placeholder="e.g., 8,400 ft²"
                      className={inputClasses}
                    />
                  </div>
                </div>

                {/* Badge */}
                <div>
                  <Label className="text-foreground font-semibold mb-2 block">Badge (Optional)</Label>
                  <Input
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g., Premium, New Listing, High Demand"
                    className={inputClasses}
                  />
                </div>

                {/* Description */}
                <div>
                  <Label className="text-foreground font-semibold mb-2 block">Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your property in detail..."
                    className="w-full px-4 py-3.5 bg-input border-2 border-border rounded-lg text-foreground text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 transition-colors min-h-40"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6 border-t border-border">
                  <Button
                    onClick={handleSaveProperty}
                    disabled={isSaving || isUploadingImage}
                    className="flex-1 bg-gradient-to-r from-accent to-yellow-600 hover:from-accent/90 hover:to-yellow-700 text-white font-semibold py-3"
                  >
                    {isSaving || isUploadingImage ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {isUploadingImage ? 'Uploading Image...' : 'Saving...'}
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                  <Button
                    onClick={() => navigate('/properties/manage')}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Footer />
      </div>
    </RoleBasedAccess>
  );
};

export default PropertyEdit;

