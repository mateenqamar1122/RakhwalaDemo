import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyService, profileService } from '@/lib/supabase-functions';
import { useAuth } from '@/contexts/AuthContext';
import type { Property, PropertyUpdate } from '@/lib/supabase-functions';

interface PropertyStats {
  total_properties: number;
  active_properties: number;
  pending_properties: number;
  total_views: number;
  total_inquiries: number;
  total_favorites: number;
}

interface UsePropertyManageReturn {
  properties: Property[] | undefined;
  isLoading: boolean;
  error: Error | null;
  stats: PropertyStats | undefined;
  isStatsLoading: boolean;
  updateProperty: (propertyId: string, updates: PropertyUpdate) => Promise<void>;
  deleteProperty: (propertyId: string) => Promise<void>;
  isUpdating: boolean;
  isDeleting: boolean;
  refetch: () => void;
}

export const usePropertyManage = (): UsePropertyManageReturn => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user properties
  const {
    data: properties,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['userProperties', user?.id],
    queryFn: () => {
      if (!user?.id) throw new Error('User not authenticated');
      return propertyService.getUserProperties(user.id);
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch user statistics
  const {
    data: stats,
    isLoading: isStatsLoading
  } = useQuery({
    queryKey: ['userStats', user?.id],
    queryFn: () => {
      if (!user?.id) throw new Error('User not authenticated');
      return profileService.getUserStats(user.id);
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Update property mutation
  const updatePropertyMutation = useMutation({
    mutationFn: async ({ propertyId, updates }: { propertyId: string; updates: PropertyUpdate }) => {
      return propertyService.updateProperty(propertyId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProperties'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    }
  });

  // Delete property mutation
  const deletePropertyMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      return propertyService.deleteProperty(propertyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProperties'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
    }
  });

  const updateProperty = useCallback(async (
    propertyId: string,
    updates: PropertyUpdate
  ): Promise<void> => {
    try {
      await updatePropertyMutation.mutateAsync({ propertyId, updates });
    } catch (error) {
      throw error;
    }
  }, [updatePropertyMutation]);

  const deleteProperty = useCallback(async (propertyId: string): Promise<void> => {
    try {
      await deletePropertyMutation.mutateAsync(propertyId);
    } catch (error) {
      throw error;
    }
  }, [deletePropertyMutation]);

  return {
    properties,
    isLoading,
    error: error as Error | null,
    stats,
    isStatsLoading,
    updateProperty,
    deleteProperty,
    isUpdating: updatePropertyMutation.isPending,
    isDeleting: deletePropertyMutation.isPending,
    refetch
  };
};

// Hook for property filtering and searching
export const usePropertyFilters = (properties: Property[] = []) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(search.toLowerCase()) ||
                         property.location.toLowerCase().includes(search.toLowerCase()) ||
                         property.city.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    filteredProperties,
    totalCount: properties.length,
    filteredCount: filteredProperties.length
  };
};

// Hook for property status management
export const usePropertyStatus = () => {
  const queryClient = useQueryClient();

  const changeStatusMutation = useMutation({
    mutationFn: async ({ propertyId, status }: { propertyId: string; status: string }) => {
      return propertyService.updateProperty(propertyId, { status: status as any });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProperties'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    }
  });

  const changeStatus = useCallback(async (
    propertyId: string,
    status: string
  ): Promise<void> => {
    try {
      await changeStatusMutation.mutateAsync({ propertyId, status });
    } catch (error) {
      throw error;
    }
  }, [changeStatusMutation]);

  return {
    changeStatus,
    isChangingStatus: changeStatusMutation.isPending
  };
};

// Hook for property analytics
export const usePropertyAnalytics = (propertyId?: string) => {
  const {
    data: analytics,
    isLoading,
    error
  } = useQuery({
    queryKey: ['propertyAnalytics', propertyId],
    queryFn: () => {
      if (!propertyId) throw new Error('Property ID is required');
      return propertyService.getPropertyStats(propertyId);
    },
    enabled: !!propertyId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Calculate view trends (mock data for now)
  const viewTrends = analytics ? [
    { date: 'Mon', views: Math.floor(analytics.views * 0.15) },
    { date: 'Tue', views: Math.floor(analytics.views * 0.12) },
    { date: 'Wed', views: Math.floor(analytics.views * 0.18) },
    { date: 'Thu', views: Math.floor(analytics.views * 0.14) },
    { date: 'Fri', views: Math.floor(analytics.views * 0.20) },
    { date: 'Sat', views: Math.floor(analytics.views * 0.11) },
    { date: 'Sun', views: Math.floor(analytics.views * 0.10) },
  ] : [];

  return {
    analytics,
    viewTrends,
    isLoading,
    error: error as Error | null
  };
};

// Hook for bulk operations
export const useBulkOperations = () => {
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const bulkStatusChange = useCallback(async (
    propertyIds: string[],
    newStatus: string
  ): Promise<void> => {
    setIsProcessing(true);
    try {
      const promises = propertyIds.map(id => 
        propertyService.updateProperty(id, { status: newStatus as any })
      );
      await Promise.all(promises);
      
      queryClient.invalidateQueries({ queryKey: ['userProperties'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [queryClient]);

  const bulkDelete = useCallback(async (
    propertyIds: string[]
  ): Promise<void> => {
    setIsProcessing(true);
    try {
      const promises = propertyIds.map(id => 
        propertyService.deleteProperty(id)
      );
      await Promise.all(promises);
      
      queryClient.invalidateQueries({ queryKey: ['userProperties'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [queryClient]);

  return {
    bulkStatusChange,
    bulkDelete,
    isProcessing
  };
};

// Hook for property export
export const usePropertyExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = useCallback(async (properties: Property[]): Promise<void> => {
    setIsExporting(true);
    try {
      // Create CSV content
      const headers = ['Title', 'Type', 'City', 'Location', 'Price', 'Status', 'Views', 'Inquiries', 'Created At'];
      const rows = properties.map(property => [
        property.title,
        property.type,
        property.city,
        property.location,
        property.price_label,
        property.status,
        property.views?.toString() || '0',
        property.inquiries_count?.toString() || '0',
        new Date(property.created_at).toLocaleDateString()
      ]);

      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `properties-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      throw error;
    } finally {
      setIsExporting(false);
    }
  }, []);

  return {
    exportToCSV,
    isExporting
  };
};
