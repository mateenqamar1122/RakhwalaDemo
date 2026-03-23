import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, SlidersHorizontal, BedDouble, Bath, Maximize, MapPin,
  X, ChevronDown, ArrowUpDown, Phone, Calendar, Star, Share2,
  Heart, ChevronRight, ShieldCheck, Eye, AlertCircle, Plus,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useProperties, type Property } from "@/hooks/useProperties";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/hooks/useFavorites";
import { useUserProperties } from "@/hooks/useUserProperties";
import RoleBasedAccess from "@/components/RoleBasedAccess";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";
import property4 from "@/assets/property-4.jpg";
import property5 from "@/assets/property-5.jpg";
import property6 from "@/assets/property-6.jpg";

// ─── Local image fallback map (used when image_url from DB is empty) ──────────
import p1 from "@/assets/property-1.jpg";
import p2 from "@/assets/property-2.jpg";
import p3 from "@/assets/property-3.jpg";
import p4 from "@/assets/property-4.jpg";
import p5 from "@/assets/property-5.jpg";
import p6 from "@/assets/property-6.jpg";
const FALLBACK_IMAGES = [p1, p2, p3, p4, p5, p6];
const getFallbackImage = (index: number) => FALLBACK_IMAGES[index % 6];

// ─── Skeleton card ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
    <div className="aspect-[16/10] bg-foreground/10" />
    <div className="p-5 space-y-3">
      <div className="h-5 bg-foreground/10 rounded w-3/4" />
      <div className="h-4 bg-foreground/10 rounded w-1/2" />
      <div className="h-px bg-border mt-4" />
      <div className="flex justify-between">
        <div className="h-5 bg-foreground/10 rounded w-1/3" />
        <div className="h-4 bg-foreground/10 rounded w-1/4" />
      </div>
    </div>
  </div>
);

const CITIES = ["All Cities", "Lahore", "Karachi", "Islamabad", "Rawalpindi"];
const TYPES  = ["All Types", "Villa", "House", "Apartment", "Penthouse", "Commercial"];
const SORT_OPTIONS = [
  { label: "Newest First",       value: "newest"    },
  { label: "Price: Low → High",  value: "price_asc" },
  { label: "Price: High → Low",  value: "price_desc"},
  { label: "Largest Area",       value: "sqft_desc" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const badgeStyle = (badge: string) => {
  if (badge === "Premium")     return "bg-purple-500/20 text-purple-300 border border-purple-500/30";
  if (badge === "New Listing") return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
  if (badge === "High Demand") return "bg-amber-500/20 text-amber-300 border border-amber-500/30";
  return "bg-foreground/10 text-foreground/70";
};

// ─── Property Detail Modal ────────────────────────────────────────────────────
const PropertyModal = ({ property, onClose }: { property: Property; onClose: () => void }) => {
  const [saved, setSaved] = useState(false);
  const { user, profile, isBuyer, isSeller, isAdmin } = useAuth();
  const { isFavorited, toggleFavorite } = useFavorites();
  const { isOwner } = useUserProperties();

  // Check if property is favorited
  useEffect(() => {
    if (user && isBuyer) {
      setSaved(isFavorited(property.id));
    }
  }, [user, isBuyer, isFavorited, property.id]);

  // close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleToggleFavorite = async () => {
    if (!user || !isBuyer) return;
    
    try {
      await toggleFavorite(property.id);
      setSaved(!saved);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const features = [
    property.beds  > 0 ? `${property.beds} Bedrooms`  : null,
    `${property.baths} Bathrooms`,
    property.sqft,
    property.city,
    property.type,
    "Ready to Move",
  ].filter(Boolean) as string[];

  const isPropertyOwner = isOwner(property.id) || isAdmin;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal Panel */}
      <motion.div
        className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto no-scrollbar bg-card border border-border rounded-3xl shadow-2xl"
        initial={{ opacity: 0, scale: 0.92, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 40 }}
        transition={{ duration: 0.35, ease: [0.25, 0.4, 0.25, 1] }}
      >
        {/* Hero Image */}
        <div className="relative h-64 md:h-80 overflow-hidden rounded-t-3xl">
          <img src={property.image} alt={property.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Top row actions */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            {property.badge
              ? <span className={`px-3 py-1 text-[10px] font-extrabold tracking-widest uppercase rounded-lg ${badgeStyle(property.badge)}`}>{property.badge}</span>
              : <span />
            }
            <div className="flex items-center gap-2">
              {/* Favorite button for buyers */}
              {user && isBuyer && (
                <button
                  onClick={handleToggleFavorite}
                  className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md border transition-all ${saved ? "bg-rose-500 border-rose-500 text-white" : "bg-black/40 border-white/20 text-white hover:bg-black/60"}`}
                >
                  <Heart size={15} fill={saved ? "currentColor" : "none"} />
                </button>
              )}
              <button
                onClick={() => navigator.clipboard?.writeText(window.location.href)}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-md border border-white/20 text-white hover:bg-black/60 transition-all"
              >
                <Share2 size={15} />
              </button>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-md border border-white/20 text-white hover:bg-black/60 transition-all"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Price on image */}
          <div className="absolute bottom-4 left-5">
            <p className="font-serif text-3xl font-bold text-white drop-shadow-lg">{property.priceLabel}</p>
            <p className="flex items-center gap-1 text-white/80 text-sm font-medium mt-0.5"><MapPin size={12} /> {property.location}</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8">
          {/* Title + type + owner badge */}
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">{property.title}</h2>
              <p className="text-muted-foreground text-sm font-medium mt-1">{property.type} · {property.city}</p>
            </div>
            <div className="flex items-center gap-2">
              {isPropertyOwner && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <ShieldCheck size={12} />
                  Your Property
                </Badge>
              )}
              <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full shrink-0">
                <Star size={12} className="text-amber-400" fill="currentColor" />
                <span className="text-amber-400 text-xs font-black">Verified</span>
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="flex items-center gap-6 py-4 px-5 bg-background rounded-2xl border border-border mb-6">
            {property.beds > 0 && (
              <>
                <div className="text-center">
                  <p className="font-serif text-xl font-bold text-foreground">{property.beds}</p>
                  <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase mt-0.5">Beds</p>
                </div>
                <div className="w-px h-8 bg-border" />
              </>
            )}
            <div className="text-center">
              <p className="font-serif text-xl font-bold text-foreground">{property.baths}</p>
              <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase mt-0.5">Baths</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="font-serif text-sm font-bold text-foreground">{property.sqft}</p>
              <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase mt-0.5">Area</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="font-serif text-sm font-bold text-foreground">{property.type}</p>
              <p className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase mt-0.5">Type</p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="label-caps mb-3">About this Property</h3>
            <p className="text-muted-foreground text-sm leading-relaxed font-medium">{property.desc}</p>
          </div>

          {/* Feature pills */}
          <div className="mb-8">
            <h3 className="label-caps mb-3">Key Features</h3>
            <div className="flex flex-wrap gap-2">
              {features.map((f) => (
                <span key={f} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground/5 border border-border text-foreground text-xs font-semibold">
                  <ShieldCheck size={11} className="text-amber-400" /> {f}
                </span>
              ))}
            </div>
          </div>

          {/* Role-specific Action buttons */}
          <RoleBasedAccess allowedRoles={['buyer', 'seller']}>
            <RoleBasedAccess allowedRoles={['buyer']}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <a
                  href="tel:+923001234567"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-foreground text-background font-bold text-sm hover:bg-foreground/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Phone size={15} /> Call Agent
                </a>
                <button
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border-2 border-amber-500/60 text-amber-400 font-bold text-sm hover:bg-amber-500/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Calendar size={15} /> Schedule Visit
                </button>
                <a
                  href="#valuation"
                  onClick={onClose}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-border text-foreground font-bold text-sm hover:bg-foreground/5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Eye size={15} /> Get Valuation <ChevronRight size={14} />
                </a>
              </div>
            </RoleBasedAccess>

            <RoleBasedAccess allowedRoles={['seller']}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {isPropertyOwner ? (
                  <>
                    <Button className="h-12 px-5 py-3.5 rounded-xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98]">
                      <Eye size={15} className="mr-2" /> View Inquiries
                    </Button>
                    <Button variant="outline" className="h-12 px-5 py-3.5 rounded-xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98]">
                      Edit Property
                    </Button>
                  </>
                ) : (
                  <Button className="h-12 px-5 py-3.5 rounded-xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98]">
                    <Plus size={15} className="mr-2" /> Add to My Properties
                  </Button>
                )}
              </div>
            </RoleBasedAccess>
          </RoleBasedAccess>

          {/* Trust note */}
          <p className="flex items-center justify-center gap-1.5 text-muted-foreground text-xs font-semibold mt-5">
            <ShieldCheck size={13} className="text-emerald-400" />
            Rakhwala verified listing · No hidden charges
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Listing Card ─────────────────────────────────────────────────────────────
const ListingCard = ({ property, onClick }: { property: Property; onClick: () => void }) => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { user, isBuyer, isSeller, isAdmin } = useAuth();
  const { isFavorited, toggleFavorite } = useFavorites();
  const { isOwner } = useUserProperties();

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || !isBuyer) return;
    
    try {
      await toggleFavorite(property.id);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleMoreDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/properties/${property.id}`);
  };

  const handleImageChange = (e: React.MouseEvent, direction: 'prev' | 'next') => {
    e.stopPropagation();
    if (direction === 'prev') {
      setCurrentImageIndex((prev) => (prev === 0 ? 0 : prev - 1));
    } else {
      setCurrentImageIndex((prev) => prev + 1);
    }
  };

  const isPropertyOwner = isOwner(property.id) || isAdmin;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      onClick={handleMoreDetails}
      className="group bg-card border border-border rounded-2xl overflow-hidden cursor-pointer hover:border-foreground/20 hover:shadow-2xl transition-shadow duration-300"
    >
      {/* Image Preview Section */}
      <div className="relative overflow-hidden aspect-[16/10] bg-muted">
        <motion.img
          key={currentImageIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          src={property.image}
          alt={property.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = getFallbackImage(currentImageIndex);
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Badge */}
        {property.badge && (
          <span className={`absolute top-3 left-3 px-2.5 py-1 text-[10px] font-extrabold tracking-widest uppercase rounded-lg ${badgeStyle(property.badge)}`}>
            {property.badge}
          </span>
        )}

        {/* Role-specific badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {isPropertyOwner && (
            <span className="px-2 py-1 text-[10px] font-bold bg-emerald-500/90 text-white rounded-lg">
              Your Property
            </span>
          )}
          {user && isBuyer && isFavorited(property.id) && (
            <span className="px-2 py-1 text-[10px] font-bold bg-rose-500/90 text-white rounded-lg">
              Favorited
            </span>
          )}
        </div>

        <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
          {property.type}
        </span>

        {/* View detail hint */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="bg-black/60 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full border border-white/20 flex items-center gap-1.5">
            <Eye size={13} /> View Details
          </span>
        </div>

        {/* Favorite button for buyers */}
        {user && isBuyer && (
          <button
            onClick={handleToggleFavorite}
            className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-rose-500 hover:border-rose-500 transition-all flex items-center justify-center"
          >
            <Heart size={14} fill={isFavorited(property.id) ? "currentColor" : "none"} />
          </button>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 space-y-4">
        <div>
          <p className="font-serif text-xl text-card-foreground font-bold truncate">{property.title}</p>
          <p className="flex items-center gap-1 text-muted-foreground text-sm mt-1 font-medium">
            <MapPin size={12} /> {property.location}
          </p>
        </div>

        {/* Price and Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <p className="font-serif text-xl font-bold text-gradient-gold">{property.priceLabel}</p>
          <div className="flex items-center gap-3 text-muted-foreground text-xs font-bold">
            {property.beds > 0 && <span className="flex items-center gap-1"><BedDouble size={13} /> {property.beds}</span>}
            {property.beds > 0 && <span className="w-px h-3 bg-border" />}
            <span className="flex items-center gap-1"><Bath size={13} /> {property.baths}</span>
            <span className="w-px h-3 bg-border" />
            <span className="flex items-center gap-1"><Maximize size={13} /> {property.sqft}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const Properties = () => {
  const [search, setSearch]         = useState("");
  const [city, setCity]             = useState("All Cities");
  const [type, setType]             = useState("All Types");
  const [minBeds, setMinBeds]       = useState(0);
  const [maxPrice, setMaxPrice]     = useState(300000000);
  const [sortBy, setSortBy]         = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage]             = useState(1);
  const [selected, setSelected]     = useState<Property | null>(null);
  const PER_PAGE = 9;

  // ── Live Supabase data ──
  const { data: allProperties = [], isLoading, isError } = useProperties({
    search, city, type, minBeds, maxPrice, sortBy,
  });

  // Supabase hook already filters/sorts; just paginate client-side
  const filtered = allProperties;

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const activeFiltersCount = [city !== "All Cities", type !== "All Types", minBeds > 0, maxPrice < 300000000].filter(Boolean).length;
  const resetFilters = () => { setCity("All Cities"); setType("All Types"); setMinBeds(0); setMaxPrice(300000000); setPage(1); setSearch(""); };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Modal */}
      <AnimatePresence>
        {selected && <PropertyModal property={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>

      {/* Page Header */}
      <div className="relative pt-24 pb-14 bg-background border-b border-border overflow-hidden">
        <div className="absolute -top-[30%] -left-[10%] w-[60%] h-[200%] rounded-full opacity-20 blur-[120px]" style={{ background: "radial-gradient(circle, hsl(35,80%,45%) 0%, transparent 70%)" }} />
        <div className="container mx-auto px-6 relative z-10">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="label-caps mb-3">Property Marketplace</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-serif text-4xl md:text-6xl font-bold text-foreground tracking-tight mb-4">
            Browse <span className="text-gradient-gold">Properties</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-muted-foreground text-lg font-medium max-w-xl">
            {allProperties.length} verified properties across Pakistan. Filter by city, type, budget and more.
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-10">
        {/* Search + Sort + Filter bar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col lg:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Search by title, city or area…" value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full h-12 pl-11 pr-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground text-sm font-medium focus:outline-none focus:border-foreground/40 transition-colors" />
            {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X size={14} /></button>}
          </div>

          <div className="relative">
            <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="h-12 pl-9 pr-10 rounded-xl bg-card border border-border text-foreground text-sm font-semibold appearance-none focus:outline-none focus:border-foreground/40 transition-colors cursor-pointer">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>

          <button onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 h-12 px-5 rounded-xl border text-sm font-semibold transition-all ${showFilters ? "bg-foreground text-background border-foreground" : "bg-card border-border text-foreground hover:border-foreground/40"}`}>
            <SlidersHorizontal size={15} /> Filters
            {activeFiltersCount > 0 && <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-black text-[10px] font-black">{activeFiltersCount}</span>}
          </button>
        </motion.div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden mb-6">
              <div className="bg-card border border-border rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="label-caps mb-3 block">City</label>
                  <div className="flex flex-wrap gap-2">
                    {CITIES.map((c) => (
                      <button key={c} onClick={() => { setCity(c); setPage(1); }}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${city === c ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"}`}>{c}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label-caps mb-3 block">Property Type</label>
                  <div className="flex flex-wrap gap-2">
                    {TYPES.map((t) => (
                      <button key={t} onClick={() => { setType(t); setPage(1); }}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${type === t ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"}`}>{t}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label-caps mb-3 block">Min. Bedrooms: {minBeds === 0 ? "Any" : `${minBeds}+`}</label>
                  <div className="flex gap-2">
                    {[0, 1, 2, 3, 4, 5].map((n) => (
                      <button key={n} onClick={() => { setMinBeds(n); setPage(1); }}
                        className={`w-10 h-10 rounded-lg text-sm font-bold border transition-all ${minBeds === n ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:border-foreground/40"}`}>
                        {n === 0 ? "Any" : `${n}+`}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label-caps mb-3 block">Max Price: PKR {(maxPrice / 10000000).toFixed(1)} Cr</label>
                  <input type="range" min={5000000} max={300000000} step={5000000} value={maxPrice}
                    onChange={(e) => { setMaxPrice(Number(e.target.value)); setPage(1); }} className="w-full accent-amber-500" />
                  <div className="flex justify-between text-[10px] text-muted-foreground font-semibold mt-1">
                    <span>PKR 0.5 Cr</span><span>PKR 30 Cr</span>
                  </div>
                </div>
              </div>
              {activeFiltersCount > 0 && (
                <div className="flex justify-end mt-3">
                  <button onClick={resetFilters} className="text-sm text-muted-foreground hover:text-foreground font-semibold flex items-center gap-1 transition-colors"><X size={13} /> Reset all filters</button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground text-sm font-semibold">
            Showing <span className="text-foreground">{paginated.length}</span> of <span className="text-foreground">{filtered.length}</span> properties
          </p>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : isError ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
            <p className="font-serif text-2xl font-bold text-foreground mb-2">Failed to load properties</p>
            <p className="text-muted-foreground font-medium">Check your connection and try again</p>
          </motion.div>
        ) : paginated.length > 0 ? (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {paginated.map((p, i) => (
                <ListingCard
                  key={p.id}
                  property={{ ...p, image_url: p.image_url || getFallbackImage(i) }}
                  onClick={() => setSelected(p)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <p className="text-6xl mb-4">🏠</p>
            <p className="font-serif text-2xl font-bold text-foreground mb-2">No properties found</p>
            <p className="text-muted-foreground font-medium mb-6">Try adjusting your search or filters</p>
            <button onClick={resetFilters} className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border text-foreground text-sm font-semibold hover:bg-foreground/5 transition-all"><X size={14} /> Reset all filters</button>
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex items-center justify-center gap-2 mt-12">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="h-10 px-4 rounded-lg border border-border text-sm font-semibold text-foreground disabled:opacity-30 hover:bg-foreground/5 transition-all">← Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button key={n} onClick={() => setPage(n)}
                className={`w-10 h-10 rounded-lg text-sm font-bold border transition-all ${page === n ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"}`}>{n}</button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="h-10 px-4 rounded-lg border border-border text-sm font-semibold text-foreground disabled:opacity-30 hover:bg-foreground/5 transition-all">Next →</button>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Properties;
