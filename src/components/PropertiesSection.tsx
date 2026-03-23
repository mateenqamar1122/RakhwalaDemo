import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PropertyCard from "./PropertyCard";
import SectionReveal from "./SectionReveal";
import { supabase } from "@/lib/supabase";

interface Property {
  id: string;
  title: string;
  image_url: string;
  location: string;
  price_label: string;
  badge: string | null;
  beds: number;
  baths: number;
  sqft: string;
  featured?: boolean;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const PropertiesSection = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from("properties")
          .select("id, title, image_url, location, price_label, badge, beds, baths, sqft")
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(6);

        if (fetchError) {
          setError("Failed to load properties");
          console.error(fetchError);
          return;
        }

        setProperties(
          data?.map((prop: any) => ({
            id: prop.id,
            title: prop.title,
            image: prop.image_url,
            image_url: prop.image_url,
            location: prop.location,
            price: prop.price_label,
            price_label: prop.price_label,
            badge: prop.badge,
            beds: prop.beds || 0,
            baths: prop.baths || 0,
            sqft: prop.sqft || "0 ft²",
          })) || []
        );
      } catch (err) {
        setError("An error occurred while loading properties");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  return (
    <section id="properties" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6">
        <SectionReveal>
          <div className="text-center mb-16">
            <p className="label-caps mb-4">Property Marketplace</p>
            <h2 className="font-serif text-4xl md:text-6xl text-foreground tracking-tight font-bold">
              Listed <span className="text-gradient-gold">Properties</span>
            </h2>
            <p className="text-muted-foreground mt-5 max-w-xl mx-auto text-lg font-medium">
              Browse verified properties across Pakistan. Connect directly with owners and investors.
            </p>
          </div>
        </SectionReveal>

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="bg-card border border-border rounded-lg h-96 animate-pulse"
              />
            ))}
          </motion.div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <p className="text-red-500 text-lg">{error}</p>
            <p className="text-muted-foreground mt-2">Please try again later</p>
          </div>
        )}

        {/* Properties Grid */}
        {!loading && !error && properties.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                id={property.id}
                title={property.title}
                image={property.image_url}
                location={property.location}
                price={property.price_label}
                badge={property.badge}
                beds={property.beds}
                baths={property.baths}
                sqft={property.sqft}
              />
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !error && properties.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No active properties available at the moment</p>
          </div>
        )}

        <SectionReveal delay={0.3}>
          <div className="text-center mt-14">
            <a href="/properties" className="btn-outline-bold px-10 py-4 text-sm gap-2">
              View All Listings →
            </a>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
};

export default PropertiesSection;
