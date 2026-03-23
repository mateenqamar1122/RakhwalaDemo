import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Home, MapPin, Maximize,
  Upload, X, Camera, FileText, AlertCircle, CheckCircle
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { usePropertyNew, usePropertyFormValidation, useImageHandling } from "@/hooks/usePropertyNew";
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

const CITIES = ["Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta"];
const PROPERTY_TYPES = ["Villa", "House", "Apartment", "Penthouse", "Commercial", "Plot", "Farmhouse"];
const STATUSES = ["For Sale", "For Rent", "New Listing"];

const UI_TO_DB_STATUS_MAP: Record<string, string> = {
  "For Sale": "active",
  "For Rent": "active",
  "New Listing": "pending",
  "Sold": "sold",
  "Rented": "rented"
};

const PropertyNew = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { createProperty, isCreating, progress } = usePropertyNew();
  const { validateForm } = usePropertyFormValidation();
  const { images, imagePreviews, imageErrors, handleImageUpload, removeImage, clearImages } = useImageHandling();
  
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    city: "",
    location: "",
    price: "",
    beds: "",
    baths: "",
    sqft: "",
    status: "New Listing",
    contact_name: profile?.full_name || "",
    contact_phone: "",
    contact_email: profile?.email || "",
  });

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        contact_name: profile.full_name || prev.contact_name,
        contact_email: profile.email || prev.contact_email,
        contact_phone: profile.phone || prev.contact_phone
      }));
    }
  }, [profile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm(formData);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setValidationErrors([]);
    setSubmitStatus('idle');

    try {
      // Map UI status to DB status
      const dbStatus = UI_TO_DB_STATUS_MAP[formData.status] || 'pending';
      const submissionData = {
        ...formData,
        status: dbStatus
      };

      await createProperty(submissionData, images);
      setSubmitStatus('success');
      clearImages();
      
      setTimeout(() => {
        navigate('/properties/manage');
      }, 2000);
    } catch (error) {
      setSubmitStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="relative pt-24 pb-14 bg-background border-b border-border">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              List Your <span className="text-gradient-gold">Property</span>
            </h1>
            <p className="text-muted-foreground text-lg font-medium">
              Reach thousands of potential buyers and renters across Pakistan
            </p>
          </motion.div>
        </div>
      </div>

      <RoleBasedAccess allowedRoles={['seller']}>

        <div className="container mx-auto px-6 py-10">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Home size={20} />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="title">Property Title *</Label>
                        <Input
                          id="title"
                          placeholder="e.g., Modern 3-Bed Villa in DHA"
                          value={formData.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="type">Property Type *</Label>
                        <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select property type" />
                          </SelectTrigger>
                          <SelectContent>
                            {PROPERTY_TYPES.map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your property in detail..."
                        rows={4}
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="status">Listing Status</Label>
                      <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map(status => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Location & Price */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin size={20} />
                      Location & Price
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Select value={formData.city} onValueChange={(value) => handleInputChange('city', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                          <SelectContent>
                            {CITIES.map(city => (
                              <SelectItem key={city} value={city}>{city}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="location">Specific Location *</Label>
                        <Input
                          id="location"
                          placeholder="e.g., DHA Phase 5, Block C"
                          value={formData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="price">Price (PKR) *</Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="e.g., 25000000"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        required
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Property Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Maximize size={20} />
                      Property Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <Label htmlFor="beds">Bedrooms</Label>
                        <Input
                          id="beds"
                          type="number"
                          placeholder="e.g., 3"
                          value={formData.beds}
                          onChange={(e) => handleInputChange('beds', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="baths">Bathrooms *</Label>
                        <Input
                          id="baths"
                          type="number"
                          placeholder="e.g., 2"
                          value={formData.baths}
                          onChange={(e) => handleInputChange('baths', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="sqft">Area (sqft) *</Label>
                        <Input
                          id="sqft"
                          placeholder="e.g., 1500"
                          value={formData.sqft}
                          onChange={(e) => handleInputChange('sqft', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Images */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera size={20} />
                      Property Images
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                        <input
                          type="file"
                          id="images"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e.target.files)}
                          className="hidden"
                        />
                        <label htmlFor="images" className="cursor-pointer">
                          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                          <p className="text-sm font-medium text-foreground mb-2">
                            Click to upload images
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG, GIF up to 10MB each (Max 6 images)
                          </p>
                        </label>
                      </div>

                      {/* Image Upload Errors */}
                      {imageErrors.length > 0 && (
                        <div className="space-y-2">
                          {imageErrors.map((error, index) => (
                            <div key={index} className="text-sm text-red-400 flex items-center gap-2">
                              <AlertCircle size={14} />
                              {error}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Form Validation Errors */}
                      {validationErrors.length > 0 && (
                        <div className="space-y-2">
                          {validationErrors.map((error, index) => (
                            <div key={index} className="text-sm text-red-400 flex items-center gap-2">
                              <AlertCircle size={14} />
                              {error}
                            </div>
                          ))}
                        </div>
                      )}
                      {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText size={20} />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <Label htmlFor="contact_name">Contact Name *</Label>
                        <Input
                          id="contact_name"
                          value={formData.contact_name}
                          onChange={(e) => handleInputChange('contact_name', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="contact_phone">Phone Number *</Label>
                        <Input
                          id="contact_phone"
                          placeholder="e.g., +923001234567"
                          value={formData.contact_phone}
                          onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="contact_email">Email Address *</Label>
                        <Input
                          id="contact_email"
                          type="email"
                          value={formData.contact_email}
                          onChange={(e) => handleInputChange('contact_email', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Submit Status */}
              {submitStatus !== 'idle' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg flex items-center gap-3 ${
                    submitStatus === 'success' 
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300' 
                      : 'bg-red-500/10 border border-red-500/20 text-red-300'
                  }`}
                >
                  {submitStatus === 'success' ? (
                    <>
                      <CheckCircle size={20} />
                      <span>Property listed successfully! Redirecting to manage properties...</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={20} />
                      <span>Failed to list property. Please try again.</span>
                    </>
                  )}
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex justify-center"
              >
                <Button
                  type="submit"
                  disabled={isCreating}
                  className="px-8 py-3 rounded-xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden"
                >
                  {isCreating && (
                    <div className="absolute inset-0 bg-foreground/10 flex items-center justify-center">
                      <div className="w-full h-1 bg-foreground/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-gold transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <span className={isCreating ? 'opacity-50' : ''}>
                    {isCreating ? `Creating Property... ${progress}%` : 'List Property'}
                  </span>
                </Button>
              </motion.div>
            </form>
          </div>
        </div>
      </RoleBasedAccess>

      <Footer />
    </div>
  );
};

export default PropertyNew;
