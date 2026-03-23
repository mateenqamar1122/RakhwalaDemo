import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Property as DBProperty } from "@/lib/database.types";

export interface Property {
  id: string;
  title: string;
  location: string;
  city: string;
  type: string;
  price: number;
  priceLabel: string;
  beds: number;
  baths: number;
  sqft: string;
  desc: string;
  image_url: string;
  image: string;
  badge?: string | null;
}

interface UsePropertiesParams {
  search: string;
  city: string;
  type: string;
  minBeds: number;
  maxPrice: number;
  sortBy: string;
}

export const useProperties = ({
  search,
  city,
  type,
  minBeds,
  maxPrice,
  sortBy,
}: UsePropertiesParams) => {
  return useQuery({
    queryKey: ["properties", search, city, type, minBeds, maxPrice, sortBy],
    queryFn: async () => {
      let query = supabase.from("properties").select("*");

      // Apply filters
      if (search) {
        // Use ilike for text search on multiple columns
        const searchPattern = `%${search}%`;
        query = query.or(
          `title.ilike.${searchPattern},location.ilike.${searchPattern},city.ilike.${searchPattern}`
        );
      }

      if (city !== "All Cities") {
        query = query.eq("city", city);
      }

      if (type !== "All Types") {
        query = query.eq("type", type);
      }

      if (minBeds > 0) {
        query = query.gte("beds", minBeds);
      }

      if (maxPrice < 300000000) {
        query = query.lte("price", maxPrice);
      }

      // Apply sorting
      if (sortBy === "price_asc") {
        query = query.order("price", { ascending: true });
      } else if (sortBy === "price_desc") {
        query = query.order("price", { ascending: false });
      } else if (sortBy === "sqft_desc") {
        query = query.order("sqft_num", { ascending: false });
      } else {
        // newest (default)
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) {
        console.error("Supabase query error:", error);
        throw error;
      }

      // Type assertion for data
      const properties = (data || []) as DBProperty[];

      return properties.map((p: DBProperty): Property => ({
        id: p.id,
        title: p.title,
        location: p.location,
        city: p.city,
        type: p.type,
        price: p.price,
        priceLabel: p.price_label || `PKR ${(p.price / 10000000).toFixed(1)} Cr`,
        beds: p.beds || 0,
        baths: p.baths || 0,
        sqft: p.sqft || "N/A",
        desc: p.description || "",
        image_url: p.image_url || "",
        image: p.image_url || "",
        badge: p.badge,
      }));
    },
  });
};

