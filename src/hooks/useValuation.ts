import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface ValuationSubmit {
  property_type: string;
  city: string;
  area_sqft: number;
  bedrooms: number;
  condition: string;
  contact_name: string;
  contact_phone: string;
  estimated_value: number;
}

export const useSubmitValuation = () => {
  return useMutation({
    mutationFn: async (data: ValuationSubmit) => {
      const { error } = await supabase.from("valuations").insert(data);
      if (error) throw error;
    },
  });
};
