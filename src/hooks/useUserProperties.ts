import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Property } from './useProperties';

export interface UserProperty extends Property {
  owned_at: string;
}

export const useUserProperties = () => {
  const { user, isSeller, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const { data: userProperties = [], isLoading } = useQuery({
    queryKey: ['userProperties', user?.id],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('user_properties')
        .select(`
          *,
          properties (*)
        `)
        .order('created_at', { ascending: false });

      // If admin, get all properties, otherwise get only user's properties
      if (!isAdmin) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching user properties:', error);
        throw error;
      }

      return data.map((userProp: any) => ({
        ...userProp.properties,
        owned_at: userProp.created_at,
      })) as UserProperty[];
    },
    enabled: !!user && (isSeller || isAdmin),
  });

  const addProperty = useMutation({
    mutationFn: async (propertyId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_properties')
        .insert({
          user_id: user.id,
          property_id: propertyId,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProperties', user?.id] });
    },
  });

  const removeProperty = useMutation({
    mutationFn: async (propertyId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_properties')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', propertyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProperties', user?.id] });
    },
  });

  const isOwner = (propertyId: string) => {
    return userProperties.some(prop => prop.id === propertyId);
  };

  return {
    userProperties,
    isLoading,
    addProperty,
    removeProperty,
    isOwner,
  };
};
