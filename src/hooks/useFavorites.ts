import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Property } from './useProperties';

export interface FavoriteProperty extends Property {
  favorited_at: string;
}

export const useFavorites = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_favorites')
        .select(`
          *,
          properties (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching favorites:', error);
        throw error;
      }

      return data.map((fav: any) => ({
        ...fav.properties,
        favorited_at: fav.created_at,
      })) as FavoriteProperty[];
    },
    enabled: !!user,
  });

  const addToFavorites = useMutation({
    mutationFn: async (propertyId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: user.id,
          property_id: propertyId,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
    },
  });

  const removeFromFavorites = useMutation({
    mutationFn: async (propertyId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', propertyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
    },
  });

  const isFavorited = (propertyId: string) => {
    return favorites.some(fav => fav.id === propertyId);
  };

  const toggleFavorite = async (propertyId: string) => {
    if (isFavorited(propertyId)) {
      await removeFromFavorites.mutateAsync(propertyId);
    } else {
      await addToFavorites.mutateAsync(propertyId);
    }
  };

  return {
    favorites,
    isLoading,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorited,
  };
};
