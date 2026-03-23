import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, MapPin, Home, Maximize, BedDouble, Building2, TrendingUp, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import SectionReveal from "./SectionReveal";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const cities = [
  "Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad",
  "Multan", "Peshawar", "Quetta", "Sialkot", "Gujranwala",
  "Hyderabad", "Bahawalpur", "Abbottabad", "Murree", "Other",
];

const propertyTypes = ["House", "Apartment", "Plot", "Commercial", "Farmhouse", "Penthouse"];
const nearbyFacilities = ["School", "Hospital", "Market", "Park", "Mosque", "Highway", "Airport"];

interface ValuationResult {
  estimatedValue: string;
  pricePerSqft: string;
  demandLevel: string;
  strategies: { label: string; description: string }[];
}

const ValuationTool = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    city: "",
    area: "",
    propertyType: "",
    size: "",
    rooms: "",
    bathrooms: "",
    facilities: [] as string[],
  });
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleFacility = (f: string) => {
    setFormData((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(f)
        ? prev.facilities.filter((x) => x !== f)
        : [...prev.facilities, f],
    }));
  };

  const handleEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const sizeNum = parseInt(formData.size) || 1000;
      const roomNum = parseInt(formData.rooms) || 3;
      const facilityBonus = formData.facilities.length * 0.03;

      const cityMultiplier: Record<string, number> = {
        Lahore: 22000, Karachi: 20000, Islamabad: 28000, Rawalpindi: 15000,
        Faisalabad: 10000, Multan: 9000, Peshawar: 11000, Quetta: 8000,
        Sialkot: 9500, Gujranwala: 8500, Hyderabad: 7500, Bahawalpur: 7000,
        Abbottabad: 12000, Murree: 18000, Other: 8000,
      };

      const typeMultiplier: Record<string, number> = {
        House: 1.0, Apartment: 0.85, Plot: 0.7, Commercial: 1.3,
        Farmhouse: 0.95, Penthouse: 1.5,
      };

      const baseRate = cityMultiplier[formData.city] || 12000;
      const typeM = typeMultiplier[formData.propertyType] || 1.0;
      const roomBonus = roomNum * 0.02;
      const totalRate = baseRate * typeM * (1 + roomBonus + facilityBonus);
      const totalValue = Math.round(totalRate * sizeNum);

      const croreValue = totalValue / 10000000;
      const lakhValue = totalValue / 100000;

      const formatted = croreValue >= 1
        ? `PKR ${croreValue.toFixed(2)} Crore`
        : `PKR ${lakhValue.toFixed(1)} Lakh`;

      setResult({
        estimatedValue: formatted,
        pricePerSqft: `PKR ${Math.round(totalRate).toLocaleString()}/sq.ft`,
        demandLevel: croreValue > 5 ? "Very High" : croreValue > 2 ? "High" : "Moderate",
        strategies: [
          { label: "Sell Now", description: `Market conditions favor selling at ${formatted}. High buyer demand in ${formData.city}.` },
          { label: "Rent Out", description: `Expected monthly rent: PKR ${Math.round(totalValue * 0.004 / 1000) * 1000 >= 1000000 ? (totalValue * 0.004 / 10000000).toFixed(2) + " Lakh" : Math.round(totalValue * 0.004).toLocaleString()}/month.` },
          { label: "Short-term Lease", description: "List on short-term rental platforms for higher yield during peak seasons." },
          { label: "Renovate & Upsell", description: "Minor renovations could increase value by 15-25%. Focus on kitchen and bathrooms." },
        ],
      });
      setLoading(false);
    }, 1500);
  };

  const handleSaveValuation = async () => {
    if (!result) return;
    
    setIsSubmitting(true);
    
    try {
      const valuationData = {
        property_type: formData.propertyType,
        city: formData.city,
        area_sqft: parseInt(formData.size) || 0,
        bedrooms: parseInt(formData.rooms) || 0,
        condition: "Good",
        contact_name: profile?.full_name || 'Anonymous User',
        contact_phone: profile?.phone || '',
        estimated_value: Math.round(parseFloat(result.estimatedValue.replace(/[^\d]/g, '')) * 10000000),
        user_id: user?.id || null,
      };

      const { error } = await supabase
        .from('valuations')
        .insert([valuationData] as any);

      if (error) {
        console.error('Error saving valuation:', error);
        toast({
          title: "Failed to save valuation",
          description: "Please try again later.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Valuation saved successfully!",
          description: "You can access your valuation reports from your dashboard.",
        });
        
        // Redirect to dashboard if logged in
        if (user) {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Failed to save valuation",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClasses = "w-full px-4 py-3.5 bg-input border-2 border-border rounded-lg text-foreground text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors";

  return (
    <section id="valuation" className="py-24 md:py-32 bg-card">
      <div className="container mx-auto px-6">
        <SectionReveal>
          <div className="text-center mb-16">
            <p className="label-caps mb-4">Property Valuation Tool</p>
            <h2 className="font-serif text-4xl md:text-6xl text-foreground tracking-tight font-bold">
              What's Your Property <span className="text-gradient-gold">Worth?</span>
            </h2>
            <p className="text-muted-foreground mt-5 max-w-xl mx-auto text-lg font-medium">
              Enter your property details below and get an instant estimated market value with personalized monetization strategies.
            </p>
          </div>
        </SectionReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
          {/* Form */}
          <SectionReveal direction="left" delay={0.1}>
            <form
              onSubmit={handleEstimate}
              className="space-y-5 p-8 md:p-10 card-bold bg-background"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="city">
                    <MapPin size={12} className="inline mr-1 -mt-0.5" />City
                  </Label>
                  <Select value={formData.city} onValueChange={(value) => setFormData({ ...formData, city: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="area">Area / Sector</Label>
                  <Input
                    id="area"
                    type="text"
                    placeholder="e.g. DHA Phase 5, Gulberg"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="property-type">
                    <Home size={12} className="inline mr-1 -mt-0.5" />Property Type
                  </Label>
                  <Select value={formData.propertyType} onValueChange={(value) => setFormData({ ...formData, propertyType: value })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="size">
                    <Maximize size={12} className="inline mr-1 -mt-0.5" />Size (sq.ft)
                  </Label>
                  <Input
                    id="size"
                    type="number"
                    placeholder="e.g. 2400"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    min={1}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="rooms">
                    <BedDouble size={12} className="inline mr-1 -mt-0.5" />Rooms
                  </Label>
                  <Input
                    id="rooms"
                    type="number"
                    placeholder="e.g. 4"
                    value={formData.rooms}
                    onChange={(e) => setFormData({ ...formData, rooms: e.target.value })}
                    min={0}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    placeholder="e.g. 3"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                    min={0}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="facilities">Nearby Facilities</Label>
                <div className="flex flex-wrap gap-2">
                  {nearbyFacilities.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => toggleFacility(f)}
                      className={`px-4 py-2 text-xs font-bold rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                        formData.facilities.includes(f)
                          ? "gradient-gold border-transparent text-primary-foreground shadow-lg"
                          : "bg-input border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                <Calculator size={18} className="mr-2" />
                {loading ? "Analyzing Market Data..." : "Estimate Property Value"}
              </Button>
            </form>
          </SectionReveal>

          {/* Result */}
          <SectionReveal direction="right" delay={0.2}>
            <div className="p-8 md:p-10 card-bold bg-background flex flex-col h-full">
              {!result ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className="w-24 h-24 rounded-2xl gradient-gold flex items-center justify-center mb-8 shadow-lg"
                  >
                    <Building2 size={36} className="text-primary-foreground" />
                  </motion.div>
                  <h3 className="font-serif text-3xl text-foreground mb-3 font-bold">Your Valuation Report</h3>
                  <p className="text-muted-foreground text-base max-w-sm font-medium">
                    Fill in your property details to receive an instant estimated market value with personalized recommendations.
                  </p>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
                  className="space-y-6"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="text-center p-8 rounded-xl gradient-gold"
                  >
                    <p className="text-primary-foreground/80 text-xs font-extrabold tracking-[0.15em] uppercase mb-2">Estimated Market Value</p>
                    <p className="font-serif text-4xl md:text-5xl text-primary-foreground font-bold tabular">{result.estimatedValue}</p>
                    <p className="text-primary-foreground/70 text-sm mt-2 font-semibold">{result.pricePerSqft}</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="flex items-center gap-4 p-5 rounded-xl border-2 border-border bg-secondary"
                  >
                    <div className="w-12 h-12 rounded-xl gradient-gold flex items-center justify-center shrink-0">
                      <TrendingUp size={20} className="text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Market Demand</p>
                      <p className="text-foreground font-bold text-lg">{result.demandLevel}</p>
                    </div>
                  </motion.div>

                  <div>
                    <p className="label-caps mb-4">Monetization Strategies</p>
                    <div className="space-y-3">
                      {result.strategies.map((s, i) => (
                        <motion.div
                          key={s.label}
                          initial={{ opacity: 0, x: 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                          className="p-5 rounded-xl border-2 border-border hover:border-primary/30 transition-all duration-300 cursor-pointer group"
                        >
                          <p className="text-foreground font-bold text-base group-hover:text-primary transition-colors">{s.label}</p>
                          <p className="text-muted-foreground text-sm mt-1 leading-relaxed font-medium">{s.description}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <a
                    href="#consultancy"
                    className="btn-outline-bold w-full py-4 text-xs justify-center gap-2"
                  >
                    Book Expert Consultancy <ArrowRight size={16} />
                  </a>

                  {user && (
                    <Button
                      onClick={handleSaveValuation}
                      disabled={isSubmitting}
                      className="w-full mt-4"
                      variant="outline"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          Save Valuation to Dashboard
                        </>
                      )}
                    </Button>
                  )}
                </motion.div>
              )}
            </div>
          </SectionReveal>
        </div>
      </div>
    </section>
  );
};

export default ValuationTool;
