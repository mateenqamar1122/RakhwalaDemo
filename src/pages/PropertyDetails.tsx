import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin, BedDouble, Bath, Maximize, Heart, Share2,
  ChevronLeft, ChevronRight, Phone,
  AlertCircle, Clock, Eye, User
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFavorites } from "@/hooks/useFavorites";
import { supabase } from "@/lib/supabase";

import {
  MorphingPopover,
  MorphingPopoverTrigger,
  MorphingPopoverContent,
} from "@/components/ui/morphing-popover";

// Local image fallback
import p1 from "@/assets/property-1.jpg";
import p2 from "@/assets/property-2.jpg";
import p3 from "@/assets/property-3.jpg";
import p4 from "@/assets/property-4.jpg";
import p5 from "@/assets/property-5.jpg";
import p6 from "@/assets/property-6.jpg";
import {GoMail} from "react-icons/go";
const FALLBACK_IMAGES = [p1, p2, p3, p4, p5, p6];
const getFallbackImage = (index: number) => FALLBACK_IMAGES[index % 6];

interface PropertyDetailsType {
  id: string;
  title: string;
  location: string;
  city: string;
  type: string;
  price: number;
  price_label: string;
  beds: number;
  baths: number;
  sqft: string;
  sqft_num: number;
  description: string;
  image_url: string;
  badge: string | null;
  status: string;
  created_at: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  owner_id?: string;
  views?: number;
  inquiries_count?: number;
  featured?: boolean;
  property_images?: Array<{
    id: string;
    image_url: string;
    is_primary: boolean;
    sort_order: number;
  }>;
}

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toggleFavorite } = useFavorites();
  const [property, setProperty] = useState<PropertyDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from("properties")
          .select(
            `
            *,
            property_images (
              id,
              image_url,
              is_primary,
              sort_order
            )
          `
          )
          .eq("id", id)
          .single();

        if (fetchError) {
          setError("Property not found");
          return;
        }

        setProperty(data);
        // Initially set favorite to false - user can toggle it
        setIsFavorite(false);
      } catch (err) {
        setError("Failed to load property details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPropertyDetails();
    }
  }, [id]);

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? (images.length - 1) : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const handleToggleFavorite = async () => {
    if (id) {
      await toggleFavorite(id);
      setIsFavorite(!isFavorite);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert("Property link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-5xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="aspect-[16/9] bg-foreground/10 rounded-2xl" />
              <div className="space-y-4">
                <div className="h-8 bg-foreground/10 rounded w-3/4" />
                <div className="h-6 bg-foreground/10 rounded w-1/2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-6 py-20 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <p className="text-xl text-muted-foreground">{error}</p>
          <Button className="mt-6" onClick={() => navigate("/properties")}>
            Back to Properties
          </Button>
        </div>
      </div>
    );
  }

  const images = property.property_images && property.property_images.length > 0
    ? property.property_images
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(img => img.image_url)
    : [property.image_url || getFallbackImage(0)];

  const statusColor = {
    active: "bg-green-500/20 text-green-600",
    pending: "bg-yellow-500/20 text-yellow-600",
    sold: "bg-red-500/20 text-red-600",
    rented: "bg-blue-500/20 text-blue-600",
    inactive: "bg-gray-500/20 text-gray-600",
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Single Unified Content Section */}
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Back Button */}
            <Button
              variant="outline"
              onClick={() => navigate("/properties")}
              className="flex items-center gap-2"
            >
              <ChevronLeft size={20} />
              Back to Properties
            </Button>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
            {/* Image Gallery */}
            <div className="relative overflow-hidden rounded-2xl bg-card border border-border aspect-[16/9]">
              <motion.img
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                src={images[currentImageIndex]}
                alt={`${property.title} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Image Controls - Always show */}
              <button
                onClick={handlePreviousImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background rounded-full p-3 transition-colors z-10 hover:scale-110 active:scale-95"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background rounded-full p-3 transition-colors z-10 hover:scale-110 active:scale-95"
              >
                <ChevronRight size={24} />
              </button>

              {/* Image Counter - Always show */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur px-4 py-2 rounded-full text-sm font-semibold border border-border/50">
                {currentImageIndex + 1} / {images.length}
              </div>

              {/* Badge */}
              {property.badge && (
                <div className="absolute top-4 left-4 px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg font-bold text-sm">
                  {property.badge}
                </div>
              )}

              {/* Actions */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={handleToggleFavorite}
                  className={`rounded-full p-3 transition-all ${
                    isFavorite
                      ? "bg-red-500 text-white"
                      : "bg-background/80 hover:bg-background text-foreground"
                  }`}
                >
                  <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
                </button>
                <button
                  onClick={handleShare}
                  className="rounded-full p-3 bg-background/80 hover:bg-background transition-colors"
                >
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            {/* Image Thumbnails Carousel - Always show */}
            {images.length > 0 && (
              <div className="space-y-3">
                <div className="flex gap-3 overflow-x-auto pb-2 scroll-smooth">
                  {images.map((img, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex-shrink-0 w-28 h-28 rounded-xl overflow-hidden border-3 transition-all duration-300 ${
                        idx === currentImageIndex
                          ? "border-accent shadow-lg shadow-accent/60 ring-2 ring-accent/30"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = getFallbackImage(idx);
                        }}
                      />
                    </motion.button>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="flex gap-1">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`transition-all ${
                          idx === currentImageIndex
                            ? "w-2 h-2 bg-accent rounded-full"
                            : "w-1.5 h-1.5 bg-border rounded-full hover:bg-accent/50"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground ml-2">
                    {images.length > 1 ? "Click thumbnail or use arrows to view images" : ""}
                  </p>
                </div>
              </div>
            )}

            {/* Header Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                {/* Title and Status */}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
                      {property.title}
                    </h1>
                    <Badge
                      className={`${
                        statusColor[property.status as keyof typeof statusColor] ||
                        statusColor.pending
                      } border-0`}
                    >
                      {property.status.charAt(0).toUpperCase() +
                        property.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin size={18} />
                    <span className="text-lg">{property.location}, {property.city}</span>
                  </div>
                </div>

                {/* Price */}
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground mb-1">Price</p>
                  <p className="font-serif text-4xl font-bold text-gradient-gold">
                    {property.price_label}
                  </p>
                </div>

                {/* Key Features */}
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="p-4 bg-card border border-border rounded-lg text-center">
                    <div className="flex justify-center mb-2">
                      <BedDouble size={24} className="text-foreground" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {property.beds}
                    </p>
                    <p className="text-sm text-muted-foreground">Bedrooms</p>
                  </div>
                  <div className="p-4 bg-card border border-border rounded-lg text-center">
                    <div className="flex justify-center mb-2">
                      <Bath size={24} className="text-foreground" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {property.baths}
                    </p>
                    <p className="text-sm text-muted-foreground">Bathrooms</p>
                  </div>
                  <div className="p-4 bg-card border border-border rounded-lg text-center">
                    <div className="flex justify-center mb-2">
                      <Maximize size={24} className="text-foreground" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {property.sqft}
                    </p>
                    <p className="text-sm text-muted-foreground">Area</p>
                  </div>
                </div>

                {/* Description */}
                <div className="pt-4 space-y-4">
                  <h2 className="font-serif text-2xl font-bold">Description</h2>
                  <p className="text-foreground/80 leading-relaxed">
                    {property.description}
                  </p>
                </div>

                {/* Property Details */}
                <div className="pt-4 space-y-4">
                  <h2 className="font-serif text-2xl font-bold">Property Details</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-card border border-border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Type</p>
                      <p className="font-semibold text-foreground">{property.type}</p>
                    </div>
                    <div className="p-4 bg-card border border-border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">City</p>
                      <p className="font-semibold text-foreground">{property.city}</p>
                    </div>
                    <div className="p-4 bg-card border border-border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Area (sqft)</p>
                      <p className="font-semibold text-foreground">
                        {property.sqft_num?.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 bg-card border border-border rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Listed</p>
                      <p className="font-semibold text-foreground">
                        {new Date(property.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar - Contact Section */}
              <div className="md:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="sticky top-24 space-y-6"
                >
                  {/* Contact Card */}
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle>Contact Agent</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {property.contact_name && (
                        <div className="flex items-start gap-3">
                          <User size={20} className="mt-1 text-foreground/60" />
                          <div>
                            <p className="text-sm text-muted-foreground">Agent</p>
                            <p className="font-semibold text-foreground">
                              {property.contact_name}
                            </p>
                          </div>
                        </div>
                      )}
                      {property.contact_phone && (
                        <div className="flex items-start gap-3">
                          <Phone size={20} className="mt-1 text-foreground/60" />
                          <div>
                            <p className="text-sm text-muted-foreground">Phone</p>
                            <a
                              href={`tel:${property.contact_phone}`}
                              className="font-semibold text-gradient-gold hover:underline"
                            >
                              {property.contact_phone}
                            </a>
                          </div>
                        </div>
                      )}
                      {property.contact_email && (
                        <div className="flex items-start gap-3">
                          <GoMail size={20} className="mt-1 text-foreground/60" />
                          <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <a
                              href={`mailto:${property.contact_email}`}
                              className="font-semibold text-gradient-gold hover:underline break-all text-sm"
                            >
                              {property.contact_email}
                            </a>
                          </div>
                        </div>
                      )}

                      <div className="pt-4 space-y-3">
                        <MorphingPopover>
                          <MorphingPopoverTrigger
                            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold py-2 rounded-lg transition-all"
                            asChild
                          >
                            <button className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold py-2 rounded-lg transition-all">
                              Contact Agent
                            </button>
                          </MorphingPopoverTrigger>

                          <MorphingPopoverContent className="w-64">
                            <div className="space-y-2">
                              {/* WhatsApp Option - Primary/Gold Color */}
                              {property.contact_phone && (
                                <motion.button
                                  onClick={() => {
                                    const message = `Hi, I'm interested in the property: ${property.title}`;
                                    const encodedMessage = encodeURIComponent(message);
                                    window.open(
                                      `https://wa.me/${property.contact_phone.replace(/\D/g, '')}?text=${encodedMessage}`,
                                      '_blank'
                                    );
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-accent/10 border border-accent/30 hover:bg-accent/20 transition-all"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <img src="/whatsppp_icon.svg" alt="WhatsApp" className="w-8 h-8 flex-shrink-0" />
                                  <div className="text-left flex-1">
                                    <p className="font-semibold text-sm text-foreground">WhatsApp</p>
                                    <p className="text-xs text-muted-foreground">{property.contact_phone}</p>
                                  </div>
                                  <span className="text-xs font-bold text-accent">→</span>
                                </motion.button>
                              )}

                              {/* Email Option - Secondary Color */}
                              {property.contact_email && (
                                <motion.button
                                  onClick={() => {
                                    const message = `Hi, I'm interested in the property: ${property.title}`;
                                    window.location.href = `mailto:${property.contact_email}?subject=Property Inquiry: ${property.title}&body=${message}`;
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary/20 border border-secondary/40 hover:bg-secondary/30 transition-all"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <img src="/gmail_icon.svg" alt="Gmail" className="w-8 h-8 flex-shrink-0" />
                                  <div className="text-left flex-1">
                                    <p className="font-semibold text-sm text-foreground">Email</p>
                                    <p className="text-xs text-muted-foreground truncate">{property.contact_email}</p>
                                  </div>
                                  <span className="text-xs font-bold text-secondary/80">→</span>
                                </motion.button>
                              )}

                              {/* Call Option - Muted Color */}
                              {property.contact_phone && (
                                <motion.button
                                  onClick={() => {
                                    window.location.href = `tel:${property.contact_phone}`;
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-muted/50 border border-muted hover:bg-muted/70 transition-all"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <img src="/call_icon.svg" alt="Call" className="w-8 h-8 flex-shrink-0" />
                                  <div className="text-left flex-1">
                                    <p className="font-semibold text-sm text-foreground">Call</p>
                                    <p className="text-xs text-muted-foreground">{property.contact_phone}</p>
                                  </div>
                                  <span className="text-xs font-bold text-muted-foreground">→</span>
                                </motion.button>
                              )}
                            </div>

                            {/* Footer */}
                            <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border text-center">
                              Direct contact with agent
                            </p>
                          </MorphingPopoverContent>
                        </MorphingPopover>

                        <Button
                          variant="outline"
                          onClick={handleToggleFavorite}
                          className="w-full"
                        >
                          <Heart
                            size={18}
                            className={isFavorite ? "fill-red-500 text-red-500" : ""}
                          />
                          {isFavorite ? "Saved" : "Save Property"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Stats Card */}
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex justify-between items-center pb-3 border-b border-border">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Eye size={18} />
                          <span className="text-sm">Views</span>
                        </div>
                        <p className="font-semibold text-foreground">
                          {property.views || 0}
                        </p>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock size={18} />
                          <span className="text-sm">Listed</span>
                        </div>
                        <p className="font-semibold text-foreground text-sm">
                          {new Date(property.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};
export default PropertyDetails;

